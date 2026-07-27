<?php

namespace App\Http\Middleware;

use App\Support\Roles;
use Closure;
use Illuminate\Http\Request;

class EnsureAbility
{
    public function handle(Request $request, Closure $next, string $ability)
    {
        $user = auth()->user();

        if (!$user || !Roles::can($user, $ability)) {
            return response()->json(['error' => 'Tidak memiliki akses untuk fitur ini'], 403);
        }

        return $next($request);
    }
}
