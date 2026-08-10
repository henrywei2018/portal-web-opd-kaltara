<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'subjudul', 'deskripsi', 'cta_text', 'cta2_text'];

    protected $table = 'hero_slide';
    protected $primaryKey = 'id_hero';

    protected $fillable = [
        'judul',
        'subjudul',
        'deskripsi',
        'bg_type',
        'bg_value',
        'bg_poster',
        'bg_autoplay',
        'overlay',
        'durasi',
        'cta_text',
        'cta_link',
        'cta2_text',
        'cta2_link',
        'tampil_statistik',
        'is_active',
        'urutan',
    ];

    protected $casts = [
        'overlay' => 'boolean',
        'bg_autoplay' => 'boolean',
        'durasi' => 'integer',
        'tampil_statistik' => 'boolean',
        'is_active' => 'boolean',
        'urutan' => 'integer',
    ];
}
