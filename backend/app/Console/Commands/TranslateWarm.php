<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

/**
 * Pre-translate all CMS content into every target locale so the first public
 * page load is already cached. Run after seeding/editing content:
 *   php artisan translate:warm
 */
class TranslateWarm extends Command
{
    protected $signature = 'translate:warm {--locale= : Only warm this target locale}';
    protected $description = 'Pre-cache machine translations for all translatable content';

    /** Models carrying the HasTranslations trait. */
    private array $models = [
        \App\Models\HeroSlide::class,
        \App\Models\Statistik::class,
        \App\Models\Berita::class,
        \App\Models\Artikel::class,
        \App\Models\Kategori::class,
        \App\Models\Menu::class,
        \App\Models\Layanan::class,
        \App\Models\Halaman::class,
        \App\Models\Dokumen::class,
        \App\Models\KategoriDokumen::class,
        \App\Models\Pengumuman::class,
        \App\Models\Video::class,
        \App\Models\Galeri::class,
        \App\Models\Slider::class,
        \App\Models\Sambutan::class,
        \App\Models\Sejarah::class,
        \App\Models\TugasFungsi::class,
        \App\Models\StrukturOrganisasi::class,
        \App\Models\Download::class,
    ];

    public function handle(): int
    {
        $targets = $this->option('locale')
            ? [$this->option('locale')]
            : (array) config('translation.targets', []);

        foreach ($targets as $locale) {
            $this->info("Warming locale: {$locale}");
            app()->setLocale($locale);

            foreach ($this->models as $modelClass) {
                if (!class_exists($modelClass)) {
                    continue;
                }
                try {
                    $rows = $modelClass::all();
                } catch (\Throwable $e) {
                    $this->warn("  skip {$modelClass}: {$e->getMessage()}");
                    continue;
                }
                $count = 0;
                foreach ($rows as $row) {
                    $row->toArray(); // triggers translation + caching of declared fields
                    $count++;
                }
                $this->line('  ' . class_basename($modelClass) . ": {$count} record(s)");
            }
        }

        $this->info('Done. Translation cache warmed.');
        return self::SUCCESS;
    }
}
