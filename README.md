# Portal Dinas Kesehatan

Portal resmi perangkat daerah — website publik + panel admin (CMS) untuk mengelola berita, layanan, dokumen, galeri, dan konten halaman secara mandiri.

Arsitektur **single-domain**: REST API (Laravel) melayani sekaligus SPA (React) dari satu origin — API di bawah `/api`, sisanya diarahkan ke aplikasi React. Tanpa CORS, satu sertifikat SSL.

---

## Teknologi

| Bagian | Stack |
|--------|-------|
| **Backend** | PHP 8.3+ · Laravel 13 · JWT Auth (`tymon/jwt-auth`) · Intervention Image v4 |
| **Frontend** | React 19 · Vite 8 · Material UI 9 · React Router 7 · Framer Motion · Axios |
| **Editor** | CKEditor 5 (rich text berita/artikel) |
| **Database** | SQLite (development) · MySQL (production) |
| **Keamanan** | Google reCAPTCHA v2 (opsional, env-gated) |

---

## Fitur

- **Konten**: Berita (multi-gambar + galeri carousel, editor kaya, sematan/"Berita Pilihan", penghitung views), Artikel, Galeri, Infografis, Video
- **Layanan publik**: modul Layanan (persyaratan, prosedur, biaya, kontak), Pengumuman, Dokumen (kategori + unduhan)
- **Page Builder**: halaman dinamis berbasis blok (hero, teks, galeri, kartu, kontak unit kerja, dll.)
- **Tampilan beranda**: Hero slider, statistik, tautan penting, banner/promosi mengambang
- **Navigasi**: menu dinamis (multi-level) yang bisa diatur admin
- **Situs**: pengaturan identitas instansi, SEO (meta/sitemap/robots + OG server-side), aksesibilitas (panel a11y + navigasi suara)
- **Manajemen**: pengguna & peran (super_admin / admin / editor / kontributor), pesan kontak masuk, audit log, dashboard

---

## Struktur Proyek

```
web-dinkes/
├── backend/          # Laravel API + document root (public/)
│   ├── app/          # Controllers, Models, Support
│   ├── routes/       # api.php (publik + admin), web.php (fallback SPA)
│   ├── database/     # migrations, seeders (DB SQLite lokal — di-ignore)
│   └── public/       # entry Laravel + hasil build SPA disalin ke sini
├── frontend/         # React SPA (Vite)
│   └── src/          # pages/public, pages/admin, components, contexts, utils
├── deploy.sh         # build SPA + composer + migrate + cache (production)
├── setup-dev.sh      # bootstrap lingkungan development
└── start-dev.sh      # jalankan backend + frontend sekaligus
```

---

## Menjalankan (Development)

**Prasyarat:** PHP 8.3+, Composer, Node.js 18+ & npm.

```bash
# --- Backend ---
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret          # isi JWT_SECRET (wajib untuk login)
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000

# --- Frontend (terminal lain) ---
cd frontend
cp .env.example .env            # jika belum ada
npm install
npm run dev
```

**Skrip bantu** (setelah `backend/.env` & `frontend/.env` dibuat seperti di atas):

- `./setup-dev.sh` — install dependency backend/frontend, generate `APP_KEY`, lalu `migrate:fresh --seed` (⚠️ mengosongkan data).
- `./start-dev.sh` — jalankan backend (`:8000`) + frontend (`:5173`) sekaligus.

Akses:
- Publik: <http://localhost:5173>
- Admin: <http://localhost:5173/login> → `/admin/dashboard`

**Login admin default:** `admin` / `admin123` — **wajib diganti di production.**

---

## Deploy ke Production

Target: **aaPanel (Nginx + PHP + MySQL)**, single-domain (document root → `backend/public`). Model deploy: **build di server**.

**Pertama kali:**

```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>/backend
cp .env.production.example .env      # edit DB_*, APP_URL, RECAPTCHA_SECRET, dll.
php artisan key:generate
php artisan jwt:secret
php artisan storage:link
cd .. && ./deploy.sh                  # build SPA + composer --no-dev + migrate + cache
```

**Update berikutnya:**

```bash
git pull
./deploy.sh              # atau ./deploy.sh --backend jika hanya ubah backend
```

Panduan lengkap: **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## Konfigurasi Environment

| File | Peran | Di git? |
|------|-------|---------|
| `backend/.env` | Rahasia backend (APP_KEY, DB, JWT, reCAPTCHA secret, mail) | ❌ (rahasia) |
| `backend/.env.example` / `.env.production.example` | Template | ✅ |
| `frontend/.env` | Konfig dev (localhost) | ❌ |
| `frontend/.env.production` | Konfig build production (hanya nilai **publik**: `/api` + reCAPTCHA *site key*) | ✅ |

> **reCAPTCHA** mati secara default (`VITE_REQUIRE_RECAPTCHA=false`). Aktifkan dengan mengisi *site key* (frontend) + `RECAPTCHA_SECRET` (backend), lalu rebuild frontend. Detail: **[RECAPTCHA_SETUP.md](RECAPTCHA_SETUP.md)**.

> Vite membakukan env saat **build** — selalu `npm run build` ulang setelah mengubah `frontend/.env.production`.

---

## Dokumentasi Tambahan

- [ARCHITECTURE.md](ARCHITECTURE.md) — arsitektur & alur data
- [DEV_SETUP.md](DEV_SETUP.md) — setup development detail
- [QUICK_START.md](QUICK_START.md) — memulai cepat
- [DEPLOYMENT.md](DEPLOYMENT.md) — deploy production (aaPanel)
- [RECAPTCHA_SETUP.md](RECAPTCHA_SETUP.md) — konfigurasi reCAPTCHA

---

## Catatan Keamanan

- Jangan pernah commit `backend/.env` (sudah di-`.gitignore`).
- Ganti kredensial admin default sebelum go-live.
- Upload pengguna (`backend/public/gambar`, `file`) dan database **tidak** ikut git — production menyimpan datanya sendiri.
