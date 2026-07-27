# Dinkes Application Architecture & Access Guide

## 🏗️ Application Architecture

### Full Stack Split Architecture

Aplikasi ini menggunakan arsitektur **Full Stack Terpisah**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                   Port: 5173 (Dev)                          │
├─────────────────────────────────────────────────────────────┤
│  • Public Website  (http://localhost:5173/*)               │
│  • Admin Panel      (http://localhost:5173/admin/*)        │
│  • Login Page       (http://localhost:5173/login)          │
│  • React Router     (Client-side routing)                  │
└─────────────────────────────────────────────────────────────┘
                             ↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Laravel)                         │
│                   Port: 8000                                │
├─────────────────────────────────────────────────────────────┤
│  • Public API      (/api/public/*)                          │
│  • Admin API       (/api/admin/*)                           │
│  • Auth API        (/api/auth/*)                            │
│  • SQLite Database                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 How to Access Admin Panel

### Step 1: Start Both Servers

**Option A: Using Automated Script**
```bash
./start-dev.sh
```

**Option B: Manual (Two Terminals)**

Terminal 1 - Backend:
```bash
cd backend
php artisan serve
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Step 2: Access Admin Panel

1. **Open Browser:** `http://localhost:5173`
2. **Go to Login:** `http://localhost:5173/login`  
3. **Login with:**
   - Username: `admin`
   - Password: `admin123`
4. **Access Dashboard:** Automatically redirects to `http://localhost:5173/admin/dashboard`

## 📡 Available Routes

### Frontend Routes (React Router)

**Public Routes:**
- `http://localhost:5173/` - Homepage
- `http://localhost:5173/berita` - News/Berita
- `http://localhost:5173/berita/:id` - Detail berita
- `http://localhost:5173/pengumuman` - Pengumuman
- `http://localhost:5173/galeri` - Gallery
- `http://localhost:5173/video` - Videos
- `http://localhost:5173/kontak` - Contact form
- `http://localhost:5173/sejarah` - History
- `http://localhost:5173/visi-misi` - Vision & Mission

**Admin Routes (Protected):**
- `http://localhost:5173/login` - Login page
- `http://localhost:5173/admin/dashboard` - Admin Dashboard
- `http://localhost:5173/admin/berita` - Manage News

### Backend API Routes (Laravel)

**Public API:**
- `GET /api/public/berita` - List berita
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
- `POST /api/public/kontak` - Contact form submit

**Auth API:**
- `POST /api/auth/login` - Login dengan reCAPTCHA
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

**Admin API (Requires Authentication):**
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/berita` - List berita (admin)
- `POST /api/admin/berita` - Create berita
- `GET /api/admin/berita/{id}` - Detail berita (admin)
- `PUT /api/admin/berita/{id}` - Update berita
- `DELETE /api/admin/berita/{id}` - Delete berita
- Dan lainnya untuk kategori, galeri, video, slider, user

## 🔄 Development Workflow

### Development Mode (Hot Reload)

**Frontend Development:**
```bash
cd frontend
npm run dev
```
- Hot reload enabled
- React DevTools available
- Fast refresh on changes

**Backend Development:**
```bash
cd backend
php artisan serve
```
- Auto-reload on PHP changes
- Detailed error messages
- Debug mode enabled

### Production Mode

**Frontend Production Build:**
```bash
cd frontend
npm run build
```
Build output di `frontend/dist/` - bisa di-serve dengan web server

**Backend Production:**
- Use production web server (Apache/Nginx)
- Configure environment variables
- Use production database (MySQL/PostgreSQL)

## 🎯 Common Tasks

### Test Admin Panel
1. Start servers: `./start-dev.sh`
2. Open: `http://localhost:5173/login`
3. Login: admin/admin123
4. Automatic redirect ke admin dashboard

### Test Public Website
1. Start servers: `./start-dev.sh`
2. Open: `http://localhost:5173`
3. Browse public pages

### Test API Only
1. Start backend only: `cd backend && php artisan serve`
2. Test endpoints: `./test-api.sh`
3. Access API: `http://localhost:8000/api/public/*`

### Development Changes

**Frontend Changes:**
- Edit files di `frontend/src/`
- Hot reload otomatis di browser
- React Fast Refresh

**Backend Changes:**
- Edit files di `backend/app/`
- Auto-reload oleh Laravel
- For route changes: `php artisan route:clear`

## 🐛 Troubleshooting

### Issue: Admin panel 404

**Wrong:** `http://localhost:8000/admin` (Laravel route)

**Correct:** 
1. `http://localhost:5173/login` (Login dulu)
2. Setelah login, auto-redirect ke `http://localhost:5173/admin/dashboard`

### Issue: Frontend tidak connect ke backend

**Check:**
1. Backend server running: `curl http://localhost:8000/api/public/berita`
2. Frontend .env: `VITE_API_BASE_URL=http://localhost:8000/api`
3. CORS enabled di backend

### Issue: Port conflicts

**Change ports:**

Backend:
```bash
php artisan serve --port=8080
```

Frontend (edit `vite.config.js`):
```javascript
server: {
  port: 3000
}
```

### Issue: Login failed

**Check:**
1. User exists: `php artisan tinker --execute="\App\Models\User::all()"`
2. reCAPTCHA disabled in development
3. Credentials: admin/admin123

## 📝 Environment Configuration

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RECAPTCHA_SITE_KEY=your-site-key
```

### Backend (.env)
```env
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=sqlite
FRONTEND_URL=http://localhost:5173
RECAPTCHA_SECRET=your-secret-key
```

## 🎉 Summary

**Architecture:** 
- Frontend React = User interface + Admin panel
- Backend Laravel = API + Database

**Access Pattern:**
1. Start both servers
2. Access everything via frontend: `http://localhost:5173`
3. Backend API called automatically by frontend
4. Admin panel is a React page, not Laravel route

**Key URLs:**
- Public site: `http://localhost:5173`
- Login: `http://localhost:5173/login`
- Admin dashboard: `http://localhost:5173/admin/dashboard` (after login)
- Backend API: `http://localhost:8000/api` (for testing only)

---

**Created:** 2026-06-17
**Status:** ✅ Architecture Documented