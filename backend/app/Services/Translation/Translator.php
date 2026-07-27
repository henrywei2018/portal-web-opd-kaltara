<?php

namespace App\Services\Translation;

use App\Services\Translation\Drivers\ClaudeDriver;
use App\Services\Translation\Drivers\DeeplDriver;
use App\Services\Translation\Drivers\GoogleDriver;
use App\Services\Translation\Drivers\MyMemoryDriver;
use App\Services\Translation\Drivers\NullDriver;
use App\Services\Translation\Drivers\TranslationDriver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * On-the-fly machine translation with a persistent cache.
 *
 * translate() resolves a single string for the active target locale:
 *   - returns the source text untouched when target === source (or unsupported)
 *   - serves a cached translation when available (DB + per-request memo)
 *   - otherwise calls the configured provider, caches, and returns the result
 *   - on ANY provider error, gracefully falls back to the source text
 */
class Translator
{
    private array $memo = [];
    private ?TranslationDriver $driver = null;

    public function source(): string
    {
        return (string) config('translation.source', 'id');
    }

    public function targets(): array
    {
        return (array) config('translation.targets', []);
    }

    public function supports(string $target): bool
    {
        return $target !== $this->source() && in_array($target, $this->targets(), true);
    }

    private function driver(): TranslationDriver
    {
        if ($this->driver) {
            return $this->driver;
        }

        return $this->driver = match (config('translation.driver', 'google')) {
            'mymemory' => new MyMemoryDriver(),
            'deepl' => new DeeplDriver(),
            'claude' => new ClaudeDriver(),
            'null', 'none', '' => new NullDriver(),
            default => new GoogleDriver(),
        };
    }

    /**
     * Translate a single string into $target (defaults to the active app locale).
     */
    public function translate(?string $text, ?string $target = null): ?string
    {
        $target ??= app()->getLocale();

        if ($text === null || trim($text) === '' || !$this->supports($target)) {
            return $text;
        }

        $source = $this->source();
        $hash = sha1($source . ':' . $target . ':' . $text);

        if (isset($this->memo[$hash])) {
            return $this->memo[$hash];
        }

        // Persistent cache
        $cached = DB::table('translation_cache')->where('hash', $hash)->value('value');
        if ($cached !== null) {
            return $this->memo[$hash] = $cached;
        }

        try {
            $value = $this->translateRaw($text, $source, $target);
        } catch (\Throwable $e) {
            Log::warning('Translation failed, falling back to source: ' . $e->getMessage());
            return $text; // graceful fallback (not cached, so it retries next time)
        }

        DB::table('translation_cache')->insertOrIgnore([
            'hash' => $hash,
            'target' => $target,
            'source_text' => mb_substr($text, 0, 60000),
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->memo[$hash] = $value;
    }

    /**
     * Translate, chunking long text to stay under provider URL/size limits.
     */
    private function translateRaw(string $text, string $source, string $target): string
    {
        $limit = (int) config('translation.chunk_size', 1500);
        if (mb_strlen($text) <= $limit) {
            return $this->driver()->translate($text, $source, $target);
        }

        $out = '';
        foreach ($this->chunk($text, $limit) as $piece) {
            $out .= $this->driver()->translate($piece, $source, $target);
        }
        return $out;
    }

    /**
     * Split text into pieces <= $limit, preferring to break at sentence,
     * newline, or tag boundaries so HTML/markup stays mostly intact.
     */
    private function chunk(string $text, int $limit): array
    {
        // Break points after a closing tag, sentence end, or newline.
        $tokens = preg_split('/(?<=[>.\n])/u', $text);
        $chunks = [];
        $buf = '';
        foreach ($tokens as $tok) {
            if (mb_strlen($buf) + mb_strlen($tok) > $limit && $buf !== '') {
                $chunks[] = $buf;
                $buf = '';
            }
            // A single token longer than the limit is hard-split.
            while (mb_strlen($tok) > $limit) {
                $chunks[] = mb_substr($tok, 0, $limit);
                $tok = mb_substr($tok, $limit);
            }
            $buf .= $tok;
        }
        if ($buf !== '') {
            $chunks[] = $buf;
        }
        return $chunks;
    }
}
