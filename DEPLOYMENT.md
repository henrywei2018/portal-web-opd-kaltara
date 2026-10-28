# Panduan Produksi — Dinkes Kaltara di aaPanel (Shared Host)

Panduan lengkap men-deploy aplikasi (Laravel API + React SPA) ke server dengan
**aaPanel**. Cocok untuk shared/VPS hosting yang memakai aaPanel + Nginx + MySQL.

---

## 0. Arsitektur deploy (SATU domain — direkomendasikan)

```
https://DOMAIN_ANDA.go.id
        │
        ├─ /                → React SPA (index.html + /assets/*)   ← statis
        ├─ /gambar/*        → file upload (logo, galeri, dll.)     ← statis
        ├─ /api/*           → Laravel REST API                     ← PHP
        └─ /berita, /admin… → dilempar ke index.html (React Router)
```

Semua di **satu domain**, jadi **tidak ada masalah CORS** dan cukup **satu
sertifikat SSL**. Caranya: *document root* diarahkan ke `backend/public`, dan
hasil build React (`frontend/dist`) disalin ke `backend/public`. Laravel punya
route fallback yang mengembalikan `index.html` untuk rute non-API.

> Alternatif (subdomain terpisah `api.domain` + `www.domain`) juga didukung —
> lihat catatan di bagian 13. Untuk mayoritas kasus, satu domain lebih sederhana.

---

## 1. Prasyarat di aaPanel

Pasang lewat **App Store** aaPanel:
- **Nginx** (web server)
- **MySQL** 5.7+ / 8.0
- **PHP 8.3** (+ ekstensi: `fileinfo`, `pdo_mysql`, `mbstring`, `openssl`,
  `curl`, `gd`/`imagick`, `bcmath`, `tokenizer`, `xml`, `zip`)
- **Composer** (Terminal aaPanel, atau menu PHP > Composer)
- **Node.js** (hanya jika mau build SPA di server; boleh juga build di laptop)

**Penting (jebakan umum aaPanel):** di **PHP 8.3 > Setting > Disabled functions**,
pastikan **`proc_open`, `putenv`, `symlink`, `exec`** TIDAK dinonaktifkan —
Composer & `php artisan` membutuhkannya.

---

## 2. Siapkan berkas aplikasi

Dua opsi:

**A. Build SPA di laptop lalu upload (disarankan untuk shared host lemah):**
```bash
cd frontend
cp .env.production .env.production.local   # isi VITE_* bila perlu
npm ci && npm run build                    # menghasilkan frontend/dist
```
Lalu upload seluruh folder proyek (atau minimal `backend/` + `frontend/dist/`).

**B. Build di server:** upload semua kode, nanti jalankan `./deploy.sh`.

Jangan upload: `node_modules/`, `vendor/`, `backend/.env`, `backend/database/*.sqlite`.

---

## 3. Buat database MySQL (aaPanel > Databases > Add DB)

Catat: **nama DB**, **user**, **password**. Contoh: `dinkes` / `dinkes` / `••••`.

---

## 4. Buat Website di aaPanel

1. **Website > Add site** → domain `DOMAIN_ANDA.go.id`, pilih PHP 8.3, tanpa DB
   (sudah dibuat manual di langkah 3).
2. Upload kode ke folder situs, mis. `/www/wwwroot/dinkes/` sehingga ada
   `/www/wwwroot/dinkes/backend` dan `/www/wwwroot/dinkes/frontend`.
3. **Website > (situs) > Site directory / Run directory** → arahkan **Running
   directory ke `/backend/public`** (INI WAJIB — agar `index.php` Laravel yang
   jadi entry point). Kalau opsi run-directory terbatas, set **Document Root**
   langsung ke `/www/wwwroot/dinkes/backend/public`.

---

## 5. Konfigurasi backend `.env`

```bash
cd /www/wwwroot/dinkes/backend
cp .env.production.example .env
# edit .env: isi DB_*, APP_URL, FRONTEND_URL, (opsional) RECAPTCHA_SECRET
php artisan key:generate
php artisan jwt:secret
```

Nilai penting: `APP_ENV=production`, `APP_DEBUG=false`, `DB_*` sesuai langkah 3,
`APP_URL` & `FRONTEND_URL` = URL situs Anda.

---

## 6. Install dependensi, migrasi, seeder

