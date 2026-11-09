/* ==========================================================
   Portofolio Aditya — script utama (tanpa library)
   Isi website diambil dari data/content.json
   (diedit lewat halaman admin tersembunyi).
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Teks antarmuka (bukan konten) ---------- */
  const UI = {
    id: {
      home: 'Beranda', about: 'Tentang', skills: 'Keahlian', web: 'Web Development', video: 'Editor Video', contact: 'Kontak',
      menu: 'Menu', scroll: 'Gulir', aboutEyebrow: 'Tentang saya', journey: 'Perjalanan', education: 'Pendidikan', experience: 'Pengalaman',
      skillsTitle: 'Yang saya kerjakan', services: 'Layanan', works: 'Karya pilihan', workEmpty: 'Karya segera hadir',
      prices: 'Paket harga', popular: 'Terpopuler', choose: 'Pesan paket ini',
      priceNoteWeb: 'Harga bisa menyesuaikan kebutuhan. Hubungi saya untuk penawaran khusus.',
      priceNoteVideo: 'Harga awal. Ada harga khusus untuk pesanan rutin atau beberapa video sekaligus.',
      process: 'Cara kerja', faq: 'Pertanyaan umum', testimonials: 'Kata klien',
      contactEyebrow: 'Kontak', contactTitle: 'Ayo kerja bareng.',
      contactText: 'Punya ide website, video, atau konten yang mau diwujudkan? Ceritakan saja, nanti saya balas dengan langkah selanjutnya.',
      startProject: 'Mulai proyek', orDirect: 'Atau hubungi langsung', talk1: 'Ayo', talk2: 'ngobrol.', getInTouch: 'Hubungi saya',
      formTitle: 'Mulai proyek', fName: 'Nama', fNamePh: 'Nama kamu', fNeed: 'Kebutuhan', fMsg: 'Ceritakan proyekmu', fMsgPh: 'Contoh: website untuk toko kue, 3 halaman, ada katalog…',
      sendWa: 'Kirim lewat WhatsApp', sendMail: 'Kirim lewat email', noContact: 'Kontak belum diisi oleh pemilik website.', needName: 'Isi nama dulu ya.',
      cv: 'Unduh CV', cvSoon: 'CV segera tersedia', visit: 'Kunjungi website', watch: 'Tonton karya', year: 'Tahun', role: 'Peran', category: 'Kategori',
      notLive: 'Link belum tersedia', close: 'Tutup', other: 'Lainnya', explore: 'Lihat detail', photoSoon: 'Foto segera',
      madeWith: 'Dibuat dengan HTML, CSS & JavaScript', preview: 'Mode pratinjau — perubahan belum disimpan', loadErr: 'Konten gagal dimuat. Coba muat ulang halaman.',
      deptHome: 'WEB / VIDEO', deptWeb: 'WEB DEPT.', deptVideo: 'VIDEO DEPT.', hello: 'Halo Aditya, saya', interest: 'Saya tertarik dengan'
    },
    en: {
      home: 'Home', about: 'About', skills: 'Skills', web: 'Web Development', video: 'Video Editor', contact: 'Contact',
      menu: 'Menu', scroll: 'Scroll', aboutEyebrow: 'About me', journey: 'Journey', education: 'Education', experience: 'Experience',
      skillsTitle: 'What I do', services: 'Services', works: 'Selected work', workEmpty: 'Work coming soon',
      prices: 'Pricing', popular: 'Popular', choose: 'Choose this plan',
      priceNoteWeb: 'Prices can be adjusted to your needs. Contact me for a custom quote.',
      priceNoteVideo: 'Starting prices. Special rates for recurring or bulk orders.',
      process: 'How it works', faq: 'FAQ', testimonials: 'What clients say',
      contactEyebrow: 'Contact', contactTitle: 'Work with me.',
      contactText: 'Have a website, video, or content idea in mind? Tell me about it and I\'ll get back to you with next steps.',
      startProject: 'Start a project', orDirect: 'Or reach me directly', talk1: 'Let’s', talk2: 'talk.', getInTouch: 'Get in touch',
      formTitle: 'Start a project', fName: 'Name', fNamePh: 'Your name', fNeed: 'Service', fMsg: 'Tell me about your project', fMsgPh: 'E.g. a 3-page website for a bakery with a catalog…',
      sendWa: 'Send via WhatsApp', sendMail: 'Send via email', noContact: 'Contact details have not been added yet.', needName: 'Please enter your name.',
      cv: 'Download CV', cvSoon: 'CV coming soon', visit: 'Visit website', watch: 'Watch', year: 'Year', role: 'Role', category: 'Category',
      notLive: 'Link not available yet', close: 'Close', other: 'Other', explore: 'View details', photoSoon: 'Photo soon',
      madeWith: 'Built with HTML, CSS & JavaScript', preview: 'Preview mode — changes not saved yet', loadErr: 'Content failed to load. Please refresh the page.',
      deptHome: 'WEB / VIDEO', deptWeb: 'WEB DEPT.', deptVideo: 'VIDEO DEPT.', hello: 'Hi Aditya, I’m', interest: 'I’m interested in'
    }
  };

  const PAGES = { home: 'index.html', web: 'web-development.html', video: 'editor-video.html' };
  const page = document.body.dataset.page || 'home';
  const app = document.getElementById('app');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let C = null;
  let lang = 'id';
  try { lang = localStorage.getItem('adt-lang') || 'id'; } catch (e) { /* abaikan */ }
  if (!UI[lang]) lang = 'id';

  /* ---------- Helper ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (v) => (v == null ? '' : typeof v === 'object' ? (v[lang] || v.id || '') : String(v));
  const T = (v) => esc(t(v));
  const u = (k) => UI[lang][k] || k;
  const safeUrl = (s) => { const v = String(s || '').trim(); return /^(https?:|mailto:|tel:|\.?\/?assets\/|data\/)/i.test(v) || /^[\w./-]+$/.test(v) ? v : ''; };
  const split = (text) => esc(text).split(/\s+/).map((w) => `<span class="split-word"><span>${w}</span></span>`).join(' ');
  const initials = () => (C.situs.nama || 'A').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const waNumber = () => { let n = String(C.situs.whatsapp || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '62' + n.slice(1); return n; };

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.6 2.3 4.3 5 4.5"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.2v.01M12 17v-3.8a2.2 2.2 0 0 1 4.4 0V17M12 10.5V17"/>',
    github: '<path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    x: '<path d="M4 4l16 16M20 4L4 20"/>',
    facebook: '<path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z"/>',
    whatsapp: '<path d="M3.5 20.5l1.4-4.3a8.5 8.5 0 1 1 3.1 3z"/><path d="M9 9.5c.3 2 2 3.8 4.2 4.4l1.1-1.2 1.8.9c-.3 1.2-1.3 1.7-2.4 1.6C10.5 14.8 8.6 12.6 8.2 10c-.1-1 .5-2 1.6-2.3l.9 1.8z" fill="currentColor" stroke="none"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ICON.email}</svg>`;

  /* ---------- Komponen ---------- */
  function socialsHTML() {
    const list = (C.sosial || []).filter((s) => safeUrl(s.url));
    if (C.situs.whatsapp) list.push({ platform: 'whatsapp', url: `https://wa.me/${waNumber()}` });
    if (C.situs.email) list.push({ platform: 'email', url: `mailto:${C.situs.email}` });
    if (!list.length) return '';
    return `<div class="socials">${list.map((s) => `<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener" aria-label="${esc(s.platform)}">${svg(String(s.platform).toLowerCase())}</a>`).join('')}</div>`;
  }

  function barcode(seed) {
    let h = 0; for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    let out = '';
    for (let i = 0; i < 28; i++) { h = (h * 1103515245 + 12345) >>> 0; out += `<i style="width:${1 + (h % 3)}px"></i>`; }
    return out;
  }

  let badgeSeq = 0;
  function badgeHTML(dept, start) {
    const s = C.situs;
    const id = `strap-${++badgeSeq}`;
    const nm = esc((s.nama || '').toUpperCase());
    const photo = safeUrl(s.foto)
      ? `<img src="${esc(safeUrl(s.foto))}" alt="${esc(s.nama)}" draggable="false">`
      : `<div class="badge-mono" aria-hidden="true">${esc(initials())}</div>`;
    return `<div class="badge-rig" data-badge data-start="${start}">
      <i class="badge-len" aria-hidden="true"></i>
      <div class="badge-swing">
        <svg class="strap" aria-hidden="true" focusable="false"><path class="strap-band" id="${id}"/><path class="strap-hi"/><text><textPath href="#${id}" startOffset="46">${nm} &#160;·&#160; ${nm} &#160;·&#160; ${nm}</textPath></text></svg>
        <div class="badge-hang">
          <div class="clip" aria-hidden="true"></div>
          <div class="badge-card" role="img" aria-label="Kartu ID ${esc(s.nama)} — bisa ditarik">
            <div class="badge-name">${esc(s.namaDepan || s.nama)}<em>${esc(s.namaBelakang || '')}</em></div>
            <div class="badge-photo">${photo}</div>
            <div class="badge-foot"><div class="barcode" aria-hidden="true">${barcode(s.idBadge || s.nama)}</div><div class="meta">ID: ${esc(s.idBadge || '0000')}<br>${esc(dept)}</div></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function headerHTML() {
    const L = (p, hash, label) => `<li><a href="${PAGES[p]}${hash || ''}">${esc(label)}</a></li>`;
    return `<header class="site-header" id="top">
      <a class="logo" href="${PAGES.home}" aria-label="${esc(C.situs.nama)} — ${esc(u('home'))}">${esc(String(C.situs.logo || 'aditya.').replace(/\.$/, ''))}<b>.</b></a>
      <div class="head-actions">
        <div class="lang-toggle" role="group" aria-label="Bahasa / Language">
          <button type="button" data-lang="id" aria-pressed="${lang === 'id'}">ID</button>
          <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button>
        </div>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(u('menu'))}"><span><i></i><i></i></span></button>
      </div>
    </header>
    <nav class="menu" id="menu" aria-label="${esc(u('menu'))}">
      <div class="wrap">
        <ol>
          ${L('home', '', u('home'))}
          ${L('home', '#tentang', u('about'))}
          ${L('home', '#keahlian', u('skills'))}
          ${L('web', '', u('web'))}
          ${L('video', '', u('video'))}
          <li><a href="#kontak">${esc(u('contact'))}</a></li>
        </ol>
        <div class="menu-foot">${socialsHTML()}<span class="muted">${T(C.situs.lokasi)}</span></div>
      </div>
    </nav>`;
  }

  function heroHome() {
    const b = C.beranda;
    const first = t((b.peran || [])[0]) || 'WEB DEVELOPER';
    return `<section class="hero" aria-label="${esc(C.situs.nama)}" style="padding-top:12px;padding-bottom:0">
      <div class="hero-panel">
        ${badgeHTML(u('deptHome'), 0.42)}
        <div class="hero-inner">
          <h1 class="hero-title"><span class="sr-only">${esc(C.situs.nama)} — </span><span><span class="type-word" data-typer>${esc(first).replace(/ /g, '<br>')}</span><span class="caret" aria-hidden="true"></span></span></h1>
          <div class="hero-cols"><p>${T(b.kolomKiri)}</p><p>${T(b.kolomKanan)}</p></div>
        </div>
        <a class="hero-scroll" href="#tentang">${esc(u('scroll'))}</a>
      </div>
    </section>`;
  }

  function heroSkill(d, dept) {
    const lines = (d.judulHero || []).map((l) => `<span class="line">${T(l)}</span>`).join('');
    return `<section class="hero hero--skill" style="padding-top:12px;padding-bottom:0">
      <div class="hero-panel">
        ${badgeHTML(dept, -0.38)}
        <div class="hero-inner">
          <p class="eyebrow" style="color:var(--ink-2)"><a href="${PAGES.home}" style="text-decoration:none">← ${esc(u('home'))}</a></p>
          <h1 class="hero-title" style="min-height:0">${lines}</h1>
          <div class="hero-cols"><p>${T(d.intro)}</p><p><a class="btn" href="#harga">${esc(u('prices'))}<span class="ico">${ICON.arrow}</span></a></p></div>
        </div>
      </div>
    </section>`;
  }

  function aboutHTML() {
    const s = C.situs, b = C.beranda;
    const photo = safeUrl(s.foto) ? `<img src="${esc(safeUrl(s.foto))}" alt="${esc(s.nama)}" loading="lazy">` : `<span class="mono" aria-hidden="true">${esc(initials())}</span><small>${esc(u('photoSoon'))}</small>`;
    const cv = safeUrl(s.cv)
      ? `<a class="btn btn--ghost" href="${esc(safeUrl(s.cv))}" target="_blank" rel="noopener" download>${esc(u('cv'))}<span class="ico">${ICON.arrow}</span></a>`
      : `<span class="btn btn--ghost" aria-disabled="true">${esc(u('cvSoon'))}<span class="ico">${ICON.arrow}</span></span>`;
    return `<section id="tentang">
      <div class="wrap">
        <p class="eyebrow reveal">${esc(u('aboutEyebrow'))}</p>
        <div class="about-grid">
          <div class="photo-box reveal">${photo}</div>
          <div class="about-body">
            <p class="lead reveal reveal-d1">${T(b.tentang)}</p>
            <p class="reveal reveal-d2">${T(b.tentangDetail)}</p>
            ${(b.angka || []).length ? `<div class="stats reveal reveal-d3">${b.angka.map((a) => `<div><b>${esc(a.nilai)}</b><span>${T(a.label)}</span></div>`).join('')}</div>` : ''}
            <div class="about-actions reveal">${cv}<button class="btn" type="button" data-start-project>${esc(u('startProject'))}<span class="ico">${ICON.arrow}</span></button></div>
          </div>
        </div>
      </div>
    </section>`;
  }

  function timelineHTML() {
    const item = (x) => `<div class="tl-item reveal"><div class="yr">${esc(x.tahun)}</div><div><h4>${T(x.judul)}</h4><div class="place">${T(x.tempat)}</div>${t(x.keterangan) ? `<p>${T(x.keterangan)}</p>` : ''}</div></div>`;
    const col = (title, list) => (list && list.length ? `<div><h3>${esc(title)}</h3>${list.map(item).join('')}</div>` : '');
    return `<section id="perjalanan" style="padding-top:0">
      <div class="wrap">
        <h2 class="h-section reveal">${split(u('journey'))}</h2>
        <div class="tl-grid">${col(u('education'), C.pendidikan)}${col(u('experience'), C.pengalaman)}</div>
      </div>
    </section>`;
  }

  function skillsHTML() {
    const tags = (s) => `<div class="tags">${(s.tag || []).filter((x) => t(x)).map((x) => `<span>${T(x)}</span>`).join('')}</div>`;
    const inner = (s, num, glyph) => `<span class="skill-glyph" aria-hidden="true">${glyph}</span>
        <div class="skill-top"><span class="skill-num">${num}</span><span class="skill-arrow" aria-hidden="true">${ICON.arrow}</span></div>
        <div><h3>${T(s.judul)}</h3><p>${T(s.ringkas)}</p>${tags(s)}<span class="sr-only">${esc(u('explore'))}</span></div>`;
    const cards = [];
    const delay = () => (cards.length % 2 ? 'reveal-d1' : '');
    const num = () => String(cards.length + 1).padStart(2, '0');
    cards.push(`<a class="skill-card reveal ${delay()}" href="${PAGES.web}">${inner(C.skill.web, num(), '&lt;/&gt;')}</a>`);
    cards.push(`<a class="skill-card reveal ${delay()}" href="${PAGES.video}">${inner(C.skill.video, num(), '▶')}</a>`);
    extraSkills().forEach((s) => {
      const glyph = esc(String(s.ikon || '').trim().slice(0, 3) || t(s.judul).trim().charAt(0).toUpperCase() || '✦');
      const link = safeUrl(s.tautan);
      const ext = /^https?:/i.test(link);
      cards.push(link
        ? `<a class="skill-card reveal ${delay()}" href="${esc(link)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${inner(s, num(), glyph)}</a>`
        : `<button class="skill-card reveal ${delay()}" type="button" data-start-project="${esc(t(s.judul))}">${inner(s, num(), glyph)}</button>`);
    });
    return `<section id="keahlian">
      <div class="wrap">
        <p class="eyebrow reveal">${esc(u('skills'))}</p>
        <h2 class="h-section reveal">${split(u('skillsTitle'))}</h2>
        <div class="skills${cards.length % 2 ? ' skills--odd' : ''}">${cards.join('')}</div>
      </div>
    </section>`;
  }
  const extraSkills = () => ((C.skill && C.skill.tambahan) || []).filter((s) => s && t(s.judul));

  function servicesHTML(list) {
    return `<section id="layanan">
      <div class="wrap">
        <h2 class="h-section reveal">${split(u('services'))}</h2>
        <div class="svc-list">${(list || []).map((x) => `<div class="svc reveal"><div><h3>${T(x.nama)}</h3><small>${T(x.sub)}</small></div><p>${T(x.deskripsi)}</p></div>`).join('')}</div>
      </div>
    </section>`;
  }

  function mockCover(title) {
    return `<div class="mock" aria-hidden="true"><div class="mock-win"><div class="mock-bar"><i></i><i></i><i></i></div><div class="mock-body"><b>${esc(title)}</b><span></span><span></span><span></span></div></div></div>`;
  }

  function worksHTML(list, kind) {
    const items = (list || []).map((x, i) => {
      const img = safeUrl(kind === 'video' ? x.thumbnail : x.gambar);
      const cover = img ? `<img src="${esc(img)}" alt="" loading="lazy">` : mockCover(x.judul);
      return `<button class="work reveal ${i % 2 ? 'reveal-d1' : ''}" type="button" data-work="${kind}:${i}">
        <div class="work-cover">${cover}${kind === 'video' ? `<span class="play">${ICON.play}</span>` : ''}</div>
        <div class="work-meta"><small>${T(x.kategori)}</small><h3>${esc(x.judul)}</h3><p>${T(x.deskripsi)}</p></div>
      </button>`;
    });
    while (items.length < 2) items.push(`<div class="work work--empty reveal" aria-hidden="true"><div class="work-cover"><span>${esc(u('workEmpty'))}</span></div><div class="work-meta"><small>—</small><h3>&nbsp;</h3><p>&nbsp;</p></div></div>`);
    return `<section id="karya" class="works-band">
      <div class="wrap">
        <h2 class="h-section reveal">${split(u('works'))}</h2>
        <div class="works">${items.join('')}</div>
      </div>
    </section>`;
  }

  function pricesHTML(list, kind) {
    const cols = Math.min((list || []).length || 3, kind === 'video' ? 4 : 3);
    return `<section id="harga">
      <div class="wrap">
        <h2 class="h-section reveal">${split(u('prices'))}</h2>
        <div class="prices" style="--cols:${cols}">
          ${(list || []).map((p, i) => `<article class="price reveal ${p.unggulan ? 'price--hot' : ''} reveal-d${i % 3}">
            ${p.unggulan ? `<span class="badge-hot">${esc(u('popular'))}</span>` : ''}
            <h3>${T(p.nama)}</h3>
            <div class="amount">${T(p.harga)}</div>
            <div class="muted">${T(p.catatan)}</div>
            <ul>${(p.fitur || []).map((f) => `<li>${T(f)}</li>`).join('')}</ul>
            <button class="btn" type="button" data-start-project="${esc(t(p.nama))}">${esc(u('choose'))}<span class="ico">${ICON.arrow}</span></button>
          </article>`).join('')}
        </div>
        <p class="note reveal">${esc(u(kind === 'video' ? 'priceNoteVideo' : 'priceNoteWeb'))}</p>
      </div>
    </section>`;
  }

  function processHTML(list) {
    if (!list || !list.length) return '';
    return `<section id="proses" style="padding-top:0">
      <div class="wrap">
        <h2 class="h-section reveal">${split(u('process'))}</h2>
        <div class="steps">${list.map((s, i) => `<div class="step reveal reveal-d${i % 4}"><h3>${T(s.judul)}</h3><p>${T(s.deskripsi)}</p></div>`).join('')}</div>
      </div>
    </section>`;
  }

  function testimonialsHTML(list) {
    if (!list || !list.length) return '';
    const stats = C.beranda.angka || [];
    const tiles = [];
    list.forEach((q, i) => {
      tiles.push(`<div class="quote reveal"><div><div class="stars" aria-label="5/5">★★★★★</div><p>${T(q.isi)}</p></div><div><b>${esc(q.nama)}</b><small>${T(q.peran)}</small></div></div>`);
      if (stats[i]) tiles.push(`<div class="stat-tile reveal"><span>${T(stats[i].label)}</span><b>${esc(stats[i].nilai)}</b></div>`);
    });
    return `<section id="testimoni" style="padding-top:0"><div class="wrap"><h2 class="h-section reveal">${split(u('testimonials'))}</h2><div class="bento">${tiles.join('')}</div></div></section>`;
  }

  function faqHTML(list) {
    if (!list || !list.length) return '';
    return `<section id="faq">
      <div class="wrap faq-wrap">
        <h2 class="h-section reveal">${split(u('faq'))}</h2>
        <div class="faq reveal">${list.map((f, i) => `<details ${i === 0 ? 'open' : ''}><summary>${T(f.tanya)}<i aria-hidden="true"></i></summary><div class="ans"><p>${T(f.jawab)}</p></div></details>`).join('')}</div>
      </div>
    </section>`;
  }

  function contactHTML() {
    const s = C.situs;
    const direct = [];
    if (s.email) direct.push(`<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`);
    if (s.whatsapp) direct.push(`<a href="https://wa.me/${waNumber()}" target="_blank" rel="noopener">WhatsApp: ${esc(s.whatsapp)}</a>`);
    return `<section id="kontak" style="padding-bottom:0">
      <div class="wrap">
        <div class="contact-card reveal">
          <div>
            <p class="eyebrow">${esc(u('contactEyebrow'))}</p>
            <h2>${esc(u('contactTitle'))}</h2>
            <p>${esc(u('contactText'))}</p>
            <button class="btn" type="button" data-start-project>${esc(u('startProject'))}<span class="ico">${ICON.arrow}</span></button>
            ${direct.length ? `<div class="contact-direct"><small>${esc(u('orDirect'))}</small>${direct.join('<br>')}</div>` : ''}
          </div>
          <div class="contact-art" aria-hidden="true"><div class="grid"></div><div class="orb"></div><b>${esc(initials())}.</b></div>
        </div>
      </div>
    </section>`;
  }

  function footerHTML() {
    const s = C.situs;
    const dept = page === 'web' ? u('deptWeb') : page === 'video' ? u('deptVideo') : u('deptHome');
    const mail = s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : s.whatsapp ? `<a href="https://wa.me/${waNumber()}" target="_blank" rel="noopener">WhatsApp ${esc(s.whatsapp)}</a>` : `<span class="muted">${esc(u('noContact'))}</span>`;
    return `<footer class="site-footer">
      ${badgeHTML(dept, 0.3)}
      <div class="wrap">
        <div class="foot-top">
          <div class="foot-menu"><small>${esc(u('menu'))}</small>
            <a href="${PAGES.home}#tentang">${esc(u('about'))}</a><a href="${PAGES.web}">${esc(u('web'))}</a><a href="${PAGES.video}">${esc(u('video'))}</a>
          </div>
          ${socialsHTML()}
        </div>
        <div class="talk"><h2 aria-label="${esc(u('talk1'))} ${esc(u('talk2'))}"><span>${esc(u('talk1'))}</span><span>${esc(u('talk2'))}</span></h2></div>
        <div class="foot-mail"><small>${esc(u('getInTouch'))}</small>${mail}</div>
        <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(s.nama)} · ${T(s.lokasi)}</span><a href="#top">↑ ${esc(u('home'))}</a></div>
      </div>
    </footer>
    <div class="modal" id="modal" aria-hidden="true"><div class="modal-bg" data-close></div><div class="modal-box" role="dialog" aria-modal="true" tabindex="-1"></div></div>`;
  }

  /* ---------- Render halaman ---------- */
  function render() {
    document.documentElement.lang = lang;
    let main = '';
    if (page === 'home') {
      main = heroHome() + aboutHTML() + timelineHTML() + skillsHTML() + contactHTML();
      document.title = `${C.situs.nama} — Web Developer & Video Editor`;
    } else {
      const d = C[page];
      main = heroSkill(d, page === 'web' ? u('deptWeb') : u('deptVideo')) + servicesHTML(d.layanan) + worksHTML(page === 'web' ? d.proyek : d.karya, page) +
        pricesHTML(d.paket, page) + (page === 'web' ? processHTML(d.proses) : '') + testimonialsHTML(d.testimoni) + faqHTML(d.faq) + contactHTML();
      document.title = `${t(C.skill[page].judul)} — ${C.situs.nama}`;
    }
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t(C.situs.deskripsiSEO));
    app.innerHTML = headerHTML() + `<main>${main}</main>` + footerHTML() + (isDraft ? `<div style="position:fixed;left:12px;bottom:12px;z-index:90;background:#c0392b;color:#fff;padding:8px 14px;border-radius:99px;font-size:13px">${esc(u('preview'))}</div>` : '');
    bind();
  }

  /* ---------- Interaksi ---------- */
  let cleanups = [];
  function bind() {
    cleanups.forEach((f) => f()); cleanups = [];
    const header = app.querySelector('.site-header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); cleanups.push(() => window.removeEventListener('scroll', onScroll));

    // Menu
    const btn = app.querySelector('.menu-btn');
    const setMenu = (open) => { document.body.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    app.querySelectorAll('.menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

    // Bahasa
    app.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.lang === lang) return;
      lang = b.dataset.lang; try { localStorage.setItem('adt-lang', lang); } catch (e) { /* abaikan */ }
      const y = window.scrollY; render(); window.scrollTo(0, y);
      app.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    }));

    // Animasi muncul
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    app.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // Kartu skill: lingkaran warna mengikuti kursor
    app.querySelectorAll('.skill-card').forEach((c) => c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));

    // Ketik judul hero
    const tw = app.querySelector('[data-typer]');
    if (tw && !reduce) typer(tw, (C.beranda.peran || []).map(t));

    // Panjang tali badge footer (dihitung dulu sebelum fisika badge dimulai)
    const fr = app.querySelector('.site-footer > .badge-rig');
    if (fr) {
      const lay = () => {
        const foot = app.querySelector('.site-footer'), talk = app.querySelector('.talk');
        const cw = app.querySelector('.site-footer .badge-card').offsetWidth;
        const ch = cw / 0.74;
        const fRect = foot.getBoundingClientRect(), tRect = talk.getBoundingClientRect();
        const len = Math.max(60, tRect.top - fRect.top + tRect.height / 2 - ch / 2 - 22);
        fr.style.setProperty('--len', `${len}px`);
      };
      lay(); window.addEventListener('resize', lay); cleanups.push(() => window.removeEventListener('resize', lay));
      if (document.fonts) document.fonts.ready.then(lay);
    }

    // Badge fisika
    app.querySelectorAll('[data-badge]').forEach((rig) => cleanups.push(initBadge(rig)));

    // Tombol mulai proyek & karya
    app.querySelectorAll('[data-start-project]').forEach((b) => b.addEventListener('click', () => openContact(b.dataset.startProject || '')));
    app.querySelectorAll('[data-work]').forEach((b) => b.addEventListener('click', () => { const [k, i] = b.dataset.work.split(':'); openWork(k, +i); }));

    // Modal
    const modal = app.querySelector('#modal');
    modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
    const onKey = (e) => { if (e.key === 'Escape') { closeModal(); setMenu(false); } };
    document.addEventListener('keydown', onKey); cleanups.push(() => document.removeEventListener('keydown', onKey));

    // Tutup FAQ lain saat satu dibuka
    app.querySelectorAll('.faq details').forEach((d) => d.addEventListener('toggle', () => {
      if (d.open) app.querySelectorAll('.faq details').forEach((o) => { if (o !== d) o.open = false; });
    }));
  }

  function typer(el, words) {
    if (words.length < 2) return;
    let i = 0;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const show = (s) => { el.innerHTML = esc(s).replace(/ /g, '<br>'); };
    (async () => {
      while (el.isConnected) {
        await wait(2600); if (!el.isConnected) return;
        el.classList.add('selected'); await wait(650);
        el.classList.remove('selected');
        i = (i + 1) % words.length;
        const w = words[i];
        for (let n = 0; n <= w.length; n++) { if (!el.isConnected) return; show(w.slice(0, n)); await wait(n === 0 ? 180 : 65); }
      }
    })();
  }

  /* Kartu ID menggantung di tali lentur (simulasi Verlet).
     Tali = rangkaian titik; kartu = dua titik berat di ujung tali.
     Bisa ditarik & dilempar; tidak bisa lewat batas atas panel. */
  function initBadge(rig) {
    const hang = rig.querySelector('.badge-hang');
    const card = rig.querySelector('.badge-card');
    const band = rig.querySelector('.strap-band'), hi = rig.querySelector('.strap-hi');
    const probe = rig.querySelector('.badge-len');
    const N = 12;               // jumlah ruas tali
    const TOP = -40;            // titik gantung (di atas tepi panel)
    const G = 0.55, DAMP = 0.985, VMAX = 38, ITER = 16, STEP = 1000 / 60;
    const CEIL = 6;             // kartu tidak boleh lebih tinggi dari ini
    let seg = 10, cardLen = 120;
    const P = [];               // titik: {x, y, px, py, w(invMass)}
    let drag = null, raf = 0, visible = true, last = performance.now(), acc = 0, t = 0;
    let lastY = window.scrollY;

    const measure = () => {
      const len = probe.offsetHeight || 120;
      const cw = card.offsetWidth || 180;
      seg = (len - TOP) / N;
      cardLen = 22 + (cw / 0.74) * 0.5;   // dari cincin ke titik berat kartu
    };
    measure();

    // Posisi awal: lurus dengan sudut awal, lalu dilepas
    const th = reduce ? 0.04 : parseFloat(rig.dataset.start || '0.3');
    const sx = Math.sin(th), sy = Math.cos(th);
    for (let i = 0; i <= N + 1; i++) {
      const r = i <= N ? i * seg : N * seg + cardLen;
      const x = sx * r, y = TOP + sy * r;
      P.push({ x, y, px: x, py: y, w: i === 0 ? 0 : i >= N ? 0.25 : 1 });
    }
    const A = P[N], B = P[N + 1];

    const local = (e) => { const r = rig.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    function satisfy(p, q, rest, stretchOnly) {
      const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 0.0001;
      if (stretchOnly && d <= rest) return;
      const ws = p.w + q.w; if (!ws) return;
      const k = (d - rest) / d / ws;
      p.x += dx * k * p.w; p.y += dy * k * p.w;
      q.x -= dx * k * q.w; q.y -= dy * k * q.w;
    }

    function physics() {
      t += STEP;
      const wind = reduce ? 0 : Math.sin(t / 1400) * 0.012 + Math.sin(t / 530) * 0.004;
      for (let i = 1; i < P.length; i++) {
        const p = P[i];
        let vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
        const v = Math.hypot(vx, vy); if (v > VMAX) { vx *= VMAX / v; vy *= VMAX / v; }
        p.px = p.x; p.py = p.y;
        p.x += vx + wind * (i / N); p.y += vy + G;
      }
      for (let n = 0; n < ITER; n++) {
        for (let i = 0; i < N; i++) satisfy(P[i], P[i + 1], seg, true);
        satisfy(A, B, cardLen, false);
        if (drag) {
          // tarik titik yang dipegang ke posisi jari/mouse
          const f = drag.f, cx = A.x + (B.x - A.x) * f, cy = A.y + (B.y - A.y) * f;
          const dx = drag.x - cx, dy = drag.y - cy, s2 = (1 - f) * (1 - f) + f * f;
          A.x += dx * (1 - f) / s2; A.y += dy * (1 - f) / s2;
          B.x += dx * f / s2; B.y += dy * f / s2;
        }
        // batas atas: kartu memantul, tidak bisa "nyangkut" di atas
        for (let i = 1; i < P.length; i++) {
          const min = i >= N ? CEIL : TOP + 2;
          if (P[i].y < min) { P[i].y = min; if (P[i].py < min) P[i].py = min + (min - P[i].py) * 0.3; }
        }
      }
    }

    function draw() {
      let d = `M${P[0].x.toFixed(1)} ${P[0].y.toFixed(1)}`;
      for (let i = 1; i < N; i++) {
        const mx = (P[i].x + P[i + 1].x) / 2, my = (P[i].y + P[i + 1].y) / 2;
        d += ` Q${P[i].x.toFixed(1)} ${P[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      d += ` L${A.x.toFixed(1)} ${A.y.toFixed(1)}`;
      band.setAttribute('d', d); hi.setAttribute('d', d);
      const ang = Math.atan2(-(B.x - A.x), B.y - A.y);
      hang.style.transform = `translate(${A.x.toFixed(2)}px, ${A.y.toFixed(2)}px) rotate(${ang.toFixed(4)}rad)`;
    }

    function frame(now) {
      raf = 0;
      acc += Math.min(64, now - last); last = now;
      while (acc >= STEP) { physics(); acc -= STEP; }
      draw();
      if (visible) raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    // Tarik kartu
    const down = (e) => {
      const p = local(e);
      const ax = B.x - A.x, ay = B.y - A.y, l2 = ax * ax + ay * ay || 1;
      const f = Math.max(0.05, Math.min(1.6, ((p.x - A.x) * ax + (p.y - A.y) * ay) / l2));
      drag = { f, x: p.x, y: p.y };
      card.setPointerCapture(e.pointerId); start();
    };
    const move = (e) => { if (drag) { const p = local(e); drag.x = p.x; drag.y = Math.max(CEIL, p.y); } };
    const up = () => { drag = null; };
    card.addEventListener('pointerdown', down);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', up);
    card.addEventListener('pointercancel', up);
    card.addEventListener('lostpointercapture', up);

    // Scroll memberi ayunan kecil ke samping
    const onScroll = () => {
      const dy = window.scrollY - lastY; lastY = window.scrollY;
      if (drag || reduce) return;
      const k = Math.max(-2.2, Math.min(2.2, dy * 0.03));
      for (let i = 1; i < P.length; i++) P[i].px += k * Math.min(1, i / N);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    if (document.fonts) document.fonts.ready.then(measure);

    // Animasi hanya jalan saat area badge terlihat (bukan kartunya saja)
    const vis = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    vis.observe(rig.parentElement || rig);

    draw(); start();
    return () => {
      cancelAnimationFrame(raf); vis.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
    };
  }

  /* ---------- Modal ---------- */
  let lastFocus = null;
  function openModal(html, light) {
    const modal = app.querySelector('#modal'); const box = modal.querySelector('.modal-box');
    lastFocus = document.activeElement;
    box.className = 'modal-box' + (light ? ' modal-box--light' : '');
    box.innerHTML = `<button class="modal-x" type="button" data-close aria-label="${esc(u('close'))}">×</button>` + html;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => (box.querySelector('input,button') || box).focus(), 60);
  }
  function closeModal() {
    const modal = app.querySelector('#modal'); if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    setTimeout(() => { modal.querySelector('.modal-box').innerHTML = ''; }, 400);
    if (lastFocus) lastFocus.focus();
  }

  function openContact(pre) {
    const opts = [];
    const add = (v) => { if (v && !opts.includes(v)) opts.push(v); };
    if (pre) add(pre);
    if (page !== 'video') (C.web.layanan || []).forEach((x) => add(t(x.nama)));
    if (page !== 'web') (C.video.layanan || []).forEach((x) => add(t(x.nama)));
    if (page === 'home') extraSkills().forEach((x) => add(t(x.judul)));
    add(u('other'));
    openModal(`<h2>${esc(u('formTitle'))}</h2>
      <form id="pform" novalidate>
        <div class="field"><label for="pf-name">${esc(u('fName'))}</label><input id="pf-name" name="name" autocomplete="name" placeholder="${esc(u('fNamePh'))}" required></div>
        <div class="field"><label for="pf-need">${esc(u('fNeed'))}</label><select id="pf-need" name="need">${opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select></div>
        <div class="field"><label for="pf-msg">${esc(u('fMsg'))}</label><textarea id="pf-msg" name="msg" placeholder="${esc(u('fMsgPh'))}"></textarea></div>
        <button class="btn btn-full" type="submit">${esc(C.situs.whatsapp ? u('sendWa') : u('sendMail'))}</button>
        <p class="form-msg" role="status"></p>
      </form>`);
    const f = document.getElementById('pform');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const msgEl = f.querySelector('.form-msg');
      const name = f.name.value.trim();
      if (!name) { msgEl.textContent = u('needName'); f.name.focus(); return; }
      const text = `${u('hello')} ${name}. ${u('interest')}: ${f.need.value}.${f.msg.value.trim() ? '\n\n' + f.msg.value.trim() : ''}`;
      if (C.situs.whatsapp) window.open(`https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      else if (C.situs.email) window.location.href = `mailto:${C.situs.email}?subject=${encodeURIComponent(f.need.value)}&body=${encodeURIComponent(text)}`;
      else msgEl.textContent = u('noContact');
    });
  }

  function embedOf(link) {
    const l = String(link || '');
    let m = l.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return { src: `https://www.youtube.com/embed/${m[1]}`, vertical: /shorts\//.test(l) };
    m = l.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (m) return { src: `https://www.tiktok.com/embed/v2/${m[1]}`, vertical: true };
    m = l.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (m) return { src: `https://drive.google.com/file/d/${m[1]}/preview`, vertical: false };
    return null;
  }

  function openWork(kind, i) {
    const x = kind === 'web' ? C.web.proyek[i] : C.video.karya[i];
    if (!x) return;
    const link = safeUrl(x.link);
    let media = '';
    if (kind === 'video') {
      const em = embedOf(link);
      if (em) media = `<div class="proj-media ${em.vertical ? 'vertical' : ''}"><iframe src="${esc(em.src)}" title="${esc(x.judul)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
      else if (safeUrl(x.thumbnail)) media = `<div class="proj-media"><img src="${esc(safeUrl(x.thumbnail))}" alt=""></div>`;
    } else {
      media = `<div class="proj-media">${safeUrl(x.gambar) ? `<img src="${esc(safeUrl(x.gambar))}" alt="${esc(x.judul)}">` : mockCover(x.judul)}</div>`;
    }
    const action = link
      ? `<a class="btn" href="${esc(link)}" target="_blank" rel="noopener">${esc(kind === 'web' ? u('visit') : u('watch'))}<span class="ico">${ICON.arrow}</span></a>`
      : `<span class="btn" aria-disabled="true">${esc(u('notLive'))}<span class="ico">${ICON.arrow}</span></span>`;
    openModal(`<p class="eyebrow">${T(x.kategori)}</p>
      <h2 style="font-size:clamp(34px,5vw,56px);letter-spacing:-.05em;line-height:.95;text-transform:uppercase;margin:0 40px 14px 0">${esc(x.judul)}</h2>
      <p class="lead" style="font-size:clamp(18px,2vw,22px)">${T(x.deskripsi)}</p>
      <div class="proj-head">
        <div><small>${esc(u('category'))}</small>${T(x.kategori) || '—'}</div>
        <div><small>${esc(u('year'))}</small>${esc(x.tahun || '—')}</div>
        <div><small>${esc(u('role'))}</small>${T(x.peran) || '—'}</div>
      </div>
      ${action}${media}`, true);
  }

  /* ---------- Muat konten ---------- */
  let isDraft = false;
  async function load() {
    if (/[?&]draft=1/.test(location.search)) {
      try { const d = localStorage.getItem('adt-draft'); if (d) { C = JSON.parse(d); isDraft = true; } } catch (e) { /* abaikan */ }
    }
    if (!C) {
      const res = await fetch('data/content.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      C = await res.json();
    }
    render();
    if (location.hash) { const el = document.querySelector(location.hash); if (el) setTimeout(() => el.scrollIntoView(), 50); }
    requestAnimationFrame(() => document.body.classList.add('ready'));
  }
  load().catch((err) => {
    console.error(err);
    app.innerHTML = `<p style="padding:40vh 24px;text-align:center">${esc(u('loadErr'))}</p>`;
    document.body.classList.add('ready');
  });
})();
