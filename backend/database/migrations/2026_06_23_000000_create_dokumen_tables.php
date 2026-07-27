<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategori_dokumen', function (Blueprint $table) {
            $table->increments('id_kategori_dokumen');
            $table->string('nama');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('dokumen', function (Blueprint $table) {
            $table->increments('id_dokumen');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->string('file');                 // stored filename on disk
            $table->string('nama_file')->nullable(); // original filename (for download)
            $table->unsignedBigInteger('ukuran')->nullable(); // bytes
            $table->unsignedInteger('id_kategori_dokumen')->nullable();
            $table->string('nomor')->nullable();     // document number
            $table->date('tanggal')->nullable();
            $table->enum('status', ['Publish', 'Draft'])->default('Publish');
            $table->unsignedInteger('id_user')->nullable();
            $table->timestamps();

            $table->foreign('id_kategori_dokumen')->references('id_kategori_dokumen')->on('kategori_dokumen')->onDelete('set null');
            $table->foreign('id_user')->references('id_user')->on('user')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen');
        Schema::dropIfExists('kategori_dokumen');
    }
};
