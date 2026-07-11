# 🇮🇩 API Wilayah Indonesia & Kode Pos

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform: Cloudflare Pages](https://img.shields.io/badge/Platform-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Database: Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare%20D1-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Tech Stack: JavaScript](https://img.shields.io/badge/Tech%20Stack-JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Contributor: Syamsul Bahri](https://img.shields.io/badge/Contributor-Syamsul%20Bahri-blue?logo=github)](https://wa.me/qr/FMVS3NLDIRUAA1)

API open-source yang cepat, modern, gratis, dan siap pakai untuk mendapatkan data administratif wilayah Indonesia (Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan) beserta data Kode Pos. Aplikasi ini dibangun secara serverless menggunakan **Cloudflare Pages Functions** dan **Cloudflare D1 SQLite Database**.

---

## ⚡ Fitur Utama

- 🚀 **Super Cepat**: Berjalan di infrastruktur global Cloudflare dengan latensi super rendah (< 50ms) dan auto-cached.
- 📂 **Data Lengkap & Up-to-date**: Sinkron dengan data administratif Kemendagri terbaru dan data kode pos Indonesia.
- 🔗 **Hierarki Wilayah Presisi**: Hasil pencarian mengembalikan data relasional (misal: mencari desa akan memuat info provinsi, kabupaten, dan kecamatan terkait).
- 📮 **Pencarian Kode Pos**: Cari wilayah administrasi langsung berdasarkan 5 digit kode pos.
- 📊 **Rekap & Statistik**: Endpoint untuk agregasi data provinsi serta statistik keseluruhan data secara real-time.
- 🛡️ **CORS & JSON Ready**: Header `Access-Control-Allow-Origin: *` aktif sehingga dapat langsung dikonsumsi di frontend (Web/Mobile/Desktop).

---

## 🚀 Base URL

Semua request dimulai dengan base URL berikut:

```http
https://api-wilayah-indo.pages.dev
```

*💡 Catatan: Salin endpoint atau kode integrasi dengan mengeklik tombol **Copy/Salin** di pojok kanan atas setiap blok kode di bawah ini.*

---

## 📖 Endpoint Dokumentasi

### 1. Get Semua Provinsi
Mendapatkan daftar seluruh provinsi di Indonesia.
* **Endpoint:** `GET /api/provinsi`
* **Contoh Request:**
  ```bash
  curl -X GET https://api-wilayah-indo.pages.dev/api/provinsi
  ```
* **Contoh Response JSON:**
  ```json
  [
    {
      "kode": "11",
      "nama": "ACEH",
      "tipe": "PROVINSI"
    },
    {
      "kode": "12",
      "nama": "SUMATERA UTARA",
      "tipe": "PROVINSI"
    }
  ]
  ```

---

### 2. Get Kabupaten/Kota berdasarkan Provinsi
Mendapatkan daftar kabupaten/kota di bawah provinsi tertentu.
* **Endpoint:** `GET /api/kabupaten?provinsi={kode_provinsi}`
* **Parameter Query:**
  * `provinsi` (Wajib, 2 digit): Kode provinsi (contoh: `11` untuk Aceh)
* **Contoh Request:**
  ```bash
  curl -X GET "https://api-wilayah-indo.pages.dev/api/kabupaten?provinsi=11"
  ```
* **Contoh Response JSON:**
  ```json
  [
    {
      "nama_provinsi": "ACEH",
      "kode": "11.01",
      "nama": "KAB. ACEH SELATAN",
      "tipe": "KABUPATEN"
    },
    {
      "nama_provinsi": "ACEH",
      "kode": "11.71",
      "nama": "KOTA BANDA ACEH",
      "tipe": "KOTA"
    }
  ]
  ```

---

### 3. Get Kecamatan berdasarkan Kabupaten
Mendapatkan daftar kecamatan di bawah kabupaten/kota tertentu.
* **Endpoint:** `GET /api/kecamatan?kabupaten={kode_kabupaten}`
* **Parameter Query:**
  * `kabupaten` (Wajib, 5 karakter): Kode kabupaten/kota (contoh: `11.01`)
* **Contoh Request:**
  ```bash
  curl -X GET "https://api-wilayah-indo.pages.dev/api/kecamatan?kabupaten=11.01"
  ```
* **Contoh Response JSON:**
  ```json
  [
    {
      "nama_provinsi": "ACEH",
      "nama_kabupaten": "KAB. ACEH SELATAN",
      "kode": "11.01.01",
      "nama": "BAKONGAN",
      "tipe": "KECAMATAN"
    }
  ]
  ```

---

### 4. Get Desa & Kelurahan berdasarkan Kecamatan
Mendapatkan daftar desa/kelurahan beserta kode pos di bawah kecamatan tertentu.
* **Endpoint:** `GET /api/desa?kecamatan={kode_kecamatan}`
* **Parameter Query:**
  * `kecamatan` (Wajib, 8 karakter): Kode kecamatan (contoh: `11.01.01`)
* **Contoh Request:**
  ```bash
  curl -X GET "https://api-wilayah-indo.pages.dev/api/desa?kecamatan=11.01.01"
  ```
* **Contoh Response JSON:**
  ```json
  [
    {
      "nama_provinsi": "ACEH",
      "nama_kabupaten": "KAB. ACEH SELATAN",
      "nama_kecamatan": "BAKONGAN",
      "kode": "11.01.01.2001",
      "nama": "KEUDE BAKONGAN",
      "tipe": "DESA",
      "kodepos": "23773"
    }
  ]
  ```

---

### 5. Get Detail Nama & Lokasi Wilayah
Mendapatkan detail nama wilayah secara lengkap (provinsi, kabupaten, kecamatan, desa, tipe, kodepos) berdasarkan kodenya secara presisi.
* **Endpoint:** `GET /api/detail?kode={kode_wilayah}`
* **Parameter Query:**
  * `kode` (Wajib, panjang 2, 5, 8, atau 13 karakter): Contoh: `11.01.01.2001`
* **Contoh Request:**
  ```bash
  curl -X GET "https://api-wilayah-indo.pages.dev/api/detail?kode=11.01.01.2001"
  ```
* **Contoh Response JSON:**
  ```json
  {
    "nama_provinsi": "ACEH",
    "nama_kabupaten": "KAB. ACEH SELATAN",
    "nama_kecamatan": "BAKONGAN",
    "kode": "11.01.01.2001",
    "nama": "KEUDE BAKONGAN",
    "tipe": "DESA",
    "kodepos": "23773"
  }
  ```

---

### 6. Cari Wilayah berdasarkan Kode Pos
Mendapatkan daftar wilayah administratif yang terasosiasi dengan kode pos tertentu.
* **Endpoint:** `GET /api/kodepos?kodepos={kodepos}`
* **Parameter Query:**
  * `kodepos` (Wajib, 5 digit): Kode pos (contoh: `23773`)
* **Contoh Request:**
  ```bash
  curl -X GET "https://api-wilayah-indo.pages.dev/api/kodepos?kodepos=23773"
  ```
* **Contoh Response JSON:**
  ```json
  [
    {
      "nama_provinsi": "ACEH",
      "nama_kabupaten": "KAB. ACEH SELATAN",
      "nama_kecamatan": "BAKONGAN",
      "kode": "11.01.01.2001",
      "nama": "KEUDE BAKONGAN",
      "tipe": "DESA",
      "kodepos": "23773"
    }
  ]
  ```

---

### 7. Rekapitulasi Data Provinsi
Mendapatkan rangkuman jumlah kabupaten, kota, kecamatan, kelurahan, dan desa di setiap provinsi.
* **Endpoint:** `GET /api/rekapitulasi`
* **Contoh Request:**
  ```bash
  curl -X GET https://api-wilayah-indo.pages.dev/api/rekapitulasi
  ```
* **Contoh Response JSON:**
  ```json
  [
    {
      "provinsi_kode": "11",
      "provinsi_nama": "ACEH",
      "kabupaten": 18,
      "kota": 5,
      "kecamatan": 290,
      "kelurahan": 0,
      "desa": 6499
    }
  ]
  ```

---

### 8. Statistik Data Keseluruhan
Mendapatkan statistik total entitas wilayah yang tersimpan di dalam database secara real-time.
* **Endpoint:** `GET /api/stats`
* **Contoh Request:**
  ```bash
  curl -X GET https://api-wilayah-indo.pages.dev/api/stats
  ```
* **Contoh Response JSON:**
  ```json
  {
    "provinsi": 38,
    "kab_kota": 514,
    "kab_kota_split": {
      "KABUPATEN": 416,
      "KOTA": 98
    },
    "kecamatan": 7288,
    "desa_kel": 83794,
    "desa_kel_split": {
      "DESA": 75312,
      "KELURAHAN": 8482
    }
  }
  ```

---

## 🛠️ Cara Integrasi di Sisi Klien (Client Integration)

Berikut adalah beberapa contoh kode untuk memanggil API ini menggunakan berbagai bahasa pemrograman terpopuler:

<details>
<summary>🌐 JavaScript (Fetch API)</summary>

```javascript
fetch('https://api-wilayah-indo.pages.dev/api/provinsi')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```
</details>

<details>
<summary>🐘 PHP (cURL)</summary>

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api-wilayah-indo.pages.dev/api/provinsi");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$output = curl_exec($ch);
curl_close($ch);      

$data = json_decode($output, true);
print_r($data);
?>
```
</details>

<details>
<summary>🐍 Python (Requests)</summary>

```python
import requests

response = requests.get('https://api-wilayah-indo.pages.dev/api/provinsi')
if response.status_code == 200:
    data = response.json()
    print(data)
```
</details>

<details>
<summary>🐹 Go (net/http)</summary>

```go
package main

import (
	"io"
	"log"
	"net/http"
)

func main() {
	resp, err := http.Get("https://api-wilayah-indo.pages.dev/api/provinsi")
	if err != nil {
		log.Fatalln(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
	}

	log.Println(string(body))
}
```
</details>

---

## 💾 Skema Database SQLite (D1 Table Schema)

Struktur tabel database D1 (`wilayah`) adalah sebagai berikut:

```sql
CREATE TABLE wilayah (
  kode TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  tipe TEXT,
  kodepos TEXT
);
```

---

## 🔄 Pembaruan & Sinkronisasi Data Wilayah

Data wilayah disinkronkan secara otomatis dari data publik Kepmendagri dan kode pos open-source:
1. [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah)
2. [cahyadsn/wilayah_kodepos](https://github.com/cahyadsn/wilayah_kodepos)

Untuk melakukan sinkronisasi database D1 Anda secara manual, ikuti langkah-langkah berikut:

```bash
# 1. Generate file SQL pembaruan (sync_updates.sql) dari repositori GitHub
node sync_github_data.js

# 2. Terapkan pembaruan data ke database lokal (Uji Coba)
npx wrangler d1 execute wilayah-db --local --file=sync_updates.sql

# 3. Terapkan pembaruan data langsung ke database Production di Cloudflare
npx wrangler d1 execute wilayah-db --remote --file=sync_updates.sql
```
*💡 Selengkapnya silakan baca panduan lengkap pada berkas [PANDUAN_SINKRONISASI.md](PANDUAN_SINKRONISASI.md).*

---

## 💻 Pengembangan Lokal & Deployment

### Jalankan secara Lokal (Development)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan Server Development Wrangler
npx wrangler pages dev public --d1=DB
```

### Deployment ke Cloudflare Pages

```bash
npm run deploy
```

---

## 👥 Kontributor

Proyek ini dipelihara dan dikembangkan dengan penuh ❤️ untuk developer Indonesia.

| Nama Kontributor | Peran | Kontak |
| :--- | :--- | :---: |
| **Syamsul Bahri** | Pencipta & Pengembang Utama | [![Chat via WhatsApp](https://img.shields.io/badge/Chat%20WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/qr/FMVS3NLDIRUAA1) |

Hubungi kontributor melalui tombol WhatsApp di atas untuk berkontribusi, melaporkan bug, atau berdiskusi.

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Silakan baca berkas [LICENSE](LICENSE) untuk informasi lebih lanjut.
