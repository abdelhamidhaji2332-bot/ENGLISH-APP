import { BDARIJA_SECTIONS, BDARIJA_SRC } from './bdarija_content.js';

// ===== SOUND SYNTH =====
const SoundSynth = {
  _enabled: true, _ctx: null,
  _getCtx() { if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)(); return this._ctx; },
  play(type) {
    if (!this._enabled) return;
    try {
      const ctx = this._getCtx();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      g.gain.value = 0.08;
      if (type === "click") { o.frequency.value = 600; o.type = "sine"; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08); o.start(); o.stop(ctx.currentTime + 0.08); }
      else if (type === "success") { o.frequency.value = 880; o.type = "sine"; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); o.start(); o.stop(ctx.currentTime + 0.3); setTimeout(() => { const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); o2.connect(g2); g2.connect(ctx.destination); o2.frequency.value = 1100; o2.type = "sine"; g2.gain.value = 0.08; g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); o2.start(); o2.stop(ctx.currentTime + 0.3); }, 150); }
    } catch(e) {}
  }
};

// ===== STATE =====
let guideContent = null;
let currentSectionId = null;
let currentLang = localStorage.getItem("falcon_lang") || "en";

function getCompleted() {
  try { return JSON.parse(localStorage.getItem("bdarija_completed") || "[]"); } catch(e) { return []; }
}
function setCompleted(list) { localStorage.setItem("bdarija_completed", JSON.stringify(list)); }
function isCompleted(id) { return getCompleted().includes(id); }
function toggleCompleted(id) {
  let list = getCompleted();
  if (list.includes(id)) { list = list.filter(x => x !== id); } else { list.push(id); }
  setCompleted(list);
  return list.includes(id);
}
function getChapterSections(chapterId) {
  return BDARIJA_SECTIONS.filter(s => s.parent === chapterId);
}
function countCompleted(chapterId) {
  const subs = getChapterSections(chapterId);
  const completed = getCompleted();
  return subs.filter(s => completed.includes(s.id)).length;
}
function getNextSection(currentId) {
  const s = BDARIJA_SECTIONS.find(x => x.id === currentId);
  if (!s || !s.parent) return null;
  const siblings = getChapterSections(s.parent);
  const idx = siblings.findIndex(x => x.id === currentId);
  if (idx >= 0 && idx < siblings.length - 1) return siblings[idx + 1].id;
  return null;
}
function getPrevSection(currentId) {
  const s = BDARIJA_SECTIONS.find(x => x.id === currentId);
  if (!s || !s.parent) return null;
  const siblings = getChapterSections(s.parent);
  const idx = siblings.findIndex(x => x.id === currentId);
  if (idx > 0) return siblings[idx - 1].id;
  return null;
}

// ===== BOOT =====
(function bootSequence() {
  if (sessionStorage.getItem("falcon_booted")) {
    document.getElementById("boot-overlay").style.display = "none";
    document.getElementById("app").style.display = "flex";
    initApp(); return;
  }
  const lines = document.querySelectorAll(".bt-line");
  let maxDelay = 0;
  lines.forEach(el => {
    const d = parseInt(el.dataset.delay) || 0;
    el.style.animationDelay = d + "ms";
    if (d > maxDelay) maxDelay = d;
  });
  const logo = document.querySelector(".bt-logo");
  if (logo) logo.style.animationDelay = maxDelay + "ms";
  const finalDelay = maxDelay + 2600;
  setTimeout(() => {
    const ov = document.getElementById("boot-overlay");
    ov.classList.add("fade");
    sessionStorage.setItem("falcon_booted", "1");
    setTimeout(() => {
      ov.style.display = "none";
      document.getElementById("app").style.display = "flex";
      document.getElementById("app").style.opacity = "0";
      initApp();
      setTimeout(() => { document.getElementById("app").style.transition = "opacity 0.4s"; document.getElementById("app").style.opacity = "1"; }, 50);
    }, 800);
  }, finalDelay);
})();

