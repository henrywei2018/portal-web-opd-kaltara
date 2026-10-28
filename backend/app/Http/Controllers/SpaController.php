<?php

namespace App\Http\Controllers;

use App\Models\Artikel;
use App\Models\Berita;
use App\Models\Halaman;
use App\Models\Setting;
use App\Support\Csp;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

/**
 * Serves the built React SPA (index.html) with per-URL SEO injected server-side:
 * title/description/canonical, OpenGraph + Twitter tags, and JSON-LD structured
 * data (Organization/WebSite site-wide, NewsArticle/Article on detail pages).
 *
 * The app is a client-rendered SPA, so crawlers and social scrapers that do not
 * run JS would otherwise only see the static index.html meta. Injection runs for
 * ALL user-agents (React re-sets the same values via useSeo, so it is not
 * cloaking). Missing content returns a real HTTP 404 (+ noindex) instead of a
 * "soft 404" 200, so search engines don't index empty pages.
 */
class SpaController extends Controller
{
    // Single-segment SPA routes that are real pages (not dynamic halaman slugs).
    // Value = [title label, description]; "{site}" is replaced with the site title.
    private const STATIC_META = [
        'berita' => ['Berita', 'Berita dan informasi terkini dari {site}.'],
        'artikel' => ['Artikel', 'Artikel dan informasi dari {site}.'],
        'infografis' => ['Infografis', 'Informasi dalam bentuk visual yang mudah dipahami.'],
        'pengumuman' => ['Pengumuman', 'Pengumuman resmi dari {site}.'],
        'galeri' => ['Galeri', 'Dokumentasi kegiatan {site}.'],
        'video' => ['Video', 'Video kegiatan dari {site}.'],
        'kontak' => ['Kontak', 'Hubungi {site} — alamat, telepon, dan jam layanan.'],
        'data' => ['Data', 'Data dan statistik {site}.'],
        'dokumen' => ['Dokumen', 'Dokumen dan informasi publik yang dapat diunduh.'],
        'profil' => ['Profil', 'Profil, visi misi, dan struktur organisasi {site}.'],
        'layanan' => ['Layanan', 'Layanan yang disediakan {site}.'],
        'sejarah' => ['Sejarah', 'Sejarah {site}.'],
        'visi-misi' => ['Visi & Misi', 'Visi dan misi {site}.'],
        'home' => [null, null], // alias of home — uses the default site title
    ];

    // First segments owned by the React app itself rather than by CMS content:
    // the admin workspace and its nested routes (/admin/dashboard, /admin/berita/…)
    // and the login screen. They have no Halaman record, so without this they fall
    // through to the dynamic-page lookup and 404. Served 200 + noindex.
    private const APP_ROUTES = ['admin', 'login'];

    public function serve(Request $request)
    {
        // Never let the SPA shadow unknown API routes — return a real 404 for those.
        if ($request->is('api', 'api/*')) {
            abort(404);
        }

        // 301 legacy numeric-id URLs (/berita/12) to their canonical slug URL.
        if ($target = $this->canonicalRedirect($request)) {
            return redirect($target, 301);
        }

        $index = public_path('index.html');
        abort_unless(File::exists($index), 404, 'Frontend belum di-build. Jalankan deploy.sh / npm run build.');

        $resolved = $this->resolve($request);
        $html = $this->inject(File::get($index), $resolved);

        $headers = [
            'Content-Type' => 'text/html; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
        ];
        if (config('keamanan.csp.enabled')) {
            $nonce = Csp::nonce();
            $html = Csp::pasangNonce($html, $nonce);
            $headers[Csp::namaHeader()] = Csp::kebijakan($nonce);
        }

        return response($html, $resolved['status'], $headers);
    }

