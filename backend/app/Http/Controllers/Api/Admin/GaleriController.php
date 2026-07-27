<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Galeri;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class GaleriController extends Controller
{
    public function index(Request $request)
    {
        $query = Galeri::with('kategori');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('kategori_id')) {
            $query->where('idkat', $request->kategori_id);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('judul', 'like', '%' . $search . '%');
        }

        $perPage = $request->get('per_page', 20);
        return response()->json($query->orderBy('id_galeri', 'desc')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'gambar' => 'required|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'status' => 'required|in:Publish,Draft',
            'tanggal' => 'required|date',
            'idkat' => 'nullable|exists:kategori,idkat',
        ]);

        // Kontributor tidak boleh publish — paksa Draft
        if (!\App\Support\Roles::canPublish(auth()->user())) {
            $data['status'] = 'Draft';
        }

        // Handle image upload
        if ($request->hasFile('gambar')) {
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        }

        $galeri = Galeri::create($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_galeri',
            'detail' => "Galeri: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($galeri, 201);
    }

    public function show($id)
    {
        return response()->json(Galeri::with('kategori')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $galeri = Galeri::findOrFail($id);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'status' => 'required|in:Publish,Draft',
            'tanggal' => 'required|date',
            'idkat' => 'nullable|exists:kategori,idkat',
        ]);

        // Kontributor tidak boleh publish — paksa Draft
        if (!\App\Support\Roles::canPublish(auth()->user())) {
            $data['status'] = 'Draft';
        }

        // Handle image upload
        if ($request->hasFile('gambar')) {
            if ($galeri->gambar) {
                $this->deleteImage($galeri->gambar);
            }
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        }

        $galeri->update($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_galeri',
            'detail' => "Galeri: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($galeri);
    }

    public function destroy($id)
    {
        $galeri = Galeri::findOrFail($id);

        if ($galeri->gambar) {
            $this->deleteImage($galeri->gambar);
        }

        $judul = $galeri->judul;
        $galeri->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_galeri',
            'detail' => "Galeri: {$judul}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
    }

    private function uploadImage($file)
    {
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('gambar'), $filename);

        try {
            $thumbDir = public_path('gambar/thumb');
            if (!is_dir($thumbDir)) {
                @mkdir($thumbDir, 0775, true);
            }
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $manager->decodePath(public_path('gambar/' . $filename))
                ->resize(710, 460)
                ->save($thumbDir . '/' . pathinfo($filename, PATHINFO_FILENAME) . '_thumb.jpg');
        } catch (\Throwable $e) {
            // Thumbnail is optional — never fail the upload because of it
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
