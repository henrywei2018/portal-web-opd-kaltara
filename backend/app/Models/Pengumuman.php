<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'pengumuman_deskripsi'];

    protected $table = 'pengumuman';
    protected $primaryKey = 'id_pengumuman';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'file',
        'pengumuman_deskripsi',
        'pengumuman_author',
        'pengumuman_tanggal'
    ];

    protected $casts = [
        'pengumuman_tanggal' => 'date',
    ];
}
