<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | When the SPA is served from the SAME domain as the API (recommended
    | single-domain deploy), CORS is never triggered. These settings only
    | matter if you host the frontend on a different origin (e.g. a subdomain).
    | Set FRONTEND_URL in .env (comma-separated for multiple origins).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('FRONTEND_URL', ''))
    ))) ?: ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // JWT is sent via the Authorization header (not cookies), so credentials
    // are not required. Keep false to allow wildcard origins safely.
    // Kredensial (cookie) hanya diizinkan bila asal SPA ditulis eksplisit di
    // FRONTEND_URL; dipakai cookie pengikat SSO saat SPA dan API beda origin.
    'supports_credentials' => trim((string) env('FRONTEND_URL', '')) !== '',

];