function initApp() {
  const theme = localStorage.getItem("falcon_theme");
  if (theme) document.documentElement.setAttribute("data-theme", theme);
  if (localStorage.getItem("falcon_sfx") === "off") { SoundSynth._enabled = false; const sb = document.getElementById("btn-sfx"); if (sb) sb.innerHTML = '<i class="fas fa-volume-mute"></i>'; }
  if (theme) { const tb = document.getElementById("btn-theme"); if (tb) tb.innerHTML = theme === "dark" ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; }
  updateLangClass();
  const bg = document.getElementById("bg-canvas");
  if (bg && !bg.querySelector(".bg-orb-3")) {
    const orb = document.createElement("div"); orb.className = "bg-orb-3"; bg.appendChild(orb);
  }
  loadGuide();
}

// ===== LOAD GUIDE =====
async function loadGuide() {
  try {
    const resp = await fetch(BDARIJA_SRC);
    guideContent = await resp.text();
    guideContent = guideContent.replace(/<script[\s\S]*?<\/script>/gi, '');
    initTOC();
    showReader();
  } catch(e) {
    document.getElementById("reader-content").innerHTML = `<div class="reader-error"><i class="fas fa-exclamation-triangle"></i> Could not load guide content. Make sure <strong>${BDARIJA_SRC}</strong> is available.</div>`;
  }
}

// ===== TOC =====
function initTOC() {
  const list = document.getElementById("toc-list");
  list.innerHTML = "";
  BDARIJA_SECTIONS.forEach((s) => {
    if (s.type === "chapter") {
      const div = document.createElement("div");
      div.className = "toc-chapter";
      div.innerHTML = `<i class="fas ${s.icon}"></i> ${s.title}`;
      div.onclick = () => showChapterIntro(s.id);
      list.appendChild(div);
    } else {
      const a = document.createElement("a");
      a.className = "toc-item";
      a.id = "toc-" + s.id;
      a.textContent = s.title;
      a.onclick = () => showSection(s.id);
      updateTocComplete(a, s.id);
      list.appendChild(a);
    }
  });
}
function updateTocComplete(el, id) {
  if (!el) return;
  if (isCompleted(id)) el.classList.add("completed");
  else el.classList.remove("completed");
}
function refreshTocComplete() {
  BDARIJA_SECTIONS.forEach(s => {
    const el = document.getElementById("toc-" + s.id);
    if (el) updateTocComplete(el, s.id);
  });
}
function filterTOC(val) {
  const q = val.toLowerCase().trim();
  const chapters = document.querySelectorAll(".toc-chapter");
  const items = document.querySelectorAll(".toc-item");
  chapters.forEach(el => { el.style.display = q ? "none" : ""; });
  items.forEach(el => {
    const match = !q || el.textContent.toLowerCase().includes(q);
    el.style.display = match ? "" : "none";
  });
}

// ===== BREADCRUMB =====
function setBreadcrumb(text) {
  document.getElementById("view-title").innerHTML = text;
}

const CARD_COLORS = { grammar:"gold", vocabulary:"violet", comprehension:"cyan", writing:"gold", verbs:"gold", "strategy-chapter":"violet", exams:"cyan", bonus:"gold" };
const CHAPTER_ICONS = { grammar:"fa-book", vocabulary:"fa-font", comprehension:"fa-brain", writing:"fa-pen", verbs:"fa-table", "strategy-chapter":"fa-trophy", exams:"fa-file-alt", bonus:"fa-gem" };

