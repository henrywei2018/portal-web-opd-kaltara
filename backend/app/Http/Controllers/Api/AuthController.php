<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'recaptcha_token' => 'nullable|string' // Make optional for dev bypass
        ]);

        // Bypass reCAPTCHA in development environment
        if (app()->environment('local') && config('app.bypass_recaptcha')) {
            // Skip reCAPTCHA verification in local development
            goto attempt_login;
        }

        // Verify reCAPTCHA in production
        if (!empty($credentials['recaptcha_token'])) {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => env('RECAPTCHA_SECRET'),
                'response' => $credentials['recaptcha_token'],
                'remoteip' => $request->ip(),
            ]);

            if (!$response->json('success')) {
                // Log failed attempt
                $this->logAuditGagal($credentials['username'], 'reCAPTCHA gagal', $request->ip());
                return response()->json(['error' => 'reCAPTCHA verification failed'], 400);
            }
        }

        attempt_login:

        // Attempt login with username
        $credentials = ['username' => $credentials['username'], 'password' => $credentials['password']];

        if (!$token = JWTAuth::attempt($credentials)) {
            // Log failed attempt
            $this->logAuditGagal($credentials['username'], 'Kredensial salah', $request->ip());
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get authenticated user
        $user = JWTAuth::user();

        // Check user status
        if (isset($user->status) && (int)$user->status === 0) {
            $this->logAuditGagal($credentials['username'], 'Akun nonaktif', $request->ip());
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['error' => 'Account inactive'], 403);
        }

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
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
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
