<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $defaults = [
            'website' => '',
            'map_embed' => '',
            'maps_link' => 'https://maps.google.com',
            'jam_operasional' => "Senin - Kamis: 08.00 - 16.00\nJumat: 08.00 - 16.30\nSabtu - Minggu & Hari Libur: Tutup",
        ];
        $now = now();
        foreach ($defaults as $k => $v) {
            DB::table('settings')->updateOrInsert(
                ['key' => $k],
                ['value' => $v, 'updated_at' => $now, 'created_at' => $now]
            );
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', ['website', 'map_embed', 'maps_link', 'jam_operasional'])->delete();
    }
};
