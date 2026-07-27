<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artikel;
use App\Models\Berita;
use App\Models\Halaman;
use Illuminate\Http\Request;

/**
 * Dynamic sitemap.xml built from published content. Served at the site root
 * (see routes/web.php) so crawlers — which do not run the SPA's JS — get a
 * complete, crawlable list of URLs. Absolute URLs use the request host so the
 * sitemap is correct on whatever domain currently serves the site.
 */
class SitemapController extends Controller
{
    // Static public routes that always exist in the SPA router.
    private const STATIC_PATHS = [
        ['/', '1.0', 'daily'],
        ['/profil', '0.7', 'monthly'],
        ['/layanan', '0.8', 'weekly'],
        ['/berita', '0.9', 'daily'],
        ['/artikel', '0.7', 'weekly'],
        ['/pengumuman', '0.7', 'weekly'],
        ['/galeri', '0.6', 'weekly'],
        ['/video', '0.6', 'weekly'],
        ['/data', '0.6', 'monthly'],
        ['/dokumen', '0.6', 'monthly'],
        ['/infografis', '0.5', 'monthly'],
        ['/kontak', '0.6', 'monthly'],
    ];

    public function index(Request $request)
    {
        $base = rtrim($request->getSchemeAndHttpHost(), '/');
        $urls = [];

        foreach (self::STATIC_PATHS as [$path, $priority, $freq]) {
            $urls[] = ['loc' => $base . $path, 'priority' => $priority, 'changefreq' => $freq];
        }

        // Published news (slug URL, fallback to id)
        Berita::where('status_berita', 'Publish')
            ->get(['id_berita', 'slug', 'tanggal_post'])
            ->each(function ($b) use (&$urls, $base) {
                $urls[] = [
                    'loc' => $base . '/berita/' . ($b->slug ?: $b->id_berita),
                    'lastmod' => $this->dateOrNull($b->tanggal_post),
                    'priority' => '0.6',
                    'changefreq' => 'weekly',
                ];
            });

        // Published articles (slug URL, fallback to id)
        Artikel::where('status_artikel', 'Publish')
            ->get(['id_artikel', 'slug', 'tanggal_post'])
            ->each(function ($a) use (&$urls, $base) {
                $urls[] = [
                    'loc' => $base . '/artikel/' . ($a->slug ?: $a->id_artikel),
                    'lastmod' => $this->dateOrNull($a->tanggal_post),
                    'priority' => '0.6',
                    'changefreq' => 'weekly',
                ];
            });

        // Published dynamic pages (nested slugs allowed)
        Halaman::where('status', 'Publish')
            ->get(['slug'])
            ->each(function ($h) use (&$urls, $base) {
                if ($h->slug) {
                    $urls[] = ['loc' => $base . '/' . ltrim($h->slug, '/'), 'priority' => '0.7', 'changefreq' => 'monthly'];
                }
            });

        $xml = $this->render($urls);

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    private function dateOrNull($value): ?string
    {
        if (!$value) {
            return null;
        }
        try {
            return \Illuminate\Support\Carbon::parse($value)->toDateString();
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function render(array $urls): string
    {
        $lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
        $lines[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $u) {
            $lines[] = '  <url>';
            $lines[] = '    <loc>' . htmlspecialchars($u['loc'], ENT_XML1) . '</loc>';
            if (!empty($u['lastmod'])) {
                $lines[] = '    <lastmod>' . $u['lastmod'] . '</lastmod>';
            }
            if (!empty($u['changefreq'])) {
                $lines[] = '    <changefreq>' . $u['changefreq'] . '</changefreq>';
            }
            if (!empty($u['priority'])) {
                $lines[] = '    <priority>' . $u['priority'] . '</priority>';
            }
            $lines[] = '  </url>';
        }
        $lines[] = '</urlset>';

        return implode("\n", $lines);
    }
}
