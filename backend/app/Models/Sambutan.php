<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sambutan extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['nama', 'jabatan', 'isi', 'sambutan'];

    protected $table = 'sambutan';
    protected $primaryKey = 'id_sambutan';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'deskripsi',
        'foto'
    ];
}
