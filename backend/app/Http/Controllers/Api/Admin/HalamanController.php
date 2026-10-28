<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Halaman;
use App\Support\Unggah;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HalamanController extends Controller
{
    public function index(Request $request)
    {
        $query = Halaman::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->orderBy('id_halaman', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'status' => 'required|in:Publish,Draft',
            'blocks' => 'nullable|array',
            'meta_description' => 'nullable|string|max:500',
            'gambar' => 'nullable|string|max:255',
        ]);

        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['judul']);
        $data['blocks'] = $data['blocks'] ?? [];
        $data['id_user'] = auth()->user()?->id_user;

        $halaman = Halaman::create($data);

        return response()->json($halaman, 201);
    }

    public function show($id)
    {
        return response()->json(Halaman::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $halaman = Halaman::findOrFail($id);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'status' => 'required|in:Publish,Draft',
            'blocks' => 'nullable|array',
            'meta_description' => 'nullable|string|max:500',
            'gambar' => 'nullable|string|max:255',
        ]);

        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['judul'], $halaman->id_halaman);
        $data['blocks'] = $data['blocks'] ?? [];

        $halaman->update($data);

        return response()->json($halaman);
    }

    public function destroy($id)
    {
        $halaman = Halaman::findOrFail($id);
        $halaman->delete();

        return response()->json(null, 204);
    }

    /**
     * Upload an image used inside a page block. Returns the stored filename + url.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|' . Unggah::ATURAN_GAMBAR . '|max:5120',
        ]);

        $file = $request->file('image');
        $filename = Unggah::simpan($file, 'gambar', Unggah::GAMBAR, 'page_', 'image');

        return response()->json([
            'filename' => $filename,
            'url' => url('gambar/' . $filename),
        ], 201);
    }

    /**
     * Build a unique slug from a source string, optionally ignoring a page id.
     * Supports nested paths like "profil/tentang-kami" — each segment is slugified.
     */
    private function uniqueSlug($source, $ignoreId = null)
    {
        $base = collect(explode('/', (string) $source))
            ->map(fn ($segment) => Str::slug($segment))
            ->filter()
            ->implode('/');

        if ($base === '') {
            $base = 'halaman';
        }

        $slug = $base;
        $i = 1;
        while (
            Halaman::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id_halaman', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }
}
