<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * How a youtube slide plays.
     *
     * false (default) — poster + play button, the player opens in a modal on
     * click. No third-party request until the visitor asks for one, so it needs
     * no cookie gate, is unaffected by reduced-motion, and is never cropped.
     * true — the muted looping background player, which does need those gates.
     */
    public function up(): void
    {
        Schema::table('hero_slide', function (Blueprint $table) {
            $table->boolean('bg_autoplay')->default(false)->after('bg_poster');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slide', function (Blueprint $table) {
            $table->dropColumn('bg_autoplay');
        });
    }
};