// ===== SHOW READER (DASHBOARD) =====
function showReader() {
  SoundSynth.play("click");
  currentSectionId = null;
  setBreadcrumb("Home");
  document.querySelectorAll(".toc-item").forEach(el => el.classList.remove("active"));
  const chapters = BDARIJA_SECTIONS.filter(s => s.type === "chapter");
  const completedList = getCompleted();
  const totalComplete = completedList.length;
  const totalSections = BDARIJA_SECTIONS.filter(s => s.type === "section").length;
  const functionsCount = BDARIJA_SECTIONS.filter(s => s.parent === "functions").length;
  const writingTypes = BDARIJA_SECTIONS.filter(s => s.parent === "writing").length;

  const lastSectionId = localStorage.getItem("bdarija_last_section");
  let continueHtml = "";
  if (lastSectionId) {
    const ls = BDARIJA_SECTIONS.find(x => x.id === lastSectionId);
    if (ls && ls.parent) {
      const parentTitle = BDARIJA_SECTIONS.find(x => x.id === ls.parent)?.title || "";
      continueHtml = `<div class="db-continue" onclick="showSection('${ls.id}')">
        <div class="dc-left">
          <div class="dc-icon"><i class="fas fa-play-circle"></i></div>
          <div class="dc-info">
            <div class="dc-label">Continue Learning</div>
            <div class="dc-title">${ls.title}</div>
            <div class="dc-chapter">${parentTitle}</div>
          </div>
        </div>
        <div class="dc-arrow"><i class="fas fa-arrow-right"></i></div>
      </div>`;
    }
  }

  const statsHtml = `<div class="db-stats">
    <div class="db-stat gold-ring"><span class="ds-value">${totalSections}</span> Lessons</div>
    <div class="db-stat cyan-ring cyan-stat"><span class="ds-value">${totalComplete}/${totalSections}</span> Completed</div>
    <div class="db-stat violet-ring"><span class="ds-value">${functionsCount}</span> Functions</div>
    <div class="db-stat violet-ring"><span class="ds-value">${writingTypes}</span> Writing Types</div>
  </div>`;

  const cards = chapters.map(s => {
    const color = CARD_COLORS[s.id] || "gold";
    const subs = getChapterSections(s.id);
    const done = countCompleted(s.id);
    const pct = subs.length ? Math.round((done / subs.length) * 100) : 0;
    let desc = "";
    if (s.id === "comprehension") desc = "True/False, questions, word reference & more";
    else if (s.id === "grammar") desc = "Tenses, passive, conditionals, modals & more";
    else if (s.id === "writing") desc = "9 text types with full Bridge templates";
    else if (s.id === "verbs") desc = "100 irregular verbs + interactive flashcards";
    else if (s.id === "vocabulary") desc = "10 thematic units with exercises";
    else if (s.id === "strategy-chapter") desc = "Exam tips, common mistakes, study plan & quiz";
    else if (s.id === "exams") desc = "Answer keys & national exam samples";
    else if (s.id === "bonus") desc = "Proverbs, slang, resources & more";

    return `<div class="chapter-card card-${color}" onclick="showChapterIntro('${s.id}')">
      <div class="cc-row">
        <div class="cc-icon"><i class="fas ${s.icon}"></i></div>
        <div class="cc-title">${s.title}</div>
      </div>
      <div class="cc-desc">${desc}</div>
      <div class="cc-progress">
        <div class="cc-progress-bar"><div class="cc-progress-fill" style="width:${pct}%"></div></div>
        <span class="cc-progress-text">${done}/${subs.length}</span>
      </div>
    </div>`;
  }).join("");

  document.getElementById("reader-content").innerHTML = `
    <div class="dashboard">
      <div class="db-hero">
        <div class="db-icon"><i class="fas fa-graduation-cap"></i></div>
        <h1>BAC ENGLISH</h1>
        <p class="db-sub">${currentLang === "ar" ? "الدليل الشامل لاجتياز امتحان الباكالوريا" : "Complete BAC English Study Guide"}</p>
        <p class="db-author">${currentLang === "ar" ? "إعداد عبد الحميد حاجي" : "by Abdelhamid Haji"}</p>
      </div>
      ${continueHtml}
      ${statsHtml}
      <div class="db-path-title">${currentLang === "ar" ? "📚 مسار التعلم" : "📚 Your Learning Path"}</div>
      <div class="db-chapters">${cards}</div>
    </div>`;
}

