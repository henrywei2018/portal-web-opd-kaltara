<?php

namespace Tests\Feature;

use App\Models\Berita;
use App\Models\User;
use App\Support\Unggah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Regresi untuk temuan audit keamanan form dan unggahan.
 */
class KeamananTest extends TestCase
{
    use RefreshDatabase;

    /** Berkas yang dibuat tes di public/, dihapus di tearDown. */
    private array $berkasPublik = [];

    protected function tearDown(): void
    {
        foreach ($this->berkasPublik as $p) {
            File::delete($p);
        }
        parent::tearDown();
    }

    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        $this->app['auth']->forgetGuards();
        $this->app['tymon.jwt']->unsetToken();
        JWTAuth::unsetToken();

        return parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);
    }

    private function admin(string $role, array $attr = []): User
    {
        return User::create(array_merge([
            'nama' => $role,
            'username' => $role . uniqid(),
            'password' => bcrypt('rahasia12345'),
            'role' => $role,
            'status' => 1,
        ], $attr));
    }

    private function token(User $u): string
    {
        return JWTAuth::fromUser($u);
    }

    /**
     * Polyglot: diawali header GIF sehingga finfo melihatnya sebagai gambar.
     * Sengaja berkas sungguhan, bukan UploadedFile::fake(): berkas palsu menebak
     * MIME dari nama, sedangkan unggahan nyata memakai finfo pada isinya.
     */
    private function polyglot(string $nama): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'poc');
        file_put_contents($path, "GIF89a;\n<?php echo 'POC'; ?>");

        return new UploadedFile($path, $nama, null, null, true);
    }

    // --- Unggahan --------------------------------------------------------

    public function test_unggah_menentukan_ekstensi_dari_isi_bukan_nama_kiriman(): void
    {
        $nama = Unggah::simpan($this->polyglot('shell.php'), 'gambar', Unggah::GAMBAR);
        $this->berkasPublik[] = public_path('gambar/' . $nama);

        $this->assertStringEndsWith('.gif', $nama);
        $this->assertFileDoesNotExist(public_path('gambar/' . pathinfo($nama, PATHINFO_FILENAME) . '.php'));
    }

    public function test_unggah_menolak_jenis_di_luar_daftar_izin(): void
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $path = tempnam(sys_get_temp_dir(), 'poc');
        file_put_contents($path, '<html><script>alert(1)</script></html>');
        Unggah::simpan(new UploadedFile($path, 'x.jpg', null, null, true), 'gambar', Unggah::GAMBAR);
    }

    public function test_upload_gambar_layanan_menolak_nama_php(): void
    {
        $this->withToken($this->token($this->admin('editor')))
            ->post('/api/admin/layanan/upload-image', ['image' => $this->polyglot('x.php')], ['Accept' => 'application/json'])
            ->assertStatus(422);
    }

    public function test_konten_struktur_tidak_bisa_ditulis_kontributor(): void
    {
        $this->withToken($this->token($this->admin('kontributor')))
            ->post('/api/admin/content/struktur', ['file' => $this->polyglot('x.php')], ['Accept' => 'application/json'])
            ->assertForbidden();
    }

    // --- Akun dan otorisasi ---------------------------------------------

    public function test_admin_tidak_bisa_reset_atau_nonaktifkan_super_admin(): void
    {
        $super = $this->admin('super_admin');
        $token = $this->token($this->admin('admin'));

        $this->withToken($token)->postJson("/api/admin/user/{$super->id_user}/reset-password")->assertForbidden();
        $this->withToken($token)->postJson("/api/admin/user/{$super->id_user}/toggle-status")->assertForbidden();
        $this->assertTrue(password_verify('rahasia12345', $super->fresh()->password));
    }

    public function test_kata_sandi_pengguna_baru_minimal_10_huruf_dan_angka(): void
    {
        $token = $this->token($this->admin('super_admin'));
        $data = ['nama' => 'Baru', 'username' => 'baru1', 'role' => 'editor', 'status' => 1];

        $this->withToken($token)->postJson('/api/admin/user', $data + ['password' => 'abc123'])
            ->assertStatus(422)->assertJsonValidationErrors('password');
        $this->withToken($token)->postJson('/api/admin/user', $data + ['password' => 'rahasiaku2026'])
            ->assertCreated();
    }

    public function test_login_dikunci_setelah_lima_kali_gagal(): void
    {
        config(['services.recaptcha.secret' => null]);
        $u = $this->admin('editor', ['username' => 'target']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', ['username' => 'target', 'password' => 'salah'])->assertUnauthorized();
        }
        // Kata sandi benar pun ditolak selama terkunci.
        $this->postJson('/api/auth/login', ['username' => 'target', 'password' => 'rahasia12345'])->assertStatus(429);
        $this->assertNotNull($u);
    }

    public function test_token_akun_yang_dinonaktifkan_langsung_ditolak(): void
    {
        $u = $this->admin('editor');
        $token = $this->token($u);
        $this->withToken($token)->getJson('/api/admin/dashboard')->assertOk();

        $u->update(['status' => 0]);
        $this->withToken($token)->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_kontributor_hanya_boleh_mengubah_beritanya_sendiri(): void
    {
        $penulis = $this->admin('editor');
        $berita = Berita::create([
            'judul' => 'Milik editor', 'isi' => '<p>isi</p>', 'tanggal_post' => now()->toDateString(),
            'status_berita' => 'Publish', 'id_user' => $penulis->id_user,
        ]);

        $this->withToken($this->token($this->admin('kontributor')))
            ->deleteJson("/api/admin/berita/{$berita->id_berita}")->assertForbidden();
        $this->assertNotNull($berita->fresh());
    }

    public function test_audit_log_tidak_terbuka_untuk_kontributor(): void
    {
        $this->withToken($this->token($this->admin('kontributor')))->getJson('/api/admin/audit-log')->assertForbidden();
    }

    // --- Permukaan publik ------------------------------------------------

    public function test_api_publik_tidak_membocorkan_username_dan_peran_penulis(): void
    {
        $u = $this->admin('super_admin', ['username' => 'rahasia_login']);
        Berita::create([
            'judul' => 'Terbit', 'isi' => '<p>isi</p>', 'tanggal_post' => now()->toDateString(),
            'status_berita' => 'Publish', 'id_user' => $u->id_user,
        ]);

        $json = $this->getJson('/api/public/berita')->assertOk()->json('data.0.user');
        $this->assertSame('super_admin', $u->role);
        $this->assertArrayNotHasKey('username', $json);
        $this->assertArrayNotHasKey('role', $json);
        $this->assertArrayNotHasKey('last_login', $json);
    }

    public function test_judul_berita_tidak_bisa_keluar_dari_blok_json_ld(): void
    {
        if (!file_exists(public_path('index.html'))) {
            $this->markTestSkipped('public/index.html belum di-build.');
        }
        $u = $this->admin('editor');
        $b = Berita::create([
            'judul' => 'x</script><script>alert(1)</script>', 'isi' => '<p>isi</p>', 'tanggal_post' => now()->toDateString(),
            'status_berita' => 'Publish', 'id_user' => $u->id_user, 'slug' => 'uji-jsonld',
        ]);

        $html = $this->get('/berita/' . $b->slug)->assertOk()->getContent();
        $this->assertStringNotContainsString('<script>alert(1)</script>', $html);
        $this->assertStringContainsString('x\\u003C\\/script\\u003E', $html);
    }
}
