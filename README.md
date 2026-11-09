# Mina -- 3D Creator

Landing page portofolio dengan Living Portrait (React + TypeScript + Tailwind CSS + Framer Motion + Lucide React).

## Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # hasil siap hosting ada di folder dist/
```

Perlu Node.js 18 ke atas dan koneksi internet (semua gambar diambil dari motionsites.ai, figma.site, dan images.higgs.ai).

## Deploy

- **Vercel / Netlify**: hubungkan repo, build command `npm run build`, output folder `dist`.
- **Hosting biasa (cPanel)**: jalankan `npm run build`, lalu unggah isi folder `dist/`.

## Struktur

```
src/
  App.tsx                     urutan section
  index.css                   style global + CSS Living Portrait (verbatim)
  lib/livingPortrait.ts       engine Living Portrait (verbatim dari spesifikasi)
  components/
    LivingPortrait.tsx        markup portret, memanggil engine sekali setelah mount
    FadeIn.tsx  AnimatedText.tsx  ContactButton.tsx  LiveProjectButton.tsx  Magnet.tsx
  sections/
    HeroSection.tsx  MarqueeSection.tsx  AboutSection.tsx  ServicesSection.tsx  ProjectsSection.tsx
```

## Yang perlu diganti

- Link tombol **Contact Me** (`src/components/ContactButton.tsx`, sekarang `#contact`) ke WhatsApp/email asli.
- Link tombol **Live Project** tiap proyek (`href` di `PROJECTS`, `src/sections/ProjectsSection.tsx`).

## Catatan teknis

- `React.StrictMode` sengaja tidak dipakai: engine portret mengikat DOM sekali saja.
- Tombol yang memakai kelas `contact-btn` otomatis memicu "heart eyes" saat di-hover.
- Komponen `Magnet` tersedia tetapi tidak dipakai di portret (sesuai spesifikasi).
