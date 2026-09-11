# 🔄 Panduan Migrasi & Sinkronisasi Data Wilayah ke Supabase

Dokumen ini berisi panduan untuk menyiapkan skema database dan memperbarui data wilayah administrasi Indonesia (berdasarkan Kepmendagri terbaru) beserta kodepos ke dalam database **Supabase** (pada skema terpisah `wilayah`).

Data diambil secara otomatis dari repositori open-source:
1. [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) (Data Wilayah)
2. [cahyadsn/wilayah_kodepos](https://github.com/cahyadsn/wilayah_kodepos) (Data Kodepos)

---

## 🛠️ Langkah 1: Jalankan DDL Skema di Supabase Dashboard

Sebelum memasukkan data atau menjalankan API, Anda perlu membuat schema, tabel, view, dan hak akses di Supabase:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih project Anda.
2. Buka menu **SQL Editor** di panel kiri.
3. Buka file [supabase/schema.sql](file:///c:/Users/ASUS/.gemini/antigravity-ide/scratch/api-wilayah/supabase/schema.sql) di proyek ini, salin seluruh isinya, lalu *paste* ke SQL Editor Supabase.
4. Klik tombol **Run** (Ctrl + Enter / Cmd + Enter).
5. Pastikan muncul pesan sukses (*Success. No rows returned*).

---

## ⚙️ Langkah 2: Tambahkan Schema 'wilayah' ke Exposed Schemas

Agar API PostgREST Supabase mengizinkan client membaca skema `wilayah`:

1. Di Supabase Dashboard, klik ikon gear **Project Settings** di pojok kiri bawah.
2. Pilih menu **API** (atau **Data API**).
3. Cari bagian **Exposed schemas** (atau *Extra search path*).
4. Tambahkan schema **`wilayah`** ke dalam daftar (sehingga menjadi `public, wilayah`).
5. Klik **Save**.

---

## 🚀 Langkah 3: Sinkronisasi / Seeding Data (~91.000 Wilayah & Kodepos)

Terdapat 2 metode untuk memasukkan data ke Supabase:

### Metode A: Upload Langsung via Script (Direkomendasikan)
Script akan secara otomatis mendownload data terbaru dari GitHub, memetakan kodepos, dan menguploadnya dalam batch via `@supabase/supabase-js`:

```bash
npm run sync:supabase
```
Script akan menampilkan progress bar secara *real-time* hingga seluruh 91.000+ data selesai tersinkronisasi.

### Metode B: Menggunakan File SQL (`seed_wilayah.sql`)
Jika Anda lebih suka mengeksekusi via SQL Editor atau `psql`:

1. Buat file SQL seeding:
   ```bash
   npm run sync:sql
   ```
   Sebuah file baru bernama `seed_wilayah.sql` akan di-generate.
2. Jalankan isi query `seed_wilayah.sql` melalui Supabase SQL Editor atau via `psql`.

---

## 🌐 Langkah 4: Menjalankan & Deploy API

### Uji Coba Lokal
Jalankan Cloudflare Pages secara lokal:
```bash
npx wrangler pages dev public
```
Buka browser di `http://localhost:8788` atau akses endpoint seperti `http://localhost:8788/api/provinsi`.

### Deploy ke Cloudflare Pages Production
Jalankan:
```bash
npm run deploy
```
*(Catatan: Jangan lupa menyematkan environment variable `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di pengaturan Settings -> Environment Variables pada dashboard Cloudflare Pages jika belum diset).*
