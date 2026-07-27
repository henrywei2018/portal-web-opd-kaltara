<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriDokumen extends Model
{
    use \App\Concerns\HasTranslations;

    public array $translatable = ['nama'];

    protected $table = 'kategori_dokumen';
    protected $primaryKey = 'id_kategori_dokumen';

    protected $fillable = ['nama', 'slug'];

    public function dokumen()
    {
        return $this->hasMany(Dokumen::class, 'id_kategori_dokumen');
    }
}
