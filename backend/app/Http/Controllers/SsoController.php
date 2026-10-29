<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Support\Roles;
use App\Support\SsoPortal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Login admin lewat SSO Portal Kaltara.
 *
 * Callback diterima backend (POST lintas situs dari portal), lalu diserahkan
 * ke SPA lewat kode serah-terima sekali pakai yang diikat cookie. JWT baru
 * terbit bila cookie pengikat cocok, sehingga kode serah-terima milik orang lain
 * tidak bisa dipakai untuk memasukkan korban ke akun penyerang (login CSRF).
 *
 * Akun dibuat/diperbarui otomatis dari role aplikasi di portal. Portal adalah
 * sumber peran; akun yang dinonaktifkan di situs ini tetap tidak bisa masuk.
 */
class SsoController extends Controller
{
    private const COOKIE = 'sso_serah';
    private const DETIK_SERAH = 120;

    /** GET /api/auth/sso — status fitur untuk halaman login. */
    public function status()
    {
        return response()->json([
            'aktif' => SsoPortal::aktif(),
            'url_masuk' => SsoPortal::aktif() ? url('/sso/login') : null,
        ]);
    }

    /** GET /sso/login — teruskan ke portal. */
    public function masuk()
    {
        if (!SsoPortal::aktif()) {
            return $this->kembali(['sso_galat' => 'nonaktif']);
        }

        return redirect()->away(SsoPortal::urlMasuk());
    }

    /** POST /sso/callback — dikirim portal (form auto-submit). */
    public function callback(Request $request)
    {
        if (!SsoPortal::aktif()) {
            return $this->kembali(['sso_galat' => 'nonaktif']);
        }

        $code = $request->input('code');
        if (!is_string($code) || $code === '' || strlen($code) > 512) {
            // Alur "token" lama sengaja tidak diterima: kode sekali pakai lebih aman.
            $this->auditGagal('Callback tanpa code', $request);
            return $this->kembali(['sso_galat' => 'gagal']);
        }

        try {
            $sso = SsoPortal::verifikasiKode($code);
        } catch (\Throwable $e) {
            Log::warning('SSO: verifikasi code gagal', ['pesan' => $e->getMessage()]);
            $this->auditGagal('Verifikasi SSO gagal', $request);
            return $this->kembali(['sso_galat' => 'gagal']);
        }

        $pengguna = $sso['user'];
        $realm = (string) ($pengguna['realm'] ?? '');
        if (!in_array($realm, config('sso.realm'), true)) {
            $this->auditGagal("Realm tidak diizinkan ({$realm})", $request, $pengguna['username'] ?? null);
            return $this->kembali(['sso_galat' => 'realm']);
        }

        $peran = $this->petakanPeran($sso['role']['code'] ?? null);
        if (!$peran) {
            $this->auditGagal('Role portal tidak dikenali: ' . ($sso['role']['code'] ?? '(tanpa role)'), $request, $pengguna['username'] ?? null);
            return $this->kembali(['sso_galat' => 'peran']);
        }

        $user = $this->sinkronkanAkun($pengguna, $peran);
        if ((int) $user->status !== 1) {
            $this->auditGagal('Akun nonaktif (SSO)', $request, $user->username);
            return $this->kembali(['sso_galat' => 'akun_nonaktif']);
        }

        $serah = Str::random(64);
        $ikat = Str::random(40);
        Cache::put('sso:serah:' . hash('sha256', $serah), [
            'id_user' => $user->id_user,
            'ikat' => hash('sha256', $ikat),
            'sso_exp' => $sso['expires_at'],
        ], self::DETIK_SERAH);

        return $this->kembali(['sso' => $serah])->withCookie(cookie(
            self::COOKIE, $ikat, self::DETIK_SERAH / 60, '/', null, $request->isSecure(), true, false, 'lax'
        ));
    }

