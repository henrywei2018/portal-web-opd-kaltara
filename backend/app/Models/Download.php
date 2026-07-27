<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Download extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'keterangan'];

    protected $table = 'download';
    protected $primaryKey = 'id_download';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'file'
    ];
}
