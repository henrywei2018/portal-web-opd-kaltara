<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index()
    {
        return response()->json(Video::orderBy('id_video', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'link_video' => 'required|string|max:500',
        ]);

        // Convert YouTube URL to embed format
        $data['link_video'] = $this->youtubeToEmbed($data['link_video']);

        $video = Video::create($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_video',
            'detail' => "Video: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($video, 201);
    }

    public function show($id)
    {
        return response()->json(Video::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $video = Video::findOrFail($id);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'link_video' => 'required|string|max:500',
        ]);

        $data['link_video'] = $this->youtubeToEmbed($data['link_video']);

        $video->update($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_video',
            'detail' => "Video: {$data['judul']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($video);
    }

    public function destroy($id)
    {
        $video = Video::findOrFail($id);
        $judul = $video->judul;
        $video->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_video',
            'detail' => "Video: {$judul}",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
    }

    private function youtubeToEmbed($url)
    {
        $url = trim($url);

        // Check if already in embed format
        if (strpos($url, 'youtube.com/embed/') !== false) {
            return $url;
        }

        // Extract video ID from youtu.be URL
        if (preg_match('/youtu\.be\/([a-zA-Z0-9_-]{11})/', $url, $m)) {
            return 'https://www.youtube.com/embed/' . $m[1];
        }

        // Extract video ID from standard YouTube URL
        if (preg_match('/[?&]v=([a-zA-Z0-9_-]{11})/', $url, $m)) {
            return 'https://www.youtube.com/embed/' . $m[1];
        }

        return $url;
    }
}
