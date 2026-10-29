<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class SsoTest extends TestCase
{
    use RefreshDatabase;

    private const PORTAL = 'https://portal.test';

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'sso.url' => self::PORTAL,
            'sso.application_id' => '12',
            'sso.api_key' => 'kunci-rahasia',
            'sso.realm' => ['asn-kaltara'],
            'sso.peta_peran' => [],
            'sso.frontend_url' => 'https://situs.test',
        ]);
    }

    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        $this->app['auth']->forgetGuards();
        $this->app['tymon.jwt']->unsetToken();
        JWTAuth::unsetToken();

        return parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);
    }

    /** Data yang dikembalikan portal palsu pada validate berikutnya. */
    private array $validasi = [];

    /** Portal palsu: exchange lalu validate dengan data yang bisa diatur. */
    private function portal(array $user = [], ?string $role = 'editor', array $ubah = []): void
    {
        $this->validasi = array_merge([
            'valid' => true,
            'user' => array_merge([
                'id' => 501, 'username' => 'budi', 'email' => 'budi@kaltaraprov.go.id',
                'full_name' => 'Budi Santoso', 'nip' => '198001012005011001', 'nik' => null, 'realm' => 'asn-kaltara',
            ], $user),
            'application' => ['id' => 12, 'code' => 'web-opd', 'name' => 'Web OPD'],
            'role' => $role ? ['id' => 3, 'code' => $role, 'name' => ucfirst($role)] : null,
            'expires_at' => time() + 3600,
        ], $ubah);

        static $terpasang = [];
        if (!isset($terpasang[spl_object_id($this)])) {
            $terpasang[spl_object_id($this)] = true;
            Http::fake([
                self::PORTAL . '/api/sso/exchange' => fn () => Http::response(['success' => true, 'data' => ['access_token' => 'jwt-portal', 'expires_in' => 3600]]),
                self::PORTAL . '/api/sso/validate' => fn () => Http::response(['success' => true, 'data' => $this->validasi]),
            ]);
        }
    }

    private function kirimCallback(): TestResponse
    {
        return $this->post('/sso/callback', ['code' => str_repeat('a', 64)]);
    }

    /** Langkah SPA; withCredentials agar cookie ikut terkirim seperti di peramban. */
    private function selesai(string $kode, ?string $ikat = null): TestResponse
    {
        $req = $this->withCredentials();
        if ($ikat !== null) {
            $req = $req->withUnencryptedCookie('sso_serah', $ikat);
        }

        return $req->postJson('/api/auth/sso/selesai', ['kode' => $kode]);
    }

    private function parameter(TestResponse $res): array
    {
        parse_str((string) parse_url($res->headers->get('Location'), PHP_URL_QUERY), $q);

        return $q;
    }

    public function test_status_nonaktif_tanpa_kredensial_aplikasi(): void
    {
        config(['sso.api_key' => null]);
        $this->getJson('/api/auth/sso')->assertOk()->assertJson(['aktif' => false, 'url_masuk' => null]);
    }

    public function test_masuk_diteruskan_ke_portal_dengan_target_self(): void
    {
        $this->get('/sso/login')->assertRedirect(self::PORTAL . '/applications/12/access?target=self');
    }

    public function test_alur_lengkap_membuat_akun_dan_menerbitkan_token_sso(): void
    {
        $this->portal();
        $res = $this->kirimCallback()->assertStatus(303);
        $this->assertStringStartsWith('https://situs.test/login?', $res->headers->get('Location'));
        $kode = $this->parameter($res)['sso'];
        $ikat = $res->getCookie('sso_serah', false)->getValue();

        $token = $this->selesai($kode, $ikat)
            ->assertOk()->assertJsonPath('user.role', 'editor')->json('access_token');

        $user = User::where('sso_id', '501')->firstOrFail();
        $this->assertSame('budi', $user->username);
        $this->assertSame('Budi Santoso', $user->nama);
        $this->assertSame('198001012005011001', $user->nip);
        $this->assertTrue((bool) JWTAuth::setToken($token)->getPayload()->get('sso'));

        // Kode serah-terima hanya sekali pakai.
        $this->selesai($kode, $ikat)->assertUnauthorized();
        // Sesi SSO tidak bisa diperpanjang lewat refresh.
        $this->withToken($token)->postJson('/api/auth/refresh')->assertUnauthorized();
        // Kode ditukar dengan api_key milik aplikasi.
        Http::assertSent(fn ($r) => str_ends_with($r->url(), '/api/sso/exchange') && $r['api_key'] === 'kunci-rahasia');
    }

    public function test_kode_serah_terima_tanpa_cookie_pengikat_ditolak(): void
    {
        $this->portal();
        $kode = $this->parameter($this->kirimCallback())['sso'];

        // Penyerang mengirim tautan /login?sso=<kode miliknya> ke korban: korban tidak punya cookie-nya.
        $this->selesai($kode)->assertUnauthorized();
        $this->selesai($kode, 'palsu')->assertUnauthorized();
    }

    public function test_token_aplikasi_lain_ditolak(): void
    {
        $this->portal([], 'editor', ['application' => ['id' => 99, 'code' => 'lain', 'name' => 'Lain']]);
        $this->assertSame('gagal', $this->parameter($this->kirimCallback())['sso_galat']);
        $this->assertSame(0, User::whereNotNull('sso_id')->count());
    }

    public function test_portal_menolak_code(): void
    {
        Http::fake([self::PORTAL . '/*' => Http::response(['success' => false, 'message' => 'Authorization code tidak valid'], 401)]);
        $this->assertSame('gagal', $this->parameter($this->kirimCallback())['sso_galat']);
    }

    public function test_realm_masyarakat_tidak_boleh_masuk_panel_admin(): void
    {
        $this->portal(['realm' => 'public-kaltara']);
        $this->assertSame('realm', $this->parameter($this->kirimCallback())['sso_galat']);
    }

    public function test_role_tak_dikenal_atau_super_admin_tidak_diberikan_otomatis(): void
    {
        $this->portal([], 'operator_lain');
        $this->assertSame('peran', $this->parameter($this->kirimCallback())['sso_galat']);

        $this->portal([], 'super_admin');
        $this->assertSame('peran', $this->parameter($this->kirimCallback())['sso_galat']);

        // Kecuali dipetakan eksplisit oleh pengelola situs.
        config(['sso.peta_peran' => ['operator_lain' => 'admin']]);
        $this->portal([], 'operator_lain');
        $this->assertArrayHasKey('sso', $this->parameter($this->kirimCallback()));
        $this->assertSame('admin', User::where('sso_id', '501')->value('role'));
    }

    public function test_peran_diperbarui_dari_portal_tetapi_akun_nonaktif_tetap_ditolak(): void
    {
        $this->portal();
        $this->kirimCallback();
        $this->portal([], 'kontributor');
        $this->kirimCallback();
        $user = User::where('sso_id', '501')->firstOrFail();
        $this->assertSame('kontributor', $user->role);

        $user->update(['status' => 0]);
        $this->assertSame('akun_nonaktif', $this->parameter($this->kirimCallback())['sso_galat']);
        $this->assertSame(0, (int) $user->fresh()->status);
    }

    public function test_akun_lokal_bernama_sama_tidak_diambil_alih(): void
    {
        $lokal = User::create(['nama' => 'Budi Lokal', 'username' => 'budi', 'password' => bcrypt('rahasia12345'), 'role' => 'super_admin', 'status' => 1]);

        $this->portal();
        $this->kirimCallback();

        $this->assertNull($lokal->fresh()->sso_id);
        $this->assertSame('super_admin', $lokal->fresh()->role);
        $this->assertSame('budi-sso2', User::where('sso_id', '501')->value('username'));
    }
}