// ===== SHOW CHAPTER INTRO =====
function showChapterIntro(id) {
  SoundSynth.play("click");
  currentSectionId = id;
  localStorage.setItem("bdarija_last_section", id);
  const s = BDARIJA_SECTIONS.find(x => x.id === id);
  const subs = getChapterSections(id);
  const chTitle = s ? s.title : id;
  const done = countCompleted(id);
  const total = subs.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  setBreadcrumb(`
    <span class="bc-home" onclick="showReader()"><i class="fas fa-home"></i></span>
    <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
    <span class="bc-current">${chTitle}</span>
  `);

  const lessons = subs.map((x) => {
    const comp = isCompleted(x.id);
    return `<div class="cm-lesson" onclick="showSection('${x.id}')">
      <div class="cl-status ${comp ? 'completed' : ''}"><i class="fas ${comp ? 'fa-check' : ''}"></i></div>
      <div class="cl-info">
        <div class="cl-title">${x.title}</div>
        <div class="cl-meta">${comp ? '✓ Completed' : 'Click to start'}</div>
      </div>
      <div class="cl-arrow"><i class="fas fa-chevron-right"></i></div>
    </div>`;
  }).join("");

  document.getElementById("reader-content").innerHTML = `
    <div class="chapter-module">
      <div class="cm-header">
        <div class="cm-icon"><i class="fas ${s ? s.icon : "fa-book"}"></i></div>
        <h2>${chTitle}</h2>
        <p class="cm-sub">${total} lesson${total !== 1 ? "s" : ""} &mdash; ${done} completed</p>
        <div class="cm-big-progress">
          <div class="cbp-bar"><div class="cbp-fill" style="width:${pct}%"></div></div>
          <span class="cbp-text">${pct}%</span>
        </div>
      </div>
      <div class="cm-lessons">${lessons}</div>
    </div>`;

  document.querySelectorAll(".toc-item").forEach(el => el.classList.remove("active"));
}

// ===== SHOW SECTION =====
function showSection(id) {
  SoundSynth.play("click");
  currentSectionId = id;
  localStorage.setItem("bdarija_last_section", id);

  const chapterIds = BDARIJA_SECTIONS.filter(s => s.type === "chapter").map(s => s.id);
  if (chapterIds.includes(id)) { showChapterIntro(id); return; }

  const container = document.getElementById("reader-content");
  let html = extractSection(id);
  if (!html) {
    container.innerHTML = `<div class="reader-empty"><i class="fas fa-file"></i> Section not found.</div>`;
    return;
  }

  const s = BDARIJA_SECTIONS.find(x => x.id === id);
  const parentTitle = s && s.parent ? getSectionTitle(s.parent) : "";
  const sectionTitle = getSectionTitle(id);
  const comp = isCompleted(id);
  const nextId = getNextSection(id);
  const prevId = getPrevSection(id);

  setBreadcrumb(`
    <span class="bc-home" onclick="showReader()"><i class="fas fa-home"></i></span>
    <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
    <span class="bc-chapter" onclick="showChapterIntro('${s.parent}')"><i class="fas fa-folder-open"></i> ${parentTitle}</span>
    <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
    <span class="bc-current">${sectionTitle}</span>
  `);

  const prevBtn = prevId
    ? `<div class="sf-btn sf-prev" onclick="showSection('${prevId}')"><i class="fas fa-arrow-left"></i><div><div class="sf-direction">Previous</div><div class="sf-title">${getSectionTitle(prevId)}</div></div></div>`
    : `<div class="sf-btn sf-disabled"><i class="fas fa-arrow-left"></i><div><div class="sf-direction">Previous</div><div class="sf-title">Start of chapter</div></div></div>`;

  const nextBtn = nextId
    ? `<div class="sf-btn sf-next" onclick="showSection('${nextId}')"><div><div class="sf-direction">Next</div><div class="sf-title">${getSectionTitle(nextId)}</div></div><i class="fas fa-arrow-right"></i></div>`
    : `<div class="sf-btn sf-disabled sf-next"><div><div class="sf-direction">Next</div><div class="sf-title">End of chapter</div></div><i class="fas fa-arrow-right"></i></div>`;

  container.innerHTML = `
    <div class="reader-section">
      <div class="rs-header">
        <div><div class="rs-chapter"><i class="fas fa-book"></i> ${parentTitle}</div>
        <div class="rs-title">${sectionTitle}</div></div>
      </div>
      ${html}
      <div class="section-footer">
        <div class="sf-nav">${prevBtn}${nextBtn}</div>
        <div class="sf-complete-row">
          <div class="sf-complete ${comp ? 'done' : ''}" onclick="toggleSectionComplete('${id}')">
            <i class="fas ${comp ? 'fa-check-circle' : 'fa-circle'}"></i>
            <span>${comp ? 'Completed' : 'Mark as Complete'}</span>
          </div>
        </div>
      </div>
    </div>`;

  container.scrollTop = 0;
  document.querySelectorAll(".toc-item").forEach(el => el.classList.remove("active"));
  const active = document.getElementById("toc-" + id);
  if (active) active.classList.add("active");
  initReadingProgress();
}

