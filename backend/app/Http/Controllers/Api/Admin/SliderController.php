<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SliderController extends Controller
{
    public function index()
    {
        return response()->json(Slider::orderBy('id_slider', 'asc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg|max:50000',
        ]);

        $filename = null;
        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('gambar'), $filename);

            // Create thumbnail
            try {
                $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                $manager->decodePath(public_path('gambar/' . $filename))
                    ->resize(2000, 793)
                    ->save(public_path('gambar/thumb/' . pathinfo($filename, PATHINFO_FILENAME) . '_thumb.jpg'));
            } catch (\Throwable $e) {
                logger()->error('Failed to create thumbnail: ' . $e->getMessage());
            }
        }

        $slider = Slider::create(['foto' => $filename]);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_slider',
            'detail' => "Slider ID: {$slider->id_slider}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($slider, 201);
    }

    public function show($id)
    {
        return response()->json(Slider::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $slider = Slider::findOrFail($id);

        $request->validate([
            'foto' => 'nullable|image|mimes:jpg,jpeg|max:50000',
        ]);

        $data = [];

        if ($request->hasFile('foto')) {
            // Delete old image
            if ($slider->foto) {
                $this->deleteImage($slider->foto);
            }

            $file = $request->file('foto');
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('gambar'), $filename);

            // Create thumbnail
            try {
                $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                $manager->decodePath(public_path('gambar/' . $filename))
                    ->resize(2000, 793)
                    ->save(public_path('gambar/thumb/' . pathinfo($filename, PATHINFO_FILENAME) . '_thumb.jpg'));
            } catch (\Throwable $e) {
                logger()->error('Failed to create thumbnail: ' . $e->getMessage());
            }

            $data['foto'] = $filename;
        }

        if (!empty($data)) {
            $slider->update($data);

            // Log audit
            AuditLog::create([
                'id_user' => auth()->user()->id_user,
                'nama_user' => auth()->user()->nama,
                'aksi' => 'edit_slider',
                'detail' => "Slider ID: {$id}",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json($slider);
    }

    public function destroy($id)
    {
        $slider = Slider::findOrFail($id);

        if ($slider->foto) {
            $this->deleteImage($slider->foto);
        }

        $slider->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_slider',
            'detail' => "Slider ID: {$id}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
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
