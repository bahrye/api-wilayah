# 🇮🇩 API Wilayah Indonesia

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

API open-source yang cepat, modern, dan gratis untuk mendapatkan data administratif wilayah Indonesia (Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan).

---

## ✨ Fitur Utama

- 🚀 **Super Cepat**: Memberikan respons dengan latensi yang sangat rendah dari seluruh Indonesia.
- 📂 **Data Lengkap**: Terdiri dari entitas Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan.
- 🛠 **Mudah Digunakan**: Endpoint RESTful yang simpel dengan respons format JSON.
- 🛡 **CORS Ready**: Dapat diakses secara langsung dari aplikasi frontend (web/mobile).

---

## 📖 Endpoint Dokumentasi

Base URL: `https://api-wilayah-indo.pages.dev`

### 1. `GET /api/provinsi`
Mendapatkan seluruh daftar provinsi di Indonesia.
- **Response**: `[{ "kode": "11", "nama": "ACEH" }, ...]`

### 2. `GET /api/kabupaten?provinsi={kode_provinsi}`
Mendapatkan daftar kabupaten/kota berdasarkan kode provinsi.
- **Parameter**: `provinsi` (contoh: `11`)
- **Response**: `[{ "kode": "11.01", "nama": "KAB. ACEH SELATAN" }, ...]`

### 3. `GET /api/kecamatan?kabupaten={kode_kabupaten}`
Mendapatkan daftar kecamatan berdasarkan kode kabupaten/kota.
- **Parameter**: `kabupaten` (contoh: `11.01`)
- **Response**: `[{ "kode": "11.01.01", "nama": "BAKONGAN" }, ...]`

### 4. `GET /api/desa?kecamatan={kode_kecamatan}`
Mendapatkan daftar desa/kelurahan berdasarkan kode kecamatan.
- **Parameter**: `kecamatan` (contoh: `11.01.01`)
- **Response**: `[{ "kode": "11.01.01.2001", "nama": "KEUDE BAKONGAN" }, ...]`

### 5. `GET /api/detail?kode={kode_wilayah}`
Mendapatkan informasi detail nama suatu wilayah berdasarkan kodenya secara presisi.
- **Parameter**: `kode` (contoh: `11.01.01.2001`)
- **Response**: `{ "kode": "11.01.01.2001", "nama": "KEUDE BAKONGAN" }`

---
*Dibuat dengan ❤️ untuk developer Indonesia.*
