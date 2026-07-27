<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Artikel;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArtikelController extends Controller
{
    public function index(Request $request)
    {
        $query = Artikel::with(['user', 'kategori']);

        // Filters
        if ($request->has('status')) {
            $query->where('status_artikel', $request->status);
        }
        if ($request->has('kategori_id')) {
            $query->where('idkat', $request->kategori_id);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', '%' . $search . '%')
                  ->orWhere('keyword', 'like', '%' . $search . '%');
            });
        }

        $perPage = $request->get('per_page', 15);
        return response()->json($query->orderBy('id_artikel', 'desc')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'keyword' => 'nullable|string',
            'tanggal_post' => 'required|date',
            'status_artikel' => 'required|in:Publish,Draft',
            'idkat' => 'nullable|exists:kategori,idkat',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'gambar2' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'gambar3' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
        ]);

        // Kontributor tidak boleh publish — paksa Draft
        if (!\App\Support\Roles::canPublish(auth()->user())) {
            $data['status_artikel'] = 'Draft';
        }

        // Handle image uploads
        $imageFields = ['gambar', 'gambar2', 'gambar3'];
        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                $data[$field] = $this->uploadImage($request->file($field));
            }
        }

        $data['id_user'] = auth()->user()->id_user;
        $data['slug'] = $this->uniqueSlug($data['judul']);

        $artikel = Artikel::create($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_artikel',
            'detail' => "Artikel: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($artikel, 201);
    }

    public function show($id)
    {
        $artikel = Artikel::with(['user', 'kategori'])->findOrFail($id);
        return response()->json($artikel);
    }

    public function update(Request $request, $id)
    {
        $artikel = Artikel::findOrFail($id);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'keyword' => 'nullable|string',
            'tanggal_post' => 'required|date',
            'status_artikel' => 'required|in:Publish,Draft',
            'idkat' => 'nullable|exists:kategori,idkat',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'gambar2' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'gambar3' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
        ]);

        // Kontributor tidak boleh publish — paksa Draft
        if (!\App\Support\Roles::canPublish(auth()->user())) {
            $data['status_artikel'] = 'Draft';
        }

        // Keep the slug stable once set (preserves indexed URLs); backfill if missing
        if (empty($artikel->slug)) {
            $data['slug'] = $this->uniqueSlug($data['judul'], $artikel->id_artikel);
        }

        // Handle image uploads
        $imageFields = ['gambar', 'gambar2', 'gambar3'];
        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                // Delete old image
                if ($artikel->$field) {
                    $this->deleteImage($artikel->$field);
                }
                $data[$field] = $this->uploadImage($request->file($field));
            } else {
                $data[$field] = $artikel->$field;
            }
        }

        $artikel->update($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_artikel',
            'detail' => "Artikel: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($artikel);
    }

    public function destroy($id)
    {
        $artikel = Artikel::findOrFail($id);

        // Delete all images
        $imageFields = ['gambar', 'gambar2', 'gambar3'];
        foreach ($imageFields as $field) {
            if ($artikel->$field) {
                $this->deleteImage($artikel->$field);
            }
        }

        $judul = $artikel->judul;
        $artikel->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_artikel',
            'detail' => "Artikel: {$judul}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
    }

    // Generate a unique, URL-safe slug from the title
    private function uniqueSlug($source, $ignoreId = null)
    {
        $base = Str::slug((string) $source) ?: 'artikel';
        $slug = $base;
        $i = 1;
        while (
            Artikel::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id_artikel', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }

    private function uploadImage($file)
    {
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $path = public_path('gambar/' . $filename);

        // Save original
        $file->move(public_path('gambar'), $filename);

        // Create thumbnail using Intervention Image
        try {
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $manager->decodePath($path)
                ->resize(710, 460)
                ->save(public_path('gambar/thumb/' . pathinfo($filename, PATHINFO_FILENAME) . '_thumb.jpg'));
        } catch (\Throwable $e) {
            // If thumbnail creation fails, continue without it
            logger()->error('Failed to create thumbnail: ' . $e->getMessage());
        }

        return $filename;
    }

    private function deleteImage($filename)
    {
        $paths = [
            public_path('gambar/' . $filename),
            public_path('gambar/thumb/' . pathinfo($filename, PATHINFO_FILENAME) . '_thumb.jpg'),
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                @unlink($path);
            }
        }
    }
}
