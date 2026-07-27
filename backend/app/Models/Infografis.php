<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Infografis extends Model
{
    protected $table = 'infografis';
    protected $primaryKey = 'id_infografis';
    public $timestamps = false;

    protected $fillable = [
        'judul',
        'gambar',
        'status',
        'tanggal',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];
}
