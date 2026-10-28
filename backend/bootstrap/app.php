<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'ability' => \App\Http\Middleware\EnsureAbility::class,
            'akun.aktif' => \App\Http\Middleware\AkunAktif::class,
        ]);
        // Hanya host APP_URL (dan subdomainnya) yang diterima. Tanpa ini Host
        // palsu ikut masuk ke canonical/og:url/sitemap yang dibangun dari request.
        // Otomatis nonaktif di APP_ENV=local.
        $middleware->trustHosts();
        // Resolve request locale (?lang / X-Locale) for on-the-fly content translation
        $middleware->appendToGroup('api', \App\Http\Middleware\SetLocale::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
        // Unauthenticated API requests -> JSON 401 (instead of redirect/500)
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
        });
    })->create();
