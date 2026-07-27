<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Halaman;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // Idempotent: clear existing navigation + sample page
        Menu::query()->delete();
        Halaman::where('slug', 'profil/tentang-kami')->delete();

        // Sample dynamic page built with the block builder (nested slug under /profil)
        $page = Halaman::create([
            'judul' => 'Tentang Kami',
            'slug' => 'profil/tentang-kami',
            'status' => 'Publish',
            'meta_description' => 'Tentang Dinas Kesehatan Provinsi Kalimantan Utara',
            'blocks' => [
                [
                    'id' => 'b1',
                    'type' => 'hero',
                    'data' => [
                        'title' => 'Tentang Kami',
                        'subtitle' => 'Dinas Kesehatan Provinsi Kalimantan Utara',
                        'description' => 'Halaman contoh yang dibuat melalui page builder dinamis.',
                        'ctaText' => 'Hubungi Kami',
                        'ctaLink' => '/kontak',
                    ],
                ],
                [
                    'id' => 'b2',
                    'type' => 'text',
                    'data' => [
                        'heading' => 'Profil Singkat',
                        'html' => '<p>Dinas Kesehatan Provinsi Kalimantan Utara berkomitmen memberikan pelayanan kesehatan terbaik bagi masyarakat. Halaman ini dapat diubah sepenuhnya melalui panel admin.</p>',
                    ],
                ],
                [
                    'id' => 'b3',
                    'type' => 'cta',
                    'data' => [
                        'title' => 'Butuh Informasi Lebih Lanjut?',
                        'description' => 'Hubungi kami untuk pertanyaan seputar layanan kesehatan.',
                        'buttonText' => 'Hubungi Kami',
                        'buttonLink' => '/kontak',
                    ],
                ],
            ],
        ]);

        // Top-level menu items (children defined inline)
        $items = [
            ['label' => 'Beranda', 'type' => 'route', 'url' => '/', 'icon' => 'Home'],
            ['label' => 'Profil', 'type' => 'dropdown', 'icon' => 'Info', 'children' => [
                ['label' => 'Sejarah', 'type' => 'route', 'url' => '/sejarah', 'icon' => 'Description'],
                ['label' => 'Visi & Misi', 'type' => 'route', 'url' => '/visi-misi', 'icon' => 'Business'],
                ['label' => 'Profil Dinas', 'type' => 'route', 'url' => '/profil', 'icon' => 'Info'],
                ['label' => 'Tentang Kami', 'type' => 'halaman', 'id_halaman' => $page->id_halaman, 'icon' => 'People'],
            ]],
            ['label' => 'Layanan', 'type' => 'route', 'url' => '/layanan', 'icon' => 'LocalHospital'],
            ['label' => 'Berita', 'type' => 'route', 'url' => '/berita', 'icon' => 'Article'],
            ['label' => 'Pengumuman', 'type' => 'route', 'url' => '/pengumuman', 'icon' => 'Announcement'],
            ['label' => 'Galeri', 'type' => 'dropdown', 'icon' => 'PhotoLibrary', 'children' => [
                ['label' => 'Galeri Foto', 'type' => 'route', 'url' => '/galeri', 'icon' => 'PhotoLibrary'],
                ['label' => 'Video', 'type' => 'route', 'url' => '/video', 'icon' => 'VideoLibrary'],
            ]],
            ['label' => 'Data', 'type' => 'route', 'url' => '/data', 'icon' => 'DataUsage'],
            ['label' => 'Kontak', 'type' => 'route', 'url' => '/kontak', 'icon' => 'Phone'],
        ];

        $urutan = 1;
        foreach ($items as $item) {
            $children = $item['children'] ?? [];
            unset($item['children']);
            $item['urutan'] = $urutan++;
            $item['is_active'] = true;
            $parent = Menu::create($item);

            $childUrutan = 1;
            foreach ($children as $child) {
                $child['urutan'] = $childUrutan++;
                $child['parent_id'] = $parent->id_menu;
                $child['is_active'] = true;
                Menu::create($child);
            }
        }

        echo "Menu & sample page seeded successfully!\n";
    }
}
