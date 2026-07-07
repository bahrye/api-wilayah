# 🇮🇩 API Wilayah Indonesia

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Cloudflare%20Workers-orange.svg)
![Database](https://img.shields.io/badge/Database-Cloudflare%20D1-black.svg)
![Cache](https://img.shields.io/badge/Cache-Redis%20%2B%20CF-red.svg)

API open-source yang cepat, modern, dan gratis untuk mendapatkan data administratif wilayah Indonesia (Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan). Dibangun secara *serverless* di atas ekosistem **Cloudflare Pages / Workers**, ditenagai oleh **Cloudflare D1** dan dioptimasi menggunakan **Redis & Cloudflare Cache TTL (7 Hari)** untuk performa yang luar biasa cepat.

---

## ✨ Fitur Utama

- 🚀 **Super Cepat & Serverless**: Berjalan di *edge network* Cloudflare, memberikan latensi yang sangat rendah dari seluruh Indonesia.
- 💾 **Dual-Layer Caching**: Respons di-cache di Redis dan Edge Cache Cloudflare dengan durasi hingga 1 minggu, meminimalkan beban database hingga mendekati 0.
- 📂 **Data Lengkap**: Terdiri dari entitas Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan.
- 🛠 **Mudah Digunakan**: Endpoint RESTful yang simpel dengan respons format JSON.
- 🛡 **CORS Ready**: Middleware bawaan agar dapat diakses secara langsung dari frontend (web/mobile).

---

## 📖 Endpoint Dokumentasi

Base URL: `https://<domain-anda.com>/api`

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

## 🚀 Panduan Setup & Deploy

Proyek ini siap untuk dideploy ke **Cloudflare Pages**.

### Prasyarat
- Akun [Cloudflare](https://dash.cloudflare.com/)
- [Node.js](https://nodejs.org/) terinstall
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)

### Langkah Deployment
1. **Clone Repository**
   ```bash
   git clone https://github.com/bahrye/api-wilayah.git
   cd api-wilayah
   ```
2. **Konfigurasi Cloudflare D1**
   - Buat database D1 baru di dashboard Cloudflare Anda.
   - Perbarui file `wrangler.toml` dan sesuaikan nilai `database_id` dengan ID Database yang baru Anda buat.
3. **Deploy**
   ```bash
   npx wrangler pages deploy public --project-name api-wilayah-indo
   ```

---

## 🔒 Catatan Keamanan
- File `.wrangler/` dan konfigurasi *local-state* lainnya telah diabaikan dari repository ini untuk mencegah tereksposnya *blobs* database lokal ke publik.
- Pastikan variabel rahasia seperti konfigurasi Redis (jika ada) ditambahkan via Cloudflare Dashboard (Secrets), **bukan** di-hardcode ke dalam kode.

## 🤝 Kontribusi
Kami sangat terbuka dengan *Pull Request* atau *Issue* jika Anda menemukan *bug* atau ingin menambahkan fitur baru!

---
*Dibuat dengan ❤️ untuk developer Indonesia.*
