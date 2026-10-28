<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\Unggah;
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
        $request->validate(['image' => 'required|' . Unggah::ATURAN_IKON . '|max:20480', 'key' => 'nullable|string']);
        // Allow uploading either the header logo or the favicon
        $key = in_array($request->input('key'), ['logo', 'favicon'], true) ? $request->input('key') : 'logo';

        $file = $request->file('image');
        $filename = Unggah::simpan($file, 'gambar', Unggah::IKON, '', 'image');

        Setting::updateOrCreate(['key' => $key], ['value' => $filename]);

        return response()->json(['filename' => $filename, 'settings' => Setting::asObject()]);
    }
}
