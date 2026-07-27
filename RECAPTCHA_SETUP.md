# reCAPTCHA Setup & Bypass Guide

## 🔒 reCAPTCHA Error: "Kunci situs tidak valid"

Jika Anda mendapatkan error "KESALAHAN untuk pemilik situs: Kunci situs tidak valid", ini berarti reCAPTCHA component mencoba memuat dengan kunci yang tidak valid atau domain tidak terdaftar di Google reCAPTCHA console.

## ✅ Solution: reCAPTCHA Bypass untuk Development

### Current Configuration (Development Bypass)

**Backend (.env):**
```env
BYPASS_RECAPTCHA=true
```

**Frontend (.env):**
```env
VITE_REQUIRE_RECAPTCHA=false
```

Dengan konfigurasi ini:
- ✅ **Backend**: Tidak memvalidasi reCAPTCHA token
- ✅ **Frontend**: Tidak menampilkan reCAPTCHA component
- ✅ **Login**: Langsung bisa login tanpa reCAPTCHA

## 🧪 Test Login Tanpa reCAPTCHA

**1. Restart Frontend Development Server:**
```bash
cd frontend
npm run dev
```

**2. Login ke Admin Panel:**
- URL: `http://localhost:5173/login`
- Username: `admin`
- Password: `admin123`

**3. Tidak akan muncul:**
- ❌ reCAPTCHA component
- ❌ Error "Kunci situs tidak valid"
- ❌ reCAPTCHA challenge

**4. Langsung login berhasil! ✅**

## 🔧 Jika Ingin Menggunakan reCAPTCHA (Production)

### Option 1: Gunakan Test Key (Google Official)

**Frontend (.env):**
```env
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqoHc1LFd9bmBG8x-f9cjOV
VITE_REQUIRE_RECAPTCHA=true
```

**Backend (.env):**
```env
RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxKoZN3UYGQdzj6tU
BYPASS_RECAPTCHA=false
```

Ini adalah **test site key** dari Google yang akan selalu valid untuk testing di localhost.

### Option 2: Daftar ke Google reCAPTCHA

**1. Daftar ke Google reCAPTCHA:**
- URL: https://www.google.com/recaptcha/admin
- Pilih: reCAPTCHA v2
- Domain: `localhost` (untuk development)

**2. Update Environment Variables:**

**Frontend (.env):**
```env
VITE_RECAPTCHA_SITE_KEY=your-actual-site-key
VITE_REQUIRE_RECAPTCHA=true
```

**Backend (.env):**
```env
RECAPTCHA_SECRET=your-actual-secret-key
BYPASS_RECAPTCHA=false
```

## 🎯 Recommended Configuration

### Development Environment (Current)
```env
# Frontend (.env)
VITE_REQUIRE_RECAPTCHA=false

# Backend (.env)
BYPASS_RECAPTCHA=true
```

### Production Environment
```env
# Frontend (.env)
VITE_REQUIRE_RECAPTCHA=true
VITE_RECAPTCHA_SITE_KEY=your-production-site-key

# Backend (.env)
BYPASS_RECAPTCHA=false
RECAPTCHA_SECRET=your-production-secret-key
```

## 🐛 Troubleshooting

### Issue: Masih muncul error "Kunci situs tidak valid"

**Solution:**
1. **Restart frontend server** (penting!):
   ```bash
   cd frontend
   # Kill existing server
   pkill -f "npm run dev"
   # Start again
   npm run dev
   ```

2. **Verify environment variables:**
   ```bash
   cd frontend
   grep VITE_REQUIRE_RECAPTCHA .env
   ```
   Harus output: `VITE_REQUIRE_RECAPTCHA=false`

3. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows/Linux) atau `Cmd + Shift + R` (Mac)
   - Atau buka incognito/private window

### Issue: Backend masih butuh reCAPTCHA token

**Solution:**
```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

### Issue: reCAPTCHA component masih muncul

**Check:**
1. Frontend `.env`: `VITE_REQUIRE_RECAPTCHA=false`
2. Restart frontend server
3. Clear browser cache

## 📝 Current Status

**Development Mode:**
- ✅ reCAPTCHA: **Disabled**
- ✅ Login: **Direct** (username/password only)
- ✅ Error "Kunci situs tidak valid": **Fixed**
- ✅ Admin access: **Working**

**To Enable reCAPTCHA:**
1. Set `VITE_REQUIRE_RECAPTCHA=true` di frontend `.env`
2. Set `BYPASS_RECAPTCHA=false` di backend `.env`
3. Restart frontend server
4. Use test site key atau register production key

## 🚀 Quick Start (Current Setup)

```bash
# Backend sudah running dengan BYPASS_RECAPTCHA=true
cd backend && php artisan serve

# Frontend - restart agar environment variables ter-load
cd frontend
npm run dev

# Login ke admin
# URL: http://localhost:5173/login
# Username: admin
# Password: admin123
# Tidak perlu reCAPTCHA! ✅
```

---

**Created:** 2026-06-17
**Status:** ✅ reCAPTCHA Bypass Active
**Note:** Error "Kunci situs tidak valid" sudah diperbaiki dengan conditional rendering