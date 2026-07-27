# Panduan Crawling Data SIMPADKU
## Bapenda Provinsi Kalimantan Utara
**URL:** https://simpadku.bapendaku.net/

---

## Ringkasan Website

**SIMPADKU** (Sistem Informasi Monitoring Pendapatan Asli Daerah) adalah sistem monitoring pendapatan daerah Kalimantan Utara yang mencakup:

1. **PKB-BBNKB** - Pajak Kendaraan Bermotor & Bea Balik Nama Kendaraan Bermotor
2. **Air Permukaan (PAP)** - Pajak Air Permukaan
3. **Alat Berat (PAB)** - Pajak Alat Berat

---

## Struktur Endpoint API

### Endpoint Utama

| Jenis Data | Endpoint | Method | Parameter | Output |
|-----------|----------|--------|-----------|--------|
| PKB-BBNKB Realtime | `/get_realtime.php` | GET | `kd_wilayah`, `tanggal` | JSON |
| PKB-BBNKB Static | `/get_static.php` | GET | `kd_wilayah`, `tanggal` | JSON |
| Air Permukaan | `/get_realtime_pap.php` | GET | - | JSON |
| Alat Berat | `/get_realtime_pab.php` | GET | - | HTML |

---

## Detail Endpoint

### 1. PKB-BBNKB Realtime (`get_realtime.php`)

**URL:** `https://simpadku.bapendaku.net/get_realtime.php`

**Parameters:**
- `kd_wilayah` (optional): Kode wilayah
- `tanggal`: Format YYYY-MM-DD

**Kode Wilayah:**
| Kode | Wilayah |
|------|---------|
| `13` | UPTD TARAKAN |
| `14` | UPTD BULUNGAN |
| `16` | UPTD NUNUKAN |
| `17` | UPTD MALINAU |
| `27` | UPTD TANA TIDUNG |
| `80` | E-SAMSAT/SIGNAL |
| `00` | SEMUA UNIT LAYANAN |
| (kosong) | PROVINSI KALTARA |

**Contoh Request:**
```bash
curl -k "https://simpadku.bapendaku.net/get_realtime.php?kd_wilayah=&tanggal=2026-06-15"
```

**Format Response JSON:**
```json
{
  "wilayah": [
    {
      "TG_PROS_BAYAR": "2026-06-15",
      "KD_WIL": "13",
      "NM_KASIR": "TARAKAN",
      "BEA_BBN_POK": "0",
      "BEA_BBN_DEN": "0",
      "BEA_PKB_POK": "23049800",
      "BEA_PKB_DEN": "977200",
      "JUMLAH_BEA": "24027000",
      "JUMLAH_KB": "71"
    },
    ...
  ],
  "hari_ini": {
    "bbn_pok": 42550000,
    "bbn_den": 0,
    "pkb_pok": 65234000,
    "pkb_den": 1336200,
    "jum_bea": 109120200,
    "jum_kb": 174
  }
}
```

---

### 2. PKB-BBNKB Static (`get_static.php`)

**URL:** `https://simpadku.bapendaku.net/get_static.php`

**Parameters:** (sama dengan realtime)
- `kd_wilayah`
- `tanggal`

**Contoh Request:**
```bash
curl -k "https://simpadku.bapendaku.net/get_static.php?kd_wilayah=&tanggal=2026-06-15"
```

**Format Response JSON:**
```json
{
  "sd_hari_ini": {
    "BBN_POK": "27233865300",
    "BBN_DEN": "14851700",
    "PKB_POK": "27782356100",
    "PKB_DEN": "519317500",
    "JUM_BEA": "55550390600",
    "JUM_KB": "63015"
  },
  "target": {
    "bbnkb": "90000000000",
    "pkb": "96500000000",
    "persen_bbn": 30.26,
    "persen_pkb": 28.79
  }
}
```

---

### 3. Air Permukaan (`get_realtime_pap.php`)

**URL:** `https://simpadku.bapendaku.net/get_realtime_pap.php`

**Parameters:** Tidak ada (otomatis tanggal hari ini)

**Contoh Request:**
```bash
curl -k "https://simpadku.bapendaku.net/get_realtime_pap.php"
```

**Format Response JSON:**
```json
{
  "wilayah": {
    "13": {
      "wilayah": "TARAKAN",
      "pokok": "222.512.900",
      "denda": "0",
      "sanksi": "25.000",
      "target": "450.000.000",
      "persen": "49,45 %"
    },
    ...
  },
  "total": {
    "pokok": "3.480.272.500",
    "denda": "1.087.335",
    "sanksi": "1.400.000",
    "target": "5.750.000.000",
    "persen": "60,53 %"
  }
}
```

