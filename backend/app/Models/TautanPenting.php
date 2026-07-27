<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TautanPenting extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul'];

    protected $table = 'tautan_penting';
    protected $primaryKey = 'id_tautan';

    protected $fillable = [
        'judul',
        'gambar',
        'url',
        'urutan',
        'is_active',
        'target_blank',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'target_blank' => 'boolean',
        'urutan' => 'integer',
    ];
}
