<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['nmkat'];

    protected $table = 'kategori';
    protected $primaryKey = 'idkat';

    public $timestamps = false;

    protected $fillable = [
        'nmkat'
    ];

    public function berita()
    {
        return $this->hasMany(Berita::class, 'idkat');
    }
}
