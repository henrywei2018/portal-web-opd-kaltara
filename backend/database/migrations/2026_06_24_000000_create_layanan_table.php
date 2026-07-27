<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('layanan', function (Blueprint $table) {
            $table->increments('id_layanan');
            $table->string('judul');
            $table->string('icon')->nullable();
            $table->string('color')->default('primary');
            $table->string('kategori')->nullable();
            $table->text('deskripsi')->nullable();
            $table->json('persyaratan')->nullable();
            $table->json('prosedur')->nullable();
            $table->string('waktu')->nullable();          // processing time
            $table->string('biaya')->nullable();
            $table->string('masa_berlaku')->nullable();
            $table->string('kontak_telepon')->nullable();
            $table->string('kontak_email')->nullable();
            $table->string('kontak_lokasi')->nullable();
            $table->boolean('darurat')->default(false);
            $table->enum('status', ['Publish', 'Draft'])->default('Publish');
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('layanan');
    }
};
