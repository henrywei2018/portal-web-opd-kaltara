<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;

/**
 * Verifikasi reCAPTCHA v2 untuk form publik dan login admin.
 *
 * Secret dibaca lewat config('services.recaptcha.secret'), bukan env(), karena
 * setelah `artisan config:cache` (dijalankan deploy.sh) env() mengembalikan null.
 *
 * Aturannya:
 * - Secret kosong          -> fitur belum dipasang, verifikasi dilewati.
 * - Secret terisi          -> token WAJIB ada dan harus lolos verifikasi Google;
 *                             tidak mengirim token tidak lagi melewati pemeriksaan.
 * - APP_ENV=local + BYPASS_RECAPTCHA=true -> dilewati, khusus pengembangan.
 */
class Recaptcha
{
    public static function aktif(): bool
    {
        if (app()->environment('local') && config('app.bypass_recaptcha')) {
            return false;
        }

        return filled(config('services.recaptcha.secret'));
    }

    public static function lolos(?string $token, ?string $ip): bool
    {
        if (!self::aktif()) {
            return true;
        }
        if (!is_string($token) || $token === '' || strlen($token) > 4096) {
            return false;
        }

        try {
            $respon = Http::asForm()->timeout(8)->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => config('services.recaptcha.secret'),
                'response' => $token,
                'remoteip' => $ip,
            ]);
        } catch (\Throwable $e) {
            // Gagal menghubungi Google diperlakukan sebagai gagal verifikasi,
            // bukan sebagai izin lewat.
            return false;
        }

        return (bool) $respon->json('success');
    }
}