    /** POST /api/auth/sso/selesai — SPA menukar kode serah-terima menjadi JWT. */
    public function selesai(Request $request)
    {
        $data = $request->validate(['kode' => 'required|string|max:128']);
        $kunci = 'sso:serah:' . hash('sha256', $data['kode']);
        // pull: sekali pakai, berhasil atau tidak.
        $serah = Cache::pull($kunci);
        $ikat = (string) $request->cookie(self::COOKIE, '');

        if (!$serah || $ikat === '' || !hash_equals($serah['ikat'], hash('sha256', $ikat))) {
            return response()->json(['error' => 'Sesi SSO tidak valid atau sudah kedaluwarsa. Silakan masuk kembali.'], 401)
                ->withoutCookie(self::COOKIE);
        }

        $user = User::find($serah['id_user']);
        if (!$user || (int) $user->status !== 1) {
            return response()->json(['error' => 'Akun tidak aktif.'], 401)->withoutCookie(self::COOKIE);
        }

        // Sesi aplikasi tidak boleh melampaui masa berlaku token SSO.
        $menit = max(1, min((int) config('jwt.ttl'), (int) floor(($serah['sso_exp'] - time()) / 60)));
        JWTAuth::factory()->setTTL($menit);
        $token = JWTAuth::claims(['sso' => true])->fromUser($user);

        $user->forceFill(['last_login' => now()])->save();
        AuditLog::create([
            'id_user' => $user->id_user,
            'nama_user' => $user->nama,
            'aksi' => 'login',
            'detail' => 'Login SSO Portal Kaltara berhasil',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $menit * 60,
            'user' => $user->fresh(),
        ])->withoutCookie(self::COOKIE);
    }

    private function petakanPeran(?string $kode): ?string
    {
        if (!is_string($kode) || $kode === '') {
            return null;
        }
        $kode = strtolower($kode);
        $peta = config('sso.peta_peran');
        $peran = $peta[$kode] ?? ($kode !== 'super_admin' ? $kode : null);

        return in_array($peran, Roles::ROLES, true) ? $peran : null;
    }

    private function sinkronkanAkun(array $p, string $peran): User
    {
        $ssoId = (string) $p['id'];
        $user = User::where('sso_id', $ssoId)->first();
        $profil = [
            'nama' => mb_substr(trim((string) ($p['full_name'] ?? '')) ?: (string) ($p['username'] ?? 'Pengguna SSO'), 0, 255),
            'email' => isset($p['email']) ? mb_substr((string) $p['email'], 0, 255) : null,
            'nip' => isset($p['nip']) ? mb_substr((string) $p['nip'], 0, 32) : null,
            'sso_realm' => mb_substr((string) ($p['realm'] ?? ''), 0, 32),
            'role' => $peran,
            'level' => Roles::level($peran),
        ];

        if ($user) {
            $user->forceFill($profil)->save();
            return $user;
        }

        return User::forceCreate($profil + [
            'sso_id' => $ssoId,
            'username' => $this->usernameUnik((string) ($p['username'] ?? 'sso')),
            // Akun SSO tidak memakai kata sandi lokal; nilai acak tak diketahui siapa pun.
            'password' => Hash::make(Str::random(48)),
            'status' => 1,
        ]);
    }

    private function usernameUnik(string $dasar): string
    {
        $dasar = Str::limit(preg_replace('/[^a-z0-9._-]/', '', strtolower($dasar)) ?: 'sso', 40, '');
        $nama = $dasar;
        for ($i = 2; User::where('username', $nama)->exists(); $i++) {
            $nama = "{$dasar}-sso{$i}";
        }

        return $nama;
    }

    private function kembali(array $query)
    {
        return redirect()->away(config('sso.frontend_url') . '/login?' . http_build_query($query), 303);
    }

    private function auditGagal(string $alasan, Request $request, ?string $username = null): void
    {
        AuditLog::create([
            'id_user' => 0,
            'nama_user' => preg_replace('/[^\w@.\- ]/', '', mb_substr((string) ($username ?? '(sso)'), 0, 100)) ?: '(sso)',
            'aksi' => 'login_gagal',
            'detail' => 'SSO: ' . mb_substr($alasan, 0, 200),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
    }
}
