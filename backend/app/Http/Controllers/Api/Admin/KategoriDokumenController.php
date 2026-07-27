<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriDokumen;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KategoriDokumenController extends Controller
{
    public function index()
    {
        return response()->json(
            KategoriDokumen::withCount('dokumen')->orderBy('nama')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $data['slug'] = $this->uniqueSlug($data['nama']);

        return response()->json(KategoriDokumen::create($data), 201);
    }

    public function update(Request $request, $id)
    {
        $kategori = KategoriDokumen::findOrFail($id);

        $data = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $data['slug'] = $this->uniqueSlug($data['nama'], $kategori->id_kategori_dokumen);
        $kategori->update($data);

        return response()->json($kategori);
    }

    public function destroy($id)
    {
        $kategori = KategoriDokumen::findOrFail($id);
        $kategori->delete(); // documents keep but lose their category (set null)

        return response()->json(null, 204);
    }

    private function uniqueSlug($source, $ignoreId = null)
    {
        $base = Str::slug($source) ?: 'kategori';
        $slug = $base;
        $i = 1;
        while (
            KategoriDokumen::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id_kategori_dokumen', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . (++$i);
        }
        return $slug;
    }
}
