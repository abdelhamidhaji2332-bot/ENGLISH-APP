import { BDARIJA_SECTIONS, BDARIJA_SRC } from './bdarija_content.js';

// ===== SOUND =====
const SFX = {
  _on: true, _ctx: null,
  _c() { if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)(); return this._ctx; },
  play(t) {
    if (!this._on) return;
    try {
      const c = this._c(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); g.gain.value = 0.07;
      if (t === 'click') { o.frequency.value = 600; o.type = 'sine'; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07); o.start(); o.stop(c.currentTime + 0.07); }
      else if (t === 'success') { o.frequency.value = 880; o.type = 'sine'; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25); o.start(); o.stop(c.currentTime + 0.25); setTimeout(() => { const o2 = c.createOscillator(), g2 = c.createGain(); o2.connect(g2); g2.connect(c.destination); o2.frequency.value = 1100; o2.type = 'sine'; g2.gain.value = 0.07; g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25); o2.start(); o2.stop(c.currentTime + 0.25); }, 130); }
    } catch(e) {}
  }
};

// ===== STATE =====
let guide = null, curId = null, lang = localStorage.getItem('f_lang') || 'en';
const getDone = () => { try { return JSON.parse(localStorage.getItem('f_done') || '[]'); } catch { return []; } };
const setDone = l => localStorage.setItem('f_done', JSON.stringify(l));
const isDone = id => getDone().includes(id);
const toggleDone = id => { let l = getDone(); l.includes(id) ? l = l.filter(x => x !== id) : l.push(id); setDone(l); return l.includes(id); };
const chapterSecs = id => BDARIJA_SECTIONS.filter(s => s.parent === id);
const countDone = id => { const d = getDone(); return chapterSecs(id).filter(s => d.includes(s.id)).length; };
const nextId = id => { const s = BDARIJA_SECTIONS.find(x => x.id === id); if (!s?.parent) return null; const ss = chapterSecs(s.parent); const i = ss.findIndex(x => x.id === id); return i >= 0 && i < ss.length - 1 ? ss[i + 1].id : null; };
const prevId = id => { const s = BDARIJA_SECTIONS.find(x => x.id === id); if (!s?.parent) return null; const ss = chapterSecs(s.parent); const i = ss.findIndex(x => x.id === id); return i > 0 ? ss[i - 1].id : null; };
const secTitle = id => BDARIJA_SECTIONS.find(x => x.id === id)?.title || 'BAC English';

// ===== HELPERS =====
function animCount(el, to, dur = 600) {
  const s = performance.now();
  (function up(now) {
    const p = Math.min((now - s) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(up);
  })(s);
}
function stagger(sel, ms = 50) {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.style.opacity = '0'; el.style.transform = 'translateY(16px)';
    setTimeout(() => { el.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * ms);
  });
}

// ===== BOOT =====
(function boot() {
  if (sessionStorage.getItem('f_booted')) {
    document.getElementById('boot-overlay').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    init(); return;
  }
  const lines = document.querySelectorAll('.bt-line');
  let max = 0;
  lines.forEach(el => { const d = parseInt(el.dataset.delay) || 0; el.style.animationDelay = d + 'ms'; if (d > max) max = d; });
  const logo = document.querySelector('.bt-logo');
  if (logo) logo.style.animationDelay = max + 'ms';
  setTimeout(() => {
    const ov = document.getElementById('boot-overlay');
    ov.classList.add('fade');
    sessionStorage.setItem('f_booted', '1');
    setTimeout(() => { ov.style.display = 'none'; document.getElementById('app').style.display = 'flex'; document.getElementById('app').style.opacity = '0'; init(); setTimeout(() => { document.getElementById('app').style.transition = 'opacity 0.35s'; document.getElementById('app').style.opacity = '1'; }, 40); }, 600);
  }, max + 2200);
})();

function init() {
  const th = localStorage.getItem('f_theme');
  if (th) document.documentElement.setAttribute('data-theme', th);
  if (localStorage.getItem('f_sfx') === 'off') { SFX._on = false; const b = document.getElementById('btn-sfx'); if (b) b.innerHTML = '<i class="fas fa-volume-mute"></i>'; }
  if (th) { const b = document.getElementById('btn-theme'); if (b) b.innerHTML = th === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; }
  updLang();
  const bg = document.getElementById('bg-canvas');
  if (bg && !bg.querySelector('.orb-1')) {
    ['orb-1', 'orb-2', 'orb-3'].forEach(c => { const d = document.createElement('div'); d.className = 'orb ' + c; bg.appendChild(d); });
  }
  loadGuide();
}

