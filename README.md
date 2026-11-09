# Portofolio Aditya Dwi Setiawan

Website portofolio statis (HTML + CSS + JavaScript, tanpa build) dengan 3 halaman:

| Halaman | File |
|---|---|
| Beranda (profil ala CV + kartu keahlian) | `index.html` |
| Web Development | `web-development.html` |
| Editor Video | `editor-video.html` |
| **Panel admin tersembunyi** | `panel-aditya.html` |

Semua isi (teks ID/EN, harga, proyek, kontak, foto) ada di `data/content.json` dan bisa diedit lewat panel admin.

## Panel admin

Buka `https://<alamat-website>/panel-aditya.html`. Halaman ini tidak ditautkan di mana pun dan memakai `noindex`.

**Setup pertama kali**
1. Buat *fine-grained token* di https://github.com/settings/personal-access-tokens/new
   - Repository access: *Only select repositories* → `Setiawan1717/portofolio-aditya`
   - Permissions → Repository → **Contents: Read and write**
2. Buka panel, tempel token, buat password (min. 10 karakter).
3. Token disimpan **terenkripsi** (AES-GCM, kunci dari password lewat PBKDF2 600.000 iterasi) di `data/admin.json`. Setelah itu cukup masuk pakai password.

Setiap klik **Simpan & publikasikan**, panel membuat commit ke repo ini, lalu GitHub Pages memperbarui website dalam 1–2 menit. Gambar yang diunggah otomatis dikompres ke WebP dan disimpan di `assets/uploads/`.

Lupa password atau token kedaluwarsa? Buat token baru, lalu di layar login pilih *Setup ulang dengan token baru*.

## Hosting

Workflow `.github/workflows/deploy.yml` mempublikasikan repo ini ke GitHub Pages setiap ada push ke `main`.
Pastikan **Settings → Pages → Source = GitHub Actions**.

Domain sendiri (misalnya `.biz.id`): isi di Settings → Pages → Custom domain, lalu arahkan DNS sesuai petunjuk GitHub.

## Ubah tampilan

- Warna dan ukuran: variabel di bagian atas `assets/css/style.css`
- Teks tombol/menu (bukan konten): objek `UI` di `assets/js/site.js`
- Font: Inter Tight (self-hosted, lisensi OFL di `assets/fonts/`)
