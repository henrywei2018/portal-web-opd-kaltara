<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

/**
 * Memindahkan gambar berita hasil impor WordPress dari situs lama ke
 * public/gambar/wp/ lalu mengganti URL-nya di database. Dijalankan bertahap:
 *
 *   --inventaris  kumpulkan URL gambar situs lama (hanya baca)
 *   --unduh       unduh ke public/gambar/wp/<tahun>/<bulan>/<berkas>; bisa diulang
 *   --tulis       ganti URL yang berkasnya sudah ada (pakai --dry-run dulu)
 *   --balik=LOG   kembalikan perubahan dari log --tulis
 *
 * Struktur folder mengikuti wp-content/uploads agar penggantian URL cukup satu
 * aturan dan mudah dibalik. URL yang gagal diunduh tetap menunjuk situs lama.
 */
class MigrasiGambarWp extends Command
{
    protected $signature = 'gambar:migrasi-wp
        {--inventaris : Kumpulkan URL gambar situs lama ke daftar kerja}
        {--unduh : Unduh berkas di daftar kerja yang belum ada}
        {--tulis : Ganti URL di database dengan berkas lokal}
        {--balik= : Kembalikan perubahan dari berkas log --tulis}
        {--dry-run : Untuk --tulis: hanya laporkan}
        {--host=diskominfo.kaltaraprov.go.id : Host situs WordPress lama}
        {--paralel=4 : Unduhan bersamaan}
        {--jeda=250 : Jeda antar-gelombang unduhan (ms)}';

    protected $description = 'Salin gambar berita dari situs WordPress lama ke server ini dan ganti URL-nya';

