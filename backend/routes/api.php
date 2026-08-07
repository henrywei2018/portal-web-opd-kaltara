<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\Admin\{DashboardController, BeritaController, GaleriController, InfografisController, VideoController, SliderController, KategoriController, UserController, ArtikelController, PengumumanController, HalamanController, MenuController, DokumenController, KategoriDokumenController, LayananController, HeroController, StatistikController, TautanPentingController, PromosiController, SettingController, KomentarController};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (no authentication)
Route::prefix('public')->group(function () {
    Route::get('/berita', [PublicController::class, 'berita']);
    Route::get('/berita-filters', [PublicController::class, 'beritaFilters']);
    Route::get('/berita/{id}', [PublicController::class, 'detailBerita']);
    Route::get('/kategori/{id}/berita', [PublicController::class, 'kategoriBerita']);
    Route::get('/kategori', [PublicController::class, 'kategori']);
    Route::get('/pengumuman', [PublicController::class, 'pengumuman']);
    Route::get('/galeri', [PublicController::class, 'galeri']);
    Route::get('/infografis', [PublicController::class, 'infografis']);
    Route::get('/artikel', [PublicController::class, 'artikel']);
    Route::get('/artikel/{id}', [PublicController::class, 'detailArtikel']);
    Route::get('/video', [PublicController::class, 'video']);
    Route::get('/slider', [PublicController::class, 'slider']);
    Route::get('/sejarah', [PublicController::class, 'sejarah']);
    Route::get('/tugasfungsi', [PublicController::class, 'tugasfungsi']);
    Route::get('/struktur', [PublicController::class, 'struktur']);
    Route::get('/sambutan', [PublicController::class, 'sambutan']);
    Route::get('/publikasi', [PublicController::class, 'publikasi']);
    Route::post('/kontak', [PublicController::class, 'kontak']);
    Route::post('/track', [PublicController::class, 'track'])->middleware('throttle:120,1');
    Route::get('/statistik-kunjungan', [PublicController::class, 'statistikKunjungan']);
    Route::get('/downloads/{id}/file', [PublicController::class, 'downloadFile']);
    Route::get('/menu', [PublicController::class, 'menu']);
    Route::get('/hero', [PublicController::class, 'hero']);
    Route::get('/statistik', [PublicController::class, 'statistik']);
    Route::get('/tautan-penting', [PublicController::class, 'tautanPenting']);
    Route::get('/promosi', [PublicController::class, 'promosi']);
    Route::get('/settings', [PublicController::class, 'settings']);
    Route::get('/layanan', [PublicController::class, 'layanan']);
    Route::get('/dokumen', [PublicController::class, 'dokumen']);
    Route::get('/dokumen-kategori', [PublicController::class, 'kategoriDokumen']);
    Route::get('/dokumen/{id}/file', [PublicController::class, 'dokumenFile']);
    // slug may contain slashes for nested pages, e.g. profil/tentang-kami
    Route::get('/halaman/{slug}', [PublicController::class, 'halamanBySlug'])->where('slug', '.*');
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Protected admin routes (JWT auth + per-module role abilities)
Route::middleware('auth:api')->prefix('admin')->group(function () {
    // Dashboard — any authenticated admin user
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/laporan-kunjungan', [DashboardController::class, 'laporanKunjungan']);
    Route::get('/audit-log', [DashboardController::class, 'auditLog']);

    // Content modules
    Route::post('berita/{id}/toggle-pin', [BeritaController::class, 'togglePin'])->middleware('ability:berita');
    Route::post('berita/upload-image', [BeritaController::class, 'uploadContentImage'])->middleware('ability:berita');
    Route::apiResource('berita', BeritaController::class)->middleware('ability:berita');
    Route::apiResource('artikel', ArtikelController::class)->middleware('ability:artikel');
    Route::apiResource('pengumuman', PengumumanController::class)->middleware('ability:pengumuman');
    Route::apiResource('kategori', KategoriController::class)->middleware('ability:kategori');
    Route::apiResource('galeri', GaleriController::class)->middleware('ability:galeri');
    Route::apiResource('infografis', InfografisController::class)->middleware('ability:infografis');
    Route::apiResource('video', VideoController::class)->middleware('ability:video');
    Route::apiResource('slider', SliderController::class)->middleware('ability:hero');
    Route::post('layanan/upload-image', [LayananController::class, 'uploadImage'])->middleware('ability:layanan');
    Route::apiResource('layanan', LayananController::class)->middleware('ability:layanan');
    Route::apiResource('statistik', StatistikController::class)->middleware('ability:statistik');
    Route::apiResource('tautan-penting', TautanPentingController::class)->middleware('ability:hero');
    Route::apiResource('promosi', PromosiController::class)->middleware('ability:hero');
    Route::middleware('ability:pengaturan')->group(function () {
        Route::get('settings', [SettingController::class, 'index']);
        Route::put('settings', [SettingController::class, 'update']);
        Route::post('settings/upload-logo', [SettingController::class, 'uploadLogo']);
    });
    Route::middleware('ability:seo')->group(function () {
        Route::get('seo', [\App\Http\Controllers\Api\Admin\SeoController::class, 'index']);
        Route::put('seo', [\App\Http\Controllers\Api\Admin\SeoController::class, 'update']);
    });
    Route::middleware('ability:pesan')->group(function () {
        Route::get('pesan', [KomentarController::class, 'index']);
        Route::get('pesan/unread-count', [KomentarController::class, 'unreadCount']);
        Route::post('pesan/{id}/read', [KomentarController::class, 'markRead']);
        Route::post('pesan/{id}/unread', [KomentarController::class, 'markUnread']);
        Route::delete('pesan/{id}', [KomentarController::class, 'destroy']);
    });

    // Documents
    Route::middleware('ability:dokumen')->group(function () {
        Route::apiResource('dokumen', DokumenController::class);
        Route::apiResource('kategori-dokumen', KategoriDokumenController::class);
    });

    // Halaman (dynamic pages)
    Route::middleware('ability:halaman')->group(function () {
        Route::post('halaman/upload-image', [HalamanController::class, 'uploadImage']);
        Route::apiResource('halaman', HalamanController::class);
    });

    // Menu (navigation)
    Route::middleware('ability:menu')->group(function () {
        Route::post('menu/reorder', [MenuController::class, 'reorder']);
        Route::apiResource('menu', MenuController::class);
    });

    // Hero (homepage slider)
    Route::middleware('ability:hero')->group(function () {
        Route::post('hero/upload-image', [HeroController::class, 'uploadImage']);
        Route::apiResource('hero', HeroController::class);
    });

    // User management (super admin / admin only)
    Route::middleware('ability:pengguna')->group(function () {
        Route::apiResource('user', UserController::class);
        Route::post('user/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::post('user/{id}/reset-password', [UserController::class, 'resetPassword']);
    });

    // Legacy content (sejarah, tugasfungsi, struktur) — any authenticated admin
    Route::get('content/sejarah', [DashboardController::class, 'getSejarah']);
    Route::put('content/sejarah', [DashboardController::class, 'updateSejarah']);
    Route::get('content/tugasfungsi', [DashboardController::class, 'getTugasFungsi']);
    Route::put('content/tugasfungsi', [DashboardController::class, 'updateTugasFungsi']);
    Route::get('content/struktur', [DashboardController::class, 'getStruktur']);
    Route::post('content/struktur', [DashboardController::class, 'updateStruktur']);
    Route::get('content/sambutan', [DashboardController::class, 'getSambutan']);
});
