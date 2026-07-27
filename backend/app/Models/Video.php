<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul'];

    protected $table = 'video';
    protected $primaryKey = 'id_video';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'link_video'
    ];
}