// ===== TOGGLE COMPLETE =====
function toggleSectionComplete(id) {
  const nowCompleted = toggleCompleted(id);
  SoundSynth.play(nowCompleted ? "success" : "click");
  if (nowCompleted) createConfetti(40);
  const btn = document.querySelector(".sf-complete");
  if (btn) {
    btn.className = "sf-complete" + (nowCompleted ? " done" : "");
    btn.innerHTML = `<i class="fas ${nowCompleted ? 'fa-check-circle' : 'fa-circle'}"></i><span>${nowCompleted ? 'Completed' : 'Mark as Complete'}</span>`;
  }
  refreshTocComplete();
  toast(nowCompleted ? "Lesson completed! 🎉" : "Lesson marked incomplete", nowCompleted ? "success" : "info");
}

// ===== READING PROGRESS =====
function initReadingProgress() {
  const bar = document.getElementById("reading-progress");
  if (!bar) return;
  const fill = bar.querySelector(".rp-fill") || (() => { const f = document.createElement("div"); f.className = "rp-fill"; bar.appendChild(f); return f; })();
  const panel = document.querySelector(".view-panel");
  if (!panel) return;
  const handler = () => {
    const scrollTop = panel.scrollTop;
    const scrollHeight = panel.scrollHeight - panel.clientHeight;
    const pct = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;
    fill.style.width = pct + "%";
  };
  panel.removeEventListener("scroll", handler);
  panel.addEventListener("scroll", handler, { passive: true });
  handler();
}

// ===== EXTRACT SECTION =====
function extractSection(id) {
  if (!guideContent) return null;
  const regex = new RegExp(`<div[^>]*id=["']page-${id}["'][^>]*>([\\s\\S]*?)<\\/div>\\s*(?:<div[^>]*id=["']page-|$)`);
  const match = guideContent.match(regex);
  if (match) return match[1];
  return null;
}

function getSectionTitle(id) {
  const s = BDARIJA_SECTIONS.find(x => x.id === id);
  return s ? s.title : "BAC English";
}

// ===== LANGUAGE =====
function updateLangClass() {
  const ls = document.getElementById("lang-switch");
  if (ls) {
    ls.classList.remove("active-en", "active-ar");
    ls.classList.add(currentLang === "en" ? "active-en" : "active-ar");
  }
}
function toggleLang() {
  SoundSynth.play("click");
  currentLang = currentLang === "en" ? "ar" : "en";
  localStorage.setItem("falcon_lang", currentLang);
  updateLangClass();
  if (currentSectionId) showSection(currentSectionId);
  else showReader();
}
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem("falcon_theme", next);
  const btn = document.getElementById("btn-theme");
  if (btn) btn.innerHTML = next === "dark" ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  SoundSynth.play("click");
}
function toggleSFX() {
  SoundSynth._enabled = !SoundSynth._enabled;
  localStorage.setItem("falcon_sfx", SoundSynth._enabled ? "on" : "off");
  const btn = document.getElementById("btn-sfx");
  if (btn) btn.innerHTML = SoundSynth._enabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
  SoundSynth.play("click");
}
function toggleSidebar() {
  const sb = document.getElementById("sidebar");
  const ov = document.getElementById("sbOverlay");
  sb.classList.toggle("open");
  if (ov) ov.classList.toggle("show");
}

