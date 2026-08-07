<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Berita, Kategori, User};
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Reporting/recap endpoints for the admin area. Read-only: these never mutate
 * content, they only aggregate it for review and export.
 */
class LaporanController extends Controller
{
    /** Columns the report may be sorted by, mapped to their real column. */
    private const SORTABLE = [
        'tanggal' => 'tanggal_post',
        'judul' => 'judul',
        'views' => 'views',
        'kategori' => null, // sorted by joined category name, see berita()
        'status' => 'status_berita',
    ];

    private const MAX_PER_PAGE = 1000;

    /**
     * News recap: title, release date, view count and public link, filterable
     * by period/category/status/author and sortable on any reported column.
     */
    public function berita(Request $request)
    {
        [$from, $to] = $this->period($request);
        $filtered = fn () => $this->filtered($request, $from, $to);

        // Totals cover the whole filtered set, not just the page being viewed.
        $summary = $filtered()
            ->selectRaw('COUNT(*) as jumlah')
            ->selectRaw('COALESCE(SUM(views), 0) as total_views')
            ->selectRaw("SUM(CASE WHEN status_berita = 'Publish' THEN 1 ELSE 0 END) as terbit")
            ->first();

        $jumlah = (int) $summary->jumlah;
        $totalViews = (int) $summary->total_views;
        $terbit = (int) $summary->terbit;

        $sortKey = $request->get('sort', 'tanggal');
        // array_key_exists, not isset: 'kategori' maps to null by design.
        if (!array_key_exists($sortKey, self::SORTABLE)) {
            $sortKey = 'tanggal'; // reject unknown keys instead of echoing them back
        }
        $direction = strtolower($request->get('dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $perPage = (int) $request->get('per_page', 25);
        $perPage = max(1, min($perPage, self::MAX_PER_PAGE));

        $rows = $filtered()->with(['kategori:idkat,nmkat', 'user:id_user,nama']);

        if ($sortKey === 'kategori') {
            // Sort on the category *name* the report shows, not the raw idkat.
            $rows->orderBy(Kategori::select('nmkat')->whereColumn('kategori.idkat', 'berita.idkat'), $direction);
        } else {
            $rows->orderBy(self::SORTABLE[$sortKey], $direction);
        }

        $rows = $rows
            ->orderBy('id_berita', 'desc') // stable tie-break for equal values
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json([
            'data' => collect($rows->items())->map(fn ($b) => [
                'id_berita' => $b->id_berita,
                'judul' => $b->judul,
                'slug' => $b->slug,
                'path' => '/berita/' . ($b->slug ?: $b->id_berita),
                'tanggal_post' => optional($b->tanggal_post)->toDateString(),
                'status_berita' => $b->status_berita,
                'views' => (int) $b->views,
                'is_pinned' => (bool) $b->is_pinned,
                'kategori' => $b->kategori?->nmkat,
                'penulis' => $b->user?->nama,
            ]),
            'summary' => [
                'jumlah_berita' => $jumlah,
                'total_views' => $totalViews,
                'rata_views' => $jumlah > 0 ? round($totalViews / $jumlah, 1) : 0,
                'terbit' => $terbit,
                'draft' => $jumlah - $terbit,
                'from' => $from,
                'to' => $to,
            ],
            'meta' => [
                'current_page' => $rows->currentPage(),
                'last_page' => $rows->lastPage(),
                'per_page' => $rows->perPage(),
                'total' => $rows->total(),
                'sort' => $sortKey,
                'dir' => $direction,
            ],
        ]);
    }

    /**
     * Aggregates behind the report charts. Every series is grouped in SQL over
     * the whole filtered set — never derived from the paginated table rows.
     */
    public function beritaGrafik(Request $request)
    {
        [$from, $to] = $this->period($request);
        $filtered = fn () => $this->filtered($request, $from, $to);

        // 1. Release trend per month, split published vs draft.
        $monthExpr = $this->monthExpr();
        $trenRows = $filtered()
            ->selectRaw("$monthExpr as periode")
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status_berita = 'Publish' THEN 1 ELSE 0 END) as terbit")
            ->whereNotNull('tanggal_post')
            ->groupBy('periode')
            ->orderBy('periode')
            ->get()
            ->keyBy('periode');

        // 2. Most-viewed news.
        $topBerita = $filtered()
            ->orderBy('views', 'desc')
            ->orderBy('id_berita', 'desc')
            ->limit(10)
            ->get(['id_berita', 'judul', 'slug', 'views'])
            ->map(fn ($b) => [
                'judul' => $b->judul,
                'views' => (int) $b->views,
                'path' => '/berita/' . ($b->slug ?: $b->id_berita),
            ]);

        // 3. Distribution across categories.
        $namaKategori = Kategori::pluck('nmkat', 'idkat');
        $kategori = $filtered()
            ->selectRaw('idkat')
            ->selectRaw('COUNT(*) as jumlah')
            ->selectRaw('COALESCE(SUM(views), 0) as views')
            ->groupBy('idkat')
            ->get()
            ->map(fn ($r) => [
                'nama' => $r->idkat ? ($namaKategori[$r->idkat] ?? 'Kategori #' . $r->idkat) : 'Tanpa Kategori',
                'jumlah' => (int) $r->jumlah,
                'views' => (int) $r->views,
            ])
            ->sortByDesc('jumlah')
            ->values();

        // 4. Contribution per author.
        $namaPenulis = User::pluck('nama', 'id_user');
        $penulis = $filtered()
            ->selectRaw('id_user')
            ->selectRaw('COUNT(*) as jumlah')
            ->selectRaw('COALESCE(SUM(views), 0) as views')
            ->groupBy('id_user')
            ->get()
            ->map(fn ($r) => [
                'nama' => $r->id_user ? ($namaPenulis[$r->id_user] ?? 'Pengguna #' . $r->id_user) : 'Tanpa Penulis',
                'jumlah' => (int) $r->jumlah,
                'views' => (int) $r->views,
            ])
            ->sortByDesc('jumlah')
            ->values();

        return response()->json([
            'tren' => $this->fillMonths($trenRows),
            'top_berita' => $topBerita,
            'kategori' => $kategori,
            'penulis' => $penulis,
        ]);
    }

    /** Dropdown options for the report filter bar. */
    public function beritaFilters()
    {
        return response()->json([
            'kategori' => Kategori::orderBy('nmkat')->get(['idkat', 'nmkat']),
            'penulis' => User::whereIn('id_user', Berita::whereNotNull('id_user')->distinct()->pluck('id_user'))
                ->orderBy('nama')
                ->get(['id_user', 'nama'])
                ->map(fn ($u) => ['id_user' => $u->id_user, 'nama' => $u->nama]),
            'status' => ['Publish', 'Draft'],
        ]);
    }

    /** The one filter definition every report endpoint shares. */
    private function filtered(Request $request, ?string $from, ?string $to)
    {
        return Berita::query()
            ->when($from, fn ($q) => $q->whereDate('tanggal_post', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('tanggal_post', '<=', $to))
            ->when($request->filled('kategori'), fn ($q) => $q->where('idkat', (int) $request->kategori))
            ->when($request->filled('penulis'), fn ($q) => $q->where('id_user', (int) $request->penulis))
            ->when($request->filled('status'), fn ($q) => $q->where('status_berita', $request->status))
            ->when($request->filled('search'), function ($q) use ($request) {
                $like = '%' . addcslashes(trim($request->search), '%_\\') . '%';
                $q->where(fn ($w) => $w->where('judul', 'like', $like)->orWhere('keyword', 'like', $like));
            });
    }

    /** 'YYYY-MM' bucket expression for the active database driver. */
    private function monthExpr(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', tanggal_post)",
            'pgsql' => "to_char(tanggal_post, 'YYYY-MM')",
            default => "DATE_FORMAT(tanggal_post, '%Y-%m')",
        };
    }

    private const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    /**
     * Turn the grouped month rows into a gap-free series between the first and
     * last month present, so a quiet month reads as zero instead of vanishing
     * from the time axis. Capped so an all-time range can't explode the chart.
     */
    private function fillMonths($rows): array
    {
        if ($rows->isEmpty()) {
            return [];
        }

        $keys = $rows->keys()->sort()->values();
        $cursor = Carbon::createFromFormat('Y-m-d', $keys->first() . '-01')->startOfMonth();
        $last = Carbon::createFromFormat('Y-m-d', $keys->last() . '-01')->startOfMonth();

        $out = [];
        while ($cursor->lte($last) && count($out) < 36) {
            $key = $cursor->format('Y-m');
            $row = $rows->get($key);
            $total = (int) ($row->total ?? 0);
            $terbit = (int) ($row->terbit ?? 0);
            $out[] = [
                'periode' => $key,
                'label' => self::MONTHS_ID[$cursor->month - 1] . ' ' . $cursor->format('y'),
                'terbit' => $terbit,
                'draft' => $total - $terbit,
                'total' => $total,
            ];
            $cursor->addMonth();
        }

        return $out;
    }

    /**
     * Normalise the reporting period. Both bounds are optional — an empty
     * period means "all time", which is a legitimate recap.
     */
    private function period(Request $request): array
    {
        $parse = function (?string $value) {
            if (!$value) {
                return null;
            }
            try {
                return Carbon::parse($value)->toDateString();
            } catch (\Throwable) {
                return null;
            }
        };

        $from = $parse($request->get('from'));
        $to = $parse($request->get('to'));

        if ($from && $to && $from > $to) {
            [$from, $to] = [$to, $from];
        }

        return [$from, $to];
    }
}