    // SVG sengaja tidak diizinkan: disajikan dari domain sendiri, skrip di
    // dalamnya ikut berjalan.
    private const MIME = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
    ];

    private const MAKS_BYTE = 25 * 1024 * 1024;

    // Kolom berita yang menyimpan nama/URL gambar utuh.
    private const KOLOM_GAMBAR = ['gambar', 'gambar2', 'gambar3', 'gambar4', 'gambar5'];

    public function handle(): int
    {
        if ($log = $this->option('balik')) {
            return $this->balik($log);
        }
        if ($this->option('inventaris')) {
            return $this->inventaris();
        }
        if ($this->option('unduh')) {
            return $this->unduh();
        }
        if ($this->option('tulis')) {
            return $this->tulis((bool) $this->option('dry-run'));
        }

        $this->error('Pilih satu tahap: --inventaris, --unduh, --tulis, atau --balik=LOG.');

        return self::INVALID;
    }

    private function inventaris(): int
    {
        $url = [];
        $ditolak = [];
        $tautanLain = 0;

        $this->setiapBerita(function ($r) use (&$url, &$ditolak, &$tautanLain) {
            foreach ($this->urlDi($r) as $u) {
                if ($this->lokal($u) !== null) {
                    $url[$u] = true;
                } elseif ($this->tampakGambar($u)) {
                    $ditolak[$u] = true;
                } else {
                    $tautanLain++;
                }
            }
        });

        $this->simpanDaftar('daftar.txt', array_keys($url));
        $this->simpanDaftar('ditolak.txt', array_keys($ditolak));

        $this->line(sprintf('URL gambar siap diunduh : %d → %s', count($url), $this->kerja('daftar.txt')));
        $this->line(sprintf('Gambar dilewati         : %d (SVG/nama tak aman/kueri) → %s', count($ditolak), $this->kerja('ditolak.txt')));
        $this->line(sprintf('Tautan non-gambar       : %d (tidak dipindahkan)', $tautanLain));

        return self::SUCCESS;
    }

    private function unduh(): int
    {
        $daftar = $this->bacaDaftar('daftar.txt');
        if ($daftar === null) {
            $this->error('Jalankan --inventaris dulu.');

            return self::FAILURE;
        }

        $antre = array_values(array_filter($daftar, fn ($u) => !$this->berkasValid($this->path($this->lokal($u)))));
        $this->line(sprintf('%d URL, %d sudah ada, %d akan diunduh.', count($daftar), count($daftar) - count($antre), count($antre)));

        $gagal = [];
        $paralel = max(1, (int) $this->option('paralel'));
        $bar = $this->output->createProgressBar(count($antre));

        foreach (array_chunk($antre, $paralel) as $gelombang) {
            $respons = Http::pool(fn ($pool) => array_map(
                fn ($u) => $pool->as($u)->timeout(60)->withHeaders(['User-Agent' => 'MigrasiGambar/1.0'])->get($u),
                $gelombang
            ));

            foreach ($gelombang as $u) {
                $alasan = $this->simpan($u, $respons[$u] ?? null);
                if ($alasan !== null) {
                    $gagal[] = "$u\t$alasan";
                }
                $bar->advance();
            }
            usleep(max(0, (int) $this->option('jeda')) * 1000);
        }

        $bar->finish();
        $this->newLine();
        $this->simpanDaftar('gagal.txt', $gagal);
        $this->line(sprintf('Berhasil: %d, gagal: %d%s', count($antre) - count($gagal), count($gagal), $gagal ? ' → ' . $this->kerja('gagal.txt') : ''));

        return self::SUCCESS;
    }

    /** Simpan respons sebagai berkas; kembalikan alasan bila ditolak. */
    private function simpan(string $url, mixed $respons): ?string
    {
        if (!$respons instanceof \Illuminate\Http\Client\Response) {
            return 'koneksi: ' . ($respons instanceof \Throwable ? $respons->getMessage() : 'tanpa respons');
        }
        if ($respons->status() !== 200) {
            return 'HTTP ' . $respons->status();
        }

        $isi = $respons->body();
        if ($isi === '' || strlen($isi) > self::MAKS_BYTE) {
            return 'ukuran ' . strlen($isi);
        }

        // Jenis ditentukan dari isi berkas, bukan nama atau header server.
        $relatif = $this->lokal($url);
        $ext = strtolower(pathinfo($relatif, PATHINFO_EXTENSION));
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($isi);
        if ($mime !== self::MIME[$ext] || @getimagesizefromstring($isi) === false) {
            return "bukan gambar $ext (terdeteksi $mime)";
        }

        $tujuan = $this->path($relatif);
        if (!is_dir(dirname($tujuan)) && !mkdir(dirname($tujuan), 0775, true) && !is_dir(dirname($tujuan))) {
            return 'gagal membuat folder';
        }
        $sementara = $tujuan . '.unduh';
        if (file_put_contents($sementara, $isi) === false || !rename($sementara, $tujuan)) {
            @unlink($sementara);

            return 'gagal menulis berkas';
        }
        @chmod($tujuan, 0664);

        return null;
    }

    private function tulis(bool $kering): int
    {
        $log = $kering ? null : $this->kerja('tulis-' . now()->format('Ymd-His') . '.jsonl');
        $baris = 0;
        $diganti = 0;
        $tersisa = 0;

        $this->setiapBerita(function ($r) use ($kering, $log, &$baris, &$diganti, &$tersisa) {
            $ubah = [];

            foreach (self::KOLOM_GAMBAR as $k) {
                $nilai = (string) $r->{$k};
                if ($nilai === '' || !$this->milikHost($nilai)) {
                    continue;
                }
                $relatif = $this->lokal($nilai);
                if ($relatif !== null && $this->berkasValid($this->path($relatif))) {
                    // gambarUrl() di frontend menambahkan /gambar/ sendiri.
                    $ubah[$k] = $relatif;
                    $diganti++;
                } else {
                    $tersisa++;
                }
            }

            $isi = (string) $r->isi;
            $baru = preg_replace_callback($this->polaUrl(), function ($m) use (&$diganti, &$tersisa) {
                $relatif = $this->lokal($m[0]);
                if ($relatif !== null && $this->berkasValid($this->path($relatif))) {
                    $diganti++;

                    return '/gambar/' . $relatif;
                }
                if ($this->tampakGambar($m[0])) {
                    $tersisa++;
                }

                return $m[0];
            }, $isi);
            if ($baru !== $isi) {
                $ubah['isi'] = $baru;
            }

            if (!$ubah) {
                return;
            }
            $baris++;
            if ($kering) {
                return;
            }

            $lama = array_intersect_key((array) $r, $ubah);
            file_put_contents($log, json_encode(['id' => $r->id_berita, 'lama' => $lama, 'baru' => $ubah], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND);
            // Query builder agar tanggal pembaruan berita tidak berubah.
            DB::table('berita')->where('id_berita', $r->id_berita)->update($ubah);
        });

        $this->line(sprintf('%d berita %s, %d URL diganti, %d URL gambar tetap ke situs lama.', $baris, $kering ? 'akan berubah' : 'diperbarui', $diganti, $tersisa));
        if ($kering) {
            $this->comment('Mode uji: tidak ada yang ditulis.');
        } elseif ($baris) {
            $this->line('Log untuk --balik: ' . $log);
        }

        return self::SUCCESS;
    }

    private function balik(string $log): int
    {
        if (!is_file($log)) {
            $this->error("Log tidak ditemukan: $log");

            return self::FAILURE;
        }

        $kembali = 0;
        $dilewati = [];
        foreach (file($log, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $json) {
            $e = json_decode($json, true);
            $sekarang = (array) DB::table('berita')->where('id_berita', $e['id'])->first(array_keys($e['baru']));
            // Jangan timpa berita yang sudah diedit lagi setelah migrasi.
            if ($sekarang !== $e['baru']) {
                $dilewati[] = $e['id'];
                continue;
            }
            DB::table('berita')->where('id_berita', $e['id'])->update($e['lama']);
            $kembali++;
        }

        $this->line(sprintf('%d berita dikembalikan.', $kembali));
        if ($dilewati) {
            $this->warn('Dilewati karena sudah diubah sejak migrasi (id): ' . implode(', ', $dilewati));
        }

        return self::SUCCESS;
    }

    private function setiapBerita(callable $f): void
    {
        $host = $this->option('host');
        DB::table('berita')
            ->select(array_merge(['id_berita', 'isi'], self::KOLOM_GAMBAR))
            ->where(function ($q) use ($host) {
                foreach (array_merge(['isi'], self::KOLOM_GAMBAR) as $k) {
                    $q->orWhere($k, 'like', "%$host%");
                }
            })
            // chunkById, bukan chunk(): --tulis mengubah baris sehingga keluar
            // dari filter ini, dan paginasi offset akan melompati sebagian.
            ->chunkById(200, fn ($rows) => $rows->each($f), 'id_berita');
    }

    /** @return string[] URL situs lama di kolom gambar dan isi (src, srcset, href). */
    private function urlDi(object $r): array
    {
        $url = [];
        foreach (self::KOLOM_GAMBAR as $k) {
            $nilai = trim((string) $r->{$k});
            if ($nilai !== '' && $this->milikHost($nilai)) {
                $url[] = $nilai;
            }
        }
        preg_match_all($this->polaUrl(), (string) $r->isi, $m);

        return array_merge($url, $m[0]);
    }

    private function polaUrl(): string
    {
        // Berhenti di kutip, spasi, koma (pemisah srcset), dan tanda kurung.
        return '~https?://' . preg_quote($this->option('host'), '~') . '/[^\s"\'<>(),]+~i';
    }

    private function milikHost(string $url): bool
    {
        return strtolower((string) parse_url($url, PHP_URL_HOST)) === strtolower($this->option('host'));
    }

    private function tampakGambar(string $url): bool
    {
        return (bool) preg_match('~/wp-content/uploads/.+\.(jpe?g|png|gif|webp|svg|bmp)(\?.*)?$~i', $url);
    }

    /**
     * Path relatif di bawah public/gambar untuk URL situs lama, atau null bila
     * tidak boleh dipindahkan. Setiap segmen dibatasi ke karakter aman sehingga
     * hasilnya tidak bisa keluar dari public/gambar/wp.
     */
    private function lokal(string $url): ?string
    {
        $p = parse_url($url);
        if (!$p || !$this->milikHost($url) || !in_array(strtolower($p['scheme'] ?? ''), ['http', 'https'], true)
            || isset($p['query']) || isset($p['fragment'])) {
            return null;
        }
        if (!preg_match('~^/wp-content/uploads/(.+)$~', $p['path'] ?? '', $m)) {
            return null;
        }

        $segmen = explode('/', $m[1]);
        foreach ($segmen as $s) {
            if ($s === '.' || $s === '..' || !preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]*$/', $s)) {
                return null;
            }
        }
        if (!isset(self::MIME[strtolower(pathinfo(end($segmen), PATHINFO_EXTENSION))])) {
            return null;
        }

        return 'wp/' . implode('/', $segmen);
    }

    private function path(string $relatif): string
    {
        return public_path('gambar/' . $relatif);
    }

    private function berkasValid(string $path): bool
    {
        return is_file($path) && filesize($path) > 0 && @getimagesize($path) !== false;
    }

    private function kerja(string $nama): string
    {
        $dir = storage_path('app/migrasi-wp');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir . '/' . $nama;
    }

    private function simpanDaftar(string $nama, array $baris): void
    {
        file_put_contents($this->kerja($nama), $baris ? implode("\n", $baris) . "\n" : '');
    }

    /** @return string[]|null */
    private function bacaDaftar(string $nama): ?array
    {
        $f = $this->kerja($nama);

        return is_file($f) ? file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : null;
    }
}
