<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sejarah extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul', 'isi', 'sejarah'];

    protected $table = 'sejarah';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'isi'
    ];
}
