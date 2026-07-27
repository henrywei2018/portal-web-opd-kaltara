<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * SEO-friendly slug URLs for berita & artikel (e.g. /berita/imunisasi-nasional
 * instead of /berita/12). Adds a `slug` column to both tables and backfills it
 * from existing titles (de-duplicated). Old numeric-id URLs keep working and are
 * 301-redirected to the slug URL by SpaController.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('berita', fn (Blueprint $t) => $t->string('slug')->nullable()->after('judul'));
        Schema::table('artikel', fn (Blueprint $t) => $t->string('slug')->nullable()->after('judul'));

        $this->backfill('berita', 'id_berita');
        $this->backfill('artikel', 'id_artikel');

        Schema::table('berita', fn (Blueprint $t) => $t->unique('slug'));
        Schema::table('artikel', fn (Blueprint $t) => $t->unique('slug'));
    }

    private function backfill(string $table, string $pk): void
    {
        $used = [];
        DB::table($table)->orderBy($pk)->get()->each(function ($row) use (&$used, $table, $pk) {
            $base = Str::slug((string) $row->judul) ?: $table;
            $slug = $base;
            $i = 1;
            while (in_array($slug, $used, true)) {
                $slug = $base . '-' . (++$i);
            }
            $used[] = $slug;
            DB::table($table)->where($pk, $row->{$pk})->update(['slug' => $slug]);
        });
    }

    public function down(): void
    {
        Schema::table('berita', function (Blueprint $t) {
            $t->dropUnique(['slug']);
            $t->dropColumn('slug');
        });
        Schema::table('artikel', function (Blueprint $t) {
            $t->dropUnique(['slug']);
            $t->dropColumn('slug');
        });
    }
};