// ===== LOAD =====
async function loadGuide() {
  try {
    const r = await fetch(BDARIJA_SRC);
    guide = await r.text();
    guide = guide.replace(/<script[\s\S]*?<\/script>/gi, '');
    initTOC();
    showReader();
  } catch(e) {
    document.getElementById('reader-content').innerHTML = `<div class="reader-error"><i class="fas fa-exclamation-triangle"></i><p>Could not load content.</p></div>`;
  }
}

// ===== TOC =====
function initTOC() {
  const list = document.getElementById('toc-list');
  list.innerHTML = '';
  BDARIJA_SECTIONS.forEach(s => {
    if (s.type === 'chapter') {
      const d = document.createElement('div');
      d.className = 'toc-chapter';
      d.innerHTML = `<i class="fas ${s.icon}"></i> ${s.title}`;
      d.onclick = () => showChapter(s.id);
      list.appendChild(d);
    } else {
      const a = document.createElement('a');
      a.className = 'toc-item'; a.id = 'toc-' + s.id; a.textContent = s.title;
      a.onclick = () => showSection(s.id);
      if (isDone(s.id)) a.classList.add('completed');
      list.appendChild(a);
    }
  });
}
function refreshTOC() { BDARIJA_SECTIONS.forEach(s => { const e = document.getElementById('toc-' + s.id); if (e) { isDone(s.id) ? e.classList.add('completed') : e.classList.remove('completed'); } }); }
function filterTOC(v) {
  const q = v.toLowerCase().trim();
  document.querySelectorAll('.toc-chapter').forEach(e => e.style.display = q ? 'none' : '');
  document.querySelectorAll('.toc-item').forEach(e => e.style.display = !q || e.textContent.toLowerCase().includes(q) ? '' : 'none');
}

// ===== BREADCRUMB =====
const setBC = t => document.getElementById('view-title').innerHTML = t;

// ===== EXTRACT =====
function extract(id) {
  if (!guide) return null;
  const tag = `id="page-${id}"`;
  const idx = guide.indexOf(tag);
  if (idx === -1) return null;
  const divStart = guide.lastIndexOf('<div', idx);
  if (divStart === -1) return null;
  const tagEnd = guide.indexOf('>', divStart);
  if (tagEnd === -1) return null;
  const contentStart = tagEnd + 1;
  let depth = 1, pos = contentStart;
  while (pos < guide.length && depth > 0) {
    const nextOpen = guide.indexOf('<div', pos);
    const nextClose = guide.indexOf('</div>', pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) { depth++; pos = nextOpen + 4; }
    else { depth--; if (depth === 0) return guide.substring(contentStart, nextClose); pos = nextClose + 6; }
  }
  return null;
}

