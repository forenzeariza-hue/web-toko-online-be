# Backend — Toko Online

REST API produk (CRUD) untuk aplikasi toko online sederhana.
Stack: Node.js + Express + Mongoose + MongoDB.

## Prasyarat
- Node.js v20+
- MongoDB Community 7.0 (lokal, port 27017)

## Persyaratan Versi

| Komponen | Minimal | Catatan |
|----------|---------|---------|
| Node.js | 20.19 | disarankan LTS 20 atau 22 |
| npm | 10 | |
| MongoDB Community | 7.0 | lokal, port 27017 |

- **nvm (opsional):** `nvm install 20 && nvm use 20`
- **Versi yang diuji di mesin ini:** Node `v26.10.0`, npm `11.19.1`

Dideklarasikan juga di field `engines` pada `backend/package.json` (`node >=20.19.0`, `npm >=10`).

## 1. Install & jalankan MongoDB Community

**macOS (Homebrew):**

1. `brew tap mongodb/brew`
2. `brew trust mongodb/brew`
3. `brew install mongodb-community@7.0`
4. `brew services start mongodb-community@7.0`
5. Cek aktif: jalankan `mongosh`, jika masuk shell berarti berhasil
6. Hentikan (opsional): `brew services stop mongodb-community@7.0`

**Windows:**

1. Unduh MongoDB Community Server (MSI) dari `mongodb.com/try/download/community`
2. Jalankan installer, pilih "Complete", centang "Install MongoDB as a Service" (Run as Network Service)
3. Opsional: centang "Install MongoDB Compass" (GUI untuk melihat data)
4. Pastikan service berjalan: buka Services (Win+R, ketik `services.msc`), cek "MongoDB Server" berstatus Running. Jika belum: klik kanan > Start
5. Install MongoDB Shell (mongosh) dari `mongodb.com/try/download/shell`, lalu cek dengan perintah `mongosh`
6. Hentikan (opsional): klik kanan service > Stop

Koneksi database: `mongodb://127.0.0.1:27017/toko-online`.

## 2. Install dependency

```bash
cd backend
npm install
```

## 3. Isi `.env`
Salin `.env.example` menjadi `.env` lalu sesuaikan:

```
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/toko-online
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=isi-string-acak-panjang-dan-rahasia
JWT_EXPIRES_IN=7d
```

> `JWT_SECRET` wajib diganti dengan nilai acak, contoh: `openssl rand -hex 32`.
> Jangan pernah commit file `.env` (sudah masuk `.gitignore`).

## 4. Seed data contoh

Seeder dipisah per koleksi:

| Perintah | File | Fungsi |
|----------|------|--------|
| `npm run seed` | keduanya | Produk **dan** akun demo |
| `npm run seed:products` | `src/seed/seedProducts.js` | 6 produk contoh |
| `npm run seed:users` | `src/seed/seedUsers.js` | 1 akun demo |
| `npm run seed:reset` | keduanya dengan `--reset` | Hapus lalu isi ulang produk **dan** user |

`npm run seed` dan turunannya **tidak menghapus** data:

- **Produk**: hanya dimasukkan bila koleksi `products` masih kosong
  (pesan `Data produk sudah ada, seed produk dilewati`).
- **User demo**: hanya dibuat bila email-nya belum terdaftar
  (pesan `User demo sudah ada, seed user dilewati`). Akun lain tidak disentuh.

**Akun demo untuk login:**

| Email | Password |
|-------|----------|
| `demo@tokoonline.test` | `demo1234` |

Password demo disimpan sebagai hash bcrypt seperti user biasa. Ingin kredensial sendiri?
Set `SEED_USER_NAME`, `SEED_USER_EMAIL`, `SEED_USER_PASSWORD` sebelum menjalankan seed.

`npm run seed:reset` **menghapus** seluruh `products` **dan** `users` lalu mengisi ulang —
pakai hanya saat memang ingin mengembalikan ke kondisi demo bersih.
`npm start` dan `npm run dev` tidak menjalankan seed.

## 5. Jalankan server

```bash
npm start      # production
npm run dev    # dengan nodemon (auto-reload)
```

Server berjalan di `http://localhost:5001`. Cek cepat: `GET http://localhost:5001/`.

## Endpoint

Base URL: `/api/products`

| Method | Endpoint | Fungsi | Status sukses |
|--------|----------|--------|---------------|
| GET | `/api/products` | Ambil semua produk | 200 |
| GET | `/api/products/:id` | Ambil 1 produk | 200 |
| POST | `/api/products` | Tambah produk | 201 |
| PUT | `/api/products/:id` | Update produk | 200 |
| DELETE | `/api/products/:id` | Hapus produk | 200 |

Field product: `nama`, `deskripsi`, `harga`, `stok`, `gambar`, `kategori`.
Status error: `400` (data tidak valid), `404` (tidak ditemukan), `500` (server).
Format error: `{ "message": "...", "error": <opsional> }`.

### Auth (JWT)

Base URL: `/api/auth`

| Method | Endpoint | Fungsi | Status sukses |
|--------|----------|--------|---------------|
| POST | `/api/auth/register` | Daftar user baru | 201 |
| POST | `/api/auth/login` | Login, mengembalikan JWT | 200 |
| GET | `/api/auth/me` | Profil user (butuh token) | 200 |

Field user: `nama`, `email`, `password` (disimpan sebagai hash bcrypt, tidak pernah dikembalikan).
Status error auth: `400` (input tidak valid), `401` (kredensial/token salah), `409` (email sudah terdaftar),
`429` (terlalu banyak percobaan login/register).

### Proteksi route

| Method | Endpoint | Akses |
|--------|----------|-------|
| GET | `/api/products` | **Butuh** `Authorization: Bearer <token>` |
| GET | `/api/products/:id` | **Butuh** `Authorization: Bearer <token>` |
| POST / PUT / DELETE | `/api/products` | **Butuh** `Authorization: Bearer <token>` |
| POST | `/api/auth/register` | Publik |
| POST | `/api/auth/login` | Publik |
| GET | `/api/auth/me` | **Butuh** token |
| GET | `/api/health` | Publik |

Seluruh endpoint produk kini butuh login (LO3): data produk tidak bisa dibaca tanpa token.

Health check: `GET /api/health` → `200 { "status": "ok" }`.

> Rate limit `429` hanya berlaku untuk percobaan kredensial (`/api/auth/register` dan
> `/api/auth/login`): 20 request / 15 menit per IP. `/api/auth/me` **tidak** dibatasi
> karena dipanggil setiap kali halaman dimuat.

> Login memakai pesan error generik yang sama untuk email salah maupun password salah
> (`"Email atau password salah"`) agar tidak membocorkan email mana yang terdaftar.

## Testing
Buka `requests.http` (VS Code REST Client / IntelliJ HTTP Client) dan jalankan A1–A8 (auth) lalu T1–T9,
atau pakai curl/Postman.

> Semua request produk (T1–T9) butuh token: jalankan **A1** (register) atau **A4** (login) dulu,
> lalu salin nilai `data.token` dari response ke variabel `@token` di `requests.http`.
