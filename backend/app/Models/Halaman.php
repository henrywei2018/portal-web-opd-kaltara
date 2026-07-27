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

    protected $casts = [
        'blocks' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
