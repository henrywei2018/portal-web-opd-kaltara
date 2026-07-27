<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistik', function (Blueprint $table) {
            $table->increments('id_statistik');
            $table->string('label');
            $table->string('nilai');            // "50+", "95%", "24/7"
            $table->string('icon')->nullable();
            $table->string('color')->default('primary');
            $table->boolean('tampil_hero')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistik');
    }
};
