<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StrukturOrganisasi extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['nama', 'jabatan'];

    protected $table = 'struktur_organisasi';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'file',
        'keterangan'
    ];
}
