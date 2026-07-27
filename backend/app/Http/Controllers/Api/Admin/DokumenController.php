<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use Illuminate\Http\Request;

class DokumenController extends Controller
{
    public function index(Request $request)
    {
        $query = Dokumen::with('kategori')->orderBy('id_dokumen', 'desc');

        if ($request->filled('kategori_id')) {
            $query->where('id_kategori_dokumen', $request->kategori_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'id_kategori_dokumen' => 'nullable|exists:kategori_dokumen,id_kategori_dokumen',
            'nomor' => 'nullable|string|max:255',
            'tanggal' => 'nullable|date',
            'status' => 'required|in:Publish,Draft',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        $data = array_merge($data, $this->storeFile($request->file('file')));
        $data['id_user'] = auth()->user()?->id_user;

        $dokumen = Dokumen::create($data);

        return response()->json($dokumen->load('kategori'), 201);
    }

    public function show($id)
    {
        return response()->json(Dokumen::with('kategori')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $dokumen = Dokumen::findOrFail($id);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'id_kategori_dokumen' => 'nullable|exists:kategori_dokumen,id_kategori_dokumen',
            'nomor' => 'nullable|string|max:255',
            'tanggal' => 'nullable|date',
            'status' => 'required|in:Publish,Draft',
            'file' => 'nullable|file|mimes:pdf|max:20480',
        ]);

        if ($request->hasFile('file')) {
            $this->deleteFile($dokumen->file);
            $data = array_merge($data, $this->storeFile($request->file('file')));
        } else {
            unset($data['file']);
        }

        $dokumen->update($data);

        return response()->json($dokumen->load('kategori'));
    }

    public function destroy($id)
    {
        $dokumen = Dokumen::findOrFail($id);
        $this->deleteFile($dokumen->file);
        $dokumen->delete();

        return response()->json(null, 204);
    }

    private function storeFile($file)
    {
        $filename = uniqid('doc_') . '.pdf';
        $original = $file->getClientOriginalName();
        $size = $file->getSize();
        $file->move(public_path('file'), $filename);

        return ['file' => $filename, 'nama_file' => $original, 'ukuran' => $size];
    }

    private function deleteFile($filename)
    {
        if ($filename) {
            $path = public_path('file/' . $filename);
            if (file_exists($path)) {
                @unlink($path);
            }
        }
    }
}
