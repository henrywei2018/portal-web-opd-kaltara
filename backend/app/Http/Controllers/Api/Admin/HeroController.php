<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
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

        return response()->json($hero, 201);
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
        $request->validate(['image' => 'required|image|mimes:jpg,jpeg,png,webp|max:8192']);

        $file = $request->file('image');
        $filename = uniqid('hero_') . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('gambar'), $filename);

        return response()->json(['filename' => $filename, 'url' => url('gambar/' . $filename)], 201);
    }

    private function validateData(Request $request)
    {
        return $request->validate([
            'judul' => 'nullable|string|max:255',
            'subjudul' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'bg_type' => 'required|in:color,gradient,image',
            'bg_value' => 'nullable|string|max:1000',
            'overlay' => 'boolean',
            'cta_text' => 'nullable|string|max:255',
            'cta_link' => 'nullable|string|max:500',
            'cta2_text' => 'nullable|string|max:255',
            'cta2_link' => 'nullable|string|max:500',
            'tampil_statistik' => 'boolean',
            'is_active' => 'boolean',
            'urutan' => 'nullable|integer',
        ]);
    }
}
