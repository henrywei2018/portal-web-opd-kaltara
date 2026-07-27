<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['label'];

    protected $table = 'menu';
    protected $primaryKey = 'id_menu';

    protected $fillable = [
        'label',
        'type',
        'id_halaman',
        'url',
        'icon',
        'parent_id',
        'urutan',
        'is_active',
        'target_blank',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'target_blank' => 'boolean',
        'urutan' => 'integer',
    ];

    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('urutan');
    }

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function halaman()
    {
        return $this->belongsTo(Halaman::class, 'id_halaman');
    }
}
