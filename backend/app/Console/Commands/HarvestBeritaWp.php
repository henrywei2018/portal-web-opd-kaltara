<?php

namespace App\Console\Commands;

use App\Models\Berita;
use App\Models\Kategori;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Harvest posts from a WordPress REST API into the `berita` table.
 *
 *   php artisan berita:harvest-wp --dry-run --pages=1   # preview one page
 *   php artisan berita:harvest-wp                       # full backfill
 *
 * Insert-only: a post whose slug already exists in `berita` is skipped, so the
 * command is safe to re-run. Edits made on the WordPress side are NOT pulled
 * back in — re-importing a changed post would need a wp_post_id column to
 * match on.
 *
 * Featured images are stored as remote URLs pointing at the source site; they
 * are not copied into local storage.
 */
class HarvestBeritaWp extends Command
{
    protected $signature = 'berita:harvest-wp
        {--source=https://diskominfo.kaltaraprov.go.id : Base URL of the WordPress site}
        {--per-page=100 : Posts per request (WordPress caps this at 100)}
        {--start-page=1 : Page to begin from, for resuming an interrupted run}
        {--pages= : Stop after this many pages (default: all)}
        {--user=1 : id_user recorded as the author of imported posts}
        {--status=Publish : status_berita for imported rows (Publish or Draft)}
        {--memory=512M : PHP memory limit for this run}
        {--dry-run : Report what would be imported without writing anything}';

    protected $description = 'Import berita from a WordPress REST API (wp/v2/posts)';

    /** Source category names mapped onto categories you already have. */
    private array $categoryAliases = [
        'uncategorized' => 'Umum',
    ];

    /** Only these fields are requested, which keeps the huge yoast_head blob out of the payload. */
    private const FIELDS = 'id,date,modified,slug,status,link,title,content,excerpt,author,featured_media,categories,tags,_links,_embedded';

    private array $kategoriCache = [];

    public function handle(): int
    {
        // A full 48-page run holds ~1.7MB per page that PHP does not hand back;
        // the stock 128M limit dies around page 37.
        ini_set('memory_limit', (string) $this->option('memory'));

        $source   = rtrim((string) $this->option('source'), '/');
        $perPage  = min(100, max(1, (int) $this->option('per-page')));
        $page     = max(1, (int) $this->option('start-page'));
        $maxPages = $this->option('pages') !== null ? (int) $this->option('pages') : null;
        $idUser   = (int) $this->option('user');
        $status   = $this->option('status') === 'Draft' ? 'Draft' : 'Publish';
        $dryRun   = (bool) $this->option('dry-run');

        $endpoint = $source . '/wp-json/wp/v2/posts';

        if ($dryRun) {
            $this->warn('DRY RUN — nothing will be written.');
        }
        $this->info("Source: {$endpoint}");

        // Probe first so we can show total work and fail early on a bad URL.
        $probe = Http::timeout(60)->retry(3, 2000)->get($endpoint, [
            'per_page' => 1,
            '_fields'  => 'id',
        ]);

        if (! $probe->successful()) {
            $this->error("Cannot reach the API (HTTP {$probe->status()}).");

            return self::FAILURE;
        }

        $totalPosts = (int) $probe->header('X-WP-Total');
        $totalPages = (int) ceil($totalPosts / $perPage);
        $lastPage   = $maxPages ? min($totalPages, $page + $maxPages - 1) : $totalPages;

        $this->line("Found {$totalPosts} posts across {$totalPages} pages of {$perPage}.");
        $this->line("Importing pages {$page}..{$lastPage}");
        $this->newLine();

        $imported = $skipped = $failed = 0;

        for (; $page <= $lastPage; $page++) {
            // Scoped to one page on purpose: duplicates that span pages are
            // caught by the whereIn check below, and keeping this for the whole
            // run grew until it exhausted PHP's memory limit.
            $seenSlugs = [];

            $response = Http::timeout(120)->retry(3, 3000)->get($endpoint, [
                'per_page' => $perPage,
                'page'     => $page,
                // Ascending order keeps pagination stable: newly published posts
                // land on the last page instead of shifting every page along.
                'orderby'  => 'date',
                'order'    => 'asc',
                'status'   => 'publish',
                '_embed'   => 'wp:featuredmedia,wp:term',
                '_fields'  => self::FIELDS,
            ]);

            if (! $response->successful()) {
                $this->error("  page {$page}: HTTP {$response->status()} — skipped");
                $failed += $perPage;
                continue;
            }

            $posts = $response->json();
            if (! is_array($posts) || $posts === []) {
                $this->line("  page {$page}: empty, stopping.");
                break;
            }

            $rows = [];
            foreach ($posts as $post) {
                $slug = $this->slugFor($post);
                if ($slug === null) {
                    $failed++;
                    continue;
                }

                // Guard against the same slug appearing twice inside one run.
                if (isset($seenSlugs[$slug])) {
                    $skipped++;
                    continue;
                }
                $seenSlugs[$slug] = true;

                $rows[$slug] = $this->mapPost($post, $slug, $idUser, $status, $dryRun);
            }

            // One query per page to find which of these slugs we already hold.
            $existing = Berita::whereIn('slug', array_keys($rows))->pluck('slug')->all();
            foreach ($existing as $slug) {
                unset($rows[$slug]);
                $skipped++;
            }

            $rows = array_values($rows);

            if ($rows !== [] && ! $dryRun) {
                Berita::insert($rows);
            }
            $imported += count($rows);

            $this->line(sprintf(
                '  page %2d/%d — %3d new, %3d already present  (running total: %d, mem %dMB)',
                $page,
                $lastPage,
                count($rows),
                count($existing),
                $imported,
                memory_get_usage(true) >> 20
            ));

            // Each page decodes ~1.5MB of JSON into deeply nested arrays; drop
            // the references so the peak does not compound across 48 pages.
            unset($posts, $rows, $response, $existing);
        }

        $this->newLine();
        $this->info(($dryRun ? 'Would import' : 'Imported') . ": {$imported}");
        $this->line("Skipped (slug already present): {$skipped}");
        if ($failed > 0) {
            $this->warn("Failed/unusable: {$failed}");
        }

        return self::SUCCESS;
    }

    /**
     * Build one `berita` row from a WordPress post.
     */
    private function mapPost(array $post, string $slug, int $idUser, string $status, bool $dryRun): array
    {
        $terms = $this->terms($post);

        return [
            'judul'         => $this->text($post['title']['rendered'] ?? '', 255) ?: '(tanpa judul)',
            'slug'          => $slug,
            'isi'           => (string) ($post['content']['rendered'] ?? ''),
            'keyword'       => $this->text(implode(', ', $terms['post_tag'] ?? []), 255),
            'gambar'        => $this->featuredImage($post),
            'tanggal_post'  => substr((string) ($post['date'] ?? ''), 0, 10) ?: date('Y-m-d'),
            'status_berita' => $status,
            'views'         => 0,
            'is_pinned'     => 0,
            'id_user'       => $idUser,
            'idkat'         => $this->kategoriId($terms['category'][0] ?? null, $dryRun),
        ];
    }

    /**
     * WordPress slugs are unique on the source and match the old public URLs,
     * so they are kept verbatim where possible.
     */
    private function slugFor(array $post): ?string
    {
        $slug = trim((string) ($post['slug'] ?? ''));
        if ($slug !== '') {
            $slug = rawurldecode($slug);
        }
        if ($slug === '') {
            $slug = Str::slug($this->text($post['title']['rendered'] ?? '', 255));
        }
        if ($slug === '') {
            return null;
        }

        return Str::limit($slug, 255, '');
    }

    /**
     * Group the embedded taxonomy terms by taxonomy name.
     *
     * @return array<string, string[]>
     */
    private function terms(array $post): array
    {
        $out = [];
        foreach ($post['_embedded']['wp:term'] ?? [] as $group) {
            if (! is_array($group)) {
                continue;
            }
            foreach ($group as $term) {
                if (isset($term['taxonomy'], $term['name'])) {
                    $out[$term['taxonomy']][] = html_entity_decode((string) $term['name'], ENT_QUOTES, 'UTF-8');
                }
            }
        }

        return $out;
    }

    private function featuredImage(array $post): ?string
    {
        $url = $post['_embedded']['wp:featuredmedia'][0]['source_url'] ?? null;
        if (! is_string($url) || $url === '' || strlen($url) > 255) {
            return null;
        }

        return $url;
    }

    /**
     * Resolve a source category name to an idkat, creating it when missing.
     */
    private function kategoriId(?string $name, bool $dryRun): ?int
    {
        if ($name === null || trim($name) === '') {
            return null;
        }

        $name = $this->categoryAliases[strtolower(trim($name))] ?? trim($name);
        $name = $this->text($name, 255);

        if (array_key_exists($name, $this->kategoriCache)) {
            return $this->kategoriCache[$name];
        }

        $existing = Kategori::where('nmkat', $name)->value('idkat');
        if ($existing === null && ! $dryRun) {
            $existing = Kategori::create(['nmkat' => $name])->idkat;
            $this->line("    + kategori baru: {$name}");
        }

        return $this->kategoriCache[$name] = $existing ? (int) $existing : null;
    }

    /**
     * Decode WordPress' HTML entities and clamp to the column width.
     */
    private function text(string $value, int $limit): string
    {
        $value = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');

        return mb_substr($value, 0, $limit);
    }
}
