<?php

return [
    // Driver used for on-the-fly machine translation.
    // Supported: 'google' (keyless, default), 'mymemory' (keyless),
    // 'deepl' (needs key), 'claude' (needs Anthropic key, best for HTML), 'null' (disabled)
    'driver' => env('TRANSLATE_DRIVER', 'google'),

    // The language the CMS content is authored in (the "source" of truth).
    'source' => env('TRANSLATE_SOURCE', 'id'),

    // Locales we are willing to translate INTO. A request for any other locale
    // (including the source) is served as-is.
    'targets' => ['en'],

    // Per-driver settings
    'deepl' => [
        'key' => env('DEEPL_API_KEY'),
        'endpoint' => env('DEEPL_ENDPOINT', 'https://api-free.deepl.com/v2/translate'),
    ],
    'claude' => [
        'key' => env('ANTHROPIC_API_KEY'),
        'model' => env('TRANSLATE_CLAUDE_MODEL', 'claude-haiku-4-5-20251001'),
    ],

    // HTTP timeout (seconds) for a single provider call.
    'timeout' => env('TRANSLATE_TIMEOUT', 8),

    // Texts longer than this are split into chunks before translating
    // (keyless GET endpoints have URL-length limits).
    'chunk_size' => 1500,
];