// ===== SHOW READER (DASHBOARD) =====
function showReader() {
  SFX.play('click');
  curId = null;
  setBC('Home');
  document.querySelectorAll('.toc-item').forEach(e => e.classList.remove('active'));
  const chs = BDARIJA_SECTIONS.filter(s => s.type === 'chapter');
  const done = getDone();
  const total = BDARIJA_SECTIONS.filter(s => s.type === 'section').length;
  const writingN = BDARIJA_SECTIONS.filter(s => s.parent === 'writing').length;

  const last = localStorage.getItem('f_last');
  let contHtml = '';
  if (last) {
    const ls = BDARIJA_SECTIONS.find(x => x.id === last);
    if (ls?.parent) {
      const pt = BDARIJA_SECTIONS.find(x => x.id === ls.parent)?.title || '';
      contHtml = `<div class="db-continue" onclick="showSection('${ls.id}')">
        <div class="dc-left"><div class="dc-icon"><i class="fas fa-play"></i></div>
        <div class="dc-info"><div class="dc-label">Continue</div><div class="dc-title">${ls.title}</div><div class="dc-chapter">${pt}</div></div></div>
        <div class="dc-arrow"><i class="fas fa-arrow-right"></i></div></div>`;
    }
  }

  const cards = chs.map((s, i) => {
    const subs = chapterSecs(s.id);
    const d = countDone(s.id);
    const pct = subs.length ? Math.round((d / subs.length) * 100) : 0;
    const descs = { comprehension: 'True/False, questions & more', grammar: 'Tenses, passive, conditionals & more', writing: '9 text types with templates', verbs: '118 irregular verbs + flashcards', vocabulary: '10 thematic units', 'strategy-chapter': 'Exam tips, mistakes & quiz', exams: 'Answer keys & samples', bonus: 'Proverbs, slang & more' };
    return `<div class="chapter-card" onclick="showChapter('${s.id}')" style="animation-delay:${i * 60}ms">
      <div class="cc-icon"><i class="fas ${s.icon}"></i></div>
      <div class="cc-title">${s.title}</div>
      <div class="cc-desc">${descs[s.id] || ''}</div>
      <div class="cc-progress"><div class="cc-bar"><div class="cc-fill" style="width:${pct}%"></div></div><span class="cc-text">${d}/${subs.length}</span></div>
    </div>`;
  }).join('');

  document.getElementById('reader-content').innerHTML = `
    <div class="dashboard">
      <div class="db-hero">
        <div class="db-icon"><i class="fas fa-graduation-cap"></i></div>
        <h1>BAC ENGLISH</h1>
        <p class="db-sub">${lang === 'ar' ? 'الدليل الشامل لاجتياز امتحان الباكالوريا' : 'Complete BAC English Study Guide'}</p>
        <p class="db-author">${lang === 'ar' ? 'إعداد عبد الحميد حاجي' : 'by Abdelhamid Haji'}</p>
      </div>
      ${contHtml}
      <div class="db-stats">
        <div class="db-stat"><span class="ds-val" data-c="${total}">0</span> Lessons</div>
        <div class="db-stat"><span class="ds-val" data-c="${done.length}">0</span> Done</div>
        <div class="db-stat st-violet"><span class="ds-val" data-c="18">0</span> Functions</div>
        <div class="db-stat st-violet"><span class="ds-val" data-c="${writingN}">0</span> Writing</div>
      </div>
      <div class="db-path-title">Your Learning Path</div>
      <div class="db-chapters">${cards}</div>
    </div>`;
  stagger('.chapter-card', 60);
  setTimeout(() => { document.querySelectorAll('.ds-val[data-c]').forEach(e => animCount(e, +e.dataset.c, 500)); }, 150);
}

// ===== SHOW CHAPTER =====
function showChapter(id) {
  SFX.play('click');
  curId = id;
  localStorage.setItem('f_last', id);
  const s = BDARIJA_SECTIONS.find(x => x.id === id);
  const subs = chapterSecs(id);
  const d = countDone(id);
  const pct = subs.length ? Math.round((d / subs.length) * 100) : 0;
  setBC(`<span class="bc-home" onclick="showReader()"><i class="fas fa-home"></i></span><span class="bc-sep"><i class="fas fa-chevron-right"></i></span><span class="bc-current">${s?.title || id}</span>`);
  const lessons = subs.map((x, i) => {
    const c = isDone(x.id);
    return `<div class="cm-lesson" onclick="showSection('${x.id}')" style="animation-delay:${i * 50}ms">
      <div class="cl-status ${c ? 'cl-done' : ''}"><i class="fas ${c ? 'fa-check' : ''}"></i></div>
      <div class="cl-info"><div class="cl-title">${x.title}</div><div class="cl-meta">${c ? 'Completed' : 'Start'}</div></div>
      <div class="cl-arrow"><i class="fas fa-chevron-right"></i></div></div>`;
  }).join('');
  document.getElementById('reader-content').innerHTML = `
    <div class="chapter-module">
      <div class="cm-header">
        <div class="cm-icon"><i class="fas ${s?.icon || 'fa-book'}"></i></div>
        <h2>${s?.title || id}</h2>
        <p class="cm-sub">${subs.length} lessons — ${d} completed</p>
        <div class="cm-progress"><div class="cm-bar"><div class="cm-fill" style="width:${pct}%"></div></div><span class="cm-pct">${pct}%</span></div>
      </div>
      <div class="cm-lessons">${lessons}</div>
    </div>`;
  stagger('.cm-lesson', 50);
  document.querySelectorAll('.toc-item').forEach(e => e.classList.remove('active'));
}

