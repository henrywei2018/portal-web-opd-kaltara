<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TautanPenting;
use App\Support\Unggah;
use Illuminate\Http\Request;

class TautanPentingController extends Controller
{
    public function index()
    {
        return response()->json(
            TautanPenting::orderBy('urutan')->orderBy('id_tautan')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['target_blank'] = $request->boolean('target_blank', true);

        if ($request->hasFile('gambar')) {
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        }

        $tautan = TautanPenting::create($data);

        return response()->json($tautan, 201);
    }

    public function update(Request $request, $id)
    {
        $tautan = TautanPenting::findOrFail($id);
        $data = $this->validateData($request);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['target_blank'] = $request->boolean('target_blank', true);

        if ($request->hasFile('gambar')) {
            $this->deleteImage($tautan->gambar);
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        } else {
            unset($data['gambar']);
        }

        $tautan->update($data);

        return response()->json($tautan);
    }

    public function destroy($id)
    {
        $tautan = TautanPenting::findOrFail($id);
        $this->deleteImage($tautan->gambar);
        $tautan->delete();

        return response()->json(null, 204);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'judul' => 'nullable|string|max:255',
            'url' => 'required|string|max:500',
            'gambar' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:20480',
            'urutan' => 'nullable|integer',
        ]);
    }

    private function uploadImage($file): string
    {
        return Unggah::simpan($file, 'gambar', Unggah::GAMBAR, '', 'gambar');
    }

    private function deleteImage(?string $filename): void
    {
        if ($filename && file_exists(public_path('gambar/' . $filename))) {
            @unlink(public_path('gambar/' . $filename));
        }
    }
}
