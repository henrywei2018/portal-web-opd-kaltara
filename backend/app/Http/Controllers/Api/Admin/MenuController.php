<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Return the full menu as a nested tree of arbitrary depth.
     */
    public function index()
    {
        $all = Menu::with('halaman:id_halaman,judul,slug')->orderBy('urutan')->get();

        return response()->json(self::buildTree($all, null));
    }

    /**
     * Build a nested tree (children of arbitrary depth) from a flat collection.
     */
    public static function buildTree($all, $parentId)
    {
        return $all
            ->filter(fn ($item) => $item->parent_id === $parentId)
            ->sortBy('urutan')
            ->values()
            ->map(function ($item) use ($all) {
                $item->setRelation('children', self::buildTree($all, $item->id_menu));
                return $item;
            });
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        if (!isset($data['urutan'])) {
            $data['urutan'] = (Menu::where('parent_id', $data['parent_id'] ?? null)->max('urutan') ?? 0) + 1;
        }

        $menu = Menu::create($data);

        return response()->json($menu, 201);
    }

    public function show($id)
    {
        return response()->json(Menu::with('children')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);
        $data = $this->validateData($request);
        $menu->update($data);

        return response()->json($menu);
    }

    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete(); // children removed via FK cascade

        return response()->json(null, 204);
    }

    /**
     * Bulk update ordering / parent assignment.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id_menu' => 'required|integer|exists:menu,id_menu',
            'items.*.urutan' => 'required|integer',
            'items.*.parent_id' => 'nullable|integer',
        ]);

        foreach ($validated['items'] as $item) {
            Menu::where('id_menu', $item['id_menu'])->update([
                'urutan' => $item['urutan'],
                'parent_id' => $item['parent_id'] ?? null,
            ]);
        }

        return response()->json(['message' => 'Urutan menu diperbarui']);
    }

    private function validateData(Request $request)
    {
        return $request->validate([
            'label' => 'required|string|max:255',
            'type' => 'required|in:halaman,route,url,dropdown',
            'id_halaman' => 'nullable|integer|exists:halaman,id_halaman',
            'url' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:100',
            'parent_id' => 'nullable|integer|exists:menu,id_menu',
            'urutan' => 'nullable|integer',
            'is_active' => 'boolean',
            'target_blank' => 'boolean',
        ]);
    }
}
