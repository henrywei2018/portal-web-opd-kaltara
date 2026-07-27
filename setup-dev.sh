#!/bin/bash

# Setup Development Environment for Dinkes Application
# This script will setup both backend and frontend for development

set -e  # Exit on error

echo "========================================"
echo "Setting Up Dinkes App Development Environment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check if PHP is installed
print_info "Checking PHP installation..."
if ! command -v php &> /dev/null; then
    print_error "PHP is not installed. Please install PHP first."
    exit 1
fi
print_success "PHP is installed"

# Check if Composer is installed
print_info "Checking Composer installation..."
if ! command -v composer &> /dev/null; then
    print_error "Composer is not installed. Please install Composer first."
    exit 1
fi
print_success "Composer is installed"

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_success "Node.js is installed"

# Check if npm is installed
print_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm is installed"

echo ""
echo "========================================"
echo "Backend Setup"
echo "========================================"

cd backend

# Install PHP dependencies
print_info "Installing PHP dependencies..."
if [ ! -d "vendor" ]; then
    composer install --no-interaction
    print_success "PHP dependencies installed"
else
    print_success "PHP dependencies already installed"
fi

# Setup database
print_info "Setting up database..."
if [ ! -f "database/database.sqlite" ]; then
    touch database/database.sqlite
    print_success "Database file created"
else
    print_success "Database file already exists"
fi

# Run migrations
print_info "Running database migrations..."
php artisan migrate --force
print_success "Migrations completed"

# Run seeders with fresh database
print_info "Running database seeders..."
php artisan migrate:fresh --seed
print_success "Seeders completed"

# Generate application key if not set
print_info "Checking application key..."
if ! grep -q "APP_KEY=base64:" .env; then
    php artisan key:generate
    print_success "Application key generated"
else
    print_success "Application key already set"
fi

# Clear and cache configs
print_info "Optimizing application..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
print_success "Application optimized"

# Create storage links if not exists
print_info "Creating storage links..."
if [ ! -L "public/storage" ]; then
    php artisan storage:link
    print_success "Storage links created"
else
    print_success "Storage links already exist"
fi

cd ..

echo ""
echo "========================================"
echo "Frontend Setup"
echo "========================================"

cd frontend

# Install Node dependencies
print_info "Installing Node dependencies..."
if [ ! -d "node_modules" ]; then
    npm install --silent
    print_success "Node dependencies installed"
else
    print_success "Node dependencies already installed"
fi

# Build frontend for production
print_info "Building frontend for development..."
npm run build
print_success "Frontend build completed"

cd ..

echo ""
echo "========================================"
echo "Setup Complete! 🎉"
echo "========================================"
echo ""
echo -e "${GREEN}Backend Setup:${NC}"
echo "  • Database: SQLite (backend/database/database.sqlite)"
echo "  • Admin Credentials:"
echo "    - Username: admin"
echo "    - Password: admin123"
echo "  • API URL: http://localhost:8000"
echo ""
echo -e "${GREEN}Frontend Setup:${NC}"
echo "  • Build output: frontend/dist/"
echo "  • API Base URL: http://localhost:8000/api"
echo ""
echo -e "${YELLOW}To start the development servers:${NC}"
echo "  1. Backend: cd backend && php artisan serve"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo -e "${YELLOW}To start only backend with frontend build:${NC}"
echo "  cd backend && php artisan serve"
echo "  Then access: http://localhost:8000"
echo ""
print_success "Development environment is ready!"