<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Statistik extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['label'];

    protected $table = 'statistik';
    protected $primaryKey = 'id_statistik';

    protected $fillable = [
        'label',
        'nilai',
        'icon',
        'color',
        'tampil_hero',
        'is_active',
        'urutan',
    ];

    protected $casts = [
        'tampil_hero' => 'boolean',
        'is_active' => 'boolean',
        'urutan' => 'integer',
    ];
}
