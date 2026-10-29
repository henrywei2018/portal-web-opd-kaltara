<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Identitas SSO Portal Kaltara pada akun admin. Akun dicocokkan lewat sso_id
 * (ID pengguna di portal), bukan username/email, agar akun lokal yang kebetulan
 * bernama sama tidak bisa diambil alih lewat SSO.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('user', function (Blueprint $table) {
            $table->string('sso_id', 64)->nullable()->unique()->after('role');
            $table->string('email')->nullable()->after('sso_id');
            $table->string('nip', 32)->nullable()->after('email');
            $table->string('sso_realm', 32)->nullable()->after('nip');
        });
    }

    public function down(): void
    {
        Schema::table('user', function (Blueprint $table) {
            $table->dropUnique(['sso_id']);
            $table->dropColumn(['sso_id', 'email', 'nip', 'sso_realm']);
        });
    }
};
