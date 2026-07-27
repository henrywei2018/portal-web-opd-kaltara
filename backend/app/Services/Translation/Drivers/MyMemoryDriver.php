<?php

namespace App\Services\Translation\Drivers;

use Illuminate\Support\Facades\Http;

/**
 * Keyless MyMemory endpoint. Free tier (~5k words/day anonymous).
 */
class MyMemoryDriver implements TranslationDriver
{
    public function translate(string $text, string $source, string $target): string
    {
        $res = Http::timeout((int) config('translation.timeout', 8))
            ->get('https://api.mymemory.translated.net/get', [
                'q' => $text,
                'langpair' => "{$source}|{$target}",
            ]);

        if (!$res->ok()) {
            throw new \RuntimeException('MyMemory HTTP ' . $res->status());
        }

        $translated = $res->json('responseData.translatedText');
        if (!is_string($translated) || $translated === '') {
            throw new \RuntimeException('Empty MyMemory response');
        }

        return $translated;
    }
}
