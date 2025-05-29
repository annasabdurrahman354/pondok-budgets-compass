# Proyek Pondok Budgets Compass

Aplikasi web internal administrasi yayasan untuk mengelola Rencana Anggaran Belanja (RAB) dan Laporan Pertanggungjawaban (LPJ) untuk semua "pondok" yang berada di bawah naungan yayasan.

## Info Proyek

**URL Proyek**: [https://pbcompass.vercel.app]

## Teknologi yang Digunakan

Proyek ini dibangun dengan:

* **Backend/Auth/DB**: Supabase
* **Frontend**: Vite, React, TypeScript, shadcn-ui, Tailwind CSS
* **Animasi**: Framer Motion (disebutkan dalam prompt, namun belum tentu terimplementasi di semua bagian)
* **Grafik/Statistik**: Recharts (digunakan dalam komponen dashboard)

## Struktur Database (Skema Supabase)

Berikut adalah gambaran umum tabel utama dalam database:

1.  **User Profile**: Menyimpan informasi pengguna (Admin Pusat dan Admin Pondok), terhubung dengan sistem autentikasi Supabase.
    * `id`: UUID (PK), foreign key ke `auth.users.id`
    * `email`: string
    * `nomor_telepon`: string
    * `nama`: string
    * `role`: enum (admin_pusat, admin_pondok)
    * `pondok_id`: UUID (bisa null untuk admin pusat)
2.  **pondok**: Informasi detail mengenai setiap pondok.
    * `id`: UUID (PK)
    * `nama`, `nomor_telepon`, `jenis` (ppm, pppm, boarding), `alamat`, `kode_pos`, `kota_id`, `provinsi_id`, `daerah_sambung_id`, `updated_at`, `accepted_at`.
3.  **pengurus**: Data pengurus yang terkait dengan setiap pondok.
    * `pondok_id`: FK
    * `nama`, `nomor_telepon`, `jabatan` (ketua, wakil\_ketua, dll.)
4.  **periode**: Mendefinisikan periode anggaran (format YYYYMM).
    * `id`: string (YYYYMM)
    * `tahun`, `bulan`
    * `awal_rab`, `akhir_rab`: datetime
    * `awal_lpj`, `akhir_lpj`: datetime
5.  **rab**: Menyimpan data Rencana Anggaran Belanja.
    * `pondok_id`, `periode_id`, `status` (diajukan, diterima, revisi), `saldo_awal`, `rencana_pemasukan`, `rencana_pengeluaran`, `dokumen_path`, `submitted_at`, `accepted_at`, `pesan_revisi`.
6.  **lpj**: Menyimpan data Laporan Pertanggungjawaban.
    * `pondok_id`, `periode_id`, `status` (diajukan, diterima, revisi), `saldo_awal`, `rencana_pemasukan`, `rencana_pengeluaran`, `realisasi_pemasukan`, `realisasi_pengeluaran`, `sisa_saldo`, `dokumen_path`, `submitted_at`, `accepted_at`, `pesan_revisi`.

## Alur Peran & Autentikasi

* Halaman Login tunggal untuk Admin Pusat dan Admin Pondok.
* Setelah login, pengguna akan diarahkan ke dashboard spesifik sesuai perannya dengan proteksi middleware.

## Fitur Utama

### Sinkronisasi Pertama Kali untuk Admin Pondok

1.  Saat login pertama, sistem akan memeriksa apakah data pondok terkait Admin Pondok sudah ada atau apakah `accepted_at` lebih baru dari `updated_at`. Jika tidak, Admin Pondok akan diarahkan untuk mengisi/memperbarui data pondok.
    * **Data Pondok**: `nama`, `nomor_telepon`, `alamat`, `kode_pos`, `jenis` (ppm, pppm, boarding), `kota_id`, `provinsi_id`, `daerah_sambung_id`.
    * **Data Pengurus Pondok**: (minimal satu entri) `nama`, `nomor_telepon`, `jabatan` (Ketua, Wakil Ketua, Pinisepuh, Sekretaris, Bendahara, Guru).
2.  Setelah pengiriman, `updated_at` akan diisi dengan waktu sekarang. Admin Pondok perlu menunggu Admin Pusat untuk mengisi `accepted_at`.
3.  Selama menunggu verifikasi, pembuatan RAB/LPJ akan dinonaktifkan, dan akan muncul pesan "Menunggu verifikasi data pondok pesantren." di dashboard.

### Proses RAB & LPJ per Bulan (Admin Pondok)

* Entitas `periode` (YYYYMM) menentukan jadwal buka/tutup pengisian RAB dan LPJ.
* **Admin Pondok**:
    1.  Jika periode RAB sedang dibuka (`awal_rab < sekarang < akhir_rab`), Admin Pondok dapat mengisi RAB untuk periode tersebut.
    2.  **Pembuatan RAB**: Untuk bulan berikutnya (contoh: Mei 2025 = 202505).
        * `saldo_awal` dihitung dari `sisa_saldo` LPJ periode sebelumnya (bisa diisi manual jika tidak ada LPJ).
        * Mengisi field: `rencana_pemasukan`, `rencana_pengeluaran`.
        * Mengunggah dokumen pendukung ke bucket `bukti_rab` (nama file: `rab-{periode}-{nama_pondok}-{string_acak_4_digit}.extensi`).
    3.  Jika periode LPJ sedang dibuka (`awal_lpj < sekarang < akhir_lpj`), Admin Pondok dapat mengisi LPJ.
    4.  **Pembuatan LPJ**: Untuk periode yang sama.
        * Data `saldo_awal`, `rencana_pemasukan`, `rencana_pengeluaran` diambil dari RAB periode yang sama (bisa diisi manual jika RAB tidak ada).
        * Admin Pondok mengisi: `realisasi_pemasukan`, `realisasi_pengeluaran`.
        * `sisa_saldo` dihitung otomatis (`saldo_awal` + `realisasi_pemasukan` - `realisasi_pengeluaran`).
        * Mengunggah dokumen pendukung ke bucket `bukti_lpj` (nama file: `lpj-{periode}-{nama_pondok}-{string_acak_4_digit}.extensi`).
        * Saat submit: `status` = `diajukan`, `submit_at` = sekarang, `accepted_at` = null.
* Tombol untuk membuat RAB/LPJ hanya aktif selama periode yang telah dikonfigurasi. Di luar periode tersebut, tombol akan nonaktif dan muncul peringatan.

### Dasbor & Manajemen

* **UI Admin Pondok (Navigasi Bawah)**: Dashboard, RAB, LPJ, Akun.
    * **Dashboard**: Salam, info periode berjalan, status pembukaan RAB/LPJ, status dan total RAB & LPJ bulan ini.
    * **Akun**: Lihat/edit profil sendiri & data pondok (perubahan data pondok memerlukan re-approval).
    * **Halaman RAB**: Daftar RAB pondok diurutkan berdasarkan periode. RAB dapat dihapus selama statusnya belum `diterima` (dengan peringatan, dan dokumen di storage juga dihapus). Tombol tambah "+" nonaktif hingga data pondok disetujui & periode RAB dibuka.
    * **Halaman LPJ**: Daftar LPJ pondok diurutkan berdasarkan periode. LPJ dapat dihapus selama statusnya belum `diterima` (dengan peringatan, dan dokumen di storage juga dihapus). Tombol tambah "+" nonaktif hingga data pondok disetujui & periode LPJ dibuka.
* **UI Admin Pusat (Sidebar)**: Dashboard, RAB, LPJ, Periode, Pondok.
    * **Dashboard**: Statistik agregat (total RAB & LPJ bulan ini dari semua pondok). Tab untuk daftar LPJ dan RAB semua pondok bulan ini, dengan fitur pencarian berdasarkan nama pondok, filter status RAB/LPJ, dan filter jenis pondok.
    * **Halaman RAB & LPJ**: Filter berdasarkan periode (default periode sekarang), pencarian pondok, tab berdasarkan status. Daftar pondok yang belum submit. Halaman detail memungkinkan Admin Pusat untuk `Setujui` (mengisi `accepted_at` dengan waktu sekarang) atau `Minta Revisi` (mengisi `pesan_revisi`). Dokumen dapat diunduh. Admin juga dapat menghapus RAB dan LPJ (dengan peringatan, dan dokumen di storage juga dihapus).
    * **Manajemen Periode**: Membuat/mengedit periode (YYYYMM, tanggal mulai & akhir RAB & LPJ). Halaman detail menampilkan daftar RAB dan LPJ terkait, serta daftar pondok yang belum submit RAB/LPJ untuk periode tersebut.
    * **Manajemen Pondok**: Operasi CRUD untuk data pondok & pengguna Admin Pondok terkait.

## Bagaimana Cara Mengedit Kode Ini?

Ada beberapa cara untuk mengedit aplikasi Anda.

**Gunakan IDE Pilihan Anda**

Jika Anda ingin bekerja secara lokal menggunakan IDE Anda sendiri, Anda dapat meng-clone repo ini dan melakukan push perubahan. Perubahan yang di-push juga akan tercermin di Lovable.

Satu-satunya syarat adalah Node.js & npm terinstal - [instal dengan nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Ikuti langkah-langkah berikut:

```sh
# Langkah 1: Clone repositori menggunakan URL Git proyek.
git clone https://github.com/annasabdurrahman354/pondok-budgets-compass.git

# Langkah 2: Navigasi ke direktori proyek.
cd pondok-budgets-compass

# Langkah 3: Instal dependensi yang diperlukan.
npm i

# Langkah 4: Jalankan server pengembangan dengan auto-reloading dan pratinjau instan.
npm run dev
