<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Berita, Artikel, Infografis, Halaman, Layanan, Dokumen, Kategori, Pengumuman, Galeri, Video, Slider, Download, User, Komentar, Kunjungan, AuditLog, Sejarah, TugasFungsi, StrukturOrganisasi, Sambutan};
use App\Support\HtmlAman;
use App\Support\Roles;
use App\Support\Unggah;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            // Content counts
            'count_berita' => Berita::count(),
            'count_berita_pub' => Berita::where('status_berita', 'Publish')->count(),
            'count_berita_pinned' => Berita::where('is_pinned', true)->count(),
            'count_artikel' => Artikel::count(),
            'count_infografis' => Infografis::count(),
            'count_pengumuman' => Pengumuman::count(),
            'count_galeri' => Galeri::count(),
            'count_video' => Video::count(),
            'count_dokumen' => Dokumen::count(),
            'count_halaman' => Halaman::count(),
            'count_layanan' => Layanan::count(),
            'count_kategori' => Kategori::count(),
            'count_download' => Download::count(),
            // Engagement (real, from view tracking)
            'count_berita_views' => (int) Berita::sum('views'),
            // People & messages
            'count_user' => User::count(),
            'count_pesan' => Komentar::count(),
            'count_unread' => Komentar::where('is_read', 0)->count(),
        ];

        // Latest news
        $berita_terbaru = Berita::with(['user', 'kategori'])
            ->orderBy('id_berita', 'desc')
            ->limit(5)
            ->get();

        // Most-viewed published news (real, from view tracking)
        $berita_terpopuler = Berita::with('kategori')
            ->where('status_berita', 'Publish')
            ->orderBy('views', 'desc')
            ->limit(5)
            ->get(['id_berita', 'judul', 'slug', 'views', 'gambar', 'tanggal_post', 'idkat']);

        // Latest messages
        $pesan_terbaru = Komentar::orderBy('is_read', 'asc')
            ->orderBy('id_komentar', 'desc')
            ->limit(5)
            ->get();

        // Jejak aktivitas memuat nama petugas dan IP; hanya untuk pengelola pengguna.
        $audit_terbaru = Roles::can(auth('api')->user(), 'pengguna')
            ? AuditLog::orderBy('created_at', 'desc')->limit(6)->get()
            : collect();

        // Content distribution (for the mix chart)
        $content_mix = [
            ['label' => 'Berita', 'count' => (int) $stats['count_berita']],
            ['label' => 'Artikel', 'count' => (int) $stats['count_artikel']],
            ['label' => 'Galeri', 'count' => (int) $stats['count_galeri']],
            ['label' => 'Infografis', 'count' => (int) $stats['count_infografis']],
            ['label' => 'Video', 'count' => (int) $stats['count_video']],
            ['label' => 'Dokumen', 'count' => (int) $stats['count_dokumen']],
            ['label' => 'Pengumuman', 'count' => (int) $stats['count_pengumuman']],
        ];

        // 6-month trend: news published + messages received per month (real time series)
        $chart_data = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = now()->subMonths($i);
            $start = $d->copy()->startOfMonth();
            $end = $d->copy()->endOfMonth();
            $chart_data[] = [
                'label' => $d->format('M Y'),
                'berita' => (int) Berita::whereBetween('tanggal_post', [$start, $end])->count(),
                'pesan' => (int) Komentar::whereBetween('tanggal_post', [$start, $end])->count(),
            ];
        }

        // ---- Site traffic (real, from visit tracking; bots excluded) ----
        $visit = Kunjungan::where('is_bot', false);
        $today = now()->startOfDay();
        $traffic = [
            'total_pageviews' => (clone $visit)->count(),
            'unique_visitors' => (clone $visit)->distinct('visitor_id')->count('visitor_id'),
            'pageviews_today' => (clone $visit)->where('created_at', '>=', $today)->count(),
            'visitors_today' => (clone $visit)->where('created_at', '>=', $today)->distinct('visitor_id')->count('visitor_id'),
        ];

        return response()->json([
            'stats' => $stats,
            'berita_terbaru' => $berita_terbaru,
            'berita_terpopuler' => $berita_terpopuler,
            'pesan_terbaru' => $pesan_terbaru,
            'audit_terbaru' => $audit_terbaru,
            'content_mix' => $content_mix,
            'chart_data' => $chart_data,
            'traffic' => $traffic,
        ]);
    }

    /** Date-range visit report (for reporting/export). Defaults to the last 30 days. */
    public function laporanKunjungan(Request $request)
    {
        $from = $request->filled('from')
            ? \Illuminate\Support\Carbon::parse($request->get('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();
        $to = $request->filled('to')
            ? \Illuminate\Support\Carbon::parse($request->get('to'))->endOfDay()
            : now()->endOfDay();
        if ($to->lt($from)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $base = fn () => Kunjungan::where('is_bot', false)->whereBetween('created_at', [$from, $to]);

        $total = (int) $base()->count();
        $unique = (int) $base()->distinct('visitor_id')->count('visitor_id');

        // Per-day counts in a single grouped query, then fill the gap days
        $byDate = $base()->selectRaw('DATE(created_at) as d, COUNT(*) as views')->groupBy('d')->pluck('views', 'd');
        $daily = [];
        $cursor = $from->copy();
        $guard = 0;
        while ($cursor->lte($to) && $guard++ < 400) {
            $key = $cursor->format('Y-m-d');
            $daily[] = ['label' => $cursor->format('d/m'), 'date' => $key, 'views' => (int) ($byDate[$key] ?? 0)];
            $cursor->addDay();
        }

        $top_pages = $base()->selectRaw('path, COUNT(*) as total')
            ->groupBy('path')->orderByDesc('total')->limit(10)->get();

        $top_referrers = $base()->whereNotNull('referrer')->where('referrer', '!=', '')
            ->selectRaw('referrer, COUNT(*) as total')
            ->groupBy('referrer')->orderByDesc('total')->limit(8)->get();

        return response()->json([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'total_pageviews' => $total,
            'unique_visitors' => $unique,
            'daily' => $daily,
            'top_pages' => $top_pages,
            'top_referrers' => $top_referrers,
        ]);
    }

    public function auditLog(Request $request)
    {
        $limit = max(1, min((int) $request->get('limit', 50), 200));
        $offset = max(0, (int) $request->get('offset', 0));

        $logs = AuditLog::orderBy('created_at', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get();

        $total = AuditLog::count();

        return response()->json([
            'logs' => $logs,
            'total' => $total,
        ]);
    }

    public function getSejarah()
    {
        return response()->json(Sejarah::orderBy('id', 'desc')->first());
    }

    public function updateSejarah(Request $request)
    {
        $isi = HtmlAman::bersihkan($request->validate(['isi' => 'required|string|max:200000'])['isi']);
        $sejarah = Sejarah::orderBy('id', 'desc')->first();
        if (!$sejarah) {
            $sejarah = Sejarah::create(['isi' => $isi]);
        } else {
            $sejarah->update(['isi' => $isi]);
        }

        return response()->json($sejarah);
    }

    public function getTugasFungsi()
    {
        return response()->json(TugasFungsi::orderBy('id', 'desc')->first());
    }

    public function updateTugasFungsi(Request $request)
    {
        $isi = HtmlAman::bersihkan($request->validate(['isi' => 'required|string|max:200000'])['isi']);
        $tugasfungsi = TugasFungsi::orderBy('id', 'desc')->first();
        if (!$tugasfungsi) {
            $tugasfungsi = TugasFungsi::create(['isi' => $isi]);
        } else {
            $tugasfungsi->update(['isi' => $isi]);
        }

        return response()->json($tugasfungsi);
    }

    public function getStruktur()
    {
        return response()->json(StrukturOrganisasi::orderBy('id', 'desc')->first());
    }

    public function updateStruktur(Request $request)
    {
        $valid = $request->validate([
            'file' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:10240',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        $filename = $request->hasFile('file')
            ? Unggah::simpan($request->file('file'), 'gambar', Unggah::GAMBAR)
            : null;

        $struktur = StrukturOrganisasi::orderBy('id', 'desc')->first();
        $data = ['keterangan' => $valid['keterangan'] ?? null];

        if ($filename) {
            $data['file'] = $filename;
        }

        if (!$struktur) {
            $struktur = StrukturOrganisasi::create($data);
        } else {
            $struktur->update($data);
        }

        return response()->json($struktur);
    }

    public function getSambutan()
    {
        return response()->json(Sambutan::orderBy('id_sambutan', 'asc')->get());
    }
}