// ===== KEYBOARD =====
document.addEventListener("keydown", function(e) {
  if (e.ctrlKey || e.metaKey || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === "/") { e.preventDefault(); document.getElementById("toc-search").focus(); }
  if (e.key === "Escape") { document.getElementById("toc-search").blur(); document.getElementById("sidebar").classList.remove("open"); }
  if (e.key === "ArrowLeft" && currentSectionId) { const p = getPrevSection(currentSectionId); if (p) showSection(p); }
  if (e.key === "ArrowRight" && currentSectionId) { const n = getNextSection(currentSectionId); if (n) showSection(n); }
});

// ===== TOAST =====
function toast(msg, type, duration) {
  const container = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = "toast toast-" + (type || "info");
  t.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i><span class="toast-text">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
  container.appendChild(t);
  setTimeout(() => { t.classList.add("removing"); setTimeout(() => t.remove(), 250); }, duration || 3500);
}

// ===== CONFETTI =====
function createConfetti(count) {
  const c = document.getElementById("confetti-container");
  const colors = ["#FFD93D","#00E5FF","#FF6B9D","#7C3AED","#00E5FF","#FFD93D"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `left:${Math.random()*100}%;background:${colors[i%colors.length]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>0.5?"50%":"2px"};--d:${2+Math.random()*2}s;--dd:${Math.random()*0.5}s`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ===== RIPPLE =====
document.addEventListener("click", function(e) {
  const btn = e.target.closest(".tb-btn, .toc-item, .ci-link, .card, .sidebar-header, .lang-switch, .chapter-card, .cm-lesson, .sf-btn, .sf-complete, .db-continue");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
});

// ===== ACCORDION =====
function toggleAcc(el) {
  const item = el.closest(".acc-item");
  if (!item) return;
  item.classList.toggle("open");
  const body = item.querySelector(".acc-body");
  if (!body) return;
  if (item.classList.contains("open")) {
    body.style.maxHeight = body.scrollHeight + "px";
  } else {
    body.style.maxHeight = "0";
  }
}

// ===== FLASHCARDS =====
const fcWords = [
  {base:'be',past:'was/were',pp:'been',dz:'يكون'},{base:'begin',past:'began',pp:'begun',dz:'يبدا'},{base:'break',past:'broke',pp:'broken',dz:'يكسر'},
  {base:'bring',past:'brought',pp:'brought',dz:'يجيب'},{base:'buy',past:'bought',pp:'bought',dz:'يشري'},{base:'choose',past:'chose',pp:'chosen',dz:'يختار'},
  {base:'come',past:'came',pp:'come',dz:'يجي'},{base:'do',past:'did',pp:'done',dz:'يدير'},{base:'drink',past:'drank',pp:'drunk',dz:'يشرب'},
  {base:'drive',past:'drove',pp:'driven',dz:'يقود'},{base:'eat',past:'ate',pp:'eaten',dz:'ياكل'},{base:'feel',past:'felt',pp:'felt',dz:'يحس'},
  {base:'find',past:'found',pp:'found',dz:'يلقى'},{base:'fly',past:'flew',pp:'flown',dz:'يطير'},{base:'forget',past:'forgot',pp:'forgotten',dz:'ينسى'},
  {base:'give',past:'gave',pp:'given',dz:'يعطي'},{base:'go',past:'went',pp:'gone',dz:'يمشي'},{base:'grow',past:'grew',pp:'grown',dz:'يكبر'},
  {base:'know',past:'knew',pp:'known',dz:'يعرف'},{base:'make',past:'made',pp:'made',dz:'يصنع'}
];
let fcIndex = 0;
let fcFlipped = false;
function showFlashcard(i) {
  const w = fcWords[i];
  const front = document.getElementById('fcWord');
  const past = document.getElementById('fcPast');
  const pp = document.getElementById('fcPp');
  const dz = document.getElementById('fcDz');
  const card = document.getElementById('fcCard');
  const count = document.getElementById('fcCount');
  if (front) front.textContent = w.base;
  if (past) past.textContent = w.past;
  if (pp) pp.textContent = w.pp;
  if (dz) dz.textContent = w.dz;
  if (card) card.classList.remove('flipped');
  fcFlipped = false;
  if (count) count.textContent = (i+1) + '/' + fcWords.length;
  fcIndex = i;
}
function flipCard() {
  fcFlipped = !fcFlipped;
  const card = document.getElementById('fcCard');
  if (card) card.classList.toggle('flipped');
}
function nextCard() { if (fcIndex < fcWords.length - 1) showFlashcard(fcIndex + 1); }
function prevCard() { if (fcIndex > 0) showFlashcard(fcIndex - 1); }

// ===== QUIZ =====
const quizData = [
  { q: 'What tense uses "yesterday" as a signal word?', opts: ['Simple Present','Simple Past','Present Perfect','Future'], ans: 1 },
  { q: 'Choose the correct passive form: "The book ___ by him."', opts: ['was written','wrote','is writing','has wrote'], ans: 0 },
  { q: 'Report: "I am happy" → He said that he ___ happy.', opts: ['is','was','has been','will be'], ans: 1 },
  { q: 'Conditional Type 2: "If I ___ rich, I would travel."', opts: ['was','were','am','will be'], ans: 1 },
  { q: 'Which linking word means "despite"?', opts: ['Therefore','However','Although','In addition'], ans: 2 },
  { q: '"Look after" means:', opts: ['search','take care of','cancel','invent'], ans: 1 },
  { q: 'Gerund: "I enjoy ___."', opts: ['to swim','swimming','swam','swim'], ans: 1 },
  { q: 'Passive with modal: "It can ___ easily."', opts: ['be done','done','do','doing'], ans: 0 },
  { q: '"She has lived here ___ 2010." Fill:', opts: ['for','since','ago','in'], ans: 1 },
  { q: 'I wish I ___ studied harder.', opts: ['have','had','would','will'], ans: 1 }
];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
function loadQuiz() {
  const d = quizData[quizIndex];
  const qEl = document.getElementById('qText');
  const optsEl = document.getElementById('qOpts');
  const fbEl = document.getElementById('qFeedback');
  if (qEl) qEl.textContent = d.q;
  if (optsEl) {
    optsEl.innerHTML = '';
    d.opts.forEach((o, i) => {
      const btn = document.createElement('div');
      btn.className = 'quiz-opt';
      btn.textContent = o;
      btn.onclick = () => checkQuiz(i, btn);
      optsEl.appendChild(btn);
    });
  }
  if (fbEl) { fbEl.style.display = 'none'; fbEl.className = 'quiz-feedback'; }
  quizAnswered = false;
}
function checkQuiz(sel, el) {
  if (quizAnswered) return;
  quizAnswered = true;
  const d = quizData[quizIndex];
  const opts = document.querySelectorAll('#qOpts .quiz-opt');
  opts.forEach((o, i) => {
    if (i === d.ans) o.classList.add('correct');
    if (i === sel && sel !== d.ans) o.classList.add('wrong');
  });
  if (sel === d.ans) quizScore++;
  const fb = document.getElementById('qFeedback');
  if (fb) {
    fb.textContent = sel === d.ans ? 'Correct!' : 'Wrong. Answer: ' + d.opts[d.ans];
    fb.style.display = 'block';
    fb.classList.add('show');
  }
}
function nextQuiz() {
  if (quizIndex < quizData.length - 1) {
    quizIndex++;
    loadQuiz();
  } else {
    const wrap = document.getElementById('qWrap');
    if (wrap) wrap.innerHTML = `<div class="quiz-score">${quizScore}/${quizData.length}</div><p style="text-align:center">Great job! Refresh to try again.</p>`;
  }
}

// ===== EXPORTS =====
window.showSection = showSection;
window.showReader = showReader;
window.showChapterIntro = showChapterIntro;
window.toggleTheme = toggleTheme;
window.toggleSFX = toggleSFX;
window.toggleSidebar = toggleSidebar;
window.filterTOC = filterTOC;
window.toggleLang = toggleLang;
window.toggleSectionComplete = toggleSectionComplete;
window.toast = toast;
window.createConfetti = createConfetti;
window.toggleAcc = toggleAcc;
window.showFlashcard = showFlashcard;
window.flipCard = flipCard;
window.nextCard = nextCard;
window.prevCard = prevCard;
window.loadQuiz = loadQuiz;
window.checkQuiz = checkQuiz;
window.nextQuiz = nextQuiz;
