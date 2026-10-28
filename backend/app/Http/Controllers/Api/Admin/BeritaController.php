<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\Galeri;
use App\Models\AuditLog;
use App\Support\Unggah;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BeritaController extends Controller
{
    public function index(Request $request)
    {
        $query = Berita::with(['user', 'kategori']);

        // Filters
        if ($request->has('status')) {
            $query->where('status_berita', $request->status);
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

        $perPage = max(1, min((int) $request->get('per_page', 15), 100));
        return response()->json($query->orderBy('id_berita', 'desc')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'keyword' => 'nullable|string',
            'tanggal_post' => 'required|date',
            'status_berita' => 'required|in:Publish,Draft',
            'idkat' => 'nullable|exists:kategori,idkat',
            'gambar' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar2' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar3' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar4' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar5' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
        ]);

        // Kontributor tidak boleh publish — paksa Draft
        if (!\App\Support\Roles::canPublish(auth()->user())) {
            $data['status_berita'] = 'Draft';
        }

        // Handle image uploads
        $imageFields = ['gambar', 'gambar2', 'gambar3', 'gambar4', 'gambar5'];
        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                $data[$field] = $this->uploadImage($request->file($field));
            }
        }

        $data['id_user'] = auth()->user()->id_user;
        $data['slug'] = $this->uniqueSlug($data['judul']);
        $data['is_pinned'] = $request->boolean('is_pinned');

        $berita = Berita::create($data);

        // Create gallery entries for uploaded images
        foreach ($imageFields as $field) {
            if (isset($data[$field]) && $data[$field]) {
                Galeri::create([
                    'judul' => $data['judul'],
                    'gambar' => $data[$field],
                    'status' => $data['status_berita'],
                    'tanggal' => $data['tanggal_post'],
                ]);
            }
        }

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_berita',
            'detail' => "Berita: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($berita, 201);
    }

    public function show($id)
    {
        $berita = Berita::with(['user', 'kategori'])->findOrFail($id);
        return response()->json($berita);
    }

    // Toggle the pinned/featured flag (quick action from the admin list)
    public function togglePin($id)
    {
        $berita = Berita::findOrFail($id);
        $berita->is_pinned = !$berita->is_pinned;
        $berita->save();

        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => $berita->is_pinned ? 'sematkan_berita' : 'lepas_sematan_berita',
            'detail' => "Berita: {$berita->judul}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(['is_pinned' => $berita->is_pinned]);
    }

    public function update(Request $request, $id)
    {
        $berita = Berita::findOrFail($id);

        // Kontributor (tanpa hak publish) hanya boleh mengelola tulisannya sendiri;
        // tanpa ini ia bisa menurunkan atau menghapus tulisan terbit milik orang lain.
        if (!\App\Support\Roles::canPublish(auth()->user()) && (int) $berita->id_user !== (int) auth()->user()->id_user) {
            return response()->json(['error' => 'Anda hanya dapat mengubah tulisan Anda sendiri'], 403);
        }

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'keyword' => 'nullable|string',
            'tanggal_post' => 'required|date',
            'status_berita' => 'required|in:Publish,Draft',
            'idkat' => 'nullable|exists:kategori,idkat',
            'gambar' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar2' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar3' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar4' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
            'gambar5' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:5120',
        ]);

        // Kontributor tidak boleh publish — paksa Draft
        if (!\App\Support\Roles::canPublish(auth()->user())) {
            $data['status_berita'] = 'Draft';
        }

        // Keep the slug stable once set (preserves indexed URLs); backfill if missing
        if (empty($berita->slug)) {
            $data['slug'] = $this->uniqueSlug($data['judul'], $berita->id_berita);
        }

        if ($request->has('is_pinned')) {
            $data['is_pinned'] = $request->boolean('is_pinned');
        }

        // Handle image uploads
        $imageFields = ['gambar', 'gambar2', 'gambar3', 'gambar4', 'gambar5'];
        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                // Delete old image
                if ($berita->$field) {
                    $this->deleteImage($berita->$field);
                }
                $data[$field] = $this->uploadImage($request->file($field));
            } else {
                $data[$field] = $berita->$field;
            }
        }

        $berita->update($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_berita',
            'detail' => "Berita: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($berita);
    }

    public function destroy($id)
    {
        $berita = Berita::findOrFail($id);

        // Kontributor (tanpa hak publish) hanya boleh mengelola tulisannya sendiri;
        // tanpa ini ia bisa menurunkan atau menghapus tulisan terbit milik orang lain.
        if (!\App\Support\Roles::canPublish(auth()->user()) && (int) $berita->id_user !== (int) auth()->user()->id_user) {
            return response()->json(['error' => 'Anda hanya dapat mengubah tulisan Anda sendiri'], 403);
        }

        // Delete all images
        $imageFields = ['gambar', 'gambar2', 'gambar3', 'gambar4', 'gambar5'];
        foreach ($imageFields as $field) {
            if ($berita->$field) {
                $this->deleteImage($berita->$field);
            }
        }

        // Delete related gallery entries
        Galeri::where('judul', $berita->judul)->delete();

        $judul = $berita->judul;
        $berita->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_berita',
            'detail' => "Berita: {$judul}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
    }

    // Generate a unique, URL-safe slug from the title
    private function uniqueSlug($source, $ignoreId = null)
    {
        $base = Str::slug((string) $source) ?: 'berita';
        $slug = $base;
        $i = 1;
        while (
            Berita::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id_berita', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }

    // Handles image uploads triggered from inside the rich text editor toolbar,
    // separate from the 5 dedicated gambar* fields on the berita record itself.
    public function uploadContentImage(Request $request)
    {
        $request->validate([
            'upload' => 'required|' . Unggah::ATURAN_GAMBAR . '|max:5120',
        ]);

        $filename = $this->uploadImage($request->file('upload'));

        return response()->json(['url' => asset('gambar/' . $filename)]);
    }

    private function uploadImage($file)
    {
        $filename = Unggah::simpan($file, 'gambar', Unggah::GAMBAR, '', 'gambar');
        $path = public_path('gambar/' . $filename);

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
