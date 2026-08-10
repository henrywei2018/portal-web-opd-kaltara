<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-slide display duration. 6 seconds matches the interval that was
     * previously hard-coded in the hero carousel, so existing slides keep
     * behaving exactly as before.
     */
    public function up(): void
    {
        Schema::table('hero_slide', function (Blueprint $table) {
            $table->unsignedSmallInteger('durasi')->default(6)->after('overlay');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slide', function (Blueprint $table) {
            $table->dropColumn('durasi');
        });
    }
};
