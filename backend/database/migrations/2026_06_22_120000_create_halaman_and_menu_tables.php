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
        // Dynamic pages built with the section/block builder
        Schema::create('halaman', function (Blueprint $table) {
            $table->increments('id_halaman');
            $table->string('judul');
            $table->string('slug')->unique();
            $table->enum('status', ['Publish', 'Draft'])->default('Draft');
            $table->json('blocks')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('gambar')->nullable();
            $table->unsignedInteger('id_user')->nullable();
            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('user')->onDelete('set null');
        });

        // Navigation menu (supports dropdown nesting via parent_id)
        Schema::create('menu', function (Blueprint $table) {
            $table->increments('id_menu');
            $table->string('label');
            // halaman = link ke halaman dinamis, route = path internal, url = link eksternal, dropdown = parent container
            $table->enum('type', ['halaman', 'route', 'url', 'dropdown'])->default('route');
            $table->unsignedInteger('id_halaman')->nullable();
            $table->string('url', 500)->nullable();
            $table->string('icon')->nullable();
            $table->unsignedInteger('parent_id')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('target_blank')->default(false);
            $table->timestamps();

            $table->foreign('id_halaman')->references('id_halaman')->on('halaman')->onDelete('cascade');
            $table->foreign('parent_id')->references('id_menu')->on('menu')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu');
        Schema::dropIfExists('halaman');
    }
};
