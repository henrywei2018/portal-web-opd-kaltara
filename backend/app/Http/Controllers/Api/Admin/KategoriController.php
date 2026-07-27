<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    public function index()
    {
        return response()->json(Kategori::orderBy('idkat', 'asc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nmkat' => 'required|string|max:255',
        ]);

        $kategori = Kategori::create($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_kategori',
            'detail' => "Kategori: {$data['nmkat']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($kategori, 201);
    }

    public function show($id)
    {
        return response()->json(Kategori::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $kategori = Kategori::findOrFail($id);

        $data = $request->validate([
            'nmkat' => 'required|string|max:255',
        ]);

        $kategori->update($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_kategori',
            'detail' => "Kategori: {$data['nmkat']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($kategori);
    }

    public function destroy($id)
    {
        $kategori = Kategori::findOrFail($id);

        // Check if category is being used
        $used = \App\Models\Berita::where('idkat', $id)->count();
        if ($used > 0) {
            return response()->json(['error' => 'Category is being used by news articles'], 400);
        }

        $nmkat = $kategori->nmkat;
        $kategori->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_kategori',
            'detail' => "Kategori: {$nmkat}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
    }
}
