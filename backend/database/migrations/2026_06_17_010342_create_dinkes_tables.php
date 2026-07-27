<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users table
        Schema::create('user', function (Blueprint $table) {
            $table->increments('id_user');
            $table->string('nama');
            $table->string('username')->unique();
            $table->string('password');
            $table->integer('level')->default(1);
            $table->integer('status')->default(1);
            $table->timestamp('last_login')->nullable();
        });

        // Categories table
        Schema::create('kategori', function (Blueprint $table) {
            $table->increments('idkat');
            $table->string('nmkat');
        });

        // News table
        Schema::create('berita', function (Blueprint $table) {
            $table->increments('id_berita');
            $table->string('judul');
            $table->text('isi');
            $table->string('keyword')->nullable();
            $table->string('gambar')->nullable();
            $table->string('gambar2')->nullable();
            $table->string('gambar3')->nullable();
            $table->string('gambar4')->nullable();
            $table->string('gambar5')->nullable();
            $table->date('tanggal_post');
            $table->enum('status_berita', ['Publish', 'Draft'])->default('Draft');
            $table->unsignedInteger('id_user');
            $table->unsignedInteger('idkat')->nullable();
            $table->foreign('id_user')->references('id_user')->on('user')->onDelete('cascade');
            $table->foreign('idkat')->references('idkat')->on('kategori')->onDelete('set null');
        });

        // Gallery table
        Schema::create('galeri', function (Blueprint $table) {
            $table->increments('id_galeri');
            $table->string('judul');
            $table->string('gambar')->nullable();
            $table->enum('status', ['Publish', 'Draft'])->default('Publish');
            $table->date('tanggal');
        });

        // Videos table
        Schema::create('video', function (Blueprint $table) {
            $table->increments('id_video');
            $table->string('judul');
            $table->string('link_video');
        });

        // Slider table
        Schema::create('slider', function (Blueprint $table) {
            $table->increments('id_slider');
            $table->string('foto');
        });

        // Sambutan (Welcome message) table
        Schema::create('sambutan', function (Blueprint $table) {
            $table->increments('id_sambutan');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->string('foto')->nullable();
        });

        // Downloads table
        Schema::create('download', function (Blueprint $table) {
            $table->increments('id_download');
            $table->string('judul');
            $table->string('file');
        });

        // Comments/Messages table
        Schema::create('komentar', function (Blueprint $table) {
            $table->increments('id_komentar');
            $table->string('nama');
            $table->string('email');
            $table->string('nomorkontak')->nullable();
            $table->string('subjek');
            $table->date('tanggal_post');
            $table->boolean('is_read')->default(false);
        });

        // Pengumuman table
        Schema::create('pengumuman', function (Blueprint $table) {
            $table->increments('id_pengumuman');
            $table->string('judul');
            $table->string('file');
            $table->text('pengumuman_deskripsi')->nullable();
            $table->string('pengumuman_author')->nullable();
            $table->date('pengumuman_tanggal')->nullable();
        });

        // Organization structure table
        Schema::create('struktur_organisasi', function (Blueprint $table) {
            $table->increments('id');
            $table->string('file')->nullable();
            $table->text('keterangan')->nullable();
        });

        // History table
        Schema::create('sejarah', function (Blueprint $table) {
            $table->increments('id');
            $table->text('isi');
        });

        // Tasks & Functions table
        Schema::create('tugasfungsi', function (Blueprint $table) {
            $table->increments('id');
            $table->text('isi');
        });

        // Instagram settings table
        Schema::create('instagram_post', function (Blueprint $table) {
            $table->increments('id_post');
            $table->string('judul');
            $table->string('link_ig')->nullable();
        });

        // Audit log table
        Schema::create('audit_log', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_user')->nullable();
            $table->string('nama_user');
            $table->string('aksi');
            $table->text('detail')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
        Schema::dropIfExists('instagram_post');
        Schema::dropIfExists('tugasfungsi');
        Schema::dropIfExists('sejarah');
        Schema::dropIfExists('struktur_organisasi');
        Schema::dropIfExists('pengumuman');
        Schema::dropIfExists('komentar');
        Schema::dropIfExists('download');
        Schema::dropIfExists('sambutan');
        Schema::dropIfExists('slider');
        Schema::dropIfExists('video');
        Schema::dropIfExists('galeri');
        Schema::dropIfExists('berita');
        Schema::dropIfExists('kategori');
        Schema::dropIfExists('user');
    }
};
