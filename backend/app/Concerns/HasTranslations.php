<?php

namespace App\Concerns;

use App\Services\Translation\Translator;

/**
 * Translates declared attributes on serialization when the active locale
 * differs from the content source language.
 *
 * Declare on the model:
 *   public array $translatable = ['judul', 'deskripsi'];      // plain string columns
 *   public array $translatableJson = ['persyaratan', 'blocks']; // JSON columns (string leaves)
 */
trait HasTranslations
{
    public function toArray()
    {
        $array = parent::toArray();

        /** @var Translator $translator */
        $translator = app(Translator::class);
        $target = app()->getLocale();
        if (!$translator->supports($target)) {
            return $array;
        }

        foreach ($this->translatable ?? [] as $field) {
            if (array_key_exists($field, $array) && is_string($array[$field]) && $array[$field] !== '') {
                $array[$field] = $translator->translate($array[$field], $target);
            }
        }

        foreach ($this->translatableJson ?? [] as $field) {
            if (array_key_exists($field, $array) && is_array($array[$field])) {
                $array[$field] = $this->translateJsonValue($array[$field], $translator, $target);
            }
        }

        return $array;
    }

    private function translateJsonValue($value, Translator $translator, string $target)
    {
        if (is_string($value)) {
            return $this->isTranslatableLeaf($value) ? $translator->translate($value, $target) : $value;
        }
        if (is_array($value)) {
            $out = [];
            foreach ($value as $key => $item) {
                if (is_string($key) && in_array($key, $this->jsonSkipKeys(), true)) {
                    $out[$key] = $item; // structural/config key — leave untouched
                    continue;
                }
                $out[$key] = $this->translateJsonValue($item, $translator, $target);
            }
            return $out;
        }
        return $value;
    }

    /** Keys inside JSON structures that hold config/identifiers, not prose. */
    protected function jsonSkipKeys(): array
    {
        return ['type', 'url', 'href', 'link', 'icon', 'color', 'image', 'src',
            'slug', 'id', 'target', 'variant', 'align', 'size', 'bg', 'bgcolor', 'value'];
    }

    /** Avoid translating URLs, emails, phone numbers, and bare numerics. */
    private function isTranslatableLeaf(string $s): bool
    {
        $t = trim($s);
        if ($t === '') {
            return false;
        }
        if (preg_match('#^(https?:|/|mailto:|tel:|\#|[\w.+-]+@[\w.-]+)#i', $t)) {
            return false;
        }
        if (is_numeric($t)) {
            return false;
        }
        return true;
    }
}
