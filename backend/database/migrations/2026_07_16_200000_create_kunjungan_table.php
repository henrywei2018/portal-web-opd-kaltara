<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Site-visit tracking (real traffic analytics). Each public SPA page view posts
 * one row via POST /public/track. `visitor_id` is a client-generated UUID
 * (localStorage) used to count unique visitors; `ip_hash` is a salted hash (no
 * raw IP stored). Bots are flagged and excluded from aggregates.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kunjungan', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->string('path', 512)->nullable();
            $t->string('visitor_id', 64)->nullable()->index();
            $t->string('referrer', 512)->nullable();
            $t->string('ip_hash', 64)->nullable();
            $t->boolean('is_bot')->default(false);
            $t->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kunjungan');
    }
};
