<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Komentar;
use Illuminate\Http\Request;

class KomentarController extends Controller
{
    public function index()
    {
        return response()->json(
            Komentar::orderBy('id_komentar', 'desc')->get()
        );
    }

    public function unreadCount()
    {
        return response()->json(['count' => Komentar::where('is_read', 0)->count()]);
    }

    public function markRead($id)
    {
        $k = Komentar::findOrFail($id);
        $k->update(['is_read' => 1]);
        return response()->json($k);
    }

    public function markUnread($id)
    {
        $k = Komentar::findOrFail($id);
        $k->update(['is_read' => 0]);
        return response()->json($k);
    }

    public function destroy($id)
    {
        Komentar::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
