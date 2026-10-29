<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\Visitor\AttributeSanitizer\AttributeSanitizerInterface;

/**
 * Sanitasi HTML konten sebelum disimpan.
 *
 * Isi berita, artikel, dan blok HTML halaman dirender mentah di situs publik
 * (dangerouslySetInnerHTML), sedangkan token admin disimpan di localStorage.
 * Tanpa sanitasi, kontributor bisa menyisipkan skrip ke berita dan mencuri
 * sesi admin yang membukanya. Elemen tata letak, gambar, tabel, dan iframe dari
 * host tepercaya tetap diizinkan; skrip, event handler, dan URL javascript:
 * dibuang.
 */
class HtmlAman
{
    private static ?HtmlSanitizer $sanitizer = null;

    public static function bersihkan(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        $bersih = self::sanitizer()->sanitize($html);

        // Isi <iframe> diperlakukan sebagai teks mentah lalu di-escape, sehingga
        // setiap sanitasi ulang meng-escape-nya lagi (&lt; → &amp;lt; …) dan
        // hasilnya tak pernah stabil. Browser tidak merender isi iframe, jadi
        // kosongkan saja. Aman di keluaran sanitizer: nilai atributnya sudah
        // di-escape sehingga tidak memuat ">" mentah.
        return preg_replace('~(<iframe\b[^>]*>).*?(</iframe>)~is', '$1$2', $bersih) ?? $bersih;
    }

    /**
     * Bersihkan setiap kunci `html` di struktur blok Page Builder, di
     * kedalaman berapa pun (blok bisa bersarang di kolom/tab).
     */
    public static function bersihkanBlok(array $blok): array
    {
        foreach ($blok as $kunci => $nilai) {
            if (is_array($nilai)) {
                $blok[$kunci] = self::bersihkanBlok($nilai);
            } elseif ($kunci === 'html' && is_string($nilai)) {
                $blok[$kunci] = self::bersihkan($nilai);
            }
        }

        return $blok;
    }

    private static function sanitizer(): HtmlSanitizer
    {
        if (self::$sanitizer) {
            return self::$sanitizer;
        }

        $hostIframe = config('keamanan.iframe_hosts', []);

        $config = (new HtmlSanitizerConfig())
            ->allowSafeElements()
            ->allowRelativeLinks()
            ->allowRelativeMedias()
            ->allowLinkSchemes(['https', 'http', 'mailto', 'tel'])
            ->allowMediaSchemes(['https', 'http', 'data'])
            ->allowElement('iframe', ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy', 'sandbox'])
            // Atribut tata letak dari CKEditor (lebar gambar, perataan) dan blok
            // HTML lanjutan; style tidak bisa menjalankan skrip di browser
            // modern. Harus setelah allowElement(), yang menimpa daftar
            // atribut elemennya.
            ->allowAttribute('class', '*')
            ->allowAttribute('style', '*')
            ->allowAttribute('target', 'a')
            ->allowAttribute('rel', 'a')
            ->withAttributeSanitizer(new class($hostIframe) implements AttributeSanitizerInterface {
                public function __construct(private array $host) {}

                public function getSupportedElements(): ?array
                {
                    return ['iframe'];
                }

                public function getSupportedAttributes(): ?array
                {
                    return ['src'];
                }

                // iframe dari host lain kehilangan src-nya, jadi kosong.
                public function sanitizeAttribute(string $element, string $attribute, string $value, HtmlSanitizerConfig $config): ?string
                {
                    $h = strtolower((string) parse_url($value, PHP_URL_HOST));
                    if ($h === '' || !str_starts_with(strtolower($value), 'https://')) {
                        return null;
                    }
                    foreach ($this->host as $izin) {
                        $izin = strtolower($izin);
                        if ($h === $izin || str_ends_with($h, '.' . $izin)) {
                            return $value;
                        }
                    }

                    return null;
                }
            })
            // Konten panjang (berita hasil impor, halaman) — batas bawaan 20 rb terlalu kecil.
            ->withMaxInputLength(2_000_000);

        return self::$sanitizer = new HtmlSanitizer($config);
    }
}
