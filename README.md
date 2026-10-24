# ifs24047-pabwe2026-proyek-frontend — Aplikasi Koleksi Resep Masakan

SvelteKit + Svelte 5 + TypeScript + Tailwind 4 (runtime Bun, `adapter-bun`). Data diambil dari backend Express di repo terpisah `ifs24047-pabwe2026-proyek-backend` (jalankan backend lebih dulu).

## Menjalankan
```bash
git clone <URL-REPO-FRONTEND>
cd ifs24047-pabwe2026-proyek-frontend
bun install
cp .env.example .env     # isi VITE_API_BASEURL dengan URL backend
bun run dev              # http://localhost:3000
bun run test:coverage
bun run build && bun start
```

## Variabel lingkungan
| Variabel | Fungsi | Contoh |
| --- | --- | --- |
| `VITE_API_BASEURL` | URL backend (tanpa `/api`) | `http://localhost:8000` |
| `APP_PORT` | Port server dev/produksi | `3000` |

## Akun
Daftar lewat halaman **Daftar**, atau pakai akun contoh dari backend: `demo@resep.id` / `demo1234`. Hanya pemilik resep yang bisa mengubah atau menghapusnya; tambah resep butuh login.

## Alur halaman
Tamu hanya melihat halaman **Masuk/Daftar**. Setelah login baru tampil beranda; navbar menampilkan profil (`/profile`) dan tombol **Keluar**, yang membawa kembali ke halaman Masuk.

## Halaman
`/auth/login` · `/auth/register` · `/profile` profil + resep saya · `/` daftar + cari + filter kategori · `/recipes/new` tambah · `/recipes/[id]` detail · `/recipes/[id]/edit` ubah.


