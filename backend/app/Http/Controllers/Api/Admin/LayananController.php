<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use Illuminate\Http\Request;

class LayananController extends Controller
{
    public function index(Request $request)
    {
        $query = Layanan::query()->orderBy('urutan')->orderBy('id_layanan');

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
        $layanan = Layanan::create($this->validateData($request));

        return response()->json($layanan, 201);
    }

    public function show($id)
    {
        return response()->json(Layanan::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $layanan = Layanan::findOrFail($id);
        $layanan->update($this->validateData($request));

        return response()->json($layanan);
    }

    public function destroy($id)
    {
        Layanan::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|file|max:20480',
        ]);
        $file = $request->file('image');
        if (!str_starts_with((string) $file->getMimeType(), 'image/')) {
            return response()->json(['message' => 'Berkas harus berupa gambar.'], 422);
        }
        $filename = uniqid() . '.' . ($file->getClientOriginalExtension() ?: 'jpg');
        $file->move(public_path('gambar'), $filename);

        return response()->json(['filename' => $filename]);
    }

    private function validateData(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'gambar' => 'nullable|string|max:255',
            'kategori' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'persyaratan' => 'nullable|array',
            'prosedur' => 'nullable|array',
            'waktu' => 'nullable|string|max:255',
            'biaya' => 'nullable|string|max:255',
            'masa_berlaku' => 'nullable|string|max:255',
            'kontak_telepon' => 'nullable|string|max:255',
            'kontak_email' => 'nullable|string|max:255',
            'kontak_lokasi' => 'nullable|string|max:255',
            'darurat' => 'boolean',
            'status' => 'required|in:Publish,Draft',
            'urutan' => 'nullable|integer',
        ]);

        $data['persyaratan'] = array_values(array_filter($data['persyaratan'] ?? [], fn ($v) => trim((string) $v) !== ''));
        $data['prosedur'] = array_values(array_filter($data['prosedur'] ?? [], fn ($v) => trim((string) $v) !== ''));

        return $data;
    }
}
