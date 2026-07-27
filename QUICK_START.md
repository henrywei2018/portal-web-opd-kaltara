# Quick Start Guide - Dinkes Application

## 🚀 Setup Otomatis (Recommended)

Jalankan script setup yang akan mengkonfigurasi seluruh aplikasi secara otomatis:

```bash
./setup-dev.sh
```

Script ini akan:
- ✅ Mengecek semua prerequisite (PHP, Composer, Node.js, npm)
- ✅ Install dependencies backend dan frontend
- ✅ Setup database SQLite
- ✅ Run migrations dan seeders
- ✅ Build frontend untuk development
- ✅ Optimasi Laravel application

## 🎯 Setup Manual

Jika script otomatis gagal, ikuti langkah manual berikut:

### Backend Setup
```bash
cd backend
composer install
touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
```

## ▶️ Menjalankan Application

### Recommended: Full Stack Development (Both Servers)
```bash
./start-dev.sh
```

Ini akan menjalankan:
- Backend API: http://localhost:8000
- Frontend React: http://localhost:5173

**Access Application:** http://localhost:5173

### Manual: Two Terminal Approach

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access:
- Application: http://localhost:5173
- Admin Panel: http://localhost:5173/login
- API Testing: http://localhost:8000/api

## 🧪 Testing API

Gunakan script testing API untuk memverifikasi semua endpoint:

```bash
./test-api.sh
```

## 🔐 Admin Access

⚠️ **PENTING:** Admin panel ada di frontend React, bukan di Laravel!

**Cara Akses Admin Panel:**

1. **Start kedua server:**
   ```bash
   ./start-dev.sh
   ```

2. **Buka login page:**
   - URL: `http://localhost:5173/login`

3. **Login dengan credentials:**
   - Username: `admin`
   - Password: `admin123`

4. **Auto-redirect ke admin dashboard:**
   - URL: `http://localhost:5173/admin/dashboard`

**❌ Salah:** `http://localhost:8000/admin` (404 - ini route Laravel)
**✅ Benar:** `http://localhost:5173/login` lalu `http://localhost:5173/admin/dashboard`

⚠️ **PENTING:** Ubah password default setelah login pertama!

## 📡 API Endpoints

### Public Endpoints (Tanpa Authentication)
- `GET /api/public/berita` - List semua berita
- `GET /api/public/berita/{id}` - Detail berita
- `GET /api/public/slider` - Slider images
- `GET /api/public/galeri` - Gallery
- `GET /api/public/video` - Videos
- `GET /api/public/kategori` - Categories
- `GET /api/public/pengumuman` - Announcements
- `GET /api/public/sejarah` - History
- `GET /api/public/tugasfungsi` - Tasks & Functions
- `GET /api/public/struktur` - Organization Structure
- `GET /api/public/sambutan` - Welcome Message
- `POST /api/public/kontak` - Contact Form

### Admin Endpoints (Requires Authentication)
- `POST /api/auth/login` - Login dengan reCAPTCHA
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current User Info
- `GET /api/admin/dashboard` - Dashboard Data
- `GET /api/admin/berita` - CRUD Berita
- `GET /api/admin/kategori` - CRUD Kategori
- `GET /api/admin/galeri` - CRUD Galeri
- `GET /api/admin/video` - CRUD Video
- `GET /api/admin/slider` - CRUD Slider
- `GET /api/admin/user` - CRUD Users
- `GET /api/admin/audit-log` - Audit Logs

## 🗄️ Database Information

### Connection
- **Type:** SQLite
- **Location:** `backend/database/database.sqlite`
- **Connection:** `DB_CONNECTION=sqlite` di `.env`

### Sample Data Created

Seeders akan membuat data sample:

1. **Users:**
   - 1 Admin user (username: admin, password: admin123)

2. **Categories:**
   - Umum
   - Kesehatan Masyarakat
   - Pelayanan Kesehatan
   - Obat dan Farmasi

3. **News Articles:**
   - 2 published news articles

4. **Gallery:**
   - 2 gallery items

5. **Videos:**
   - 1 educational video

6. **Other Content:**
   - Announcements, sliders, welcome message, history, organizational structure

## 🔄 Reset Database

Untuk reset database dan fresh start:

```bash
cd backend
php artisan migrate:fresh --seed
```

## 🛠️ Development vs Production

### Development Mode
- Debug: `true`
- Detailed error messages
- Development server
- Hot reload untuk frontend

### Production Mode
- Debug: `false`
- Generic error messages
- Production web server (Apache/Nginx)
- Optimized build

## 📝 Environment Configuration

### Backend (.env)
```env
APP_NAME="Dinkes Kaltara"
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=sqlite
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RECAPTCHA_SITE_KEY=your-site-key
```

## 🐛 Troubleshooting

### Issue: Permission Denied
```bash
chmod +x setup-dev.sh start-dev.sh test-api.sh
```

### Issue: Database Locked
```bash
cd backend
php artisan cache:clear
php artisan config:clear
```

### Issue: Storage Permission
```bash
cd backend
chmod -R 775 storage bootstrap/cache
```

### Issue: Frontend Build Failed
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Port 8000 Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Atau gunakan port lain
php artisan serve --port=8080
```

## 📞 Support

Jika mengalami issues:
1. Periksa error messages dengan detail
2. Verifikasi semua prerequisites terinstall
3. Coba manual setup steps
4. Check file permissions untuk storage directories
5. Clear cache dan config

## 📚 Additional Documentation

- `DEV_SETUP.md` - Detailed setup guide
- `README.md` - General project information
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev

---

**Selamat Menggunakan! 🎉**

Untuk pertanyaan atau issues, silakan hubungi tim development.