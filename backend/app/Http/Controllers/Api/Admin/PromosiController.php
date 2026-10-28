<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promosi;
use App\Support\Unggah;
use Illuminate\Http\Request;

class PromosiController extends Controller
{
    public function index()
    {
        return response()->json(
            Promosi::orderBy('id_promosi', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['target_blank'] = $request->boolean('target_blank', true);
        $data['jeda_hari'] = (int) $request->input('jeda_hari', 3);

        if ($request->hasFile('gambar')) {
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        }

        $promosi = Promosi::create($data);

        return response()->json($promosi, 201);
    }

    public function update(Request $request, $id)
    {
        $promosi = Promosi::findOrFail($id);
        $data = $this->validateData($request);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['target_blank'] = $request->boolean('target_blank', true);
        $data['jeda_hari'] = (int) $request->input('jeda_hari', 3);

        if ($request->hasFile('gambar')) {
            $this->deleteImage($promosi->gambar);
            $data['gambar'] = $this->uploadImage($request->file('gambar'));
        } else {
            unset($data['gambar']);
        }

        $promosi->update($data);

        return response()->json($promosi);
    }

    public function destroy($id)
    {
        $promosi = Promosi::findOrFail($id);
        $this->deleteImage($promosi->gambar);
        $promosi->delete();

        return response()->json(null, 204);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'judul' => 'nullable|string|max:255',
            'url' => 'nullable|string|max:500',
            // Days to hide after close; 0 = permanent
            'jeda_hari' => 'nullable|integer|min:0|max:365',
            'gambar' => 'nullable|' . Unggah::ATURAN_GAMBAR . '|max:20480',
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
