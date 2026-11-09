/* ==========================================================
   Panel admin tersembunyi
   - Isi website (data/content.json) diedit lewat formulir.
   - Perubahan disimpan langsung ke repo GitHub lewat GitHub API.
   - Token GitHub disimpan TERENKRIPSI di data/admin.json
     (AES-GCM, kunci dari password lewat PBKDF2), jadi cukup
     ingat password untuk masuk dari perangkat mana pun.
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Pengaturan repo (ubah kalau repo dipindah) ---------- */
  const REPO = { owner: 'Setiawan1717', name: 'portofolio-aditya', branch: 'main' };
  const CONTENT_PATH = 'data/content.json';
  const ADMIN_PATH = 'data/admin.json';
  const UPLOAD_DIR = 'assets/uploads';
  const ITER = 600000;

  const $ = (s) => document.querySelector(s);
  const API = `https://api.github.com/repos/${REPO.owner}/${REPO.name}`;
  let token = '';
  let data = null;      // konten yang sedang diedit
  let saved = '';       // versi terakhir yang tersimpan (string JSON)
  let sha = '';         // sha file content.json di GitHub
  let current = 'situs';

  /* ---------- Util ---------- */
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (bytes) => { let s = ''; const a = new Uint8Array(bytes); for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = (str) => Uint8Array.from(atob(String(str).replace(/\s/g, '')), (c) => c.charCodeAt(0));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* abaikan */ } }, del: (k) => { try { sessionStorage.removeItem(k); } catch (e) { /* abaikan */ } } };
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((c) => c != null && el.append(c.nodeType ? c : document.createTextNode(String(c))));
    return el;
  };
  let toastT = 0;
  function toast(text, err) { const t = $('#toast'); t.textContent = text; t.className = 'toast' + (err ? ' err' : ''); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hidden'), err ? 7000 : 4000); }
  function show(id) { ['setup', 'login', 'boot', 'editor'].forEach((x) => $('#' + x).classList.toggle('hidden', x !== id)); }

  /* ---------- Kriptografi ---------- */
  async function keyFrom(pass, salt, iter) {
    const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function encryptToken(tok, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await keyFrom(pass, salt, ITER);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(tok));
    return { v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(ct), dibuat: new Date().toISOString() };
  }
  async function decryptToken(blob, pass) {
    const key = await keyFrom(pass, unb64(blob.salt), blob.iter || ITER);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.data));
    return dec.decode(pt);
  }

  /* ---------- GitHub API ---------- */
  async function gh(path, opts = {}, tok = token) {
    const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (tok) headers.Authorization = `Bearer ${tok}`;
    if (opts.body) headers['Content-Type'] = 'application/json';
    const res = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) }, cache: 'no-store' });
    if (!res.ok) { const e = new Error(`GitHub ${res.status}`); e.status = res.status; try { e.detail = (await res.json()).message; } catch (x) { /* abaikan */ } throw e; }
    return res.status === 204 ? null : res.json();
  }
  async function getFile(path, tok = token) {
    const f = await gh(`/contents/${path}?ref=${REPO.branch}&t=${Date.now()}`, {}, tok);
    let text;
    if (f.content) text = dec.decode(unb64(f.content));
    else { const blob = await gh(`/git/blobs/${f.sha}`, {}, tok); text = dec.decode(unb64(blob.content)); }
    return { text, sha: f.sha };
  }
  async function putFile(path, contentB64, message, fileSha) {
    const body = { message, content: contentB64, branch: REPO.branch };
    if (fileSha) body.sha = fileSha;
    return gh(`/contents/${path}`, { method: 'PUT', body: JSON.stringify(body) });
  }
  async function fileSha(path) { try { return (await gh(`/contents/${path}?ref=${REPO.branch}&t=${Date.now()}`)).sha; } catch (e) { if (e.status === 404) return ''; throw e; } }
  const errText = (e) => e.status === 401 ? 'Token GitHub tidak valid atau sudah kedaluwarsa.' : e.status === 403 ? 'Token tidak punya izin menulis ke repo ini (Contents: Read and write).' : e.status === 404 ? 'Repo atau file tidak ditemukan. Cek pengaturan token (repo yang dipilih).' : e.status === 409 || e.status === 422 ? 'Isi di GitHub berubah dari tempat lain. Muat ulang panel lalu coba lagi.' : (e.detail || e.message || 'Terjadi kesalahan.');

  /* ---------- Alur masuk ---------- */
  let adminBlob = null;
  async function boot() {
    $('#repoName').textContent = `${REPO.owner}/${REPO.name}`;
    const saveTok = ss.get('adt-tok');
    try {
      const f = await getFile(ADMIN_PATH, null);
      adminBlob = JSON.parse(f.text);
    } catch (e) {
      if (e.status !== 404) { show('login'); $('#loginMsg').textContent = 'Tidak bisa menghubungi GitHub. Cek koneksi lalu muat ulang.'; $('#loginMsg').className = 'msg err'; return; }
    }
    if (saveTok) { token = saveTok; return openEditor(); }
    show(adminBlob ? 'login' : 'setup');
    if (adminBlob) $('#lPass').focus();
  }

  $('#setupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = $('#setupMsg'), btn = e.target.querySelector('button');
    const tok = $('#sToken').value.trim(), p1 = $('#sPass').value, p2 = $('#sPass2').value;
    m.className = 'msg err';
    if (p1.length < 10) { m.textContent = 'Password minimal 10 karakter.'; return; }
    if (p1 !== p2) { m.textContent = 'Kedua password tidak sama.'; return; }
    btn.disabled = true; m.className = 'msg'; m.textContent = 'Mengecek token…';
    try {
      const repo = await gh('', {}, tok);
      if (repo.permissions && !repo.permissions.push) throw Object.assign(new Error(), { status: 403 });
      token = tok;
      m.textContent = 'Mengenkripsi dan menyimpan…';
      const blob = await encryptToken(tok, p1);
      await putFile(ADMIN_PATH, b64(enc.encode(JSON.stringify(blob, null, 2))), 'Setup panel admin', await fileSha(ADMIN_PATH));
      adminBlob = blob; ss.set('adt-tok', tok);
      openEditor();
      toast('Setup selesai. Mulai sekarang masuk cukup dengan password.');
    } catch (err) { m.className = 'msg err'; m.textContent = errText(err); token = ''; }
    btn.disabled = false;
  });

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = $('#loginMsg'), btn = e.target.querySelector('button');
    btn.disabled = true; m.className = 'msg'; m.textContent = 'Memeriksa…';
    try { token = await decryptToken(adminBlob, $('#lPass').value); }
    catch (err) { m.className = 'msg err'; m.textContent = 'Password salah.'; btn.disabled = false; $('#lPass').select(); return; }
    ss.set('adt-tok', token); $('#lPass').value = '';
    btn.disabled = false; m.textContent = '';
    openEditor();
  });

  async function openEditor() {
    show('boot');
    try {
      const f = await getFile(CONTENT_PATH);
      data = JSON.parse(f.text); sha = f.sha;
      if (data.skill && !Array.isArray(data.skill.tambahan)) data.skill.tambahan = [];
      saved = JSON.stringify(data);
    } catch (e) {
      ss.del('adt-tok'); token = '';
      show(adminBlob ? 'login' : 'setup');
      const m = adminBlob ? $('#loginMsg') : $('#setupMsg'); m.className = 'msg err'; m.textContent = errText(e) + (e.status === 401 ? ' Buat token baru lalu pakai menu Keamanan → Ganti token.' : '');
      if (e.status === 401 && adminBlob) { m.textContent += ''; showTokenReset(); }
      return;
    }
    show('editor'); buildSide(); renderPanel(); updateStatus();
  }

  // Kalau token kedaluwarsa: tawarkan setup ulang dari layar login
  function showTokenReset() {
    if ($('#resetTok')) return;
    $('#loginForm').append(h('p', { class: 'hint', id: 'resetTok' }, 'Token kedaluwarsa? ', h('a', { href: '#', onclick: (e) => { e.preventDefault(); show('setup'); } }, 'Setup ulang dengan token baru')));
  }

  /* ---------- Struktur bagian & label ---------- */
  const SECTIONS = [
    { key: 'situs', title: 'Profil & kontak', desc: 'Nama, foto, CV, WhatsApp, email, dan lokasi. Dipakai di semua halaman.' },
    { key: 'sosial', title: 'Media sosial', desc: 'Link yang kosong tidak ditampilkan.' },
    { key: 'beranda', title: 'Beranda', desc: 'Judul yang berganti di hero, teks perkenalan, dan angka.' },
    { key: 'skill', title: 'Kartu keahlian', desc: 'Kartu di bagian Keahlian beranda. Dua kartu utama mengarah ke halaman Web Dev & Editor Video. Tambah keahlian baru di bagian "Keahlian tambahan" paling bawah.' },
    { key: 'pendidikan', title: 'Pendidikan', desc: 'Riwayat pendidikan di bagian Perjalanan.' },
    { key: 'pengalaman', title: 'Pengalaman', desc: 'Organisasi, proyek, dan kerja di bagian Perjalanan.' },
    { key: 'web', title: 'Halaman Web Dev', desc: 'Layanan, proyek, paket harga, cara kerja, FAQ, dan testimoni halaman Web Development.' },
    { key: 'video', title: 'Halaman Editor Video', desc: 'Layanan, karya video, paket harga, FAQ, dan testimoni halaman Editor Video.' }
  ];
  const LABEL = {
    nama: 'Nama', namaDepan: 'Nama depan (di kartu ID)', namaBelakang: 'Nama belakang (di kartu ID)', logo: 'Logo teks', idBadge: 'Nomor di kartu ID', foto: 'Foto profil',
    cv: 'File CV (PDF)', email: 'Email', whatsapp: 'Nomor WhatsApp', lokasi: 'Lokasi', deskripsiSEO: 'Deskripsi untuk Google', platform: 'Platform', url: 'Link',
    peran: 'Judul hero yang berganti-ganti', kolomKiri: 'Teks kecil kiri', kolomKanan: 'Teks kecil kanan', tentang: 'Perkenalan (teks besar)', tentangDetail: 'Perkenalan lanjutan',
    angka: 'Angka / statistik', nilai: 'Angka', label: 'Keterangan', web: 'Kartu Web Development', video: 'Kartu Editor Video', judul: 'Judul', ringkas: 'Ringkasan', tag: 'Label kecil',
    tahun: 'Tahun', tempat: 'Tempat / instansi', keterangan: 'Keterangan', judulHero: 'Judul besar (per baris)', intro: 'Teks pembuka', layanan: 'Layanan', sub: 'Sub-judul', deskripsi: 'Deskripsi',
    proyek: 'Proyek', karya: 'Karya video', kategori: 'Kategori', gambar: 'Gambar sampul', thumbnail: 'Thumbnail', link: 'Link', peranProyek: 'Peran', paket: 'Paket harga',
    harga: 'Harga', catatan: 'Catatan di bawah harga', unggulan: 'Tandai sebagai "Terpopuler"', fitur: 'Isi paket', proses: 'Cara kerja', faq: 'Pertanyaan umum (FAQ)', tanya: 'Pertanyaan', jawab: 'Jawaban',
    testimoni: 'Testimoni (hanya tampil kalau ada isinya)', isi: 'Isi testimoni',
    tambahan: 'Keahlian tambahan', ikon: 'Ikon besar di kartu', tautan: 'Link saat kartu diklik (opsional)'
  };
  const HINT = {
    whatsapp: 'Contoh: 081234567890. Dipakai untuk tombol pesan.', foto: 'Kosongkan untuk memakai inisial. Foto akan dibuat hitam-putih otomatis.', cv: 'Unggah PDF atau tempel link Google Drive.',
    link: 'Link website, YouTube, TikTok, atau Google Drive. Video YouTube/TikTok/Drive akan diputar langsung di website.', peran: 'Ditulis kapital. Spasi = pindah baris.',
    testimoni: 'Isi hanya dengan testimoni asli dari klien.', logo: 'Titik di akhir otomatis berwarna.', idBadge: 'Bebas, misalnya tanggal lahir atau angka favorit.',
    tambahan: 'Tiap keahlian tampil sebagai kartu baru di beranda. Judul wajib diisi; kartu tanpa judul tidak ditampilkan.',
    ikon: '1–3 karakter, misalnya ✎, UI, ◆, atau emoji. Kosong = huruf pertama judul.',
    tautan: 'Kosongkan supaya kartu membuka formulir "Mulai proyek". Bisa diisi link Behance, Drive, atau halaman lain.'
  };
  const LONG = ['deskripsi', 'tentang', 'tentangDetail', 'intro', 'jawab', 'isi', 'keterangan', 'kolomKiri', 'kolomKanan', 'ringkas', 'deskripsiSEO'];
  const FILEKEYS = { foto: 'image', gambar: 'image', thumbnail: 'image', cv: 'pdf' };
  const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'linkedin', 'github', 'facebook', 'x'];
  const L2 = () => ({ id: '', en: '' });
  const TPL = {
    sosial: () => ({ platform: 'instagram', url: '' }), peran: L2, judulHero: L2, fitur: L2, tag: () => '',
    angka: () => ({ nilai: '', label: L2() }),
    pendidikan: () => ({ tahun: '', judul: L2(), tempat: L2(), keterangan: L2() }), pengalaman: () => ({ tahun: '', judul: L2(), tempat: L2(), keterangan: L2() }),
    layanan: () => ({ nama: L2(), sub: L2(), deskripsi: L2() }),
    proyek: () => ({ kategori: L2(), judul: '', deskripsi: L2(), gambar: '', link: '', tahun: '', peran: L2() }),
    karya: () => ({ kategori: L2(), judul: '', deskripsi: L2(), thumbnail: '', link: '', tahun: '', peran: L2() }),
    paket: () => ({ nama: L2(), harga: L2(), catatan: L2(), unggulan: false, fitur: [] }),
    proses: () => ({ judul: L2(), deskripsi: L2() }), faq: () => ({ tanya: L2(), jawab: L2() }),
    testimoni: () => ({ nama: '', peran: L2(), isi: L2() }),
    tambahan: () => ({ judul: L2(), ringkas: L2(), tag: [], ikon: '', tautan: '' })
  };
  const isLang = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 2 && 'id' in v && 'en' in v;
  const labelOf = (key, parentKey) => (key === 'peran' && parentKey !== 'beranda' ? 'Peran' : LABEL[key] || key);
  const blank = (v) => Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : typeof v === 'boolean' ? false : typeof v === 'number' ? 0 : '';
  const preview = (it) => { if (typeof it === 'string') return it; if (isLang(it)) return it.id || it.en; for (const k of ['judul', 'nama', 'tanya', 'platform', 'tahun']) if (it && it[k]) return isLang(it[k]) ? it[k].id || it[k].en : it[k]; return ''; };

  /* ---------- Sidebar ---------- */
  function buildSide() {
    const side = $('#side'); side.innerHTML = '';
    SECTIONS.forEach((s) => side.append(h('button', { type: 'button', class: s.key === current ? 'on' : '', onclick: () => { current = s.key; buildSide(); renderPanel(); window.scrollTo(0, 0); } }, s.title)));
    side.append(h('hr'));
    side.append(h('button', { type: 'button', class: current === '_keamanan' ? 'on' : '', onclick: () => { current = '_keamanan'; buildSide(); renderPanel(); } }, '🔒 Keamanan'));
    side.append(h('hr'));
    const pv = h('div', { class: 'pv' }, 'Pratinjau (belum disimpan):');
    [['Beranda', 'index.html'], ['Web Dev', 'web-development.html'], ['Editor Video', 'editor-video.html']].forEach(([n, f]) => pv.append(h('a', { href: `${f}?draft=1`, target: '_blank', onclick: storeDraft }, n + ' ↗')));
    side.append(pv);
  }
  function storeDraft() { try { localStorage.setItem('adt-draft', JSON.stringify(data)); } catch (e) { toast('Pratinjau tidak tersedia di browser ini.', true); } }

  /* ---------- Formulir ---------- */
  function renderPanel() {
    const panel = $('#panel'); panel.innerHTML = '';
    if (current === '_keamanan') return renderSecurity(panel);
    const s = SECTIONS.find((x) => x.key === current);
    panel.append(h('h2', {}, s.title), h('p', { class: 'desc' }, s.desc));
    const val = data[s.key];
    if (Array.isArray(val)) panel.append(listField(data, s.key, s.key));
    else Object.keys(val).forEach((k) => panel.append(field(val, k, s.key)));
  }

  function field(obj, key, parentKey) {
    const v = obj[key];
    const label = labelOf(key, parentKey);
    const hint = HINT[key] && !(key === 'peran' && parentKey !== 'beranda') ? h('p', { class: 'hint' }, HINT[key]) : null;
    if (Array.isArray(v)) return h('fieldset', { class: 'grp' }, h('legend', {}, label), hint, listField(obj, key, parentKey));
    if (isLang(v)) return h('div', { class: 'f' }, h('label', { class: 'lb' }, label), langPair(v, key), hint);
    if (v && typeof v === 'object') return h('fieldset', { class: 'grp' }, h('legend', {}, label), ...Object.keys(v).map((k) => field(v, k, key)));
    if (typeof v === 'boolean') return h('div', { class: 'f' }, h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: v, onchange: (e) => { obj[key] = e.target.checked; changed(); } }), label));
    if (FILEKEYS[key]) return h('div', { class: 'f' }, h('label', { class: 'lb' }, label), fileField(obj, key), hint);
    if (key === 'platform') {
      const sel = h('select', { class: 'inp', onchange: (e) => { obj[key] = e.target.value; changed(); } }, ...PLATFORMS.map((p) => h('option', { value: p, selected: p === v }, p)));
      return h('div', { class: 'f' }, h('label', { class: 'lb' }, label), sel);
    }
    return h('div', { class: 'f' }, h('label', { class: 'lb' }, label), textInput(obj, key, LONG.includes(key)), hint);
  }

  function textInput(obj, key, long, ph) {
    const attrs = { class: 'inp', placeholder: ph || '', oninput: (e) => { obj[key] = e.target.value; changed(); } };
    if (key === 'email') attrs.type = 'email';
    if (key === 'whatsapp') attrs.inputmode = 'tel';
    const el = long ? h('textarea', attrs) : h('input', { type: 'text', ...attrs });
    el.value = obj[key] == null ? '' : obj[key];
    return el;
  }

  function langPair(v, key) {
    const long = LONG.includes(key);
    return h('div', { class: 'pair' },
      h('div', {}, h('span', { class: 'tag' }, 'INDONESIA'), textInput(v, 'id', long)),
      h('div', {}, h('span', { class: 'tag' }, 'ENGLISH'), textInput(v, 'en', long, v.id ? '(kosong = pakai teks Indonesia)' : '')));
  }

  function listField(obj, key, parentKey) {
    const wrap = h('div');
    const draw = () => {
      wrap.innerHTML = '';
      const arr = obj[key];
      const list = h('div', { class: 'list' });
      arr.forEach((it, i) => {
        const ctrl = (sym, title, fn, cls) => h('button', { type: 'button', class: 'ib ' + (cls || ''), title, 'aria-label': title, onclick: (e) => { e.preventDefault(); fn(); changed(); draw(); } }, sym);
        const controls = [
          ctrl('↑', 'Naikkan', () => { if (i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; }),
          ctrl('↓', 'Turunkan', () => { if (i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; }),
          ctrl('✕', 'Hapus', () => { if (confirmDel(it)) arr.splice(i, 1); }, 'del')
        ];
        if (typeof it === 'string') {
          list.append(h('div', { class: 'simple-row' }, textInput(arr, i), ...controls));
        } else if (isLang(it)) {
          list.append(h('div', { class: 'simple-row' }, langPair(it, key), ...controls));
        } else {
          const body = h('div', { class: 'body' }, ...Object.keys(it).map((k) => field(it, k, key)));
          const ttl = h('span', { class: 'ttl' }, h('small', {}, `#${i + 1}`), preview(it) || '(baru)');
          const det = h('details', { class: 'item', open: !preview(it) }, h('summary', {}, ttl, ...controls), body);
          body.addEventListener('input', () => { ttl.lastChild.textContent = preview(it) || '(baru)'; });
          list.append(det);
        }
      });
      wrap.append(list);
      wrap.append(h('button', { type: 'button', class: 'add', onclick: () => { arr.push(TPL[key] ? TPL[key]() : arr.length ? blank(arr[0]) : ''); changed(); draw(); } }, '+ Tambah ' + (labelOf(key, parentKey).split(' (')[0].toLowerCase())));
    };
    draw();
    return wrap;
  }
  function confirmDel(it) { const p = preview(it); return !p || window.confirm(`Hapus "${p}"?`); }

  function fileField(obj, key) {
    const kind = FILEKEYS[key];
    const inp = textInput(obj, key, false, kind === 'pdf' ? 'assets/uploads/cv.pdf atau link' : 'assets/uploads/foto.webp atau link gambar');
    const img = h('img', { class: 'thumb', alt: '' });
    const upd = () => { const v = obj[key]; img.classList.toggle('hidden', !(kind === 'image' && v)); if (kind === 'image' && v) img.src = /^https?:/.test(v) ? v : `https://raw.githubusercontent.com/${REPO.owner}/${REPO.name}/${REPO.branch}/${v}`; };
    inp.addEventListener('input', upd); upd();
    const file = h('input', { type: 'file', accept: kind === 'pdf' ? 'application/pdf' : 'image/*', class: 'hidden' });
    const btn = h('button', { type: 'button', class: 'btn ghost small', onclick: () => file.click() }, 'Unggah');
    const clr = h('button', { type: 'button', class: 'btn ghost small', onclick: () => { obj[key] = ''; inp.value = ''; upd(); changed(); } }, 'Kosongkan');
    file.addEventListener('change', async () => {
      const f = file.files[0]; if (!f) return;
      btn.disabled = true; btn.textContent = 'Mengunggah…';
      try {
        const path = await uploadFile(f, kind, key);
        obj[key] = path; inp.value = path; upd(); changed();
        toast('File terunggah. Klik "Simpan & publikasikan" supaya tampil di website.');
      } catch (e) { toast('Gagal mengunggah: ' + errText(e), true); }
      btn.disabled = false; btn.textContent = 'Unggah'; file.value = '';
    });
    return h('div', { class: 'file-row' }, img, inp, btn, clr, file);
  }

  async function uploadFile(f, kind, key) {
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const base = (f.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || key).slice(0, 40);
    let bytes, ext;
    if (kind === 'pdf') {
      if (f.size > 8 * 1024 * 1024) throw new Error('Ukuran PDF maksimal 8 MB.');
      bytes = new Uint8Array(await f.arrayBuffer()); ext = 'pdf';
    } else {
      const max = key === 'foto' ? 1000 : 1600;
      const bmp = await createImageBitmap(f);
      const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.84));
      const useBlob = blob && blob.type === 'image/webp' ? blob : await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
      ext = useBlob.type === 'image/webp' ? 'webp' : 'jpg';
      bytes = new Uint8Array(await useBlob.arrayBuffer());
    }
    const path = `${UPLOAD_DIR}/${stamp}-${base}.${ext}`;
    await putFile(path, b64(bytes), `Unggah ${path}`);
    return path;
  }

  /* ---------- Keamanan ---------- */
  function renderSecurity(panel) {
    panel.append(h('h2', {}, 'Keamanan'), h('p', { class: 'desc' }, 'Ganti password atau token GitHub. Password lama tidak bisa dipulihkan, jadi simpan baik-baik.'));
    panel.append(h('div', { class: 'warn', html: 'Alamat panel ini tidak ditautkan di website mana pun. Token GitHub disimpan <b>terenkripsi</b> dengan password-mu, jadi gunakan password yang panjang dan jangan dipakai di tempat lain.' }));
    const p1 = h('input', { class: 'inp', type: 'password', autocomplete: 'new-password' }), p2 = h('input', { class: 'inp', type: 'password', autocomplete: 'new-password' });
    const tk = h('input', { class: 'inp', type: 'password', placeholder: 'Kosongkan kalau token tidak diganti' });
    const msg = h('p', { class: 'msg', role: 'status' });
    const btn = h('button', { type: 'button', class: 'btn', onclick: async () => {
      msg.className = 'msg err';
      if (p1.value.length < 10) { msg.textContent = 'Password minimal 10 karakter.'; return; }
      if (p1.value !== p2.value) { msg.textContent = 'Kedua password tidak sama.'; return; }
      btn.disabled = true; msg.className = 'msg'; msg.textContent = 'Menyimpan…';
      try {
        const newTok = tk.value.trim() || token;
        if (tk.value.trim()) { const r = await gh('', {}, newTok); if (r.permissions && !r.permissions.push) throw Object.assign(new Error(), { status: 403 }); }
        const old = token; token = newTok;
        try { const blob = await encryptToken(newTok, p1.value); await putFile(ADMIN_PATH, b64(enc.encode(JSON.stringify(blob, null, 2))), 'Perbarui kredensial panel admin', await fileSha(ADMIN_PATH)); adminBlob = blob; }
        catch (e) { token = old; throw e; }
        ss.set('adt-tok', token); p1.value = p2.value = tk.value = '';
        msg.className = 'msg ok'; msg.textContent = 'Tersimpan. Pakai password baru saat masuk berikutnya.';
      } catch (e) { msg.className = 'msg err'; msg.textContent = errText(e); }
      btn.disabled = false;
    } }, 'Simpan password / token');
    panel.append(
      h('div', { class: 'f' }, h('label', { class: 'lb' }, 'Password baru'), p1),
      h('div', { class: 'f' }, h('label', { class: 'lb' }, 'Ulangi password baru'), p2),
      h('div', { class: 'f' }, h('label', { class: 'lb' }, 'Token GitHub baru (opsional)'), tk, h('p', { class: 'hint', html: 'Buat di <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">pengaturan token GitHub</a> dengan izin <i>Contents: Read and write</i> untuk repo ini saja.' })),
      btn, msg);
  }

  /* ---------- Simpan ---------- */
  const isDirty = () => JSON.stringify(data) !== saved;
  function changed() { updateStatus(); }
  function updateStatus() {
    const s = $('#status'), d = isDirty();
    s.textContent = d ? '● Ada perubahan yang belum disimpan' : 'Semua perubahan tersimpan';
    s.classList.toggle('dirty', d);
    $('#btnSave').disabled = !d; $('#btnReset').disabled = !d;
  }
  $('#btnSave').addEventListener('click', async () => {
    const b = $('#btnSave'); b.disabled = true; b.textContent = 'Menyimpan…';
    try {
      const text = JSON.stringify(data, null, 2) + '\n';
      const r = await putFile(CONTENT_PATH, b64(enc.encode(text)), 'Perbarui konten dari panel admin', sha);
      sha = r.content.sha; saved = JSON.stringify(data);
      try { localStorage.removeItem('adt-draft'); } catch (e) { /* abaikan */ }
      toast('Tersimpan! Website akan berubah dalam 1–2 menit.');
    } catch (e) { toast('Gagal menyimpan: ' + errText(e), true); }
    b.textContent = 'Simpan & publikasikan'; updateStatus();
  });
  $('#btnReset').addEventListener('click', () => { if (!window.confirm('Batalkan semua perubahan yang belum disimpan?')) return; data = JSON.parse(saved); renderPanel(); updateStatus(); });
  $('#btnLogout').addEventListener('click', () => { if (isDirty() && !window.confirm('Ada perubahan belum disimpan. Tetap keluar?')) return; ss.del('adt-tok'); token = ''; data = null; saved = ''; location.reload(); });
  window.addEventListener('beforeunload', (e) => { if (data && isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  if (!window.crypto || !crypto.subtle) { show('login'); $('#loginMsg').textContent = 'Browser ini tidak mendukung enkripsi. Buka lewat https dengan browser terbaru.'; $('#loginMsg').className = 'msg err'; return; }
  boot();
})();
