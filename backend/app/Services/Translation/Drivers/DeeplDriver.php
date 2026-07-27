<?php

namespace App\Services\Translation\Drivers;

use Illuminate\Support\Facades\Http;

/**
 * DeepL translation. High quality, HTML-aware (tag_handling=html). Requires DEEPL_API_KEY.
 */
class DeeplDriver implements TranslationDriver
{
    public function translate(string $text, string $source, string $target): string
    {
        $key = config('translation.deepl.key');
        if (!$key) {
            throw new \RuntimeException('DEEPL_API_KEY not configured');
        }

        $res = Http::timeout((int) config('translation.timeout', 8))
            ->asForm()
            ->withHeaders(['Authorization' => 'DeepL-Auth-Key ' . $key])
            ->post(config('translation.deepl.endpoint'), [
                'text' => $text,
                'source_lang' => strtoupper($source),
                'target_lang' => strtoupper($target),
                'tag_handling' => 'html',
            ]);

        if (!$res->ok()) {
            throw new \RuntimeException('DeepL HTTP ' . $res->status());
        }

        $out = $res->json('translations.0.text');
        if (!is_string($out) || $out === '') {
            throw new \RuntimeException('Empty DeepL response');
        }

        return $out;
    }
}
