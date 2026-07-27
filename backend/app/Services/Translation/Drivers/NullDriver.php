<?php

namespace App\Services\Translation\Drivers;

/**
 * Disabled translation — returns the source text unchanged.
 */
class NullDriver implements TranslationDriver
{
    public function translate(string $text, string $source, string $target): string
    {
        return $text;
    }
}
