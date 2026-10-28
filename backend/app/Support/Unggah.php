<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Penyimpanan berkas unggahan ke folder publik (public/gambar, public/file).
 *
 * Ekstensi berkas yang disimpan SELALU ditentukan server dari isi berkas
 * (MIME hasil sniffing), lalu dicocokkan dengan daftar izin. Nama dan ekstensi
 * kiriman klien tidak pernah dipakai sebagai ekstensi: berkas "foto.php" yang
 * diawali header GIF tersimpan sebagai .gif dan tidak dijalankan PHP, dan
 * polyglot "x.html" tersimpan sebagai .jpg sehingga tidak dirender sebagai HTML.
 * SVG tidak diizinkan karena bisa memuat skrip.
 */
class Unggah
{
    public const GAMBAR = ['jpg', 'png', 'webp', 'gif'];
    public const IKON = ['jpg', 'png', 'webp', 'gif', 'ico'];
    public const DOKUMEN_KANTOR = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    // Aturan validasi siap pakai; pemeriksaan ekstensi klien ditambahkan agar
    // nama berkas yang menyamar ditolak sejak validasi.
    public const ATURAN_GAMBAR = 'image|mimes:jpg,jpeg,png,webp,gif|extensions:jpg,jpeg,png,webp,gif';
    public const ATURAN_IKON = 'file|mimes:jpg,jpeg,png,webp,gif,ico|extensions:jpg,jpeg,png,webp,gif,ico';

    /**
     * @param  string[]  $izin    Ekstensi yang boleh disimpan (huruf kecil).
     * @param  string    $field   Nama field untuk pesan galat validasi.
     */
    public static function simpan(UploadedFile $file, string $folder, array $izin, string $prefix = '', string $field = 'file', bool $denganNamaAsli = false): string
    {
        $ext = self::ekstensi($file);
        if ($ext === null || !in_array($ext, $izin, true)) {
            throw ValidationException::withMessages([$field => 'Jenis berkas tidak diizinkan.']);
        }

        $nama = uniqid($prefix);
        if ($denganNamaAsli) {
            // Bagian nama asli hanya untuk keterbacaan saat diunduh; dibersihkan
            // menjadi slug sehingga tidak bisa membawa titik, garis miring, atau ekstensi.
            $asli = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
            if ($asli !== '') {
                $nama .= '_' . Str::limit($asli, 80, '');
            }
        }
        $nama .= '.' . $ext;

        $file->move(public_path($folder), $nama);

        return $nama;
    }

    /** Ekstensi dari isi berkas, dinormalkan; null bila tidak dikenali. */
    public static function ekstensi(UploadedFile $file): ?string
    {
        $mime = (string) $file->getMimeType();
        // finfo melaporkan ikon dengan beberapa nama; samakan dulu.
        if (in_array($mime, ['image/x-icon', 'image/vnd.microsoft.icon'], true)) {
            return 'ico';
        }

        $ext = strtolower((string) $file->guessExtension());

        return match ($ext) {
            '' => null,
            'jpeg', 'jpe' => 'jpg',
            default => $ext,
        };
    }
}
