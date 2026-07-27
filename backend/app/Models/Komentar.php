<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Komentar extends Model
{
    protected $table = 'komentar';
    protected $primaryKey = 'id_komentar';

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'email',
        'nomorkontak',
        'subjek',
        'pesan',
        'tanggal_post',
        'is_read'
    ];

    protected $casts = [
        'tanggal_post' => 'datetime',
        'is_read' => 'boolean',
    ];
}