```bash
cd /www/wwwroot/dinkes/backend
composer install --no-dev --optimize-autoloader

php artisan migrate --force      # buat semua tabel di MySQL
php artisan db:seed --force      # akun admin awal + menu + konten contoh
```

Seeder membuat akun awal **username `admin` / password `admin123`** →
**WAJIB diganti** (langkah 11).

---

## 7. Salin hasil build React ke `public/`

Dari root proyek:
```bash
./deploy.sh --frontend     # build SPA + salin ke backend/public
# atau, bila sudah build di laptop, salin manual:
#   rm -rf backend/public/assets && cp -r frontend/dist/. backend/public/
```

Setelah ini `backend/public/index.html` dan `backend/public/assets/` harus ada,
berdampingan dengan `index.php`, `gambar/`, `.htaccess`.

---

## 8. Perizinan berkas

```bash
cd /www/wwwroot/dinkes/backend
chmod -R ug+rw storage bootstrap/cache
chown -R www:www .           # user web aaPanel biasanya 'www'
```

Folder upload `public/gambar` dan `public/file` harus writable oleh `www`.

---

## 9. Konfigurasi Nginx

aaPanel > Website > (situs) > **Config**. Pastikan blok `location /` seperti ini
(bawaan Laravel aaPanel sudah mirip):

```nginx
# entry point Laravel; SPA & API sama-sama lewat sini kecuali file statis nyata
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/tmp/php-cgi-83.sock;   # sesuaikan versi PHP
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}

# cache aset statis SPA (opsional, mempercepat)
location ~* \.(?:js|css|woff2?|png|jpe?g|gif|svg|ico)$ {
    expires 30d;
    access_log off;
    try_files $uri /index.php?$query_string;
}

# jangan pernah sajikan berkas sensitif
location ~ /\.(?!well-known) { deny all; }
location ~ /(\.env|composer\.(json|lock)|artisan)$ { deny all; }
```

Simpan → **Reload Nginx**. Uji: buka `https://DOMAIN_ANDA.go.id` (SPA) dan
`https://DOMAIN_ANDA.go.id/api/public/settings` (JSON).

---

## 10. SSL / HTTPS

aaPanel > Website > (situs) > **SSL** → **Let's Encrypt** → terbitkan sertifikat
→ aktifkan **Force HTTPS**. Setelah HTTPS aktif, pastikan di `.env`:
`SESSION_SECURE_COOKIE=true` dan `APP_URL=https://...`, lalu
`php artisan config:cache`.

---

## 11. Ganti password admin (WAJIB)

Login ke `https://DOMAIN_ANDA.go.id/admin` (admin / admin123) → menu **Pengguna**
→ ubah password admin. Atau lewat tinker:
```bash
php artisan tinker
>>> $u = App\Models\User::where('username','admin')->first();
>>> $u->password = password_hash('PASSWORD_BARU_KUAT', PASSWORD_BCRYPT); $u->save();
```

---

## 12. Optimasi cache Laravel (produksi)

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```
> Setiap kali `.env` atau route berubah, ulangi `config:cache` & `route:cache`
> (atau `php artisan optimize:clear` lalu cache ulang).

---

## 13. Aktifkan reCAPTCHA (opsional, disarankan)

Aplikasi berjalan **tanpa** reCAPTCHA jika dibiarkan kosong. Untuk mengaktifkan
(login admin + form Kontak):

1. Buat kunci **reCAPTCHA v2 "I'm not a robot"** di
   <https://www.google.com/recaptcha/admin>, tambahkan domain Anda.
2. **Backend** `.env`: `RECAPTCHA_SECRET=<secret key>` → `php artisan config:cache`.
3. **Frontend** `frontend/.env.production`:
   ```
   VITE_RECAPTCHA_SITE_KEY=<site key>
   VITE_REQUIRE_RECAPTCHA=true
   ```
   Lalu **build ulang** SPA: `./deploy.sh --frontend` (Vite menanam nilai ini
   saat build, jadi wajib rebuild).

> **Subdomain terpisah?** Jika SPA di `www.domain` dan API di `api.domain`:
> set `frontend/.env.production` → `VITE_API_BASE_URL=https://api.domain.go.id/api`,
> dan backend `.env` → `FRONTEND_URL=https://www.domain.go.id` (mengaktifkan CORS
> di `config/cors.php`). Terbitkan SSL untuk kedua host.

