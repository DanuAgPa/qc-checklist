Created At: 2026-11-15T16:32:20+07:00
Completed At: 2026-11-15T16:32:20+07:00
# QC Checklist Generator — Tahap 1: Fondasi
2: 
3: QC Checklist Generator adalah tools internal Quality Control untuk mencatat dan merekap hasil testing software.
4: Dokumen ini mencakup panduan setup dari nol untuk **Tahap 1**: Database (Prisma + PostgreSQL), Autentikasi (JWT + bcryptjs), Role-based Access Control (RBAC), dan Halaman Login & Kelola Pengguna.
5: 
6: ---
7: 
8: ## 1. Langkah Menjalankan dari Nol
9: 
10: ### Prasyarat
11: - Node.js 18+ (disarankan Node.js 20 atau 22)
12: - Docker Desktop (untuk PostgreSQL lokal via Docker) ATAU opsi runner lokal tanpa Docker.
13: 
14: ### Langkah Setup
15: 
16: 1. **Install dependensi:**
17:    ```bash
18:    npm install
19:    ```
20: 
21: 2. **Jalankan database PostgreSQL:**
22:    - **Opsi A (Docker Compose — disarankan):**
23:      ```bash
24:      docker compose up -d
25:      ```
26:    - **Opsi B (Tanpa Docker via runner lokal):**
27:      ```bash
28:      npm run db:local
29:      ```
30: 
31: 3. **Salin file environment:**
32:    ```bash
33:    cp .env.example .env
34:    # Di Windows PowerShell:
35:    Copy-Item .env.example .env
36:    ```
37:    Pastikan konfigurasi di `.env` sudah sesuai:
38:    ```env
39:    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qc_checklist"
40:    AUTH_SECRET="a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
41:    ```
42: 
43: 4. **Jalankan migrasi database:**
44:    ```bash
45:    npx prisma migrate dev
46:    ```
47: 
48: 5. **Jalankan seed database:**
49:    ```bash
50:    npx prisma db seed
Created At: 2026-11-15T16:11:23+07:00
Completed At: 2026-11-15T16:11:23+07:00
## 2. Daftar Akun Seed (Pengembangan)
Semua akun dev menggunakan password: `password123`
| Email | Password | Role | Hak Akses Menu |
|---|---|---|---|
| `tester@qc.local` | `password123` | **TESTER** | Input Testing, Riwayat |
| `pm@qc.local` | `password123` | **PRODUCT_MANAGER** | Riwayat, Dashboard, Pengguna (kelola akun) |
| `tester@qc.local` | `password123` | **TESTER** | Input Testing, Riwayat |
| `pm@qc.local` | `password123` | **PRODUCT_MANAGER** | Riwayat, Dashboard, Pengguna (kelola akun) |
Matriks hak akses:
| Halaman | TESTER | PRODUCT_MANAGER |
|---|---|---|
| Input Testing (`/input`) | ✅ simpan | ✅ simpan |
| Riwayat (`/riwayat`) | ✅ lihat | ✅ lihat |
| Dashboard (`/dashboard`) | ✅ lihat | ✅ lihat |
| Pengguna (`/pengguna`) | ❌ (403) | ✅ kelola |
---
## 3. Model Data
- **User** — `id`, `name`, `email` (unik), `passwordHash` (bcrypt), `role` (`TESTER` / `PRODUCT_MANAGER`), `isActive`, `createdAt`.
- **TestResult** — `id`, `sid`, `taskTitle`, `testerId`, `testedAt`, `environment` (`DEMO` / `PRODUCTION`), `status` (`PASS` / `FAIL`), `note`, `attemptNumber`, `createdAt`. Index pada `sid`.
- **LoginAttempt** — rate limiting login persisten (kunci 5 menit setelah 5 kegagalan beruntun).
Prinsip audit: data testing **append-only** — tidak pernah di-update atau di-delete dari aplikasi. Setiap input baru selalu menjadi baris baru; nomor percobaan (`attemptNumber`) dihitung di server (jumlah entri sebelumnya dengan sdg sama + 1).
---
## 4. Alur Fitur
### Input Testing (TESTER & PRODUCT_MANAGER)
- Validasi **zod** dijalankan di client (feedback instan) dan diulang di server action (sumber kebenaran).
- sdg di-trim dan diubah ke huruf besar, wajib diawali `sdg-` (contoh: `sdg-234`, `sdg-2024-001`).
- Field **Tester** terisi otomatis dari sesi login dan read-only.
- Tanggal default hari ini; Environment dan Status wajib; Catatan opsional (maks 2000 karakter).
- Bila entri terakhir untuk SID sudah **PASS**, server meminta konfirmasi *“SID ini sudah berstatus PASS. Tetap simpan sebagai retest?”* sebelum menyimpan.
- Setelah sukses: toast singkat dan form dikosongkan (Tester tetap terisi).
### Riwayat (semua role)
- Query ke database dengan search SID, urutan tanggal terbaru, pagination 20 baris per halaman.
- Badge attempt dari `attemptNumber`: `1` = **Test awal**, `2+` = **Retest ke-(N-1)**.
- Kolom Catatan dengan tombol **Selengkapnya**.
- **Export Excel (SheetJS)** mengekspor seluruh hasil yang cocok dengan filter/search aktif (bukan seluruh tabel). Nama file: `riwayat-testing-YYYY-MM-DD.xlsx`. Tombol disabled bila hasil kosong.
### Dashboard (TESTER & PRODUCT_MANAGER)
- Semua angka dihitung di server dengan query agregat Prisma (`count`, `groupBy`, dan `DISTINCT ON` untuk entri terakhir per SID) — bukan dihitung di client.
- Filter environment dan rentang tanggal lewat searchParams (`?env=production&from=2026-01-01&to=2026-01-31`) sehingga URL bisa di-bookmark.
- Persentase keberhasilan = total PASS / total entri × 100% (setiap entri, termasuk retest, dihitung terpisah) — definisi ditampilkan di bawah kartu.
- 4 kartu ringkasan, breakdown per environment, breakdown per tester, dan daftar **SID Belum Resolved** (SID yang entri terakhirnya FAIL).
---
## 5. Token Desain
- Aksen: `#1E3A5F` (hover `#2D5580`).
- Background: `#F7F8FA`.
- Card: `#FFFFFF` border `#E2E5EA`, radius 10/8/6px, shadow `0 1px 2px rgba(0,0,0,0.04)`.
- PASS: teks `#15803D` bg `#DCFCE7`.
- FAIL: teks `#B91C1C` bg `#FEE2E2`.
- Badge Retest: teks `#57534E` bg `#F5F5F4`.
- Typography: `Inter` untuk UI dan `JetBrains Mono` untuk SID & angka via `next/font`.
---
## 6. Struktur Proyek (Ringkas)
```
prisma/               schema.prisma, migrasi, seed.ts
proxy.ts              proteksi route + role check (edge)
lib/                  db, auth (JWT), password, access, validation (zod), format
app/login             halaman login
app/(protected)/
input/              Input Testing (client form + server action)
riwayat/            Riwayat (server page + tabel client + export)
dashboard/          Dashboard Rekap (server page + filter client)
pengguna/           Kelola Pengguna (PM)
app/api/              route handler auth & users
scripts/              runner PostgreSQL lokal (embedded)
```