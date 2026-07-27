<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('artikel', function (Blueprint $table) {
            $table->increments('id_artikel');
            $table->string('judul');
            $table->text('isi');
            $table->string('keyword')->nullable();
            $table->string('gambar')->nullable();
            $table->string('gambar2')->nullable();
            $table->string('gambar3')->nullable();
            $table->date('tanggal_post');
            $table->enum('status_artikel', ['Publish', 'Draft'])->default('Draft');
            $table->unsignedInteger('id_user');
            $table->unsignedInteger('idkat')->nullable();
            $table->foreign('id_user')->references('id_user')->on('user')->onDelete('cascade');
            $table->foreign('idkat')->references('idkat')->on('kategori')->onDelete('set null');
        });

        // Add kategori column to galeri table for infografis support
        Schema::table('galeri', function (Blueprint $table) {
            $table->unsignedInteger('idkat')->nullable()->after('status');
            $table->foreign('idkat')->references('idkat')->on('kategori')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            $table->dropForeign(['idkat']);
            $table->dropColumn('idkat');
        });

        Schema::dropIfExists('artikel');
    }
};
