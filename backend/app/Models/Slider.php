<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'deskripsi', 'caption'];

    protected $table = 'slider';
    protected $primaryKey = 'id_slider';

    public $timestamps = false;

    protected $fillable = [
        'foto'
    ];
}
