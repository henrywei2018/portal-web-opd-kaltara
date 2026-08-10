<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Seeded empty on purpose. This portal is a template for any agency,
        // and 119 is the Indonesian *health* emergency line — baking it in made
        // every fresh install advertise an emergency service it may not run.
        // Installs that already seeded '119' keep it; clear it in Pengaturan.
        DB::table('settings')->updateOrInsert(
            ['key' => 'telepon_darurat'],
            ['value' => '', 'updated_at' => now(), 'created_at' => now()]
        );
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'telepon_darurat')->delete();
    }
};
