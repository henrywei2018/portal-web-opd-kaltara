<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('translation_cache', function (Blueprint $table) {
            $table->id();
            $table->string('hash', 64)->unique(); // sha1(source:target:text)
            $table->string('target', 8);
            $table->longText('source_text')->nullable();
            $table->longText('value');
            $table->timestamps();
            $table->index('target');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translation_cache');
    }
};
