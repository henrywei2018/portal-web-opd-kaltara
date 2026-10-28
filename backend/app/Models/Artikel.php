<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artikel extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'isi'];

    protected $table = 'artikel';
    protected $primaryKey = 'id_artikel';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'slug',
        'isi',
        'keyword',
        'gambar',
        'gambar2',
        'gambar3',
        'tanggal_post',
        'status_artikel',
        'id_user',
        'idkat'
    ];

    // Isi dirender sebagai HTML mentah di situs publik; disanitasi di sini agar
    // setiap jalur tulis (form admin, impor, tinker) ikut tercakup.
    protected static function booted(): void
    {
        static::saving(function (self $m) {
            if ($m->isDirty('isi')) {
                $m->isi = \App\Support\HtmlAman::bersihkan($m->isi);
            }
        });
    }

    protected $casts = [
        'tanggal_post' => 'date',
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
