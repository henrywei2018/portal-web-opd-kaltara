<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TugasFungsi extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'isi', 'tugas', 'fungsi'];

    protected $table = 'tugasfungsi';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'isi'
    ];
}
