<?php

use App\Http\Controllers\Api\SitemapController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — serve the built React SPA
|--------------------------------------------------------------------------
| The frontend is built with Vite and its output (frontend/dist) is copied
| into this app's public/ folder at deploy time (see deploy.sh). Static files
| (/assets/*, /gambar/*, favicon, etc.) are served directly by the web server;
| every other path returns index.html so React Router can handle it. SpaController
| injects per-URL SEO/OpenGraph meta into that HTML for social scrapers.
| The JSON API lives under /api (routes/api.php).
*/

// Dynamic sitemap for crawlers (must be declared before the SPA fallback).
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// robots.txt — references the sitemap using the current host so it stays correct
// on any domain. Declared before the fallback so the SPA doesn't shadow it.
Route::get('/robots.txt', function () {
    $sitemap = rtrim(request()->getSchemeAndHttpHost(), '/') . '/sitemap.xml';
    $body = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\n\nSitemap: {$sitemap}\n";

    return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
});

// Serve the SPA (with server-injected meta) for all other paths.
Route::get('/', [SpaController::class, 'serve']);
Route::fallback([SpaController::class, 'serve']);
