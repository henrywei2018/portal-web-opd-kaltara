<?php

namespace App\Services\Translation\Drivers;

use Illuminate\Support\Facades\Http;

/**
 * LLM-based translation via the Anthropic API. Best quality and HTML-safe
 * (preserves markup). Requires ANTHROPIC_API_KEY. Opt-in via TRANSLATE_DRIVER=claude.
 */
class ClaudeDriver implements TranslationDriver
{
    public function translate(string $text, string $source, string $target): string
    {
        $key = config('translation.claude.key');
        if (!$key) {
            throw new \RuntimeException('ANTHROPIC_API_KEY not configured');
        }

        $langName = ['id' => 'Indonesian', 'en' => 'English'];
        $from = $langName[$source] ?? $source;
        $to = $langName[$target] ?? $target;

        $res = Http::timeout((int) config('translation.timeout', 8) + 12)
            ->withHeaders([
                'x-api-key' => $key,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => config('translation.claude.model'),
                'max_tokens' => 4096,
                'system' => "You are a professional translator for a government health department website. "
                    . "Translate the user's text from {$from} to {$to}. Preserve any HTML tags, entities, and "
                    . "formatting exactly. Keep proper nouns, phone numbers, emails, and URLs unchanged. "
                    . "Output ONLY the translation, with no preamble or quotes.",
                'messages' => [
                    ['role' => 'user', 'content' => $text],
                ],
            ]);

        if (!$res->ok()) {
            throw new \RuntimeException('Anthropic HTTP ' . $res->status());
        }

        $out = $res->json('content.0.text');
        if (!is_string($out) || $out === '') {
            throw new \RuntimeException('Empty Anthropic response');
        }

        return trim($out);
    }
}
