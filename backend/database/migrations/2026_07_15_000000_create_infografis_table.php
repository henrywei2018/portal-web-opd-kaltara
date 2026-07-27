<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Give infografis its own module. Previously an "infografis" was just a galeri
 * row detected by a fuzzy LIKE '%infogra%' on its category name or title, which
 * also leaked those images into the normal /galeri feed. This creates a real
 * `infografis` table and MOVES the matching rows out of `galeri` (image files in
 * public/gambar are shared by filename, so nothing on disk needs to move).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('infografis', function (Blueprint $table) {
            $table->increments('id_infografis');
            $table->string('judul');
            $table->string('gambar')->nullable();
            $table->enum('status', ['Publish', 'Draft'])->default('Publish');
            $table->date('tanggal')->nullable();
        });

        // Move existing infografis-like galeri rows into the new table
        $rows = DB::table('galeri')
            ->leftJoin('kategori', 'galeri.idkat', '=', 'kategori.idkat')
            ->where(function ($q) {
                $q->where('kategori.nmkat', 'like', '%infogra%')
                  ->orWhere('galeri.judul', 'like', '%infogra%');
            })
            ->select('galeri.*')
            ->get();

        foreach ($rows as $r) {
            DB::table('infografis')->insert([
                'judul' => $r->judul,
                'gambar' => $r->gambar,
                'status' => $r->status,
                'tanggal' => $r->tanggal,
            ]);
        }

        if ($rows->isNotEmpty()) {
            DB::table('galeri')->whereIn('id_galeri', $rows->pluck('id_galeri')->all())->delete();
        }
    }

    public function down(): void
    {
        // Move rows back into galeri so the split is reversible
        if (Schema::hasTable('infografis')) {
            DB::table('infografis')->orderBy('id_infografis')->get()->each(function ($r) {
                DB::table('galeri')->insert([
                    'judul' => $r->judul,
                    'gambar' => $r->gambar,
                    'status' => $r->status,
                    'tanggal' => $r->tanggal,
                ]);
            });
        }

        Schema::dropIfExists('infografis');
    }
};
