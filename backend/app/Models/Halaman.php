<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Halaman extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'meta_description'];
    public array $translatableJson = ['blocks'];

    protected $table = 'halaman';
    protected $primaryKey = 'id_halaman';

    protected $fillable = [
        'judul',
        'slug',
        'status',
        'blocks',
        'meta_description',
        'gambar',
        'id_user',
    ];

    // Blok teks dan "HTML (Lanjutan)" dirender mentah di situs publik.
    protected static function booted(): void
    {
        static::saving(function (self $m) {
            if ($m->isDirty('blocks') && is_array($m->blocks)) {
                $m->blocks = \App\Support\HtmlAman::bersihkanBlok($m->blocks);
            }
        });
    }

    protected $casts = [
        'blocks' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
