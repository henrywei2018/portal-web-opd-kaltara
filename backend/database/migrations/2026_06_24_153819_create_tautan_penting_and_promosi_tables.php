<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tautan_penting', function (Blueprint $table) {
            $table->id('id_tautan');
            $table->string('judul')->nullable();
            $table->string('gambar')->nullable();
            $table->string('url', 500);
            $table->integer('urutan')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('target_blank')->default(true);
            $table->timestamps();
        });

        Schema::create('promosi', function (Blueprint $table) {
            $table->id('id_promosi');
            $table->string('judul')->nullable();
            $table->string('gambar')->nullable();
            $table->string('url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('target_blank')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tautan_penting');
        Schema::dropIfExists('promosi');
    }
};
