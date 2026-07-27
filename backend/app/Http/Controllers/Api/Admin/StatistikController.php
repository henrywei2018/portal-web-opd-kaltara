<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Statistik;
use Illuminate\Http\Request;

class StatistikController extends Controller
{
    public function index()
    {
        return response()->json(Statistik::orderBy('urutan')->orderBy('id_statistik')->get());
    }

    public function store(Request $request)
    {
        return response()->json(Statistik::create($this->validateData($request)), 201);
    }

    public function show($id)
    {
        return response()->json(Statistik::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $stat = Statistik::findOrFail($id);
        $stat->update($this->validateData($request));

        return response()->json($stat);
    }

    public function destroy($id)
    {
        Statistik::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    private function validateData(Request $request)
    {
        return $request->validate([
            'label' => 'required|string|max:255',
            'nilai' => 'required|string|max:50',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'tampil_hero' => 'boolean',
            'is_active' => 'boolean',
            'urutan' => 'nullable|integer',
        ]);
    }
}
