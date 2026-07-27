<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Galeri extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['judul'];

    protected $table = 'galeri';
    protected $primaryKey = 'id_galeri';

    public $timestamps = false;

    protected $fillable = [
        'judul',
        'gambar',
        'status',
        'tanggal',
        'idkat'
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'idkat');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'Publish');
    }
}
