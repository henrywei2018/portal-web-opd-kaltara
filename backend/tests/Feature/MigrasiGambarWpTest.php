<?php

namespace Tests\Feature;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MigrasiGambarWpTest extends TestCase
{
    use RefreshDatabase;

    private const LAMA = 'https://diskominfo.kaltaraprov.go.id/wp-content/uploads';

    private string $tmp;

    protected function setUp(): void
    {
        parent::setUp();

        // Folder publik & kerja sementara agar test tidak menulis ke public/gambar asli.
        $this->tmp = sys_get_temp_dir() . '/migrasi-wp-' . uniqid();
        File::makeDirectory($this->tmp . '/public', 0775, true);
        File::makeDirectory($this->tmp . '/storage/app', 0775, true);
        $this->app->usePublicPath($this->tmp . '/public');
        $this->app->useStoragePath($this->tmp . '/storage');
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->tmp);
        parent::tearDown();
    }

    private function png(): string
    {
        $img = imagecreatetruecolor(2, 2);
        ob_start();
        imagepng($img);

        return ob_get_clean();
    }

    private function berita(array $kolom): int
    {
        $u = User::firstOrCreate(['username' => 'admin-uji'], ['nama' => 'Admin', 'password' => bcrypt('x'), 'role' => 'admin', 'status' => 1]);
        $b = new Berita();
        $b->forceFill(['id_user' => $u->id_user, 'judul' => 'Uji', 'tanggal_post' => now()->toDateString()] + $kolom)->save();

        return $b->getKey();
    }

    public function test_alur_inventaris_unduh_tulis_dan_balik(): void
    {
        $id = $this->berita([
            'gambar' => self::LAMA . '/2026/08/utama.png',
            'isi' => '<p>Isi</p><img src="' . self::LAMA . '/2026/08/isi.png" srcset="' . self::LAMA . '/2026/08/isi-300x200.png 300w, ' . self::LAMA . '/2026/08/isi.png 600w">'
                . '<a href="https://diskominfo.kaltaraprov.go.id/berita-lama/">tautan</a>'
                . '<img src="' . self::LAMA . '/2026/08/hilang.png">'
                . '<img src="' . self::LAMA . '/2026/08/palsu.png">'
                . '<img src="' . self::LAMA . '/2026/08/ikon.svg">',
        ]);
        $isiAwal = DB::table('berita')->where('id_berita', $id)->value('isi');

        Http::fake([
            '*/hilang.png' => Http::response('', 404),
            '*/palsu.png' => Http::response('<?php system($_GET["c"]);', 200),
            '*' => Http::response($this->png(), 200),
        ]);

        $this->artisan('gambar:migrasi-wp --inventaris')
            ->expectsOutputToContain('URL gambar siap diunduh : 5')
            ->assertSuccessful();

        $this->artisan('gambar:migrasi-wp --unduh')
            ->expectsOutputToContain('Berhasil: 3, gagal: 2')
            ->assertSuccessful();
        $this->assertFileExists(public_path('gambar/wp/2026/08/utama.png'));
        $this->assertFileExists(public_path('gambar/wp/2026/08/isi-300x200.png'));
        $this->assertFileDoesNotExist(public_path('gambar/wp/2026/08/palsu.png'));
        $this->assertFileDoesNotExist(public_path('gambar/wp/2026/08/ikon.svg'));

        // Unduh ulang hanya mencoba yang gagal.
        Http::fake(['*' => Http::response('', 404)]);
        $this->artisan('gambar:migrasi-wp --unduh')->expectsOutputToContain('3 sudah ada, 2 akan diunduh')->assertSuccessful();

        $this->artisan('gambar:migrasi-wp --tulis --dry-run')->assertSuccessful();
        $this->assertSame($isiAwal, DB::table('berita')->where('id_berita', $id)->value('isi'));

        $this->artisan('gambar:migrasi-wp --tulis')
            ->expectsOutputToContain('1 berita diperbarui, 4 URL diganti, 3 URL gambar tetap ke situs lama')
            ->assertSuccessful();

        $r = DB::table('berita')->where('id_berita', $id)->first();
        $this->assertSame('wp/2026/08/utama.png', $r->gambar);
        $this->assertStringContainsString('src="/gambar/wp/2026/08/isi.png"', $r->isi);
        $this->assertStringContainsString('/gambar/wp/2026/08/isi-300x200.png 300w, /gambar/wp/2026/08/isi.png 600w', $r->isi);
        // Yang gagal, ditolak, atau bukan gambar tetap menunjuk situs lama.
        $this->assertStringContainsString(self::LAMA . '/2026/08/hilang.png', $r->isi);
        $this->assertStringContainsString(self::LAMA . '/2026/08/ikon.svg', $r->isi);
        $this->assertStringContainsString('https://diskominfo.kaltaraprov.go.id/berita-lama/', $r->isi);

        $log = glob(storage_path('app/migrasi-wp/tulis-*.jsonl'))[0];
        $this->artisan('gambar:migrasi-wp', ['--balik' => $log])->expectsOutputToContain('1 berita dikembalikan')->assertSuccessful();
        $r = DB::table('berita')->where('id_berita', $id)->first();
        $this->assertSame(self::LAMA . '/2026/08/utama.png', $r->gambar);
        $this->assertSame($isiAwal, $r->isi);
    }

    public function test_balik_tidak_menimpa_berita_yang_diedit_setelah_migrasi(): void
    {
        $id = $this->berita(['gambar' => self::LAMA . '/2026/08/a.png', 'isi' => '<p>x</p>']);
        Http::fake(['*' => Http::response($this->png(), 200)]);

        $this->artisan('gambar:migrasi-wp --inventaris');
        $this->artisan('gambar:migrasi-wp --unduh');
        $this->artisan('gambar:migrasi-wp --tulis');
        DB::table('berita')->where('id_berita', $id)->update(['gambar' => 'baru-diunggah.jpg']);

        $log = glob(storage_path('app/migrasi-wp/tulis-*.jsonl'))[0];
        $this->artisan('gambar:migrasi-wp', ['--balik' => $log])->expectsOutputToContain('0 berita dikembalikan')->assertSuccessful();
        $this->assertSame('baru-diunggah.jpg', DB::table('berita')->where('id_berita', $id)->value('gambar'));
    }

    public function test_path_berbahaya_tidak_pernah_diunduh(): void
    {
        $this->berita([
            'gambar' => self::LAMA . '/2026/../../../../index.png',
            'isi' => '<img src="' . self::LAMA . '/2026/08/a%2F..%2Fb.png"><img src="https://diskominfo.kaltaraprov.go.id.evil.example/wp-content/uploads/x.png">',
        ]);
        Http::fake(['*' => Http::response($this->png(), 200)]);

        $this->artisan('gambar:migrasi-wp --inventaris')->expectsOutputToContain('URL gambar siap diunduh : 0')->assertSuccessful();
        $this->artisan('gambar:migrasi-wp --unduh')->assertSuccessful();
        Http::assertNothingSent();
    }
}
