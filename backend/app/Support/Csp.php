<?php

namespace App\Support;

/**
 * Content-Security-Policy untuk halaman SPA.
 *
 * Berbasis nonce + 'strict-dynamic': hanya <script> dari index.html (yang
 * diberi nonce oleh SpaController) dan skrip yang dimuatnya — chunk Vite,
 * reCAPTCHA, YouTube IFrame API, GA/GTM — yang boleh berjalan. Skrip yang
 * tersisip lewat konten (XSS) tidak punya nonce sehingga diblokir, termasuk
 * event handler inline. 'unsafe-inline' dan https: di script-src hanya
 * cadangan untuk browser lama; browser yang mengenal nonce mengabaikannya.
 */
class Csp
{
    public static function nonce(): string
    {
        return base64_encode(random_bytes(16));
    }

    public static function namaHeader(): string
    {
        return config('keamanan.csp.report_only') ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    }

    public static function kebijakan(string $nonce): string
    {
        $frame = array_merge(
            ["'self'"],
            array_map(fn ($h) => 'https://' . $h, config('keamanan.iframe_hosts', [])),
            // reCAPTCHA dan GTM <noscript> memakai iframe dari host ini.
            ['https://www.google.com', 'https://www.recaptcha.net', 'https://www.googletagmanager.com']
        );

        return implode('; ', [
            "default-src 'self'",
            "script-src 'nonce-{$nonce}' 'strict-dynamic' https: 'unsafe-inline'",
            // MUI/emotion menyuntikkan <style> saat runtime.
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            // http: untuk gambar lama/impor ber-URL absolut http; gambar dan
            // media tidak bisa menjalankan skrip.
            "img-src 'self' data: blob: https: http:",
            "media-src 'self' blob: https: http:",
            "connect-src 'self' https:",
            'frame-src ' . implode(' ', array_unique($frame)),
            "worker-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
        ]);
    }

    /** Beri nonce pada setiap <script> di HTML yang belum memilikinya. */
    public static function pasangNonce(string $html, string $nonce): string
    {
        return preg_replace('/<script\b(?![^>]*\bnonce=)/i', '<script nonce="' . $nonce . '"', $html);
    }
}