    /** Resolve meta, HTTP status and JSON-LD for the requested path. */
    private function resolve(Request $request): array
    {
        $s = Setting::asObject();
        $host = rtrim($request->getSchemeAndHttpHost(), '/');
        $siteTitle = $s['site_title'] ?? 'Portal Resmi';
        $defaultDesc = $s['seo_meta_description'] ?? ($s['site_subtitle'] ?? '');
        $defaultKeywords = $s['seo_keywords'] ?? '';
        $defaultImage = $this->imageUrl($s['logo'] ?? '', $host);

        $meta = [
            'title' => ($s['site_subtitle'] ?? '') !== '' ? "{$siteTitle} - {$s['site_subtitle']}" : $siteTitle,
            'description' => $defaultDesc,
            'keywords' => $defaultKeywords,
            'image' => $defaultImage,
            'type' => 'website',
            'site_name' => $siteTitle,
            'url' => $request->url(),
            'noindex' => false,
        ];
        $status = 200;

        // Site-wide structured data on every page
        $jsonld = [$this->organizationSchema($s, $host, $siteTitle, $defaultImage), $this->websiteSchema($host, $siteTitle)];

        $path = '/' . ltrim($request->path(), '/');
        $seg = explode('/', ltrim($path, '/'))[0] ?? '';
        $segments = array_values(array_filter(explode('/', ltrim($path, '/')), fn ($x) => $x !== ''));

        if (preg_match('#^/berita/([^/]+)$#', $path, $m)) {
            $b = $this->findBerita($m[1]);
            if ($b) {
                $img = $this->imageUrl($b->gambar, $host) ?: $defaultImage;
                $meta = array_merge($meta, [
                    'title' => "{$b->judul} - {$siteTitle}",
                    'description' => $this->excerpt($b->isi) ?: $defaultDesc,
                    'keywords' => $b->keyword ?: $defaultKeywords,
                    'image' => $img,
                    'type' => 'article',
                ]);
                $jsonld[] = $this->articleSchema('NewsArticle', $b->judul, $meta['description'], $img, $b->tanggal_post, $meta['url'], $s, $host, $siteTitle);
            } else {
                [$meta, $status] = $this->notFound($meta, $siteTitle);
            }
        } elseif (preg_match('#^/artikel/([^/]+)$#', $path, $m)) {
            $a = $this->findArtikel($m[1]);
            if ($a) {
                $img = $this->imageUrl($a->gambar, $host) ?: $defaultImage;
                $meta = array_merge($meta, [
                    'title' => "{$a->judul} - {$siteTitle}",
                    'description' => $this->excerpt($a->isi) ?: $defaultDesc,
                    'keywords' => $a->keyword ?: $defaultKeywords,
                    'image' => $img,
                    'type' => 'article',
                ]);
                $jsonld[] = $this->articleSchema('Article', $a->judul, $meta['description'], $img, $a->tanggal_post, $meta['url'], $s, $host, $siteTitle);
            } else {
                [$meta, $status] = $this->notFound($meta, $siteTitle);
            }
        } elseif ($path === '/') {
            // home — keep default site title/description
        } elseif (in_array($seg, self::APP_ROUTES, true)) {
            // Admin workspace / login: real SPA routes at any depth. React Router
            // owns them, so serve the shell with 200 and keep them unindexed.
            $meta['title'] = ($seg === 'login' ? 'Login' : 'Admin') . " - {$siteTitle}";
            $meta['description'] = '';
            $meta['noindex'] = true;
            $jsonld = [];
        } elseif (count($segments) === 1 && array_key_exists($seg, self::STATIC_META)) {
            // Known single-segment page (e.g. /berita, /layanan, /kontak)
            [$label, $desc] = self::STATIC_META[$seg];
            if ($label !== null) {
                $meta['title'] = "{$label} - {$siteTitle}";
                $meta['description'] = str_replace('{site}', $siteTitle, $desc);
            }
        } else {
            // Anything else must be a published dynamic page (nested slugs allowed)
            $h = Halaman::where('slug', ltrim($path, '/'))->where('status', 'Publish')->first();
            if ($h) {
                $meta['title'] = "{$h->judul} - {$siteTitle}";
                $meta['description'] = $this->excerpt($h->meta_description) ?: $defaultDesc;
                $meta['image'] = $this->imageUrl($h->gambar, $host) ?: $defaultImage;
            } else {
                [$meta, $status] = $this->notFound($meta, $siteTitle);
            }
        }

        return ['meta' => $meta, 'status' => $status, 'jsonld' => $jsonld];
    }

    // Resolve a berita/artikel by slug (preferred) or numeric id (legacy)
    private function findBerita(string $key)
    {
        return Berita::where('status_berita', 'Publish')
            ->where(function ($q) use ($key) {
                $q->where('slug', $key);
                if (ctype_digit($key)) {
                    $q->orWhere('id_berita', (int) $key);
                }
            })->first();
    }

    private function findArtikel(string $key)
    {
        return Artikel::where('status_artikel', 'Publish')
            ->where(function ($q) use ($key) {
                $q->where('slug', $key);
                if (ctype_digit($key)) {
                    $q->orWhere('id_artikel', (int) $key);
                }
            })->first();
    }

    // If a legacy /berita/{id} or /artikel/{id} URL has a slug, return the slug path
    private function canonicalRedirect(Request $request): ?string
    {
        $path = '/' . ltrim($request->path(), '/');
        if (preg_match('#^/berita/(\d+)$#', $path, $m)) {
            $b = Berita::where('id_berita', (int) $m[1])->where('status_berita', 'Publish')->first();
            if ($b && $b->slug) {
                return '/berita/' . $b->slug;
            }
        }
        if (preg_match('#^/artikel/(\d+)$#', $path, $m)) {
            $a = Artikel::where('id_artikel', (int) $m[1])->where('status_artikel', 'Publish')->first();
            if ($a && $a->slug) {
                return '/artikel/' . $a->slug;
            }
        }

        return null;
    }

    private function notFound(array $meta, string $siteTitle): array
    {
        $meta['title'] = "Halaman Tidak Ditemukan - {$siteTitle}";
        $meta['description'] = 'Halaman yang Anda cari tidak tersedia atau telah dipindahkan.';
        $meta['type'] = 'website';
        $meta['noindex'] = true;

        return [$meta, 404];
    }