---

### 4. Alat Berat (`get_realtime_pab.php`)

**URL:** `https://simpadku.bapendaku.net/get_realtime_pab.php`

**Parameters:** Tidak ada

**Contoh Request:**
```bash
curl -k "https://simpadku.bapendaku.net/get_realtime_pab.php"
```

**Format Response:** HTML Table (perlu di-parse)

---

## Penting: Proteksi Website

Website ini memiliki proteksi anti-scraping. Untuk berhasil mengambil data:

1. **Session Required**: Kunjungi halaman utama dulu untuk mendapatkan cookie PHPSESSID
2. **User-Agent**: Gunakan User-Agent browser asli
3. **HTTPS verify**: Server menggunakan self-signed SSL, perlu bypass SSL verification

---

## Contoh Implementasi dengan Python

### Setup
```bash
pip install requests beautifulsoup4
```

### Script Dasar
```python
import requests
from datetime import datetime

# Disable SSL warning
requests.packages.urllib3.disable_warnings()

# Buat session
session = requests.Session()
session.verify = False  # Bypass SSL
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})

# Kunjungi main page dulu (wajib untuk cookie)
session.get('https://simpadku.bapendaku.net/')

# Set tanggal
tanggal = datetime.now().strftime('%Y-%m-%d')

# Ambil data PKB-BBNKB
response = session.get('https://simpadku.bapendaku.net/get_realtime.php', params={
    'kd_wilayah': '',
    'tanggal': tanggal
})

data = response.json()
print(data)
```

---

## Contoh dengan cURL

```bash
# 1. Ambil cookie dari main page
curl -k -c cookies.txt -A "Mozilla/5.0" "https://simpadku.bapendaku.net/" > /dev/null

# 2. Gunakan cookie untuk request data
curl -k -b cookies.txt -A "Mozilla/5.0" \
  "https://simpadku.bapendaku.net/get_realtime.php?tanggal=2026-06-15"
```

---

## Data yang Tersedia

### PKB-BBNKB Fields:
- `BEA_BBN_POK` - Bea Balik Nama Pokok
- `BEA_BBN_DEN` - Bea Balik Nama Denda
- `BEA_PKB_POK` - Pajak Kendaraan Bermotor Pokok
- `BEA_PKB_DEN` - Pajak Kendaraan Bermotor Denda
- `JUMLAH_BEA` - Jumlah total bea
- `JUMLAH_KB` - Jumlah Kendaraan Bermotor

### Air Permukaan Fields:
- `pokok` - Pajak pokok
- `denda` - Denda
- `sanksi` - Sanksi administrasi
- `target` - Target penerimaan
- `persen` - Persentase pencapaian

### Alat Berat Fields:
- `pokok` - Pajak pokok
- `denda` - Denda
- `target` - Target penerimaan
- `persen` - Persentase pencapaian

---

## Tips Crawling

1. **Rate Limiting**: Jangan request terlalu cepat, tunggu 1-2 detik antar request
2. **Tanggal**: Untuk data historis, gunakan parameter tanggal sesuai format YYYY-MM-DD
3. **Error Handling**: Endpoint mungkin return 403 jika session tidak valid, ulangi dari main page
4. **Data Format**: Angka dalam format Indonesia (titik sebagai pemisah ribuan), perlu dibersihkan

---

## Contoh Data Output (Sample)

**Data PKB-BBNKB per 2026-06-15:**

| Wilayah | BBN Pokok | PKB Pokok | Jumlah | KB |
|---------|-----------|-----------|--------|-----|
| TARAKAN | Rp 0 | Rp 23.049.800 | Rp 24.027.000 | 71 |
| TANJUNG SELOR | Rp 42.550.000 | Rp 22.003.100 | Rp 64.774.800 | 68 |
| NUNUKAN | Rp 0 | Rp 12.197.900 | Rp 12.285.200 | 23 |
| MALINAU | Rp 0 | Rp 3.234.000 | Rp 3.235.700 | 5 |
| TANA TIDUNG | Rp 0 | Rp 3.349.100 | Rp 3.385.200 | 5 |
| ESAMSAT | Rp 0 | Rp 1.502.700 | Rp 1.514.900 | 3 |

**Total Hari Ini:** Rp 109.222.800 | 175 KB

**Target:**
- BBNKB: Rp 90.000.000.000 (30.26%)
- PKB: Rp 96.500.000.000 (28.79%)
