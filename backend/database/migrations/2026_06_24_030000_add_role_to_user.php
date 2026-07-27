<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user', function (Blueprint $table) {
            $table->string('role')->default('kontributor')->after('level');
        });

        // Backfill: existing level-1 accounts become super admins, others admins
        DB::table('user')->where('level', 1)->update(['role' => 'super_admin']);
        DB::table('user')->where('level', '!=', 1)->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('user', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