---

## 14. Checklist keamanan produksi

- [ ] `APP_ENV=production`, `APP_DEBUG=false` (jangan pernah `true` di publik).
- [ ] Password `admin` sudah diganti; buat akun editor/kontributor sesuai peran.
- [ ] HTTPS aktif + Force HTTPS + `SESSION_SECURE_COOKIE=true`.
- [ ] `.env`, `composer.json`, `artisan` tidak bisa diakses via URL (blok Nginx §9).
- [ ] Tidak ada berkas dev di `backend/public/` (mis. `devlogin.html`) —
      hapus jika ada. Folder upload sah: `gambar/`, `file/`.
- [ ] `RECAPTCHA_SECRET` diisi bila ingin proteksi bot (opsional).
- [ ] Backup terjadwal DB + folder `public/gambar` (aaPanel > Cron / Backup).
- [ ] Sekali setelah update keamanan konten: backup DB, lalu
      `php artisan konten:sanitasi --dry-run` (lihat dampaknya) dan
      `php artisan konten:sanitasi`. Membersihkan HTML berita/artikel/halaman
      yang tersimpan sebelum sanitasi saat-simpan diterapkan.
- [ ] Header `Content-Security-Policy` aktif (cek di DevTools > Network).
      Bila sebuah embed diblokir: tambahkan host-nya ke `IFRAME_HOSTS`
      (lihat `config/keamanan.php`). Darurat: `CSP_REPORT_ONLY=true` hanya
      melaporkan tanpa memblokir; `CSP_ENABLED=false` mematikannya. Jalankan
      `php artisan config:cache` setelah mengubah `.env`.
- [ ] `composer audit` dan `npm audit --omit=dev` bersih sebelum rilis.

---

## 15. Update / redeploy (rilis berikutnya)

```bash
cd /www/wwwroot/dinkes
git pull            # atau upload kode baru
./deploy.sh         # build SPA + composer + migrate + cache
```
Atau terpisah: `./deploy.sh --frontend` (hanya UI), `./deploy.sh --backend`
(hanya API/DB).

---

## 16. Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| **500 Internal Server Error** | `APP_KEY` kosong (`php artisan key:generate`), atau `storage/` tak writable (langkah 8). Cek `backend/storage/logs/laravel.log`. |
| **Halaman putih / blank** | `frontend/dist` belum disalin ke `public/` (langkah 7), atau `VITE_API_BASE_URL` salah. Cek `public/index.html` ada. |
| **/api/... balas HTML, bukan JSON** | Run directory belum diarahkan ke `/backend/public` (langkah 4). |
| **Gambar 404** | Cek folder `public/gambar` ikut ter-upload & permission `www`. URL gambar = `/gambar/<file>`. |
| **419 / CSRF saat login** | Bersihkan cache: `php artisan optimize:clear`, pastikan `SESSION_DRIVER=database` & tabel `sessions` ada (migrate). |
| **CORS error** | Hanya muncul di mode subdomain; set `FRONTEND_URL` benar lalu `config:cache`. |
| **Composer/artisan error `proc_open`** | Aktifkan `proc_open`/`putenv` di PHP 8.3 > Disabled functions (langkah 1). |
| **Terjemahan EN tidak muncul** | Server perlu akses keluar ke `translate.googleapis.com`. Bila diblok, terjemahan baru tak tergenerate (yang sudah di-cache tetap tampil). |
| **Form Kontak selalu gagal** | Jika `RECAPTCHA_SECRET` diisi tapi frontend belum dibuild dgn site key + `VITE_REQUIRE_RECAPTCHA=true`. Samakan keduanya, atau kosongkan keduanya untuk menonaktifkan. |

---

## 17. Verifikasi cepat pasca-deploy

1. `https://DOMAIN/` → beranda tampil, logo & gambar muncul.
2. `https://DOMAIN/api/public/settings` → JSON pengaturan.
3. `https://DOMAIN/berita` lalu **refresh** → tetap tampil (SPA fallback OK).
4. `https://DOMAIN/admin` → login → dashboard.
5. Kirim pesan di **/kontak** → muncul di **Admin > Pesan Masuk**.
6. Upload sebuah gambar (mis. logo di Pengaturan) → tersimpan & tampil.

Selesai. 🎉
