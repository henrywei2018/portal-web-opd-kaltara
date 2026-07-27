<?php

namespace App\Services\Translation\Drivers;

use Illuminate\Support\Facades\Http;

/**
 * Keyless Google translate endpoint. Good quality, no API key required.
 * Returns segmented results which we concatenate back together.
 */
class GoogleDriver implements TranslationDriver
{
    public function translate(string $text, string $source, string $target): string
    {
        $res = Http::timeout((int) config('translation.timeout', 8))
            ->get('https://translate.googleapis.com/translate_a/single', [
                'client' => 'gtx',
                'sl' => $source,
                'tl' => $target,
                'dt' => 't',
                'q' => $text,
            ]);

        if (!$res->ok()) {
            throw new \RuntimeException('Google translate HTTP ' . $res->status());
        }

        $data = $res->json();
        $segments = $data[0] ?? null;
        if (!is_array($segments)) {
            throw new \RuntimeException('Unexpected Google translate response');
        }

        $out = '';
        foreach ($segments as $seg) {
            $out .= $seg[0] ?? '';
        }

        return $out !== '' ? $out : $text;
    }
}
