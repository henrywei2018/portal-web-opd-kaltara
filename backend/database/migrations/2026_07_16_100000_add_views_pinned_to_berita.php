<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * View tracking + pinned/featured flag for berita. `views` is incremented on
 * each detail load; `is_pinned` marks a berita as featured (shown in the home
 * "Berita Pilihan" carousel).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('berita', function (Blueprint $t) {
            $t->unsignedInteger('views')->default(0)->after('status_berita');
            $t->boolean('is_pinned')->default(false)->after('views');
            $t->index('is_pinned');
        });
    }

    public function down(): void
    {
        Schema::table('berita', function (Blueprint $t) {
            $t->dropIndex(['is_pinned']);
            $t->dropColumn(['views', 'is_pinned']);
        });
    }
};
