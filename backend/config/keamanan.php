<?php

/*
|--------------------------------------------------------------------------
| Keamanan konten
|--------------------------------------------------------------------------
| Satu daftar host iframe dipakai dua lapis pertahanan sekaligus: sanitasi
| HTML konten (App\Support\HtmlAman) dan header Content-Security-Policy
| (SpaController). Menambah sumber embed baru cukup di sini.
*/

return [

    // Host yang boleh menjadi src <iframe> di konten (berita, artikel, blok
    // halaman) dan muncul di frame-src CSP. Cocok persis atau subdomain.
    'iframe_hosts' => array_values(array_filter(array_map('trim', explode(',', (string) env(
        'IFRAME_HOSTS',
        'www.youtube.com,www.youtube-nocookie.com,www.google.com,maps.google.com,player.vimeo.com,'
        . 'lookerstudio.google.com,datastudio.google.com,docs.google.com'
    ))))),

    'csp' => [
        // Matikan hanya untuk darurat (mis. CSP memblokir fitur di produksi).
        'enabled' => env('CSP_ENABLED', true),
        // true = browser hanya melaporkan pelanggaran ke konsol, tidak memblokir.
        'report_only' => env('CSP_REPORT_ONLY', false),
    ],

];
