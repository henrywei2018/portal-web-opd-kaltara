<?php

namespace Tests\Feature;

use App\Models\Berita;
use App\Models\Halaman;
use App\Models\User;
use App\Support\HtmlAman;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KeamananKontenTest extends TestCase
{
    use RefreshDatabase;

    public function test_sanitasi_membuang_vektor_xss_tetapi_mempertahankan_konten(): void
    {
        $bersih = HtmlAman::bersihkan(
            '<p style="text-align:center">Halo <a href="https://kaltaraprov.go.id">tautan</a></p>'
            . '<img src="/gambar/a.jpg" onerror="fetch(1)">'
            . '<script>alert(localStorage.token)</script>'
            . '<a href="javascript:alert(1)">x</a>'
            . '<iframe src="https://www.youtube.com/embed/abc" allowfullscreen></iframe>'
            . '<iframe src="https://evil.example/x"></iframe>'
            . '<iframe src="https://youtube.com.evil.example/x"></iframe>'
        );

        $this->assertStringContainsString('style="text-align:center"', $bersih);
        $this->assertStringContainsString('href="https://kaltaraprov.go.id"', $bersih);
        $this->assertStringContainsString('src="https://www.youtube.com/embed/abc"', $bersih);
        $this->assertStringNotContainsString('<script', $bersih);
        $this->assertStringNotContainsString('onerror', $bersih);
        $this->assertStringNotContainsString('javascript:', $bersih);
        $this->assertStringNotContainsString('evil.example', $bersih);
    }

    public function test_sanitasi_stabil_bila_diulang_termasuk_isi_iframe(): void
    {
        // Sisa penanda kursor TinyMCE di dalam iframe (impor dari situs lama).
        $sekali = HtmlAman::bersihkan(
            '<p>Dokumen</p><iframe src="https://www.youtube.com/embed/abc" width="100%">'
            . '<span data-mce-type="bookmark" style="display:inline-block">x</span></iframe>'
        );

        $this->assertSame(
            '<p>Dokumen</p><iframe src="https://www.youtube.com/embed/abc" width="100%"></iframe>',
            $sekali
        );
        $this->assertSame($sekali, HtmlAman::bersihkan($sekali));
    }

    public function test_isi_berita_disanitasi_saat_disimpan_lewat_jalur_mana_pun(): void
    {
        $penulis = User::create(['nama' => 'Kontributor', 'username' => 'kontrib', 'password' => bcrypt('x'), 'role' => 'kontributor', 'status' => 1]);
        $berita = new Berita();
        $berita->forceFill([
            'id_user' => $penulis->id_user,
            'judul' => 'Uji',
            'isi' => '<p>aman</p><img src=x onerror="alert(1)"><script>alert(2)</script>',
            'tanggal_post' => now()->toDateString(),
        ])->save();

        $tersimpan = Berita::find($berita->getKey())->isi;
        $this->assertStringContainsString('<p>aman</p>', $tersimpan);
        $this->assertStringNotContainsString('onerror', $tersimpan);
        $this->assertStringNotContainsString('<script', $tersimpan);
    }

    public function test_blok_html_halaman_disanitasi_di_kedalaman_berapa_pun(): void
    {
        $halaman = new Halaman();
        $halaman->forceFill([
            'judul' => 'Uji',
            'slug' => 'uji-keamanan',
            'blocks' => [
                ['type' => 'html', 'data' => ['html' => '<section style="padding:8px"><script>alert(1)</script>ok</section>']],
                ['type' => 'kolom', 'data' => ['isi' => [['type' => 'text', 'data' => ['html' => '<b onclick="x()">t</b>', 'heading' => '<i>judul</i>']]]]],
            ],
        ])->save();

        $blok = Halaman::find($halaman->getKey())->blocks;
        $this->assertSame('<section style="padding:8px">ok</section>', $blok[0]['data']['html']);
        $this->assertSame('<b>t</b>', $blok[1]['data']['isi'][0]['data']['html']);
        // Hanya kunci `html` yang disentuh; teks lain dirender React sebagai teks.
        $this->assertSame('<i>judul</i>', $blok[1]['data']['isi'][0]['data']['heading']);
    }

    public function test_halaman_spa_mengirim_csp_dengan_nonce_yang_cocok_dengan_skrip(): void
    {
        if (!file_exists(public_path('index.html'))) {
            $this->markTestSkipped('public/index.html belum di-build.');
        }

        $res = $this->get('/kontak');
        $csp = $res->headers->get('Content-Security-Policy');

        $this->assertNotNull($csp);
        $this->assertMatchesRegularExpression("/script-src 'nonce-([A-Za-z0-9+\\/=]+)' 'strict-dynamic'/", $csp);
        preg_match("/'nonce-([^']+)'/", $csp, $m);
        $this->assertStringContainsString('<script nonce="' . $m[1] . '"', $res->getContent());
        $this->assertStringContainsString("object-src 'none'", $csp);
        $this->assertStringContainsString('https://www.youtube.com', $csp);
        $this->assertSame('nosniff', $res->headers->get('X-Content-Type-Options'));

        // Nonce baru di setiap respons.
        $this->assertStringNotContainsString($m[1], (string) $this->get('/kontak')->headers->get('Content-Security-Policy'));
    }

    public function test_csp_bisa_dialihkan_ke_mode_laporan(): void
    {
        if (!file_exists(public_path('index.html'))) {
            $this->markTestSkipped('public/index.html belum di-build.');
        }
        config(['keamanan.csp.report_only' => true]);

        $res = $this->get('/kontak');
        $this->assertNull($res->headers->get('Content-Security-Policy'));
        $this->assertNotNull($res->headers->get('Content-Security-Policy-Report-Only'));
    }
}
