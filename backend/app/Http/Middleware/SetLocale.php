<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Resolves the request locale from (in order): ?lang= query or X-Locale header.
 * Falls back to the content source language so responses stay Indonesian unless
 * a translation is explicitly requested. Only supported locales are honoured.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $source = (string) config('translation.source', 'id');
        $allowed = array_merge([$source], (array) config('translation.targets', []));

        $locale = $request->query('lang') ?? $request->header('X-Locale') ?? $source;
        $locale = is_string($locale) ? strtolower(trim($locale)) : $source;

        app()->setLocale(in_array($locale, $allowed, true) ? $locale : $source);

        return $next($request);
    }
}
