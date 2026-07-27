<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promosi extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul'];

    protected $table = 'promosi';
    protected $primaryKey = 'id_promosi';

    protected $fillable = [
        'judul',
        'gambar',
        'url',
        'is_active',
        'target_blank',
        'jeda_hari',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'target_blank' => 'boolean',
        'jeda_hari' => 'integer',
    ];
}
