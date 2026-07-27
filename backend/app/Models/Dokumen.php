<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dokumen extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'deskripsi'];

    protected $table = 'dokumen';
    protected $primaryKey = 'id_dokumen';

    protected $fillable = [
        'judul',
        'deskripsi',
        'file',
        'nama_file',
        'ukuran',
        'id_kategori_dokumen',
        'nomor',
        'tanggal',
        'status',
        'id_user',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'ukuran' => 'integer',
    ];

    public function kategori()
    {
        return $this->belongsTo(KategoriDokumen::class, 'id_kategori_dokumen');
    }
}
