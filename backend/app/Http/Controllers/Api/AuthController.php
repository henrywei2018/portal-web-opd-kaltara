<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use App\Support\Recaptcha;
use Illuminate\Support\Facades\RateLimiter;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // Gagal masuk 5 kali untuk pasangan username+IP mengunci 15 menit.
    private const MAKS_GAGAL = 5;
    private const JEDA_KUNCI = 900;

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string|max:100',
            'password' => 'required|string|max:255',
            'recaptcha_token' => 'nullable|string|max:4096',
        ]);

        // Batas percobaan per username+IP, di samping throttle per IP pada rute.
        // Menahan tebak kata sandi terarah ke satu akun dari banyak permintaan.
        $kunci = 'login:' . mb_strtolower($credentials['username']) . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($kunci, self::MAKS_GAGAL)) {
            $detik = RateLimiter::availableIn($kunci);
            $this->logAuditGagal($credentials['username'], 'Terlalu banyak percobaan', $request->ip());

            return response()->json(['error' => "Terlalu banyak percobaan masuk. Coba lagi dalam {$detik} detik."], 429)
                ->header('Retry-After', $detik);
        }

        if (!Recaptcha::lolos($credentials['recaptcha_token'] ?? null, $request->ip())) {
            RateLimiter::hit($kunci, self::JEDA_KUNCI);
            $this->logAuditGagal($credentials['username'], 'reCAPTCHA gagal', $request->ip());
            return response()->json(['error' => 'reCAPTCHA verification failed'], 400);
        }

        $credentials = ['username' => $credentials['username'], 'password' => $credentials['password']];

        if (!$token = JWTAuth::attempt($credentials)) {
            RateLimiter::hit($kunci, self::JEDA_KUNCI);
            $this->logAuditGagal($credentials['username'], 'Kredensial salah', $request->ip());
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get authenticated user
        $user = JWTAuth::user();

        // Akun nonaktif dijawab sama seperti kredensial salah, supaya respons
        // tidak menjadi penanda "kata sandi benar" bagi penyerang. Alasannya
        // tetap tercatat di audit log.
        if (isset($user->status) && (int)$user->status === 0) {
            RateLimiter::hit($kunci, self::JEDA_KUNCI);
            $this->logAuditGagal($credentials['username'], 'Akun nonaktif', $request->ip());
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        RateLimiter::clear($kunci);

        // Update last login
        $user->update(['last_login' => now()]);

        // Log successful login
        AuditLog::create([
            'id_user' => $user->id_user,
            'nama_user' => $user->nama,
            'aksi' => 'login',
            'detail' => 'Login berhasil',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return $this->respondWithToken($token);
    }

    public function me()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 401);
            }
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token invalid'], 401);
        }
    }

    public function logout()
    {
        try {
            // Get user before invalidating token
            $user = JWTAuth::user();

            // Log logout
            if ($user) {
                AuditLog::create([
                    'id_user' => $user->id_user,
                    'nama_user' => $user->nama,
                    'aksi' => 'logout',
                    'detail' => 'Logout dari sistem',
                    'ip_address' => request()->ip(),
                    'created_at' => now(),
                ]);
            }

            // Invalidate token
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json(['message' => 'Successfully logged out']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Successfully logged out']);
        }
    }

    public function refresh()
    {
        try {
            // Sesi SSO tidak diperpanjang: masa berlakunya mengikuti token
            // portal, lalu pengguna masuk ulang lewat SSO.
            if (JWTAuth::manager()->setRefreshFlow()->decode(JWTAuth::getToken())->get('sso')) {
                return response()->json(['error' => 'Sesi SSO berakhir, silakan masuk kembali melalui SSO'], 401);
            }
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            // Akun yang dinonaktifkan tidak boleh memperpanjang sesinya.
            $user = auth('api')->setToken($newToken)->user();
            if (!$user || (int) $user->status !== 1) {
                auth('api')->invalidate();
                return response()->json(['error' => 'Could not refresh token'], 401);
            }
            return $this->respondWithToken($newToken);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not refresh token'], 401);
        }
    }

    protected function respondWithToken($token)
    {
        try {
            $user = JWTAuth::user();

            return response()->json([
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60, // JWT TTL in seconds
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
                'user' => null
            ]);
        }
    }

    private function logAuditGagal($username, $alasan, $ip)
    {
        $clean = preg_replace('/[^\w@.\- ]/', '', mb_substr((string)$username, 0, 100));
        AuditLog::create([
            'id_user' => 0,
            'nama_user' => $clean ?: '(kosong)',
            'aksi' => 'login_gagal',
            'detail' => $alasan,
            'ip_address' => $ip,
            'created_at' => now(),
        ]);
    }
}