    private function organizationSchema(array $s, string $host, string $siteTitle, string $logo): array
    {
        $sameAs = array_values(array_filter([
            $s['facebook'] ?? null, $s['instagram'] ?? null, $s['twitter'] ?? null, $s['youtube'] ?? null,
        ]));

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'GovernmentOrganization',
            'name' => $siteTitle,
            'url' => $host . '/',
        ];
        if ($logo !== '') {
            $schema['logo'] = $logo;
        }
        if (!empty($s['email'])) {
            $schema['email'] = $s['email'];
        }
        if (!empty($s['telepon'])) {
            $schema['telephone'] = $s['telepon'];
        }
        if (!empty($s['alamat'])) {
            $schema['address'] = ['@type' => 'PostalAddress', 'streetAddress' => $s['alamat']];
        }
        if ($sameAs) {
            $schema['sameAs'] = $sameAs;
        }

        return $schema;
    }

    private function websiteSchema(string $host, string $siteTitle): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $siteTitle,
            'url' => $host . '/',
        ];
    }

    private function articleSchema(string $type, string $headline, string $desc, string $image, $date, string $url, array $s, string $host, string $siteTitle): array
    {
        $publisher = ['@type' => 'Organization', 'name' => $siteTitle];
        $logo = $this->imageUrl($s['logo'] ?? '', $host);
        if ($logo !== '') {
            $publisher['logo'] = ['@type' => 'ImageObject', 'url' => $logo];
        }

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => $type,
            'headline' => $headline,
            'description' => $desc,
            'mainEntityOfPage' => $url,
            'author' => ['@type' => 'Organization', 'name' => $siteTitle],
            'publisher' => $publisher,
        ];
        if ($image !== '') {
            $schema['image'] = [$image];
        }
        $iso = $this->isoDate($date);
        if ($iso) {
            $schema['datePublished'] = $iso;
            $schema['dateModified'] = $iso;
        }

        return $schema;
    }

    private function isoDate($value): ?string
    {
        if (!$value) {
            return null;
        }
        try {
            return Carbon::parse($value)->toIso8601String();
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function imageUrl(?string $src, string $host): string
    {
        if (!$src) {
            return '';
        }

        return preg_match('#^https?://#', $src) ? $src : "{$host}/gambar/{$src}";
    }

    private function excerpt(?string $text, int $len = 160): string
    {
        $s = trim(preg_replace('/\s+/', ' ', strip_tags((string) $text)));
        if (mb_strlen($s) > $len) {
            $s = rtrim(mb_substr($s, 0, $len - 1)) . '…';
        }

        return $s;
    }

    /** Replace title/description/keywords and inject canonical, OG/Twitter, robots, and JSON-LD. */
    private function inject(string $html, array $resolved): string
    {
        $meta = $resolved['meta'];

        // Drop the static tags we are about to override
        $html = preg_replace('#<title>.*?</title>#is', '', $html, 1);
        $html = preg_replace('#<meta\s+name="description"[^>]*>#i', '', $html, 1);
        $html = preg_replace('#<meta\s+name="keywords"[^>]*>#i', '', $html, 1);

        $e = fn ($v) => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
        $img = $meta['image'];
        $tags = [];
        $tags[] = '<title>' . $e($meta['title']) . '</title>';
        if ($meta['description'] !== '') {
            $tags[] = '<meta name="description" content="' . $e($meta['description']) . '">';
        }
        if ($meta['keywords'] !== '') {
            $tags[] = '<meta name="keywords" content="' . $e($meta['keywords']) . '">';
        }
        if (!empty($meta['noindex'])) {
            $tags[] = '<meta name="robots" content="noindex, follow">';
        }
        $tags[] = '<link rel="canonical" href="' . $e($meta['url']) . '">';
        $tags[] = '<meta property="og:title" content="' . $e($meta['title']) . '">';
        $tags[] = '<meta property="og:description" content="' . $e($meta['description']) . '">';
        $tags[] = '<meta property="og:type" content="' . $e($meta['type']) . '">';
        $tags[] = '<meta property="og:url" content="' . $e($meta['url']) . '">';
        $tags[] = '<meta property="og:site_name" content="' . $e($meta['site_name']) . '">';
        if ($img !== '') {
            $tags[] = '<meta property="og:image" content="' . $e($img) . '">';
        }
        $tags[] = '<meta name="twitter:card" content="' . ($img !== '' ? 'summary_large_image' : 'summary') . '">';
        $tags[] = '<meta name="twitter:title" content="' . $e($meta['title']) . '">';
        $tags[] = '<meta name="twitter:description" content="' . $e($meta['description']) . '">';
        if ($img !== '') {
            $tags[] = '<meta name="twitter:image" content="' . $e($img) . '">';
        }

        foreach ($resolved['jsonld'] as $schema) {
            $json = json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            if ($json !== false) {
                $tags[] = '<script type="application/ld+json">' . $json . '</script>';
            }
        }

        $block = "\n    " . implode("\n    ", $tags) . "\n  ";

        $pos = stripos($html, '</head>');
        if ($pos !== false) {
            return substr($html, 0, $pos) . $block . substr($html, $pos);
        }

        return $block . $html;
    }
}
