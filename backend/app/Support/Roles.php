<?php

namespace App\Support;

use App\Models\User;

/**
 * Fixed roles with a code-defined ability matrix (RBAC).
 * Abilities are module keys; '*' means all.
 */
class Roles
{
    public const ROLES = ['super_admin', 'admin', 'editor', 'kontributor'];

    public const LABELS = [
        'super_admin' => 'Super Admin',
        'admin' => 'Admin',
        'editor' => 'Editor',
        'kontributor' => 'Kontributor',
    ];

    public static function abilities(?string $role): array
    {
        return match ($role) {
            'super_admin' => ['*'],
            'admin' => [
                'berita', 'artikel', 'pengumuman', 'galeri', 'infografis', 'video', 'kategori',
                'dokumen', 'layanan', 'halaman', 'menu', 'hero', 'statistik', 'pengguna', 'pengaturan', 'pesan', 'seo', 'laporan', 'publish',
            ],
            'editor' => [
                'berita', 'artikel', 'pengumuman', 'galeri', 'infografis', 'video', 'kategori',
                'dokumen', 'layanan', 'halaman', 'laporan', 'publish',
            ],
            'kontributor' => ['berita', 'artikel', 'pengumuman', 'galeri', 'infografis', 'video'],
            default => [],
        };
    }

    public static function can(?User $user, string $ability): bool
    {
        if (!$user) {
            return false;
        }
        $abilities = self::abilities($user->role);

        return in_array('*', $abilities, true) || in_array($ability, $abilities, true);
    }

    public static function canPublish(?User $user): bool
    {
        return self::can($user, 'publish');
    }
}
