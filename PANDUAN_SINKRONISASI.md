# 🔄 Panduan Sinkronisasi Data Wilayah & Kodepos

Dokumen ini berisi panduan untuk memperbarui data wilayah administrasi Indonesia (berdasarkan Kepmendagri terbaru) dan kodepos ke dalam database Cloudflare D1 Anda. 

Data diambil secara otomatis dari repositori open-source:
1. [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) (Untuk Data Wilayah)
2. [cahyadsn/wilayah_kodepos](https://github.com/cahyadsn/wilayah_kodepos) (Untuk Data Kodepos)

---

## 🛠️ Langkah 1: Generate File SQL Pembaruan

Langkah pertama adalah menarik data terbaru dari repositori GitHub di atas dan meramunya menjadi satu file SQL khusus yang kompatibel dengan Cloudflare D1.

Jalankan perintah berikut di terminal Anda (pastikan Anda berada di direktori proyek `api-wilayah`):

```bash
node sync_github_data.js
```

**Hasil yang diharapkan:**
Script akan berjalan selama beberapa detik/menit untuk mengunduh dan memproses puluhan ribu data. Setelah selesai, Anda akan melihat pesan berhasil, dan sebuah file baru bernama **`sync_updates.sql`** akan muncul di dalam folder proyek Anda.

---

## 💻 Langkah 2: Eksekusi ke Database (Lokal / Uji Coba)

Sebelum menerapkan pembaruan ke *production*, sangat disarankan untuk mengujinya di database lokal Wrangler (D1) Anda.

Jalankan perintah ini untuk memasukkan data ke database lokal:

```bash
npx wrangler d1 execute wilayah-db --local --file=sync_updates.sql
```

*(Catatan: Proses ini mungkin membutuhkan waktu beberapa saat karena mengeksekusi puluhan ribu baris query SQL).*

---

## 🚀 Langkah 3: Eksekusi ke Database (Production)

Jika Anda sudah yakin data di lokal aman dan aplikasi berjalan normal, Anda bisa langsung menerapkan pembaruan tersebut ke database D1 *Production* yang ada di Cloudflare.

Jalankan perintah ini:

```bash
npx wrangler d1 execute wilayah-db --remote --file=sync_updates.sql
```

Tunggu hingga proses selesai. Selamat! API Wilayah Anda kini sudah menggunakan data administrasi dan kodepos paling *up-to-date*.

---

## ⚠️ Catatan Penting

1. **Jangan mengubah nama tabel di script**: Script `sync_github_data.js` diasumsikan mengeksekusi `INSERT/UPDATE` ke dalam tabel bernama `wilayah`. Pastikan skema tabel D1 Anda memiliki kolom `kode`, `nama`, `tipe`, dan `kodepos`.
2. **Koneksi Internet**: Script membutuhkan koneksi internet yang stabil untuk mengunduh file `.sql` berukuran besar dari GitHub.
3. **Penyimpanan SQL**: File `sync_updates.sql` yang di-generate bisa berukuran cukup besar. Jika tidak dibutuhkan lagi untuk *tracking* atau *history*, Anda bisa mengabaikannya di git dengan memasukkannya ke dalam `.gitignore`.
