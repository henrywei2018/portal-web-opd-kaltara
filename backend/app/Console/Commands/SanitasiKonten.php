<?php

namespace App\Console\Commands;

use App\Support\HtmlAman;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Membersihkan HTML konten yang tersimpan sebelum sanitasi saat-simpan
 * (App\Support\HtmlAman) diterapkan. Ditulis lewat query builder agar tanggal
 * pembaruan berita tidak ikut berubah.
 */
class SanitasiKonten extends Command
{
    protected $signature = 'konten:sanitasi {--dry-run : Hanya laporkan baris yang akan berubah}';

    protected $description = 'Sanitasi HTML isi berita, artikel, dan blok halaman yang sudah tersimpan';

    // tabel => [primary key, kolom, jenis]
    private const TARGET = [
        'berita' => ['id_berita', 'isi', 'html'],
        'artikel' => ['id_artikel', 'isi', 'html'],
        'halaman' => ['id_halaman', 'blocks', 'blok'],
    ];

    public function handle(): int
    {
        $kering = (bool) $this->option('dry-run');

        foreach (self::TARGET as $tabel => [$pk, $kolom, $jenis]) {
            $berubah = [];
            DB::table($tabel)->select([$pk, $kolom])->orderBy($pk)->chunk(200, function ($rows) use (&$berubah, $tabel, $pk, $kolom, $jenis, $kering) {
                foreach ($rows as $r) {
                    $lama = $r->{$kolom};
                    if ($lama === null || $lama === '') {
                        continue;
                    }

                    if ($jenis === 'html') {
                        $baru = HtmlAman::bersihkan($lama);
                    } else {
                        $blok = json_decode($lama, true);
                        if (!is_array($blok)) {
                            continue;
                        }
                        $bersih = HtmlAman::bersihkanBlok($blok);
                        $baru = $bersih === $blok ? $lama : json_encode($bersih, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    }

                    if ($baru !== $lama) {
                        $berubah[] = $r->{$pk};
                        if (!$kering) {
                            DB::table($tabel)->where($pk, $r->{$pk})->update([$kolom => $baru]);
                        }
                    }
                }
            });

            $this->line(sprintf(
                '%-8s %d baris %s%s',
                $tabel,
                count($berubah),
                $kering ? 'akan berubah' : 'dibersihkan',
                $berubah ? ' (id: ' . implode(', ', array_slice($berubah, 0, 20)) . (count($berubah) > 20 ? ', …' : '') . ')' : ''
            ));
        }

        if ($kering) {
            $this->comment('Mode uji: tidak ada yang ditulis. Perubahan juga mencakup normalisasi format (mis. <img> menjadi <img />).');
        }

        return self::SUCCESS;
    }
}
