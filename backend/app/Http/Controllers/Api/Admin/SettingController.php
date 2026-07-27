<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        return response()->json(Setting::asObject());
    }

    public function update(Request $request)
    {
        foreach (Setting::KEYS as $key) {
            if ($request->has($key)) {
                Setting::updateOrCreate(['key' => $key], ['value' => (string) $request->input($key)]);
            }
        }

        return response()->json(Setting::asObject());
    }

    public function uploadLogo(Request $request)
    {
        $request->validate(['image' => 'required|file|max:20480', 'key' => 'nullable|string']);
        // Allow uploading either the header logo or the favicon
        $key = in_array($request->input('key'), ['logo', 'favicon'], true) ? $request->input('key') : 'logo';

        $file = $request->file('image');
        $mime = (string) $file->getMimeType();
        if (!str_starts_with($mime, 'image/') && $mime !== 'image/vnd.microsoft.icon' && $file->getClientOriginalExtension() !== 'ico') {
            return response()->json(['message' => 'Berkas harus berupa gambar.'], 422);
        }
        $filename = uniqid() . '.' . ($file->getClientOriginalExtension() ?: 'png');
        $file->move(public_path('gambar'), $filename);

        Setting::updateOrCreate(['key' => $key], ['value' => $filename]);

        return response()->json(['filename' => $filename, 'settings' => Setting::asObject()]);
    }
}
