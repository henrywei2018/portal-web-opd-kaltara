<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_slide', function (Blueprint $table) {
            $table->increments('id_hero');
            $table->string('judul')->nullable();
            $table->string('subjudul')->nullable();
            $table->text('deskripsi')->nullable();
            $table->enum('bg_type', ['color', 'gradient', 'image'])->default('color');
            $table->string('bg_value')->nullable();     // hex color, CSS gradient, or image filename
            $table->boolean('overlay')->default(true);   // darken image background for text contrast
            $table->string('cta_text')->nullable();
            $table->string('cta_link')->nullable();
            $table->string('cta2_text')->nullable();
            $table->string('cta2_link')->nullable();
            $table->boolean('tampil_statistik')->default(true); // show the right-side stat cards
            $table->boolean('is_active')->default(true);
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_slide');
    }
};
