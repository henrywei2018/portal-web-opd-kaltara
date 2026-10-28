<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Support\Unggah;
use Illuminate\Http\Request;

class HeroController extends Controller
{
    public function index()
    {
        return response()->json(HeroSlide::orderBy('urutan')->orderBy('id_hero')->get());
    }

    public function store(Request $request)
    {
        $hero = HeroSlide::create($this->validateData($request));

        // Pick up column defaults (e.g. `durasi`) so the response matches the row.
        return response()->json($hero->refresh(), 201);
    }

    public function show($id)
    {
        return response()->json(HeroSlide::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $hero = HeroSlide::findOrFail($id);
        $hero->update($this->validateData($request));

        return response()->json($hero);
    }

    public function destroy($id)
    {
        HeroSlide::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    /**
     * Upload a hero background image. Returns the stored filename.
     */
    public function uploadImage(Request $request)
    {
        $request->validate(['image' => 'required|' . Unggah::ATURAN_GAMBAR . '|max:8192']);

        $file = $request->file('image');
        $filename = Unggah::simpan($file, 'gambar', Unggah::GAMBAR, 'hero_', 'image');

        return response()->json(['filename' => $filename, 'url' => url('gambar/' . $filename)], 201);
    }

    private function validateData(Request $request)
    {
        $data = $request->validate([
            'judul' => 'nullable|string|max:255',
            'subjudul' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'bg_type' => 'required|in:color,gradient,image,youtube',
            'bg_value' => 'nullable|string|max:1000',
            // Locally hosted still for youtube slides — shown whenever the
            // player must not run (no cookie consent, reduced motion, offline).
            'bg_poster' => 'nullable|string|max:255',
            'bg_autoplay' => 'boolean',
            'overlay' => 'boolean',
            // Seconds this slide stays on screen. Bounded so a typo can't
            // freeze the carousel or make it flicker past unreadably.
            'durasi' => 'nullable|integer|min:2|max:60',
            'cta_text' => 'nullable|string|max:255',
            'cta_link' => 'nullable|string|max:500',
            'cta2_text' => 'nullable|string|max:255',
            'cta2_link' => 'nullable|string|max:500',
            'tampil_statistik' => 'boolean',
            'is_active' => 'boolean',
            'urutan' => 'nullable|integer',
        ]);

        // `durasi` is nullable in the request but NOT NULL in the table: drop an
        // explicit null so the column default (6s) applies instead of erroring.
        if (array_key_exists('durasi', $data) && $data['durasi'] === null) {
            unset($data['durasi']);
        }

        return $data;
    }
}
