<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Shared per-request instance so the in-memory cache + driver are reused
        $this->app->singleton(\App\Services\Translation\Translator::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Batas permintaan per akun untuk area yang butuh login. Unggahan diberi
        // batas tersendiri agar satu akun tidak bisa memenuhi disk server.
        RateLimiter::for('admin', fn (Request $request) => [
            Limit::perMinute(300)->by('admin:' . ($request->user('api')?->getKey() ?? $request->ip())),
            ...($request->allFiles() ? [Limit::perMinute(30)->by('admin-unggah:' . ($request->user('api')?->getKey() ?? $request->ip()))] : []),
        ]);

        RateLimiter::for('media', fn (Request $request) => [
            Limit::perMinute(120)->by('media:' . ($request->user('media')?->getKey() ?? $request->ip())),
            ...($request->allFiles() ? [Limit::perMinute(15)->by('media-unggah:' . ($request->user('media')?->getKey() ?? $request->ip()))] : []),
        ]);
    }
}