// ===== SHOW SECTION =====
function showSection(id) {
  SFX.play('click');
  curId = id;
  localStorage.setItem('f_last', id);
  const chIds = BDARIJA_SECTIONS.filter(s => s.type === 'chapter').map(s => s.id);
  if (chIds.includes(id)) { showChapter(id); return; }
  const ct = document.getElementById('reader-content');
  const html = extract(id);
  if (!html) { ct.innerHTML = `<div class="reader-empty"><i class="fas fa-file"></i><p>Section not found.</p></div>`; return; }
  const s = BDARIJA_SECTIONS.find(x => x.id === id);
  const pTitle = s?.parent ? secTitle(s.parent) : '';
  const comp = isDone(id);
  const nId = nextId(id), pId = prevId(id);
  setBC(`<span class="bc-home" onclick="showReader()"><i class="fas fa-home"></i></span><span class="bc-sep"><i class="fas fa-chevron-right"></i></span><span class="bc-chapter" onclick="showChapter('${s.parent}')"><i class="fas fa-folder-open"></i> ${pTitle}</span><span class="bc-sep"><i class="fas fa-chevron-right"></i></span><span class="bc-current">${secTitle(id)}</span>`);
  const prev = pId ? `<div class="sf-btn" onclick="showSection('${pId}')"><i class="fas fa-arrow-left"></i><div><div class="sf-dir">Previous</div><div class="sf-title">${secTitle(pId)}</div></div></div>` : `<div class="sf-btn sf-disabled"><i class="fas fa-arrow-left"></i><div><div class="sf-dir">Previous</div><div class="sf-title">Start</div></div></div>`;
  const nxt = nId ? `<div class="sf-btn sf-next" onclick="showSection('${nId}')"><div><div class="sf-dir">Next</div><div class="sf-title">${secTitle(nId)}</div></div><i class="fas fa-arrow-right"></i></div>` : `<div class="sf-btn sf-disabled sf-next"><div><div class="sf-dir">Next</div><div class="sf-title">End</div></div><i class="fas fa-arrow-right"></i></div>`;
  ct.innerHTML = `<div class="reader-section">
    <div class="rs-header"><div class="rs-chapter"><i class="fas fa-book"></i> ${pTitle}</div><div class="rs-title">${secTitle(id)}</div></div>
    ${html}
    <div class="section-footer">
      <div class="sf-nav">${prev}${nxt}</div>
      <div class="sf-complete-row">
        <div class="sf-complete ${comp ? 'done' : ''}" onclick="toggleComplete('${id}')">
          <i class="fas ${comp ? 'fa-check-circle' : 'fa-circle'}"></i><span>${comp ? 'Completed' : 'Mark Complete'}</span>
        </div>
      </div>
    </div></div>`;
  ct.scrollTop = 0;
  document.querySelectorAll('.toc-item').forEach(e => e.classList.remove('active'));
  const act = document.getElementById('toc-' + id);
  if (act) act.classList.add('active');
  initProgress();
}

// ===== TOGGLE COMPLETE =====
function toggleComplete(id) {
  const now = toggleDone(id);
  SFX.play(now ? 'success' : 'click');
  if (now) confetti(35);
  const btn = document.querySelector('.sf-complete');
  if (btn) { btn.className = 'sf-complete' + (now ? ' done' : ''); btn.innerHTML = `<i class="fas ${now ? 'fa-check-circle' : 'fa-circle'}"></i><span>${now ? 'Completed' : 'Mark Complete'}</span>`; }
  refreshTOC();
  toast(now ? 'Lesson completed!' : 'Marked incomplete', now ? 'success' : 'info');
}

// ===== READING PROGRESS =====
function initProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;
  const fill = bar.querySelector('.rp-fill');
  const panel = document.querySelector('.view-panel');
  if (!panel || !fill) return;
  const h = () => { const s = panel.scrollTop, sh = panel.scrollHeight - panel.clientHeight; fill.style.width = sh > 0 ? Math.min((s / sh) * 100, 100) + '%' : '0%'; };
  panel.removeEventListener('scroll', h);
  panel.addEventListener('scroll', h, { passive: true });
  h();
}

