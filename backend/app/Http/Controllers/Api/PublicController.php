<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Berita, Kategori, Pengumuman, Galeri, Infografis, Video, Slider, Sejarah, TugasFungsi, StrukturOrganisasi, Sambutan, Download, Komentar, Artikel, Menu, Halaman, Dokumen, KategoriDokumen, Layanan, HeroSlide, Statistik, TautanPenting, Promosi, Kunjungan};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PublicController extends Controller
{
    public function berita(Request $request)
    {
        $query = Berita::with(['user', 'kategori'])
            ->where('status_berita', 'Publish')
            ->orderBy('id_berita', 'desc');

        // Featured/pinned news (home "Berita Pilihan")
        if ($request->boolean('pinned')) {
            $query->where('is_pinned', true);
        }

        if ($request->has('kategori_id')) {
            $query->where('idkat', $request->kategori_id);
        }

        if ($request->has('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        $perPage = (int) $request->get('limit', $request->get('per_page', 5));
        return response()->json($query->paginate($perPage));
    }

    public function detailBerita($id)
    {
        // Resolve by slug (preferred) or numeric id (legacy URLs)
        $berita = Berita::with(['user', 'kategori'])
            ->where('status_berita', 'Publish')
            ->where(function ($q) use ($id) {
                $q->where('slug', $id);
                if (ctype_digit((string) $id)) {
                    $q->orWhere('id_berita', (int) $id);
                }
            })
            ->first();

        if (!$berita) {
            return response()->json(['error' => 'Not found'], 404);
        }

        // Track a view
        $berita->increment('views');

        // Related news
        $related = Berita::where('idkat', $berita->idkat)
            ->where('id_berita', '!=', $berita->id_berita)
            ->where('status_berita', 'Publish')
            ->limit(3)
            ->get();

        // Latest news
        $latest = Berita::where('status_berita', 'Publish')
            ->where('id_berita', '!=', $berita->id_berita)
            ->orderBy('id_berita', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'berita' => $berita,
            'related' => $related,
            'latest' => $latest
        ]);
    }

    public function kategoriBerita($id)
    {
        $kategori = Kategori::find($id);
        if (!$kategori) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $berita = Berita::with(['user', 'kategori'])
            ->where('idkat', $id)
            ->where('status_berita', 'Publish')
            ->orderBy('id_berita', 'desc')
            ->paginate(10);

        return response()->json([
            'kategori' => $kategori,
            'berita' => $berita
        ]);
    }

    public function kategori()
    {
        return response()->json(Kategori::orderBy('nmkat', 'asc')->get());
    }

    public function pengumuman()
    {
        return response()->json(
            Pengumuman::orderBy('id_pengumuman', 'desc')->get()
        );
    }

    public function galeri(Request $request)
    {
        $perPage = $request->get('per_page', 12);
        return response()->json(
            Galeri::where('status', 'Publish')
                ->orderBy('id_galeri', 'desc')
                ->paginate($perPage)
        );
    }

    /**
     * Record one site visit (page view). Called by the SPA on each public route
     * change. Bots (JS-executing crawlers) are flagged and excluded from stats.
     */
    public function track(Request $request)
    {
        $data = $request->validate([
            'path' => 'nullable|string|max:512',
            'visitor_id' => 'nullable|string|max:64',
            'referrer' => 'nullable|string|max:512',
        ]);

        $ua = (string) $request->userAgent();
        $isBot = (bool) preg_match('/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|lighthouse|headless|monitor|preview/i', $ua);

        Kunjungan::create([
            'path' => $data['path'] ?? '/',
            'visitor_id' => $data['visitor_id'] ?? null,
            'referrer' => $data['referrer'] ?? null,
            'ip_hash' => hash('sha256', $request->ip() . '|' . config('app.key')),
            'is_bot' => $isBot,
            'created_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    /** Public visitor statistics widget (online / today / yesterday / week / month / total). */
    public function statistikKunjungan()
    {
        $now = now();
        $base = fn () => Kunjungan::where('is_bot', false);

        return response()->json([
            'online' => (int) $base()->where('created_at', '>=', $now->copy()->subMinutes(5))->distinct('visitor_id')->count('visitor_id'),
            'hari_ini' => (int) $base()->where('created_at', '>=', $now->copy()->startOfDay())->count(),
            'kemarin' => (int) $base()->whereBetween('created_at', [$now->copy()->subDay()->startOfDay(), $now->copy()->subDay()->endOfDay()])->count(),
            'minggu_ini' => (int) $base()->where('created_at', '>=', $now->copy()->startOfWeek())->count(),
            'bulan_ini' => (int) $base()->where('created_at', '>=', $now->copy()->startOfMonth())->count(),
            'total' => (int) $base()->count(),
            'total_pengunjung' => (int) $base()->distinct('visitor_id')->count('visitor_id'),
        ]);
    }

    public function infografis()
    {
        return response()->json(
            Infografis::where('status', 'Publish')
                ->orderBy('id_infografis', 'desc')
                ->get()
        );
    }

    public function video()
    {
        return response()->json(
            Video::orderBy('id_video', 'desc')->paginate(6)
        );
    }

    public function slider()
    {
        return response()->json(
            Slider::orderBy('id_slider', 'asc')->get()
        );
    }

    public function sejarah()
    {
        return response()->json(
            Sejarah::orderBy('id', 'desc')->first()
        );
    }

    public function tugasfungsi()
    {
        return response()->json(
            TugasFungsi::orderBy('id', 'desc')->first()
        );
    }

    public function struktur()
    {
        return response()->json(
            StrukturOrganisasi::orderBy('id', 'desc')->first()
        );
    }

    public function sambutan()
    {
        return response()->json(
            Sambutan::orderBy('id_sambutan', 'asc')->get()
        );
    }

    public function publikasi()
    {
        return response()->json(
            Download::orderBy('id_download', 'desc')->get()
        );
    }

    public function kontak(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'nomorkontak' => 'nullable|string|max:50',
            'subjek' => 'required|string|max:255',
            'pesan' => 'required|string|max:5000',
            'recaptcha_token' => 'nullable|string',
        ]);

        // Verify reCAPTCHA. Skipped in local dev (BYPASS_RECAPTCHA) and also when
        // no secret is configured yet — so the form works before keys are set.
        $secret = env('RECAPTCHA_SECRET');
        $bypass = (app()->environment('local') && config('app.bypass_recaptcha')) || empty($secret);
        if (!$bypass) {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $validated['recaptcha_token'] ?? '',
                'remoteip' => $request->ip(),
            ]);
            if (!$response->json('success')) {
                return response()->json(['error' => 'reCAPTCHA verification failed'], 400);
            }
        }

        $komentar = Komentar::create([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'nomorkontak' => $validated['nomorkontak'] ?? '',
            'subjek' => $validated['subjek'],
            'pesan' => $validated['pesan'],
            'tanggal_post' => now(),
            'is_read' => 0,
        ]);

        return response()->json(['message' => 'Pesan terkirim', 'data' => $komentar], 201);
    }

    public function downloadFile($id)
    {
        $download = Download::find($id);
        if (!$download) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $path = public_path('file/' . $download->file);

        if (!file_exists($path)) {
            return response()->json(['error' => 'File not found on server'], 404);
        }

        return response()->download($path);
    }

    public function artikel(Request $request)
    {
        $query = Artikel::with(['user', 'kategori'])
            ->where('status_artikel', 'Publish')
            ->orderBy('id_artikel', 'desc');

        if ($request->has('kategori_id')) {
            $query->where('idkat', $request->kategori_id);
        }

        if ($request->has('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->get('per_page', 5);
        return response()->json($query->paginate($perPage));
    }

    public function detailArtikel($id)
    {
        // Resolve by slug (preferred) or numeric id (legacy URLs)
        $artikel = Artikel::with(['user', 'kategori'])
            ->where('status_artikel', 'Publish')
            ->where(function ($q) use ($id) {
                $q->where('slug', $id);
                if (ctype_digit((string) $id)) {
                    $q->orWhere('id_artikel', (int) $id);
                }
            })
            ->first();

        if (!$artikel) {
            return response()->json(['error' => 'Not found'], 404);
        }

        // Related articles
        $related = Artikel::where('idkat', $artikel->idkat)
            ->where('id_artikel', '!=', $artikel->id_artikel)
            ->where('status_artikel', 'Publish')
            ->limit(3)
            ->get();

        // Latest articles
        $latest = Artikel::where('status_artikel', 'Publish')
            ->where('id_artikel', '!=', $artikel->id_artikel)
            ->orderBy('id_artikel', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'artikel' => $artikel,
            'related' => $related,
            'latest' => $latest
        ]);
    }

    /**
     * Active navigation menu as a tree (only active items, ordered).
     */
    public function menu()
    {
        $all = Menu::with('halaman:id_halaman,judul,slug')
            ->where('is_active', true)
            ->orderBy('urutan')
            ->get();

        return response()->json(\App\Http\Controllers\Api\Admin\MenuController::buildTree($all, null));
    }

    /**
     * A published dynamic page by its slug.
     */
    public function halamanBySlug($slug)
    {
        $halaman = Halaman::where('slug', $slug)
            ->where('status', 'Publish')
            ->first();

        if (!$halaman) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($halaman);
    }

    /**
     * Published documents, optionally filtered by category slug.
     */
    public function dokumen(Request $request)
    {
        $query = Dokumen::with('kategori')
            ->where('status', 'Publish')
            ->orderBy('tanggal', 'desc')
            ->orderBy('id_dokumen', 'desc');

        if ($request->filled('kategori')) {
            $query->whereHas('kategori', fn ($q) => $q->where('slug', $request->kategori));
        }
        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('limit')) {
            $query->limit((int) $request->limit);
        }

        return response()->json($query->get());
    }

    /**
     * Active statistics, ordered.
     */
    public function statistik()
    {
        return response()->json(
            Statistik::where('is_active', true)->orderBy('urutan')->orderBy('id_statistik')->get()
        );
    }

    /**
     * Active hero slides (homepage), ordered.
     */
    public function hero()
    {
        return response()->json(
            HeroSlide::where('is_active', true)->orderBy('urutan')->orderBy('id_hero')->get()
        );
    }

    /**
     * Published services (layanan), ordered.
     */
    public function layanan()
    {
        return response()->json(
            Layanan::where('status', 'Publish')->orderBy('urutan')->orderBy('id_layanan')->get()
        );
    }

    /**
     * Document categories (with document counts).
     */
    public function kategoriDokumen()
    {
        return response()->json(
            KategoriDokumen::withCount(['dokumen' => fn ($q) => $q->where('status', 'Publish')])
                ->orderBy('nama')
                ->get()
        );
    }

    /**
     * Download a document file with its original filename.
     */
    public function dokumenFile($id)
    {
        $dokumen = Dokumen::find($id);
        if (!$dokumen) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $path = public_path('file/' . $dokumen->file);
        if (!file_exists($path)) {
            return response()->json(['error' => 'File not found on server'], 404);
        }

        return response()->download($path, $dokumen->nama_file ?: $dokumen->file);
    }

    public function tautanPenting()
    {
        return response()->json(
            TautanPenting::where('is_active', true)->orderBy('urutan')->orderBy('id_tautan')->get()
        );
    }

    public function promosi()
    {
        return response()->json(
            Promosi::where('is_active', true)->orderBy('id_promosi', 'desc')->get()
        );
    }

    public function settings()
    {
        return response()->json(\App\Models\Setting::asObject());
    }
}
