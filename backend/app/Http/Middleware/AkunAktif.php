<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Menolak token milik akun yang sudah dinonaktifkan.
 *
 * Status akun hanya diperiksa saat login, sementara JWT tetap sah sampai
 * kedaluwarsa (dan bisa diperbarui hingga refresh_ttl). Tanpa pemeriksaan per
 * permintaan, petugas yang dinonaktifkan atau perusahaan yang ditolak tetap
 * bisa memakai sesi lamanya.
 */
class AkunAktif
{
    public function handle(Request $request, Closure $next, string $guard = 'api')
    {
        $akun = auth($guard)->user();

        $aktif = match ($guard) {
            'media' => $akun && !in_array($akun->status_akun, ['ditolak', 'nonaktif'], true),
            default => $akun && (int) $akun->status === 1,
        };

        if (!$aktif) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return $next($request);
    }
}
