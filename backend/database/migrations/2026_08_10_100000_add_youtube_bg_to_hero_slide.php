<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds a YouTube background type to the hero.
     *
     * `bg_type` becomes a plain string instead of an enum: every new background
     * kind would otherwise need its own ALTER on MySQL, and the allowed values
     * are already enforced by request validation. `bg_poster` holds a locally
     * uploaded still shown whenever the player must not run — before cookie
     * consent, under reduced-motion, or when YouTube is unreachable.
     */
    public function up(): void
    {
        Schema::table('hero_slide', function (Blueprint $table) {
            $table->string('bg_type', 20)->default('color')->change();
            $table->string('bg_poster')->nullable()->after('bg_value');
        });
    }

    public function down(): void
    {
        // Any slide using a type outside the original enum must be parked on a
        // valid one first, or the enum below would reject the existing rows.
        \DB::table('hero_slide')->whereNotIn('bg_type', ['color', 'gradient', 'image'])->update(['bg_type' => 'color']);

        Schema::table('hero_slide', function (Blueprint $table) {
            $table->dropColumn('bg_poster');
            $table->enum('bg_type', ['color', 'gradient', 'image'])->default('color')->change();
        });
    }
};
