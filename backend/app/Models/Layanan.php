<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Layanan extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'deskripsi', 'kategori', 'waktu', 'biaya', 'masa_berlaku', 'kontak_lokasi'];
    public array $translatableJson = ['persyaratan', 'prosedur'];

    protected $table = 'layanan';
    protected $primaryKey = 'id_layanan';

    protected $fillable = [
        'judul',
        'icon',
        'color',
        'gambar',
        'kategori',
        'deskripsi',
        'persyaratan',
        'prosedur',
        'waktu',
        'biaya',
        'masa_berlaku',
        'kontak_telepon',
        'kontak_email',
        'kontak_lokasi',
        'darurat',
        'status',
        'urutan',
    ];

    protected $casts = [
        'persyaratan' => 'array',
        'prosedur' => 'array',
        'darurat' => 'boolean',
        'urutan' => 'integer',
    ];
}
