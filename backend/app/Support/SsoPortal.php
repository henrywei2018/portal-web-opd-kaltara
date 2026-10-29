<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Klien server-ke-server SSO Portal Kaltara (alur "code").
 *
 *   1. Pengguna diarahkan ke {portal}/applications/{id}/access?target=self.
 *   2. Portal mengirim POST `code` (sekali pakai, 2 menit) ke /sso/callback.
 *   3. Code ditukar ke /api/sso/exchange (+ api_key) menjadi token.
 *   4. Token divalidasi ke /api/sso/validate (+ api_key); isi token tidak
 *      pernah dipercaya tanpa validasi ini.
 *
 * Pesan galat dari portal hanya masuk log; pengguna menerima pesan umum.
 */
class SsoPortal
{
    public static function aktif(): bool
    {
        return filled(config('sso.application_id')) && filled(config('sso.api_key'));
    }

    public static function urlMasuk(): string
    {
        return config('sso.url') . '/applications/' . rawurlencode((string) config('sso.application_id')) . '/access?target=self';
    }

    /**
     * Tukar code lalu validasi tokennya.
     *
     * @return array{user: array, role: ?array, expires_at: int}
     */
    public static function verifikasiKode(string $code): array
    {
        $tukar = self::panggil('/api/sso/exchange', ['code' => $code]);
        $token = $tukar['data']['access_token'] ?? null;
        if (!is_string($token) || $token === '') {
            throw new RuntimeException('Respons exchange tanpa access_token');
        }

        $data = self::panggil('/api/sso/validate', ['token' => $token])['data'] ?? [];
        if (($data['valid'] ?? false) !== true || !is_array($data['user'] ?? null)) {
            throw new RuntimeException('Token SSO tidak valid');
        }
        // Token untuk aplikasi lain tidak boleh dipakai masuk ke sini.
        if ((string) ($data['application']['id'] ?? '') !== (string) config('sso.application_id')) {
            throw new RuntimeException('Token SSO untuk aplikasi lain');
        }
        $kedaluwarsa = (int) ($data['expires_at'] ?? 0);
        if ($kedaluwarsa <= time()) {
            throw new RuntimeException('Token SSO sudah kedaluwarsa');
        }

        return [
            'user' => $data['user'],
            'role' => is_array($data['role'] ?? null) ? $data['role'] : null,
            'expires_at' => $kedaluwarsa,
        ];
    }

    private static function panggil(string $jalur, array $isi): array
    {
        try {
            $respon = Http::asForm()
                ->acceptJson()
                ->timeout(config('sso.timeout'))
                ->post(config('sso.url') . $jalur, $isi + ['api_key' => config('sso.api_key')]);
        } catch (\Throwable $e) {
            throw new RuntimeException('Portal SSO tidak dapat dihubungi: ' . $e->getMessage(), 0, $e);
        }

        $json = $respon->json();
        if (!$respon->successful() || !is_array($json) || ($json['success'] ?? false) !== true) {
            Log::warning('SSO portal menolak permintaan', [
                'jalur' => $jalur,
                'status' => $respon->status(),
                'pesan' => is_array($json) ? ($json['message'] ?? null) : null,
            ]);
            throw new RuntimeException('Portal SSO menolak ' . $jalur . ' (HTTP ' . $respon->status() . ')');
        }

        return $json;
    }
}
