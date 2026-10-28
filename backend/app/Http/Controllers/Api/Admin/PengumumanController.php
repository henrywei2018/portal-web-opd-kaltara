<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\AuditLog;
use App\Support\Unggah;
use Illuminate\Http\Request;

class PengumumanController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengumuman::query();

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('judul', 'like', '%' . $search . '%');
        }

        $perPage = max(1, min((int) $request->get('per_page', 15), 100));
        return response()->json($query->orderBy('id_pengumuman', 'desc')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
            'pengumuman_deskripsi' => 'nullable|string',
            'pengumuman_author' => 'nullable|string|max:255',
            'pengumuman_tanggal' => 'required|date',
        ]);

        // Handle file upload
        if ($request->hasFile('file')) {
            $data['file'] = $this->uploadFile($request->file('file'));
        }

        $pengumuman = Pengumuman::create($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_pengumuman',
            'detail' => "Pengumuman: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($pengumuman, 201);
    }

    public function show($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);
        return response()->json($pengumuman);
    }

    public function update(Request $request, $id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
            'pengumuman_deskripsi' => 'nullable|string',
            'pengumuman_author' => 'nullable|string|max:255',
            'pengumuman_tanggal' => 'required|date',
        ]);

        // Handle file upload
        if ($request->hasFile('file')) {
            // Delete old file
            if ($pengumuman->file) {
                $this->deleteFile($pengumuman->file);
            }
            $data['file'] = $this->uploadFile($request->file('file'));
        }

        $pengumuman->update($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_pengumuman',
            'detail' => "Pengumuman: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($pengumuman);
    }

    public function destroy($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        if ($pengumuman->file) {
            $this->deleteFile($pengumuman->file);
        }

        $judul = $pengumuman->judul;
        $pengumuman->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_pengumuman',
            'detail' => "Pengumuman: {$judul}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
    }

    private function uploadFile($file)
    {
        return Unggah::simpan($file, 'file', Unggah::DOKUMEN_KANTOR, '', 'file', true);
    }

    private function deleteFile($filename)
    {
        $path = public_path('file/' . $filename);
        if (file_exists($path)) {
            @unlink($path);
        }
    }
}
