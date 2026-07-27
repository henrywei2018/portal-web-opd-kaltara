<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('promosi', function (Blueprint $table) {
            // Days to hide the banner after a visitor closes it. 0 = permanent (never re-show).
            $table->unsignedSmallInteger('jeda_hari')->default(3)->after('target_blank');
        });
    }

    public function down(): void
    {
        Schema::table('promosi', function (Blueprint $table) {
            $table->dropColumn('jeda_hari');
        });
    }
};
