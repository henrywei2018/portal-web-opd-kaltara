# Development Setup Guide

## Prerequisites

Before starting, make sure you have the following installed:

- **PHP** (>= 8.2)
- **Composer** (>= 2.0)
- **Node.js** (>= 18.0)
- **npm** (>= 9.0)

### Installing Prerequisites

#### Ubuntu/Debian:
```bash
# Install PHP and required extensions
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-sqlite3 php8.2-mbstring php8.2-xml php8.2-curl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### macOS:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PHP, Composer, and Node.js
brew install php composer node
```

## Quick Start

### Automated Setup (Recommended)

Run the automated setup script:

```bash
./setup-dev.sh
```

This script will:
- Check all prerequisites
- Install backend dependencies
- Setup SQLite database
- Run migrations and seeders
- Install frontend dependencies
- Build frontend for development
- Optimize Laravel application

### Manual Setup

If you prefer manual setup or the automated script fails, follow these steps:

#### Backend Setup

1. **Install PHP Dependencies:**
```bash
cd backend
composer install
```

2. **Setup Environment:**
```bash
# Copy environment configuration
cp .env.example .env

# Generate application key
php artisan key:generate
```

3. **Setup Database:**
```bash
# Create SQLite database file
touch database/database.sqlite

# Run migrations
php artisan migrate

# Run seeders (this will create sample data and admin user)
php artisan db:seed
```

4. **Create Storage Links:**
```bash
php artisan storage:link
```

5. **Optimize Application:**
```bash
php artisan config:cache
php artisan route:cache
```

#### Frontend Setup

1. **Install Node Dependencies:**
```bash
cd frontend
npm install
```

2. **Build for Development:**
```bash
npm run build
```

3. **Development Mode (Optional):**
```bash
npm run dev
```

## Development Servers

### Backend Only (Recommended for Testing Build)

Start Laravel development server:

```bash
cd backend
php artisan serve
```

Access the application at: `http://localhost:8000`

### Full Stack Development

Run both backend and frontend development servers:

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
- Backend API: `http://localhost:8000`
- Frontend Dev: `http://localhost:5173`

## Database

### Default Database Connection

The application uses SQLite by default (`backend/database/database.sqlite`).

### Database Seeders

Running seeders will create:

1. **Admin User:**
   - Username: `admin`
   - Password: `admin123`
   - Level: 1 (Super Admin)
   - Status: Active

2. **Sample Categories:**
   - Umum
   - Kesehatan Masyarakat
   - Pelayanan Kesehatan
   - Obat dan Farmasi

3. **Sample News Articles:**
   - 2 published news articles with full content

4. **Sample Gallery Items:**
   - 2 gallery items with placeholder images

5. **Sample Videos:**
   - 1 educational video about hand washing

6. **Other Content:**
   - Sample announcements
   - Slider images
   - Welcome message
   - History and organizational structure info

### Reset Database

To reset the database and start fresh:

```bash
cd backend
php artisan migrate:fresh --seed
```

## File Structure

```
web-dinkes/
├── backend/                 # Laravel API Backend
│   ├── app/                # Application logic
│   ├── database/           # Database migrations and seeders
│   │   ├── migrations/     # Database migrations
│   │   ├── seeders/        # Database seeders
│   │   └── database.sqlite # SQLite database file
│   ├── public/             # Public accessible files
│   ├── resources/          # Views and raw assets
│   ├── routes/            # API routes
│   └── storage/            # Application storage
│       ├── app/           # Application files
│       └── framework/     # Framework files (cache, sessions, etc.)
├── frontend/              # React Frontend
│   ├── src/              # React source code
│   ├── dist/             # Built production files
│   └── public/           # Static assets
└── setup-dev.sh          # Automated setup script
```

## Environment Configuration

### Backend (.env)

Key configuration values:

```env
APP_NAME="Dinkes Kaltara"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

FRONTEND_URL=http://localhost:5173

# reCAPTCHA (Optional - set your own keys)
RECAPTCHA_SECRET=your-secret-key
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RECAPTCHA_SITE_KEY=your-site-key
```

## Common Issues

### Issue: Permission Denied on setup-dev.sh

**Solution:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

### Issue: Composer/Memory Limit

**Solution:**
```bash
composer install --memory-limit=-1
```

### Issue: Storage Permission

**Solution:**
```bash
cd backend
chmod -R 775 storage bootstrap/cache
```

### Issue: SQLite Database Locked

**Solution:**
```bash
cd backend
php artisan cache:clear
php artisan config:clear
```

### Issue: Frontend Build Failed

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Development Workflow

### Making Changes

1. **Backend Changes:**
   - Edit code in `backend/app/`
   - Changes are auto-reloaded by Laravel
   - For route changes: `php artisan route:clear`

2. **Frontend Changes:**
   - Edit code in `frontend/src/`
   - Development server auto-reloads
   - For production build: `npm run build`

### Testing

**Backend:**
```bash
cd backend
php artisan test
```

**Frontend:**
```bash
cd frontend
npm run lint
```

## Production Build

For production deployment:

1. **Backend:**
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

2. **Frontend:**
```bash
cd frontend
npm run build
```

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

## Support

If you encounter issues:
1. Check the error messages carefully
2. Verify all prerequisites are installed
3. Try the manual setup steps
4. Check file permissions for storage directories

## Admin Access

After setup, you can login to the admin panel at:
- URL: `http://localhost:8000/admin`
- Username: `admin`
- Password: `admin123`

**Important:** Change the default admin password after first login!