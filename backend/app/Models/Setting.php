<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'settings';
    protected $fillable = ['key', 'value'];

    /** Allowed setting keys (whitelist for updates). */
    public const KEYS = [
        'site_title', 'site_subtitle', 'logo', 'favicon',
        'email', 'telepon', 'fax', 'alamat', 'website', 'telepon_darurat',
        'facebook', 'instagram', 'twitter', 'youtube',
        'map_embed', 'maps_link', 'jam_operasional',
        // SEO module
        'seo_meta_description', 'seo_keywords', 'seo_ga_id', 'seo_search_console',
    ];

    /** Subset of KEYS managed by the SEO module. */
    public const SEO_KEYS = [
        'seo_meta_description', 'seo_keywords', 'seo_ga_id', 'seo_search_console',
    ];

    /** Return all settings as a flat key => value object. */
    public static function asObject(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
