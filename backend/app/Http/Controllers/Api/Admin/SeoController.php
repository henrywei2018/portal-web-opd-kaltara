<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

/**
 * SEO module — global SEO settings stored in the generic `settings` table.
 * Only the SEO-specific keys (Setting::SEO_KEYS) are read/written here; the
 * broader site settings remain under the SettingController (ability:pengaturan).
 */
class SeoController extends Controller
{
    public function index()
    {
        $all = Setting::asObject();
        $out = [];
        foreach (Setting::SEO_KEYS as $key) {
            $out[$key] = $all[$key] ?? '';
        }

        return response()->json($out);
    }

    public function update(Request $request)
    {
        foreach (Setting::SEO_KEYS as $key) {
            if ($request->has($key)) {
                Setting::updateOrCreate(['key' => $key], ['value' => (string) $request->input($key)]);
            }
        }

        return response()->json($this->index()->getData(true));
    }
}
