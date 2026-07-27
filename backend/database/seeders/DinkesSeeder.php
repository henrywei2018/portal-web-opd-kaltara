<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DinkesSeeder extends Seeder
{
    public function run(): void
    {
        // Create default admin user
        DB::table('user')->insert([
            'nama' => 'Administrator',
            'username' => 'admin',
            'password' => password_hash('admin123', PASSWORD_BCRYPT),
            'level' => 1,
            'role' => 'super_admin',
            'status' => 1,
        ]);

        // Create sample categories
        DB::table('kategori')->insert([
            ['nmkat' => 'Umum'],
            ['nmkat' => 'Kesehatan Masyarakat'],
            ['nmkat' => 'Pelayanan Kesehatan'],
            ['nmkat' => 'Obat dan Farmasi'],
        ]);

        $kategoriId = 1;

        // Create sample news
        DB::table('berita')->insert([
            [
                'judul' => 'Dinas Kesehatan Provinsi Kaltara Mengadakan Sosialisasi PHBS',
                'isi' => '<p>Dinas Kesehatan Provinsi Kalimantan Utara mengadakan sosialisasi Perilaku Hidup Bersih dan Sehat (PHBS) kepada masyarakat. Kegiatan ini bertujuan untuk meningkatkan kesadaran masyarakat akan pentingnya menjaga kebersihan lingkungan dan kesehatan pribadi.</p><p>Sosialisasi ini meliputi cara mencuci tangan dengan benar, menjaga kebersihan lingkungan, dan pola hidup sehat sehari-hari.</p>',
                'keyword' => 'PHBS, Kesehatan, Sosialisasi',
                'gambar' => null,
                'tanggal_post' => now()->subDays(7)->toDateString(),
                'status_berita' => 'Publish',
                'id_user' => 1,
                'idkat' => $kategoriId,
            ],
            [
                'judul' => 'Imunisasi Nasional Dilaksanakan di Seluruh Provinsi Kaltara',
                'isi' => '<p>Program Imunisasi Nasional dilaksanakan di seluruh wilayah Provinsi Kalimantan Utara. Program ini bertujuan untuk memberikan perlindungan kepada balita dan anak-anak dari penyakit yang dapat dicegah dengan imunisasi.</p><p>Dinkes menghimbau seluruh orang tua untuk membawa anak-anak mereka ke posyandu atau puskesmas terdekat untuk mendapatkan imunisasi lengkap.</p>',
                'keyword' => 'Imunisasi, Anak, Kesehatan',
                'gambar' => null,
                'tanggal_post' => now()->subDays(3)->toDateString(),
                'status_berita' => 'Publish',
                'id_user' => 1,
                'idkat' => 3,
            ],
        ]);

        // Create sample gallery
        DB::table('galeri')->insert([
            [
                'judul' => 'Kegiatan Sosialisasi PHBS',
                'gambar' => 'gallery1.jpg',
                'status' => 'Publish',
                'tanggal' => now()->subDays(5)->toDateString(),
            ],
            [
                'judul' => 'Imunisasi di Puskesmas',
                'gambar' => 'gallery2.jpg',
                'status' => 'Publish',
                'tanggal' => now()->subDays(2)->toDateString(),
            ],
        ]);

        // Create sample video
        DB::table('video')->insert([
            'judul' => 'Tutorial Cuci Tangan yang Benar',
            'link_video' => 'https://www.youtube.com/embed/l-LWxF9aOl4',
        ]);

        // Create sample announcement
        DB::table('pengumuman')->insert([
            'judul' => 'Jadwal Pelayanan Kesehatan Gratis',
            'file' => 'jadwal_pelayanan.pdf',
            'pengumuman_deskripsi' => 'Dinas Kesehatan Provinsi Kaltara menyelenggarakan pelayanan kesehatan gratis bagi masyarakat yang membutuhkan.',
            'pengumuman_author' => 'Admin',
            'pengumuman_tanggal' => now()->toDateString(),
        ]);

        // Create sample slider
        DB::table('slider')->insert([
            'foto' => 'slider1.jpg',
        ]);

        // Create sample content
        DB::table('sejarah')->insert(['isi' => '<p>Dinas Kesehatan Provinsi Kalimantan Utara telah berdiri sejak pemekaran provinsi dan terus berkembang untuk memberikan pelayanan kesehatan yang prima kepada masyarakat.</p>']);
        DB::table('tugasfungsi')->insert(['isi' => '<p>Dinas Kesehatan Provinsi Kaltara bertugas menyelenggarakan pelayanan kesehatan, pengembangan sumber dayas kesehatan, dan pengawasan kesehatan di wilayah Provinsi Kalimantan Utara.</p>']);
        DB::table('struktur_organisasi')->insert(['keterangan' => 'Struktur Organisasi Dinkes Provinsi Kaltara']);

        echo "Sample data inserted successfully!\n";
        echo "Login credentials:\n";
        echo "Username: admin\n";
        echo "Password: admin123\n";
    }
}
