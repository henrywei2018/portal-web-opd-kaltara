<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Berita extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'isi'];

    protected $table = 'berita';
    protected $primaryKey = 'id_berita';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'slug',
        'isi',
        'keyword',
        'gambar',
        'gambar2',
        'gambar3',
        'gambar4',
        'gambar5',
        'tanggal_post',
        'status_berita',
        'views',
        'is_pinned',
        'id_user',
        'idkat'
    ];

    protected $casts = [
        'tanggal_post' => 'date',
        'views' => 'integer',
        'is_pinned' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'idkat');
    }
}