// ===== CONTROLS =====
function updLang() { const l = document.getElementById('lang-switch'); if (l) { l.classList.remove('active-en', 'active-ar'); l.classList.add(lang === 'en' ? 'active-en' : 'active-ar'); } }
function toggleLang() { SFX.play('click'); lang = lang === 'en' ? 'ar' : 'en'; localStorage.setItem('f_lang', lang); updLang(); curId ? showSection(curId) : showReader(); }
function toggleTheme() { const h = document.documentElement, n = h.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; h.setAttribute('data-theme', n); localStorage.setItem('f_theme', n); const b = document.getElementById('btn-theme'); if (b) b.innerHTML = n === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; SFX.play('click'); }
function toggleSFX() { SFX._on = !SFX._on; localStorage.setItem('f_sfx', SFX._on ? 'on' : 'off'); const b = document.getElementById('btn-sfx'); if (b) b.innerHTML = SFX._on ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>'; SFX.play('click'); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sbOverlay').classList.toggle('show'); }

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.target.tagName === 'INPUT') return;
  if (e.key === '/') { e.preventDefault(); document.getElementById('toc-search').focus(); }
  if (e.key === 'Escape') { document.getElementById('toc-search').blur(); document.getElementById('sidebar').classList.remove('open'); document.getElementById('sbOverlay').classList.remove('show'); }
  if (e.key === 'ArrowLeft' && curId) { const p = prevId(curId); if (p) showSection(p); }
  if (e.key === 'ArrowRight' && curId) { const n = nextId(curId); if (n) showSection(n); }
});

// ===== TOAST =====
function toast(msg, type, dur) {
  const c = document.getElementById('toast-container'), t = document.createElement('div');
  t.className = 'toast toast-' + (type || 'info');
  t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span class="toast-text">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 200); }, dur || 3000);
}

// ===== CONFETTI =====
function confetti(n) {
  const c = document.getElementById('confetti-container');
  const cols = ['#f59e0b', '#22d3ee', '#ec4899', '#8b5cf6', '#10b981'];
  for (let i = 0; i < n; i++) {
    const e = document.createElement('div');
    e.className = 'confetti-piece';
    e.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % cols.length]};width:${5 + Math.random() * 7}px;height:${5 + Math.random() * 7}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};--d:${2 + Math.random() * 2}s;--dd:${Math.random() * 0.4}s`;
    c.appendChild(e);
    setTimeout(() => e.remove(), 4000);
  }
}

// ===== RIPPLE =====
document.addEventListener('click', e => {
  const b = e.target.closest('.tb-btn, .toc-item, .sidebar-header, .lang-switch, .chapter-card, .cm-lesson, .sf-btn, .sf-complete, .db-continue');
  if (!b) return;
  const r = b.getBoundingClientRect(), rp = document.createElement('span');
  rp.className = 'ripple';
  const sz = Math.max(r.width, r.height);
  rp.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px`;
  b.appendChild(rp);
  setTimeout(() => rp.remove(), 500);
});

// ===== ACCORDION =====
function toggleAcc(el) {
  const item = el.closest('.acc-item');
  if (!item) return;
  item.classList.toggle('open');
  const body = item.querySelector('.acc-body');
  if (!body) return;
  body.style.maxHeight = item.classList.contains('open') ? body.scrollHeight + 'px' : '0';
}

// ===== FLASHCARDS =====
const fcW = [
  {b:'be',p:'was/were',pp:'been',d:'يكون'},{b:'begin',p:'began',pp:'begun',d:'يبدا'},{b:'break',p:'broke',pp:'broken',d:'يكسر'},
  {b:'bring',p:'brought',pp:'brought',d:'يجيب'},{b:'buy',p:'bought',pp:'bought',d:'يشري'},{b:'choose',p:'chose',pp:'chosen',d:'يختار'},
  {b:'come',p:'came',pp:'come',d:'يجي'},{b:'do',p:'did',pp:'done',d:'يدير'},{b:'drink',p:'drank',pp:'drunk',d:'يشرب'},
  {b:'drive',p:'drove',pp:'driven',d:'يقود'},{b:'eat',p:'ate',pp:'eaten',d:'ياكل'},{b:'feel',p:'felt',pp:'felt',d:'يحس'},
  {b:'find',p:'found',pp:'found',d:'يلقى'},{b:'fly',p:'flew',pp:'flown',d:'يطير'},{b:'forget',p:'forgot',pp:'forgotten',d:'ينسى'},
  {b:'give',p:'gave',pp:'given',d:'يعطي'},{b:'go',p:'went',pp:'gone',d:'يمشي'},{b:'grow',p:'grew',pp:'grown',d:'يكبر'},
  {b:'know',p:'knew',pp:'known',d:'يعرف'},{b:'make',p:'made',pp:'made',d:'يصنع'}
];
let fcI = 0, fcFlip = false;
function showFC(i) {
  const w = fcW[i];
  const f = document.getElementById('fcWord'), pa = document.getElementById('fcPast'), pp = document.getElementById('fcPp'), dz = document.getElementById('fcDz'), card = document.getElementById('fcCard'), cnt = document.getElementById('fcCount');
  if (f) f.textContent = w.b; if (pa) pa.textContent = w.p; if (pp) pp.textContent = w.pp; if (dz) dz.textContent = w.d;
  if (card) card.classList.remove('flipped'); fcFlip = false;
  if (cnt) cnt.textContent = (i + 1) + '/' + fcW.length; fcI = i;
}
function flipCard() { fcFlip = !fcFlip; const c = document.getElementById('fcCard'); if (c) c.classList.toggle('flipped'); }
function nextCard() { if (fcI < fcW.length - 1) showFC(fcI + 1); }
function prevCard() { if (fcI > 0) showFC(fcI - 1); }

