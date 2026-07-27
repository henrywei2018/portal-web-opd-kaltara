<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Infografis;
use App\Models\AuditLog;
use App\Support\Roles;
use Illuminate\Http\Request;

class InfografisController extends Controller
{
    public function index(Request $request)
    {
        $query = Infografis::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->get('per_page', 20);

        return response()->json($query->orderBy('id_infografis', 'desc')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'gambar' => 'required|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'status' => 'required|in:Publish,Draft',
            'tanggal' => 'required|date',
        ]);

        if (!Roles::canPublish(auth()->user())) {
            $data['status'] = 'Draft';
        }

        if ($request->hasFile('gambar')) {
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        }

        $infografis = Infografis::create($data);

        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_infografis',
            'detail' => "Infografis: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($infografis, 201);
    }

    public function show($id)
    {
        return response()->json(Infografis::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $infografis = Infografis::findOrFail($id);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,gif,bmp|max:5120',
            'status' => 'required|in:Publish,Draft',
            'tanggal' => 'required|date',
        ]);

        if (!Roles::canPublish(auth()->user())) {
            $data['status'] = 'Draft';
        }

        if ($request->hasFile('gambar')) {
            if ($infografis->gambar) {
                $this->deleteImage($infografis->gambar);
            }
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        }

        $infografis->update($data);

        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_infografis',
            'detail' => "Infografis: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($infografis);
    }

    public function destroy($id)
    {
        $infografis = Infografis::findOrFail($id);

        if ($infografis->gambar) {
            $this->deleteImage($infografis->gambar);
        }

        $judul = $infografis->judul;
        $infografis->delete();

        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_infografis',
            'detail' => "Infografis: {$judul}",
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
