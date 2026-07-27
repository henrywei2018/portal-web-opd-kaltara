<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstagramPost extends Model
{
    protected $table = 'instagram_post';
    protected $primaryKey = 'id_post';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'link_ig'
    ];
}
