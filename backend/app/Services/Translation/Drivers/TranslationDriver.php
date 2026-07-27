<?php

namespace App\Services\Translation\Drivers;

interface TranslationDriver
{
    /**
     * Translate a single chunk of text. May throw on provider failure;
     * the Translator service is responsible for catching and falling back.
     */
    public function translate(string $text, string $source, string $target): string;
}
