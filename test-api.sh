#!/bin/bash

# API Testing Script for Dinkes Application
# This script tests the public API endpoints without authentication

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000/api/public"

echo -e "${BLUE}========================================"
echo "Testing Dinkes Public API"
echo -e "========================================${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    echo -e "${YELLOW}Testing $name...${NC}"
    echo "GET $endpoint"

    response=$(curl -s "$endpoint")

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "$response" | head -c 200
        echo "..."
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
    echo ""
}

echo -e "${BLUE}Public Endpoints:${NC}"
echo ""

# Test berita endpoint
test_endpoint "Berita (News)" "$BASE_URL/berita"

# Test berita detail endpoint
test_endpoint "Berita Detail (ID: 1)" "$BASE_URL/berita/1"

# Test slider endpoint
test_endpoint "Slider" "$BASE_URL/slider"

# Test galeri endpoint
test_endpoint "Galeri" "$BASE_URL/galeri"

# Test video endpoint
test_endpoint "Video" "$BASE_URL/video"

# Test kategori endpoint
test_endpoint "Kategori" "$BASE_URL/kategori"

# Test pengumuman endpoint
test_endpoint "Pengumuman" "$BASE_URL/pengumuman"

# Test sejarah endpoint
test_endpoint "Sejarah" "$BASE_URL/sejarah"

# Test tugasfungsi endpoint
test_endpoint "Tugas & Fungsi" "$BASE_URL/tugasfungsi"

# Test struktur endpoint
test_endpoint "Struktur Organisasi" "$BASE_URL/struktur"

# Test sambutan endpoint
test_endpoint "Sambutan" "$BASE_URL/sambutan"

echo -e "${BLUE}========================================"
echo -e "${GREEN}API Testing Complete!${NC}"
echo -e "========================================${NC}"
echo ""
echo -e "${YELLOW}Note: Admin endpoints require authentication${NC}"
echo "To test admin endpoints, you need to:"
echo "1. Get a reCAPTCHA token from the frontend"
echo "2. Login via POST /api/auth/login"
echo "3. Use the returned JWT token in Authorization header"