// ===== QUIZ =====
const qData = [
  { q: 'What tense uses "yesterday"?', o: ['Simple Present','Simple Past','Present Perfect','Future'], a: 1 },
  { q: 'Passive: "The book ___ by him."', o: ['was written','wrote','is writing','has wrote'], a: 0 },
  { q: 'Reported: "I am happy" → He said he ___ happy.', o: ['is','was','has been','will be'], a: 1 },
  { q: 'Type 2: "If I ___ rich, I would travel."', o: ['was','were','am','will be'], a: 1 },
  { q: '"despite" = ?', o: ['Therefore','However','Although','In addition'], a: 2 },
  { q: '"Look after" means:', o: ['search','take care of','cancel','invent'], a: 1 },
  { q: '"I enjoy ___."', o: ['to swim','swimming','swam','swim'], a: 1 },
  { q: '"It can ___ easily."', o: ['be done','done','do','doing'], a: 0 },
  { q: '"She lived here ___ 2010."', o: ['for','since','ago','in'], a: 1 },
  { q: '"I wish I ___ studied harder."', o: ['have','had','would','will'], a: 1 }
];
let qI = 0, qS = 0, qA = false;
function loadQ() {
  const d = qData[qI], q = document.getElementById('qText'), o = document.getElementById('qOpts'), fb = document.getElementById('qFeedback');
  if (q) q.textContent = d.q;
  if (o) { o.innerHTML = ''; d.o.forEach((t, i) => { const b = document.createElement('div'); b.className = 'quiz-opt'; b.textContent = t; b.onclick = () => checkQ(i); o.appendChild(b); }); }
  if (fb) { fb.style.display = 'none'; fb.className = 'quiz-feedback'; }
  qA = false;
}
function checkQ(i) {
  if (qA) return; qA = true;
  const d = qData[qI], opts = document.querySelectorAll('#qOpts .quiz-opt');
  opts.forEach((o, j) => { if (j === d.a) o.classList.add('correct'); if (j === i && i !== d.a) o.classList.add('wrong'); });
  if (i === d.a) qS++;
  const fb = document.getElementById('qFeedback');
  if (fb) { fb.textContent = i === d.a ? 'Correct!' : 'Wrong: ' + d.o[d.a]; fb.style.display = 'block'; fb.classList.add('show'); }
}
function nextQ() {
  if (qI < qData.length - 1) { qI++; loadQ(); }
  else { const w = document.getElementById('qWrap'); if (w) w.innerHTML = `<div class="quiz-score">${qS}/${qData.length}</div><p style="text-align:center;margin-top:8px">Great job! Refresh to retry.</p>`; }
}

// ===== EXPORTS =====
window.showSection = showSection;
window.showReader = showReader;
window.showChapter = showChapter;
window.toggleTheme = toggleTheme;
window.toggleSFX = toggleSFX;
window.toggleSidebar = toggleSidebar;
window.filterTOC = filterTOC;
window.toggleLang = toggleLang;
window.toggleComplete = toggleComplete;
window.toast = toast;
window.toggleAcc = toggleAcc;
window.showFC = showFC;
window.flipCard = flipCard;
window.nextCard = nextCard;
window.prevCard = prevCard;
window.loadQ = loadQ;
window.checkQ = checkQ;
window.nextQ = nextQ;
