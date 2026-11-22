'use strict';
/* ===== ミミィのえいご  app.js ===== */
const APP_VER = '1.8.0';
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DAY = 864e5;
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayOffset = n => { const d = new Date(); d.setDate(d.getDate() + n); return todayKey(d); };

/* ---------- ことばデータを展開 ---------- */
const WORDS = [], WMAP = {};
CATEGORIES.forEach((c, ci) => {
  c.words = [];
  c.list.trim().split('\n').forEach((line, i) => {
    const p = line.split('|');
    if (!p[0] || !p[0].trim()) return;
    const w = { id: p[0].trim(), en: p[0].trim(), ja: (p[1] || '').trim(), em: (p[2] || '').trim(), lv: +(p[3] || 5) || 5, cat: c.id, ci, i };
    WORDS.push(w); WMAP[w.id] = w; c.words.push(w);
  });
});
// 単語の本のことば（BOOK）を取りこむ。レッスンごとに1つのグループにする。
// すでにあることばは 本の日本語・絵文字で上書きして「本のことば」の印をつける。
// 本だけにあることばは lv:0（英検メーターには数えない）。
const BOOKWORDS = [];
if (typeof BOOK !== 'undefined' && BOOK.length) {
  BOOK.forEach((u, ui) => {
    const cat = { id: 'L' + u.n, name: `Lesson ${u.n}　${u.ja}`, sub: u.title, icon: u.icon || '📖', words: [], list: '', book: true, n: u.n };
    (u.list || '').trim().split('\n').forEach(line => {
      const p = line.split('|'); let raw = (p[0] || '').trim(); if (!raw) return;
      let art = ''; const m = raw.match(/^(a|an|the)\s+(.+)$/i); if (m) { art = m[1].toLowerCase(); raw = m[2]; }
      const id = raw, en = raw.replace(/#.*$/, '');
      const ja = (p[1] || '').trim(), em = (p[2] || '').trim();
      let w = WMAP[id];
      if (!w) { w = { id, en, ja, em, lv: 0, cat: cat.id, ci: CATEGORIES.length + ui, i: cat.words.length }; WORDS.push(w); WMAP[id] = w; }
      else { if (ja) w.ja = ja; if (em) w.em = em; }
      if (art && !w.art) w.art = art;
      if (!cat.words.includes(w)) cat.words.push(w);
      if (!w.book) { w.book = true; w.un = u.n; w.bo = BOOKWORDS.length; BOOKWORDS.push(w); }
    });
    CATEGORIES.push(cat);
  });
}
// 絵文字がない ことばに オリジナルの絵（pics.js）をつける
if (typeof PICS !== 'undefined') for (const [id, v] of Object.entries(PICS)) if (WMAP[id]) WMAP[id].em = v;
const inLevel = w => w.lv >= S.set.lvl || !!w.book; // 級のはんい＋本のことば
const CMAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const isNum = w => /^\d+$/.test(w.em);
const spellable = w => /^[a-z]{3,8}$/.test(w.en);
const SEG = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter() : null;
function pic(w) {
  if (!w.em) return `<span class="txtpic">${esc(w.ja)}</span>`;
  if (isNum(w)) return `<span class="numpic">${esc(w.em)}</span>`;
  if (w.em[0] === '§') return `<span class="emo svgpic">${picSVG(w.em.slice(1))}</span>`;
  const n = SEG ? [...SEG.segment(w.em)].length : Math.ceil([...w.em].length / 2);
  return n >= 2 ? `<span class="emo"><span class="${n >= 3 ? 'em3' : 'em2'}">${w.em}</span></span>` : `<span class="emo">${w.em}</span>`;
}

/* ---------- 保存データ ---------- */
const KEY = 'mimi-eigo-v1';
function freshProfile(name) {
  return {
    name: name || '', stars: 0, earned: 0, streak: 0, best: 0, lastDay: '', lessonDay: '', days: {},
    today: null, mg: null, review: [], words: {}, own: ['bg0'], wear: [], bg: 'bg0', mock: [], spokeDay: '', spoke: [],
    set: { rate: 0.85, voice: '', nNew: 5, lvl: 5, sfx: true, lock: true, src: 'book', mgMax: 1 }
  };
}
function fixProfile(p) {
  const d = freshProfile('');
  for (const k in d) if (p[k] === undefined) p[k] = d[k];
  for (const k in d.set) if (p.set[k] === undefined) p.set[k] = d.set[k];
  return p;
}
let root, S, trial = false;
function loadRoot() {
  try { root = JSON.parse(localStorage.getItem(KEY)); } catch (e) { root = null; }
  if (!root || !root.profiles || !Object.keys(root.profiles).length) root = { cur: 'p1', profiles: { p1: freshProfile('') } };
  Object.values(root.profiles).forEach(fixProfile);
  if (!root.profiles[root.cur]) root.cur = Object.keys(root.profiles)[0];
  S = root.profiles[root.cur];
}
function save() {
  if (trial) return; // おためしモードは保存しない
  root.profiles[root.cur] = S;
  try { localStorage.setItem(KEY, JSON.stringify(root)); } catch (e) { }
}

/* ---------- 星・レベル・れんぞく ---------- */
const TITLES = ['ひよっこ', 'ルーキー', 'チャレンジャー', 'がんばりや', 'ことばハンター', 'みみじょうず', 'えいごのたまご', 'えいごのつばさ', 'リスニングスター', 'えいごのたつじん', 'なかまの しんゆう'];
const level = () => 1 + Math.floor(S.earned / 40);
const title = () => TITLES[Math.min(TITLES.length - 1, level() - 1)];
function addStar(n) { S.stars += n; S.earned += n; const el = $('#starN'); if (el) el.textContent = S.stars; }
function markActive() {
  const t = todayKey();
  if (S.lastDay === t) return;
  S.streak = (S.lastDay === dayOffset(-1)) ? S.streak + 1 : 1;
  S.best = Math.max(S.best || 0, S.streak);
  S.lastDay = t;
}
const streakNow = () => (S.lastDay === todayKey() || S.lastDay === dayOffset(-1)) ? S.streak : 0;

/* ---------- 記憶（くりかえし学習） ---------- */
// 正解するたびに次の出題までの日数がのびる（ライトナー方式）。まちがえたら1日後にもどる。
const IV = [0, 1, 2, 4, 7, 15, 30];
let SESSION = new Set();
function ws(en) { return S.words[en] || (S.words[en] = { b: 0, d: 0, ok: 0, ng: 0 }); }
function grade(en, ok) {
  const s = ws(en), now = Date.now();
  if (ok) s.ok++; else s.ng++;
  if (SESSION.has(en)) { if (!ok) { s.b = 1; s.d = now + DAY - 3 * 3600e3; } return; }
  SESSION.add(en);
  s.b = ok ? Math.min(6, s.b + 1) : 1;
  s.d = now + IV[s.b] * DAY - 3 * 3600e3;
}
const mastered = w => S.words[w.id] && S.words[w.id].b >= 3;
const seen = w => !!S.words[w.id];

/* ---------- 音声（よみあげ） ---------- */
let VOICES = [];
function loadVoices() { try { VOICES = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) { } }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice() {
  if (!VOICES.length) loadVoices();
  const s = S && S.set.voice;
  return (s && VOICES.find(v => v.name === s))
    || VOICES.find(v => /en[-_]US/i.test(v.lang) && /google/i.test(v.name))
    || VOICES.find(v => /en[-_]US/i.test(v.lang))
    || VOICES[0] || null;
}
let speakId = 0;
function talk(on) { $$('.mimi').forEach(m => m.classList.toggle('talking', on)); }
function say(text, rate) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res();
    const id = ++speakId;
    try { speechSynthesis.cancel(); } catch (e) { }
    const u = new SpeechSynthesisUtterance(String(text).replace(/P\.E\./g, 'P E').replace(/\bUFO\b/g, 'U F O'));
    u.lang = 'en-US'; const v = pickVoice(); if (v) u.voice = v;
    u.rate = rate || S.set.rate; u.pitch = 1.05;
    let done = false;
    const end = () => { if (done) return; done = true; if (id === speakId) talk(false); res(); };
    u.onend = end; u.onerror = end;
    talk(true);
    setTimeout(() => { if (id === speakId) { try { speechSynthesis.speak(u); } catch (e) { end(); } } else end(); }, 60);
    setTimeout(end, 1800 + String(text).length * 140 / u.rate);
  });
}
function stopVoice() { speakId++; try { speechSynthesis.cancel(); } catch (e) { } talk(false); }

/* ---------- マイク（はなすれんしゅう） ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function hear() {
  return new Promise(res => {
    if (!SR) return res(null);
    let r; try { r = new SR(); } catch (e) { return res(null); }
    r.lang = 'en-US'; r.maxAlternatives = 5; r.interimResults = false;
    let got = null, err = false;
    r.onresult = e => { got = [...e.results[0]].map(a => a.transcript.toLowerCase().trim()); };
    r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') err = true; };
    r.onend = () => res(err ? null : (got || []));
    try { r.start(); } catch (e) { return res(null); }
    setTimeout(() => { try { r.stop(); } catch (e) { } }, 5000);
  });
}
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function heardOK(alts, targets) {
  return alts.some(a => { const n = norm(a); return targets.some(t => { t = norm(t); return n === t || (' ' + n + ' ').includes(' ' + t + ' '); }); });
}
async function tryMic(btn, target, extra = []) {
  if (!SR) return;
  stopVoice();
  const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '🎙️ きいてるよ…';
  setMimi('normal', 'どうぞ！ いってみて 👂');
  const r = await hear();
  btn.disabled = false; btn.innerHTML = old;
  if (r === null) { setMimi('oops', 'マイクがつかえないみたい。おうちの人にきいてね'); return; }
  if (!r.length) { setMimi('oops', 'きこえなかったよ。もういちど、大きなこえで！'); return; }
  if (heardOK(r, [target, ...extra])) {
    sfx('ok'); setMimi('happy', 'じょうず！ ちゃんと つたわったよ ✨');
    const t = todayKey(); if (S.spokeDay !== t) { S.spokeDay = t; S.spoke = []; }
    if (!S.spoke.includes(target)) { S.spoke.push(target); addStar(1); }
    save();
  } else {
    setMimi('normal', `「${esc(r[0])}」ってきこえたよ。おてほんをきいて もういちど！`);
  }
}

/* ---------- 効果音 ---------- */
let AC;
function tone(freqs, dur = 0.11, type = 'triangle', vol = 0.14) {
  if (!S.set.sfx) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime;
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.value = f;
      const t = t0 + i * dur;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.8);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur * 2);
    });
  } catch (e) { }
}
function sfx(k) {
  if (k === 'ok') tone([784, 1175]);
  else if (k === 'ng') tone([330, 247], 0.14, 'sine', 0.1);
  else if (k === 'fan') tone([523, 659, 784, 1047, 1319], 0.09);
  else if (k === 'buy') tone([660, 880, 990], 0.08);
}

/* ---------- ミミィ ---------- */
// きょうの なかま：アプリを ひらいた日だけ じゅんばんに こうたいする（ひらかない日は すすまない）
function buddy() {
  if (!S) return BUDDIES[0];
  const t = todayKey();
  if (S.bd !== t) { S.bi = S.bd ? ((S.bi || 0) + 1) % BUDDIES.length : (S.bi || 0); S.bd = t; save(); }
  return BUDDIES[S.bi] || BUDDIES[0];
}
function mimiSVG(wear, id) {
  const B = (id && BUDDIES.find(x => x.id === id)) || buddy();
  return buddySVG(B, wear || (S ? S.wear : []));
}
function mimiRow(text, mood = 'normal') {
  return `<div class="mimi-row"><div class="mimi mood-${mood}">${mimiSVG()}</div><div class="bubble">${text || ''}</div></div>`;
}
const mainMimi = () => $('.mimi-row .mimi') || $('.hero .mimi');
let moodTok = 0;
function setMimi(mood, text) {
  const m = mainMimi();
  if (m && mood) {
    moodTok++;
    const tk = m.classList.contains('talking');
    m.className = 'mimi'; void m.getBoundingClientRect(); // おなじ表情でも うごきを もういちど
    m.className = 'mimi mood-' + mood + (tk ? ' talking' : '');
  }
  if (text != null) { const b = $('.mimi-row .bubble') || $('.hero .bubble'); if (b) b.innerHTML = text; }
}
const curMood = () => { const m = mainMimi(); const c = m && [...m.classList].find(x => x.startsWith('mood-')); return c ? c.slice(5) : ''; };
// しばらくしたら ふつうの顔に もどす
function moodFor(mood, text, ms) { setMimi(mood, text); const t = moodTok; setTimeout(() => { if (t === moodTok && curMood() === mood) setMimi('normal', null); }, ms); }
// なかまの セリフ（キャラごと）
const bline = k => { const B = buddy(); return (B.lines && B.lines[k] && B.lines[k].length) ? pick(B.lines[k]) : ''; };
let COMBO = 0, MISS = 0;
function cheer() {
  COMBO++; MISS = 0; sfx('ok'); addStar(1);
  if (COMBO >= 3 && COMBO % 3 === 0) {
    addStar(1); setTimeout(() => sfx('fan'), 150);
    setMimi('great', `<b>${COMBO}もん れんぞく！</b> ⭐+1<br>${bline('great') || pick(OKMSG)}`);
  } else setMimi('happy', Math.random() < .5 && bline('ok') ? bline('ok') : pick(OKMSG));
}
function boo(text) {
  COMBO = 0; MISS++; sfx('ng');
  setMimi(MISS >= 2 ? 'shock' : 'oops', text || (Math.random() < .5 && bline('ng') ? bline('ng') : pick(NGMSG)));
}
function thinkQ(text) { moodFor('think', text, 1800); }
/* タッチすると はんのう／ひまだと きょろきょろ／ほうっておくと ねむる */
let lastAct = Date.now(), taps = [], actT = 0;
function act(m, cls, ms = 900) {
  clearTimeout(actT); m.classList.remove('a-wiggle', 'a-squish', 'a-spin', 'a-hop', 'a-ear', 'look-l', 'look-r', 'look-u');
  void m.getBoundingClientRect(); m.classList.add(cls); actT = setTimeout(() => m.classList.remove(cls), ms);
}
document.addEventListener('pointerdown', e => {
  lastAct = Date.now();
  const m = e.target.closest && e.target.closest('.mimi');
  const main = mainMimi();
  if (main && curMood() === 'sleepy' && m !== main) { moodFor('wow', 'はっ！ ね、ねてないよ！', 1300); return; }
  if (!m || m.closest('.bud') || m.closest('.welcome')) return;
  const now = Date.now(); taps = taps.filter(t => now - t < 2500); taps.push(now);
  if (m !== main) { act(m, pick(['a-wiggle', 'a-squish', 'a-hop'])); return; }
  if (curMood() === 'sleepy') { moodFor('wow', 'はっ！ ね、ねてないよ！', 1300); return; }
  if (taps.length >= 5) { taps = []; tone([880, 1175, 1568], .07); moodFor('great', 'くすぐったい〜！', 1600); return; }
  tone([660 + Math.random() * 400], .06);
  act(m, pick(['a-wiggle', 'a-squish', 'a-spin', 'a-hop', 'a-ear']));
  const b = $('.mimi-row .bubble') || $('.hero .bubble');
  const line = bline('tap'); if (b && line && Math.random() < .7) { const keep = b.innerHTML; b.innerHTML = line; setTimeout(() => { if (b.innerHTML === line) b.innerHTML = keep; }, 1500); }
}, true);
setInterval(() => {
  const m = mainMimi(); if (!m || document.hidden || m.classList.contains('talking')) return;
  const mood = curMood();
  if (Date.now() - lastAct > 40000 && mood !== 'sleepy' && $('#stage')) { setMimi('sleepy', bline('sleepy') || '…zzz'); return; }
  if (mood !== 'normal' && mood !== 'think') return;
  const r = Math.random();
  if (r < .45) act(m, pick(['look-l', 'look-r', 'look-u']), 1200);
  else if (r < .6) act(m, 'a-ear', 800);
  else if (r < .7) act(m, 'a-hop', 900);
}, 4500);
const OKMSG = ['すごい！', 'やったね！', 'Great! ✨', 'Good job!', 'さすが！', 'Perfect!', 'そのちょうし！', 'Nice! 💖'];
const NGMSG = ['おしい！ いっしょにおぼえよう', 'だいじょうぶ、つぎはできるよ', 'ドンマイ！ こたえをよくきいてね', 'まちがえるとおぼえるチャンス！'];

/* ---------- 画面の共通 ---------- */
const app = $('#app');
function applyBg() {
  const b = BACKS.find(x => x.id === S.bg) || BACKS[0];
  document.documentElement.style.setProperty('--bg1', b.c[0]);
  document.documentElement.style.setProperty('--bg2', b.c[1]);
}
function show(html) { stopVoice(); closeModal(); app.innerHTML = html; window.scrollTo(0, 0); applyBg(); }
function subHead(title, back = home) {
  setTimeout(() => { const b = $('#backBtn'); if (b) b.onclick = () => back(); }, 0);
  return `<div class="topbar"><button class="iconbtn" id="backBtn" aria-label="もどる">←</button><div class="ttl" style="font-size:20px">${title}</div></div>`;
}
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
function confetti() {
  const em = ['⭐', '💖', '🎉', '✨', '🌸', '🎀'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span'); s.className = 'conf'; s.textContent = pick(em);
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = Math.random() * .8 + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 3400);
  }
}
function modal(html) {
  closeModal();
  const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="box">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  document.body.appendChild(m); return m;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
function bindPlay(scope, text) {
  $$('.play', scope).forEach(b => b.onclick = () => say(text, b.classList.contains('slowb') ? 0.55 : undefined));
}
const playBtns = (slow = true) => `<div class="playrow"><button class="play" aria-label="きく">🔊</button>${slow ? '<button class="play slowb" aria-label="ゆっくり">🐢</button>' : ''}</div>`;

/* ========== ホーム ========== */
// 級の数字は小さいほどむずかしい：5級をめざす→5級のことばだけ、4級をめざす→5級＋4級
function lessonPlan(theme) {
  const now = Date.now(), L = S.set.lvl;
  const pool = WORDS.filter(w => inLevel(w) && (!theme || (CMAP[theme] && CMAP[theme].words.includes(w))));
  const due = pool.filter(w => { const s = S.words[w.id]; return s && s.b > 0 && s.d <= now; })
    .sort((a, b) => S.words[a.id].d - S.words[b.id].d).slice(0, theme ? 4 : 8);
  let nNew = S.set.nNew; if (due.length >= 8) nNew = Math.min(nNew, 2);
  const notYet = w => !S.words[w.id] || !S.words[w.id].b;
  let fresh;
  if (!theme && BOOKWORDS.length && S.set.src === 'book') fresh = BOOKWORDS.filter(notYet).slice(0, nNew); // 本の順番どおり
  else fresh = pool.filter(notYet).sort((a, b) => b.lv - a.lv || a.ci - b.ci || a.i - b.i).slice(0, nNew);
  return { due, fresh };
}
function greeting() {
  const h = new Date().getHours();
  if (h < 11) return ['Good morning!', 'おはよう'];
  if (h < 17) return ['Hello!', 'こんにちは'];
  return ['Good evening!', 'こんばんは'];
}
function home() {
  if (!S.name) return welcome();
  const BB = buddy(), T = todaySet(), doneToday = setDone();
  const locked = S.set.lock && !doneToday;
  const [gEn, gJa] = greeting();
  const L5 = WORDS.filter(w => w.lv === 5), L4 = WORDS.filter(w => w.lv === 4);
  const m5 = L5.filter(mastered).length, m4 = L4.filter(mastered).length;
  const wd = ['日', '月', '火', '水', '木', '金', '土'];
  let week = '';
  for (let k = -6; k <= 0; k++) {
    const d = new Date(); d.setDate(d.getDate() + k); const key = todayKey(d);
    week += `<div class="d ${k === 0 ? 'today' : ''}">${wd[d.getDay()]}<div class="s ${S.days[key] ? 'on' : ''}">${S.days[key] ? '🌸' : ''}</div></div>`;
  }
  const modes = [
    ['listen', '🎧', 'きいてタッチ', 'きいて えらぶ'],
    ['pairs', '👂', 'みみトレ', 'にている音を ききわけ'],
    ['meaning', '💡', 'いみクイズ', 'えいご⇔にほんご'],
    ['spell', '🧩', 'つづりパズル', 'もじを ならべる'],
    ['dialog', '💬', 'かいわ', 'しつもんに こたえる'],
    ['order', '🔀', 'ならべかえ', 'ぶんを つくる'],
    ['abc', '🔤', 'ABC', 'もじと 音'],
    ['grammar', '🎵', 'かたちあそび', 'きいて まねして かたちを おぼえる'],
    ['review', '📒', 'おうちの人と見る', S.review.length ? `まちがえた かたち ${S.review.length}こ` : 'いまは なし ✨'],
    ['zukan', '📚', 'ことばずかん', 'あつめた ことば'],
    ['mock', '📝', '英検ミニテスト', 'ほんばんふう'],
    ['dress', '👗', 'きせかえ', '⭐で おしゃれ'],
  ];
  show(`<div class="home">
  <div class="hd"><div class="who"><span class="lv">Lv.${level()}</span><b>${esc(S.name)}</b><small>${title()}</small></div>
  <div class="chips"><span class="chip">⭐ <b id="starN">${S.stars}</b></span><span class="chip">🔥 ${streakNow()}にち</span><button class="iconbtn" id="gear" aria-label="せってい">⚙️</button></div></div>
  ${trial ? '<div class="trialbar">🔧 おためしモード中（きろくは のこりません）</div>' : ''}
  <div class="hero"><div class="mimi mood-happy">${mimiSVG()}</div>
   <div class="bubble">${esc(S.name)}ちゃん、${gJa}！<br><span class="small">きょうの なかまは <b>${BB.name}</b>（${BB.who}）</span><br><span class="bond">なかよし ${'💗'.repeat(Math.min(5, Math.ceil(((S.bond || {})[BB.id] || 0) / 3)))}${'🤍'.repeat(5 - Math.min(5, Math.ceil(((S.bond || {})[BB.id] || 0) / 3)))}</span><br>${esc(BB.hello)}<br><button class="say" id="greet">🔊 ${gEn}</button></div></div>
  <div class="set-card ${doneToday ? 'done' : ''}">
   <div class="t">${doneToday ? '💮 きょうの ワンセット クリア！' : '🌟 きょうの ワンセット'}</div>
   <div class="d">${doneToday ? 'すごい！ あしたも いっしょに やろうね' : `やくそく：まいにち これだけは やろうね（${T.fresh.length ? `あたらしいことば ${T.fresh.length}こ` : 'ふくしゅうの日'}${T.due.length ? `・ふくしゅう ${T.due.length}こ` : ''}）`}</div>
   <div class="steps">${STAGES.map((st, k) => `<div class="step ${k < T.st ? 'ok' : k === T.st && !doneToday ? 'now' : ''}"><div class="si">${k < T.st ? '✅' : st.icon}</div><div class="sn">${st.name}</div></div>`).join('')}</div>
   ${doneToday ? '<button class="btn sm sub" id="moreBtn">🍙 おかわりレッスン</button>' : `<button class="btn big" id="setBtn">${T.st ? `つづきから（${T.st + 1}/${STAGES.length}）▶` : 'スタート ▶'}</button>`}
  </div>
  <div id="mgSlot">${MG.card()}</div>
  <div class="week">${week}</div>
  <div id="voiceNote"></div>
  <div class="sec-title">${locked ? '🔒 ワンセットが おわったら あそべるよ' : 'あそびながら まなぼう'}</div>
  <div class="grid">${modes.map(m => `<button class="tile ${locked && !FREE.includes(m[0]) ? 'locked' : ''}" data-m="${m[0]}">${m[0] === 'review' && S.review.length ? `<span class="badge">${S.review.length}</span>` : ''}<div class="i">${m[1]}</div><div class="n">${m[2]}</div><div class="h">${m[3]}</div></button>`).join('')}</div>
  <div class="eiken">
   <div style="font-weight:800">🏆 英検への みちのり</div>
   <div class="small">おぼえた（3回いじょう正かい）ことばの数</div>
   <div style="margin-top:6px">5級のことば ${m5} / ${L5.length}</div><div class="meter"><i style="width:${L5.length ? m5 / L5.length * 100 : 0}%"></i></div>
   <div>4級のことば ${m4} / ${L4.length}</div><div class="meter p"><i style="width:${L4.length ? m4 / L4.length * 100 : 0}%"></i></div>
   ${S.mock.length ? `<div class="small">さいきんのミニテスト：${S.mock.slice(-1).map(x => `${x.lv}級 ${x.s}/${x.t}（${Math.round(x.s / x.t * 100)}%）`)[0]}</div>` : ''}
  </div>
  <p class="small center" style="margin-top:18px">ミミィのえいご v${APP_VER}</p>
 </div>`);
  $('#gear').onclick = settings;
  $('#greet').onclick = () => say(gEn);
  if ($('#setBtn')) $('#setBtn').onclick = () => runStage(T.st);
  if ($('#moreBtn')) $('#moreBtn').onclick = () => startLesson();
  MG.bindCard();
  $$('.tile').forEach(t => t.onclick = () => {
    if (t.classList.contains('locked')) { setMimi('normal', 'さきに きょうの ワンセットを やろう！ おわったら あそべるよ 🌟'); say("Let's do today's set first!"); return; }
    MODES[t.dataset.m]();
  });
  setTimeout(() => {
    if ('speechSynthesis' in window) loadVoices();
    const n = $('#voiceNote'); if (!n) return;
    if (!('speechSynthesis' in window)) n.innerHTML = '<div class="notice">このブラウザは よみあげに たいおうしていません。Chromeで ひらいてね。</div>';
    else if (!VOICES.length) n.innerHTML = '<div class="notice">えいごの こえが みつかりません。<br><span class="small">おうちの人へ：⚙️せってい の「こえ」を見てください。</span></div>';
  }, 1500);
}

/* ========== はじめて ========== */
function welcome() {
  show(`<div class="welcome center">
   <div class="mimi mood-happy">${mimiSVG([], 'mimi')}</div>
   <div class="bubble" style="text-align:left">はじめまして！ わたしは <b>ミミィ</b>。<br>おおきな みみで、えいごを いっしょに きこうね！<br>あなたの なまえを おしえて？</div>
   <div class="field" style="margin-top:16px"><input type="text" id="nm" placeholder="なまえ" maxlength="12" style="font-size:22px;text-align:center"></div>
   <div class="field"><label>めざす級</label><div class="seg" id="lvSeg" style="justify-content:center"><button data-v="5" class="on">英検5級</button><button data-v="4">英検4級</button></div></div>
   <button class="btn big" id="go">はじめる ▶</button>
   <p class="small">※ 音が出ます。タブレットの音量を あげてね</p></div>`);
  let lv = 5;
  $$('#lvSeg button').forEach(b => b.onclick = () => { lv = +b.dataset.v; $$('#lvSeg button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#go').onclick = () => {
    const v = $('#nm').value.trim(); if (!v) { $('#nm').focus(); return; }
    S.name = v; S.set.lvl = lv; save();
    say('Hello! Nice to meet you!'); home();
  };
}

/* ========== 問題のしくみ ========== */
function runSeq({ title, items, bonus = 2, onFinish, again, intro, nextStep }) {
  COMBO = 0; MISS = 0;
  SESSION = new Set();
  let i = 0, score = 0, answered = 0;
  const secs = {}; const startEarned = S.earned;
  show(`<div class="sub"><div class="topbar"><button class="iconbtn" id="quit" aria-label="やめる">✕</button><div class="prog"><div class="bar" id="bar"></div></div><div class="ttl">${title}</div></div>
    ${mimiRow(intro || 'がんばろう！')}<div id="stage"></div></div>`);
  $('#quit').onclick = () => { if (answered) markActive(); save(); home(); };
  const ctx = {
    sec: '',
    next: () => { i++; save(); step(); },
    answered: ok => {
      answered++; if (ok) score++;
      const t = todayKey(); S.days[t] = (S.days[t] || 0) + 1;
      if (ctx.sec) { secs[ctx.sec] = secs[ctx.sec] || [0, 0]; secs[ctx.sec][1]++; if (ok) secs[ctx.sec][0]++; }
    },
    requeue: f => items.push(f),
  };
  function step() {
    const bar = $('#bar'); if (!bar) return;
    bar.style.width = (i / items.length * 100) + '%';
    if (i >= items.length) return finish();
    ctx.sec = ''; MISS = 0; setMimi('normal', null);
    items[i](ctx);
  }
  function finish() {
    const perfect = answered > 0 && score === answered;
    if (answered || bonus) addStar(bonus + (perfect && answered >= 5 ? 3 : 0));
    markActive();
    let extra = '';
    if (onFinish) extra = onFinish({ score, answered, secs }) || '';
    save();
    const got = S.earned - startEarned;
    const pct = answered ? score / answered : 1;
    const msg = !answered ? 'よくできました！' : perfect ? 'ぜんもん正かい！ てんさい！？' : pct >= .8 ? 'すごい！ ほとんど正かい！' : pct >= .5 ? 'いいかんじ！ まちがえたところは また でてくるよ' : 'チャレンジえらい！ くりかえすと おぼえられるよ';
    const secHtml = Object.keys(secs).length > 1 ? `<table class="sec-table">${Object.entries(secs).map(([k, v]) => `<tr><td>${k}</td><td>${v[0]} / ${v[1]}</td></tr>`).join('')}</table>` : '';
    show(`<div class="sub">${mimiRow(`${msg}<br><span class="small">${bline('great')}</span>`, perfect || pct >= .8 ? 'great' : 'happy')}
      <div class="result">${answered ? `<div class="score">${score} / ${answered}</div>` : '<div class="score">💮</div>'}
      <div class="st">⭐ +${got}</div>${secHtml}${extra}
      ${nextStep ? `<button class="btn big" id="nstep">${nextStep.label}</button>` : ''}
      ${again ? '<button class="btn big" id="again">もういちど ↻</button>' : ''}
      <button class="btn big sub" id="toHome">ホームへ 🏠</button></div></div>`);
    sfx('fan'); confetti(); say(perfect ? 'Perfect! Great job!' : 'Good job!');
    if (again) $('#again').onclick = again;
    if (nextStep) $('#nstep').onclick = nextStep.fn;
    if ($('#mgGo')) $('#mgGo').onclick = () => MG.open();
    $('#toHome').onclick = home;
  }
  step();
}

// 選択問題の共通部品
function choiceQ(ctx, { prompt, opts, ans, word, autoplay, sayAfter, onWrong, onAnswer, cls = '', optCls = '', reveal, mimi }) {
  const st = $('#stage');
  if (mimi) thinkQ(mimi);
  st.innerHTML = `<div class="qcard">${prompt}</div><div class="opts ${cls}">${opts.map((o, i) => `<button class="opt ${optCls}" data-i="${i}">${o}</button>`).join('')}</div><div class="after"></div>`;
  if (autoplay) { bindPlay(st, autoplay); setTimeout(() => say(autoplay), 350); }
  let locked = false;
  $$('.opt', st).forEach(b => b.onclick = async () => {
    if (locked) return; locked = true;
    const i = +b.dataset.i, ok = i === ans;
    b.classList.add(ok ? 'right' : 'wrong');
    if (!ok) $$('.opt', st)[ans].classList.add('right');
    if (word) grade(word.id, ok);
    if (onAnswer) onAnswer(ok, i);
    ctx.answered(ok);
    if (ok) cheer();
    else { boo(); if (onWrong) onWrong(); }
    if (reveal) {
      $('.after', st).insertAdjacentHTML('beforeend', `<div class="reveal">${reveal}</div>`);
      $$('.after [data-say]', st).forEach(x => x.onclick = () => say(x.dataset.say));
    }
    if (ok && !reveal) {
      await sleep(350); if (sayAfter) await say(sayAfter); await sleep(350);
      if ($('#stage') === st) ctx.next();
    } else {
      $('.after', st).insertAdjacentHTML('beforeend', '<button class="btn big next">つぎへ ▶</button>');
      $('.next', st).onclick = () => ctx.next();
      await sleep(350); if (sayAfter) say(sayAfter);
    }
  });
}

function distractors(w, n, field) {
  const ok = x => x !== w && x[field] && x[field] !== w[field] && (field !== 'em' || x.em);
  const same = shuffle(WORDS.filter(x => x.cat === w.cat && ok(x)));
  const other = shuffle(WORDS.filter(x => x.cat !== w.cat && ok(x)));
  const out = [], used = new Set([w[field]]);
  for (const x of [...same, ...other]) {
    if (!used.has(x[field])) { used.add(x[field]); out.push(x); if (out.length >= n) break; }
  }
  return out;
}

// 単語問題
function qItem(w, type, opt = {}) {
  return ctx => {
    if (type === 'sp' && spellable(w)) return spellQ(ctx, w, opt);
    const onWrong = opt.requeue ? () => { if (!opt.requeued) { opt.requeued = true; ctx.requeue(qItem(w, 'lm', { requeued: true })); } } : null;
    if (type === 'lp' && w.em) {
      const ch = shuffle([w, ...distractors(w, 3, 'em')]);
      return choiceQ(ctx, { mimi: 'きいて、えを タッチしてね 👂', prompt: `<div class="qtext">なんて いってるかな？</div>${playBtns()}`, autoplay: w.en,
        opts: ch.map(pic), optCls: 'pic', ans: ch.indexOf(w), word: w, sayAfter: w.en, onWrong });
    }
    if (type === 'lm' || (type === 'lp' && !w.em)) {
      const ch = shuffle([w, ...distractors(w, 3, 'ja')]);
      return choiceQ(ctx, { mimi: 'きいて、いみを えらんでね 👂', prompt: `<div class="qtext">なんて いってるかな？</div>${playBtns()}`, autoplay: w.en,
        opts: ch.map(x => esc(x.ja)), ans: ch.indexOf(w), word: w, sayAfter: w.en, onWrong });
    }
    if (type === 'pe' && w.em) { // え → えいご（よむ）
      const ch = shuffle([w, ...distractors(w, 3, 'en')]);
      return choiceQ(ctx, { mimi: 'この えは えいごで どれ？', prompt: `<div>${pic(w)}</div><div class="qtext">${esc(w.ja)}</div>`,
        opts: ch.map(x => `<span class="en-font">${esc(x.en)}</span>`), ans: ch.indexOf(w), word: w, sayAfter: w.en, onWrong });
    }
    if (type === 'le') { // きく → つづりをえらぶ
      const ch = shuffle([w, ...similarWords(w, 3)]);
      return choiceQ(ctx, { mimi: 'きいて、正しい つづりを えらんでね', prompt: `<div class="qtext">どの つづりかな？</div>${playBtns()}`, autoplay: w.en,
        opts: ch.map(x => `<span class="en-font">${esc(x.en)}</span>`), ans: ch.indexOf(w), word: w, onWrong,
        reveal: `<b class="en-font">${esc(w.en)}</b>（${esc(w.ja)}）` });
    }
    if (type === 'em' || type === 'pe') {
      const ch = shuffle([w, ...distractors(w, 3, 'ja')]);
      return choiceQ(ctx, { mimi: 'いみは どれかな？', prompt: `<div class="qword en-font">${esc(w.en)}</div>${playBtns(false)}`, autoplay: w.en,
        opts: ch.map(x => esc(x.ja)), ans: ch.indexOf(w), word: w, onWrong });
    }
    // je: にほんご→えいご
    const ch = shuffle([w, ...distractors(w, 3, 'en')]);
    return choiceQ(ctx, { mimi: 'えいごで なんていう？', prompt: `${w.em && !isNum(w) ? `<div class="emo">${w.em}</div>` : ''}<div class="qword ja">${esc(w.ja)}</div>`,
      opts: ch.map(x => `<span class="en-font">${esc(x.en)}</span>`), ans: ch.indexOf(w), word: w, sayAfter: w.en, onWrong });
  };
}
function anyType(w) { const t = ['lm', 'em', 'je', 'le']; if (w.em) t.push('lp', 'pe'); if (spellable(w)) t.push('sp'); return pick(t); }
// にたつづりのことば（le 用）：さいしょの文字・長さが近いものをえらぶ
function similarWords(w, n) {
  const sc = x => (x.en[0].toLowerCase() === w.en[0].toLowerCase() ? 2 : 0) + (Math.abs(x.en.length - w.en.length) <= 1 ? 1 : 0) + (x.cat === w.cat ? .5 : 0) + Math.random();
  const used = new Set([w.en.toLowerCase()]); const out = [];
  for (const x of WORDS.filter(x => x !== w && !x.en.includes(' ') === !w.en.includes(' ')).sort((a, b) => sc(b) - sc(a))) {
    if (!used.has(x.en.toLowerCase())) { used.add(x.en.toLowerCase()); out.push(x); if (out.length >= n) break; }
  }
  return out;
}

// つづり
function spellQ(ctx, w, opt = {}) {
  thinkQ('きいて、もじを じゅんばんに タッチ！');
  const letters = w.en.split('');
  const extra = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !letters.includes(c))).slice(0, letters.length > 5 ? 2 : 1);
  const tiles = shuffle([...letters, ...extra]).map((c, k) => ({ c, k, used: false }));
  let ansT = [], locked = false;
  const st = $('#stage');
  st.innerHTML = `<div class="qcard"><div>${w.em ? pic(w) : ''}</div><div class="qtext">${esc(w.ja)}</div>${playBtns()}</div>
    <div class="slots" id="slots"></div><div class="pool" id="pool"></div>
    <div class="after"><button class="btn sm sub" id="bk">⌫ ひとつ けす</button></div>`;
  bindPlay(st, w.en); setTimeout(() => say(w.en), 350);
  function draw() {
    $('#slots').innerHTML = letters.map((_, k) => `<div class="slot ${ansT[k] ? 'fill' : ''}">${ansT[k] ? ansT[k].c : ''}</div>`).join('');
    $('#pool').innerHTML = tiles.map(t => `<button class="ltile en-font ${t.used ? 'used' : ''}" data-k="${t.k}">${t.c}</button>`).join('');
    $$('#pool .ltile').forEach(b => b.onclick = () => {
      if (locked) return; const t = tiles.find(x => x.k === +b.dataset.k); if (t.used) return;
      t.used = true; ansT.push(t); tone([600 + ansT.length * 40], 0.05); draw();
      if (ansT.length === letters.length) check();
    });
  }
  $('#bk').onclick = () => { if (locked || !ansT.length) return; ansT.pop().used = false; draw(); };
  async function check() {
    locked = true;
    const ok = ansT.map(t => t.c).join('') === w.en;
    grade(w.id, ok); ctx.answered(ok);
    $('#bk').remove();
    if (ok) { cheer(); $('#slots').style.boxShadow = 'inset 0 0 0 3px var(--mint)'; await say(w.en); await sleep(400); ctx.next(); }
    else {
      boo(`こたえは <b class="en-font">${esc(w.en)}</b> だよ`);
      $('#slots').style.boxShadow = 'inset 0 0 0 3px var(--red)';
      $('.after', st).innerHTML = `<div class="reveal center"><span class="qword en-font" style="font-size:34px">${esc(w.en)}</span></div><button class="btn big next">つぎへ ▶</button>`;
      $('.next', st).onclick = () => ctx.next();
      if (opt.requeue && !opt.requeued) { opt.requeued = true; ctx.requeue(qItem(w, 'lm', { requeued: true })); }
      await say(w.en);
    }
  }
  draw();
}

// ならべかえ
function orderQ(ctx, s, { listenFirst = false } = {}) {
  thinkQ('にほんごに あうように ならべてね');
  const toks = s.en.split(' ');
  const tiles = shuffle(toks.map((c, k) => ({ c, k, used: false })));
  let ansT = [], locked = false;
  const st = $('#stage');
  st.innerHTML = `<div class="qcard"><div class="qsent">${esc(s.ja)}</div></div>
    <div class="slots sent" id="slots"></div><div class="pool" id="pool"></div>
    <div class="after"><button class="btn sm sub" id="bk">⌫ ひとつ もどす</button></div>`;
  function draw() {
    $('#slots').innerHTML = ansT.length ? ansT.map(t => `<span class="chunk en-font">${esc(t.c)}</span>`).join('') : '<span class="small">ここに ならぶよ</span>';
    $('#pool').innerHTML = tiles.map((t, idx) => `<button class="ltile w en-font ${t.used ? 'used' : ''}" data-x="${idx}">${esc(t.c)}</button>`).join('');
    $$('#pool .ltile').forEach(b => b.onclick = () => {
      if (locked) return; const t = tiles[+b.dataset.x]; if (t.used) return;
      t.used = true; ansT.push(t); tone([600 + ansT.length * 40], 0.05); draw();
      if (ansT.length === toks.length) check();
    });
  }
  $('#bk').onclick = () => { if (locked || !ansT.length) return; ansT.pop().used = false; draw(); };
  async function check() {
    locked = true;
    const ok = ansT.map(t => t.c).join(' ') === s.en;
    ctx.answered(ok); $('#bk').remove();
    if (ok) { cheer(); $('#slots').style.boxShadow = 'inset 0 0 0 3px var(--mint)'; await say(s.en); await sleep(500); ctx.next(); }
    else {
      boo('おしい！ 正しいじゅんばんを きいてみよう');
      $('#slots').style.boxShadow = 'inset 0 0 0 3px var(--red)';
      $('.after', st).innerHTML = `<div class="reveal"><b class="en-font" style="font-size:22px">${esc(s.en)}</b> <button class="play mini">🔊</button></div><button class="btn big next">つぎへ ▶</button>`;
      bindPlay(st, s.en);
      $('.next', st).onclick = () => ctx.next();
      await say(s.en);
    }
  }
  draw();
}

// かいわ（リスニング）
function dialogQ(ctx, d, { listen = true } = {}) {
  const ch = shuffle([d.a, ...d.w]);
  const prompt = listen
    ? `<div class="qtext">しつもんを きいて、こたえを えらんでね</div>${playBtns()}<div id="qt" style="margin-top:8px"><button class="btn sm sub" id="showT">📜 もじを見る</button></div>`
    : `<div class="qtext">A と B の かいわ。（　）に入るのは？</div><div class="qsent en-font" style="text-align:left">A: ${esc(d.q)}<br>B: （　　　　）</div>`;
  choiceQ(ctx, {
    mimi: listen ? `${buddy().name}が きくよ。こたえてね！` : 'かいわを よんでね',
    prompt, autoplay: listen ? d.q : null, opts: ch.map(x => `<span class="en-font">${esc(x)}</span>`), optCls: 'txt', cls: 'one', ans: ch.indexOf(d.a),
    reveal: `<b class="en-font">A: ${esc(d.q)}<br>B: ${esc(d.a)}</b><br><span class="small">（${esc(d.ja)}）</span>`,
    sayAfter: d.q + ' ... ' + d.a,
  });
  const sb = $('#showT'); if (sb) sb.onclick = () => { $('#qt').innerHTML = `<div class="qsent en-font">${esc(d.q)}</div>`; };
}

/* ========== きょうのレッスン ========== */
function startLesson(theme) {
  let { due, fresh } = lessonPlan(theme);
  if (!due.length && !fresh.length) {
    const pool = shuffle(WORDS.filter(w => seen(w) && inLevel(w) && (!theme || CMAP[theme].words.includes(w)))).slice(0, 8);
    if (!pool.length) { toast('このテーマは ぜんぶ おぼえたよ！'); return; }
    due = pool;
  }
  const items = [];
  fresh.forEach(w => items.push(introItem(w)));
  const q1 = fresh.map(w => qItem(w, w.em ? 'lp' : 'lm', { requeue: true }));
  const q2 = due.map(w => qItem(w, anyType(w), { requeue: true }));
  const q3 = fresh.map(w => qItem(w, spellable(w) && Math.random() < .6 ? 'sp' : 'je', { requeue: true }));
  items.push(...shuffle([...q1, ...q2]), ...shuffle(q3));
  runSeq({
    title: theme ? CMAP[theme].name : 'きょうのレッスン', items, bonus: 5,
    intro: fresh.length ? 'あたらしい ことばだよ！ よく きいてね 👂' : 'ふくしゅうしよう！',
    onFinish: () => { if (!theme) S.lessonDay = todayKey(); return fresh.length ? `<div class="small">きょう であった ことば：${fresh.map(w => `<b class="en-font">${esc(w.en)}</b>`).join('、')}</div>` : ''; },
  });
}
function introItem(w) {
  return ctx => {
    moodFor('wow', `あたらしい ことばだよ！ ${buddy().name}も いっしょに いうよ。せーの！`, 900);
    ws(w.id);
    const st = $('#stage');
    st.innerHTML = `<div class="wcard">${w.un ? `<div class="tag" style="display:inline-block">📖 Lesson ${w.un}</div>` : ''}<div class="pic">${pic(w)}</div>${w.art ? `<div class="art en-font">${w.art}</div>` : ''}<div class="en en-font">${esc(w.en)}</div><div class="ja">${esc(w.ja)}</div>
      <div class="row"><button class="btn sm purple" id="p1">🔊 もういちど</button><button class="btn sm sub" id="p2">🐢 ゆっくり</button>${SR ? '<button class="btn sm mint" id="mic">🎤 いってみる</button>' : ''}</div></div>
      <button class="btn big" id="nx">わかった！ ▶</button>`;
    $('#p1').onclick = () => say(w.en);
    $('#p2').onclick = () => say(w.en, 0.55);
    if (SR) $('#mic').onclick = e => tryMic(e.currentTarget, w.en, isNum(w) ? [w.em] : []);
    $('#nx').onclick = () => ctx.next();
    (async () => { await sleep(300); await say(w.en); await sleep(350); await say(w.art ? w.art + ' ' + w.en : w.en, 0.6); })();
  };
}

/* ========== きょうのワンセット ========== */
// 1日1セット。耳 → 新しいことば → いろんな問題 → 文と会話 の4ステップを毎日かならず通る。
const tokens = t => norm(t).split(' ');
function todaySet() {
  const t = todayKey();
  if (!S.today || S.today.d !== t || (S.today.bk !== BOOKWORDS.length && !S.today.st)) {
    let { due, fresh } = lessonPlan();
    if (!due.length && !fresh.length) due = shuffle(WORDS.filter(w => seen(w) && inLevel(w))).slice(0, 6);
    const key = new Set([...fresh, ...due].flatMap(w => tokens(w.en)));
    // 今日のことばが入った文・今日のレッスンの文をゆうせん
    const units = new Set(fresh.map(w => w.un).filter(Boolean));
    const hit = (x, u) => tokens(x).filter(k => key.has(k)).length + (u && units.has(u) ? 3 : 0) + Math.random() * .9;
    const okLv = x => (x.lv || 5) >= S.set.lvl || x.u;
    const dl = DIALOGS.map((d, k) => [k, d, hit(d.q + ' ' + d.a, d.u)]).filter(([, d]) => okLv(d)).sort((a, b) => b[2] - a[2]);
    const sn = SENTENCES.map((x, k) => [k, x, hit(x.en, x.u)]).filter(([, x]) => okLv(x)).sort((a, b) => b[2] - a[2]);
    const gq = shuffle(GRAMMAR.filter(g => g.lv >= S.set.lvl).flatMap((g, gi) => g.quiz.map((q, qi) => [GRAMMAR.indexOf(g), qi])));
    S.today = { d: t, bk: BOOKWORDS.length, fresh: fresh.map(w => w.id), due: due.map(w => w.id), st: 0, dlg: dl.slice(0, 2).map(x => x[0]), ord: sn.slice(0, 2).map(x => x[0]), gram: gq.slice(0, 1) };
    save();
  }
  return S.today;
}
const W = en => WMAP[en];
const STAGES = [
  { name: 'みみウォームアップ', icon: '👂', intro: 'まずは 耳の じゅんび体そう！',
    build: () => shuffle(PAIRS).slice(0, 3).map(pairItem) },
  { name: 'あたらしいことば', icon: '🌟', intro: 'きょうの あたらしい ことばだよ。よく きいて、まねしてね',
    build: T => { const f = T.fresh.map(W).filter(Boolean);
      return [...f.map(introItem), ...shuffle(f.map(w => qItem(w, w.em ? 'lp' : 'lm', { requeue: true })))]; } },
  { name: 'いろんなもんだい', icon: '🎯', intro: 'いろんな もんだいで しっかり おぼえよう！',
    build: T => {
      const f = T.fresh.map(W).filter(Boolean), d = T.due.map(W).filter(Boolean);
      const read = f.map(w => qItem(w, pick(w.em ? ['pe', 'le'] : ['em', 'le']), { requeue: true }));   // よむ・つづりを見分ける
      const make = f.map(w => qItem(w, spellable(w) ? 'sp' : 'je', { requeue: true }));                 // じぶんで つくる
      const rev = d.map(w => qItem(w, anyType(w), { requeue: true }));                                   // ふくしゅう
      const talk = SR ? shuffle(f.filter(w => w.em)).slice(0, 2).map(sayItem) : [];                      // いってみる
      return [...shuffle([...read, ...rev]), ...shuffle(make), ...talk];
    } },
  { name: 'かいわ・ぶん', icon: '💬', intro: 'さいごは かいわと ぶん！ ことばを つかってみよう',
    build: T => [
      ...T.dlg.map(k => ctx => dialogQ(ctx, DIALOGS[k])),
      ...T.ord.slice(0, 1).map(k => ctx => orderQ(ctx, SENTENCES[k])),
      ...T.gram.map(([g, q]) => ctx => grammarQ(ctx, GRAMMAR[g].quiz[q])),
    ] },
];
function setDone() { return S.lessonDay === todayKey(); }
function runStage(k) {
  const T = todaySet();
  if (k >= STAGES.length) return home();
  const st = STAGES[k], items = st.build(T);
  if (!items.length) { T.st = Math.max(T.st, k + 1); save(); return runStage(k + 1); }
  const last = k === STAGES.length - 1;
  runSeq({
    title: `${k + 1}/${STAGES.length} ${st.name}`, items, bonus: 2, intro: st.intro,
    onFinish: () => {
      T.st = Math.max(T.st, k + 1);
      if (T.st >= STAGES.length && !setDone()) {
        S.lessonDay = todayKey(); addStar(10);
        const bid = buddy().id; S.bond = S.bond || {}; S.bond[bid] = (S.bond[bid] || 0) + 1;
        return `<div class="panel" style="font-size:20px"><b>💮 きょうの ワンセット ぜんぶ クリア！</b><br>ボーナス ⭐10 ／ ほかの あそびも できるよ<br><span class="bond">💗 ${buddy().name}との なかよしが アップ！（${S.bond[buddy().id]}）</span></div><button class="btn big mint" id="mgGo">🔍 まちがいさがしへ！</button>`;
      }
      return '';
    },
    nextStep: last ? null : { label: `つぎ：${STAGES[k + 1].icon} ${STAGES[k + 1].name} ▶`, fn: () => runStage(k + 1) },
  });
}
// 絵を見て いってみる（まちがいにはしない）
function sayItem(w) {
  return ctx => {
    setMimi('normal', 'えを見て、えいごで いってみよう！ 🎤');
    const st = $('#stage');
    st.innerHTML = `<div class="wcard"><div class="pic">${pic(w)}</div><div class="ja">${esc(w.ja)}</div>
      <div id="ansBox" style="min-height:58px"></div>
      <div class="row"><button class="btn mint" id="mic">🎤 いってみる</button><button class="btn sm sub" id="hint">💡 こたえを きく</button></div></div>
      <button class="btn big" id="nx">つぎへ ▶</button>`;
    const reveal = () => { $('#ansBox').innerHTML = `<div class="en en-font">${esc(w.en)}</div>`; say(w.en); };
    $('#mic').onclick = async e => { await tryMic(e.currentTarget, w.en, isNum(w) ? [w.em] : []); $('#ansBox') && ($('#ansBox').innerHTML = `<div class="en en-font">${esc(w.en)}</div>`); };
    $('#hint').onclick = reveal;
    $('#nx').onclick = () => ctx.next();
  };
}
function pairItem(p) {
  return ctx => {
    const side = Math.random() < .5 ? 0 : 2; const word = p[side];
    const opts = [`<span class="en-font">${esc(p[0])}</span><br><span class="small">${esc(p[1])}</span>`, `<span class="en-font">${esc(p[2])}</span><br><span class="small">${esc(p[3])}</span>`];
    choiceQ(ctx, {
      mimi: 'どっちに きこえた？', prompt: `<div class="qtext">${esc(p[0])} と ${esc(p[2])}、どっちかな？</div>${playBtns()}`,
      autoplay: word, opts, ans: side / 2,
      reveal: `こたえは <b class="en-font">${esc(word)}</b>。 くらべて きいてみよう：<div style="display:flex;gap:10px;margin-top:8px"><button class="btn sm purple en-font" data-say="${esc(p[0])}">🔊 ${esc(p[0])}</button><button class="btn sm purple en-font" data-say="${esc(p[2])}">🔊 ${esc(p[2])}</button></div>`,
    });
  };
}

/* ========== ゲームいろいろ ========== */
function gamePool(filter = () => true, min = 12) {
  const L = S.set.lvl;
  let p = WORDS.filter(w => inLevel(w) && seen(w) && filter(w));
  if (p.length < min) {
    const add = WORDS.filter(w => inLevel(w) && !seen(w) && filter(w)).sort((a, b) => b.lv - a.lv || a.ci - b.ci || a.i - b.i).slice(0, min * 2 - p.length);
    p = p.concat(add);
  }
  return shuffle(p);
}
function gListen() {
  const ws_ = gamePool().slice(0, 10);
  runSeq({ title: 'きいてタッチ', items: ws_.map(w => qItem(w, w.em ? 'lp' : 'lm')), intro: 'よく きいてね 👂', again: gListen });
}
function gMeaning() {
  const ws_ = gamePool().slice(0, 10);
  runSeq({ title: 'いみクイズ', items: ws_.map((w, k) => qItem(w, k % 2 ? 'je' : 'em')), again: gMeaning });
}
function gSpell() {
  const ws_ = gamePool(spellable, 10).slice(0, 8);
  runSeq({ title: 'つづりパズル', items: ws_.map(w => qItem(w, 'sp')), again: gSpell });
}
function gPairs() {
  runSeq({ title: 'みみトレ', intro: 'にている音を ききわけよう！ 耳を きたえるよ', again: gPairs, items: shuffle(PAIRS).slice(0, 10).map(pairItem) });
}
function gDialog() {
  const ds = shuffle(DIALOGS.filter(d => (d.lv || 5) >= S.set.lvl || d.u)).slice(0, 8);
  runSeq({ title: 'かいわ', intro: `${buddy().name}の しつもんに こたえてね`, again: gDialog, items: ds.map(d => ctx => dialogQ(ctx, d)) });
}
function gOrder() {
  const ss = shuffle(SENTENCES.filter(s => (s.lv || 5) >= S.set.lvl || s.u)).slice(0, 6);
  runSeq({ title: 'ならべかえ', again: gOrder, items: ss.map(s => ctx => orderQ(ctx, s)) });
}

/* ========== ABC ========== */
function abc() {
  show(`<div class="sub">${subHead('🔤 ABC')}${mimiRow('もじを タッチすると 音が でるよ。ことばの さいしょの音に ちゅうもく！')}
    <div class="abc">${PHONICS.map((p, k) => `<button data-k="${k}"><div class="L en-font">${p[0]}<small>${p[0].toLowerCase()}</small></div><div class="ex">${p[2]}</div><div class="small en-font">${p[1]}</div></button>`).join('')}</div>
    <button class="btn big purple" id="abcq">🎯 さいしょの もじ クイズ</button></div>`);
  $$('.abc button').forEach(b => b.onclick = async () => {
    const p = PHONICS[+b.dataset.k];
    setMimi('normal', `<span class="en-font" style="font-size:26px">${p[0]} ${p[0].toLowerCase()}</span> ― <b class="en-font">${p[1]}</b><br><span class="small">音のヒント：${esc(p[3])}</span>`);
    await say(p[0]); await sleep(150); await say(p[1]); await sleep(150); await say(p[1], 0.55);
  });
  $('#abcq').onclick = abcQuiz;
}
function abcQuiz() {
  const ps = shuffle(PHONICS.filter(p => p[0] !== 'X')).slice(0, 8);
  runSeq({
    title: 'さいしょの もじ', again: abcQuiz, intro: 'さいしょの音を よく きいてね',
    items: ps.map(p => ctx => {
      const others = shuffle(PHONICS.filter(q => q[0] !== p[0] && q[0] !== 'X')).slice(0, 3);
      const ch = shuffle([p, ...others]);
      choiceQ(ctx, {
        mimi: 'どの もじで はじまる？', prompt: `<div class="emo">${p[2]}</div>${playBtns()}`, autoplay: p[1],
        opts: ch.map(q => `<span class="en-font" style="font-size:36px">${q[0]}<small style="font-size:26px;color:var(--purple)"> ${q[0].toLowerCase()}</small></span>`),
        ans: ch.indexOf(p), sayAfter: p[1], reveal: `<b class="en-font">${p[1]}</b> は <b>${p[0]}</b> から。<span class="small">（${esc(p[3])}）</span>`,
      });
    }),
  });
}

/* ========== かたちあそび（ぶんぽう） ==========
   ルールの説明は1行だけ。「くらべて きく → まねする → えらぶ」で かたちに なれる。 */
// 2つの文で ちがう ことばに しるしを つける
function diffMark(a, b) {
  const wa = a.split(' '), wb = b.split(' ');
  const has = (arr, w) => arr.map(x => norm(x)).includes(norm(w));
  const mk = (ws, other) => ws.map(w => has(other, w) ? esc(w) : `<b class="hl">${esc(w)}</b>`).join(' ');
  return [mk(wa, wb), mk(wb, wa)];
}
function grammar() {
  show(`<div class="sub">${subHead('🎵 かたちあそび')}${mimiRow('むずかしい きまりは おぼえなくて だいじょうぶ。きいて まねすると しぜんに わかるよ')}
    <div class="list">${GRAMMAR.map((g, k) => `<button class="row-btn" data-k="${k}"><span class="i">🎵</span><span class="t">${esc(g.name || g.title)}<br><span class="small en-font">${esc(g.title)}</span></span><span class="tag ${g.lv === 4 ? 'p' : ''}">${g.lv}級</span></button>`).join('')}</div></div>`);
  $$('.row-btn').forEach(b => b.onclick = () => grammarLesson(GRAMMAR[+b.dataset.k]));
}
function grammarLesson(g) {
  const [ca, cb] = g.cmp ? diffMark(g.cmp[0], g.cmp[1]) : ['', ''];
  show(`<div class="sub">${subHead('🎵 ' + esc(g.name || g.title), grammar)}${mimiRow(`<span style="font-size:19px">${esc(g.tip || '')}</span>`)}
    ${g.cmp ? `<div class="panel"><b>👂 くらべて きいてみよう</b><div class="small">ちがう ところは どこかな？</div>
      <div class="cmp"><button class="cmpb en-font" data-t="0">🔊 ${ca}</button><span class="cmpv">↔</span><button class="cmpb en-font" data-t="1">🔊 ${cb}</button></div></div>` : ''}
    <div class="panel"><b>🗣️ まねして いってみよう</b>${g.ex.map((e, k) => `<div class="ex-row"><button class="play mini" data-k="${k}">🔊</button><div style="flex:1"><div class="e en-font">${esc(e[0])}</div><div class="j">${esc(e[1])}</div></div>${SR ? `<button class="btn sm mint exmic" data-k="${k}">🎤</button>` : ''}</div>`).join('')}</div>
    <button class="btn big" id="gq">クイズに チャレンジ ▶</button></div>`);
  $$('.cmpb').forEach(b => b.onclick = () => say(g.cmp[+b.dataset.t]));
  $$('.ex-row .play').forEach(b => b.onclick = () => say(g.ex[+b.dataset.k][0]));
  $$('.exmic').forEach(b => b.onclick = e => tryMic(e.currentTarget, g.ex[+b.dataset.k][0]));
  $('#gq').onclick = () => runSeq({ title: 'かたちあそび', again: () => grammarLesson(g), items: shuffle(g.quiz).map(q => ctx => grammarQ(ctx, q)) });
  if (g.cmp) (async () => { await sleep(400); await say(g.cmp[0]); await sleep(300); await say(g.cmp[1]); })();
}
function gqKey(q) { for (let gi = 0; gi < GRAMMAR.length; gi++) { const qi = GRAMMAR[gi].quiz.indexOf(q); if (qi >= 0) return gi + '-' + qi; } return null; }
function grammarQ(ctx, q, { fromReview = false } = {}) {
  const order = shuffle(q.o.map((t, k) => k));
  const full = q.q.replace('( )', q.o[q.a]);
  const key = gqKey(q);
  choiceQ(ctx, {
    mimi: '（　）に はいるのは どれ？', prompt: `<div class="qsent en-font">${esc(q.q).replace('( )', '（　　）')}</div>`,
    opts: order.map(k => `<span class="en-font">${esc(q.o[k])}</span>`), ans: order.indexOf(q.a), sayAfter: full,
    onAnswer: (ok, i) => {
      if (!key) return;
      const r = S.review.find(x => x.k === key);
      if (!ok) { // まちがえたら「おうちの人と見る」に入れる
        const pickTxt = q.o[order[i]];
        if (r) { r.n++; r.d = todayKey(); r.pick = pickTxt; } else S.review.push({ k: key, n: 1, d: todayKey(), pick: pickTxt });
        if (S.review.length > 40) S.review.shift();
      } else if (fromReview && r) { S.review = S.review.filter(x => x !== r); }
    },
  });
}
function gqFromKey(k) { const [gi, qi] = k.split('-').map(Number); const g = GRAMMAR[gi]; return g && g.quiz[qi] ? { g, q: g.quiz[qi] } : null; }

/* ========== おうちの人と見る ========== */
function review() {
  const items = S.review.map(r => ({ r, ...gqFromKey(r.k) })).filter(x => x.q).reverse();
  show(`<div class="sub">${subHead('📒 おうちの人と見る')}${mimiRow(items.length ? 'まちがえた かたちが たまっているよ。おうちの人と いっしょに 見てね' : 'いまは なにも ないよ！ すごいね ✨')}
    ${items.length ? `<div class="panel small">おうちの人へ：お子さんが まちがえた文法問題です。<b>正しい文を いっしょに声に出して読む</b>だけでも十分です。説明は「かたちのヒント」の1行を目安にしてください。「いっしょに見た」で消えます。</div>` : ''}
    <div class="list">${items.map(x => { const full = x.q.q.replace('( )', x.q.o[x.q.a]);
      return `<div class="panel rv"><div class="rv-h"><span class="tag ${x.g.lv === 4 ? 'p' : ''}">${esc(x.g.name || x.g.title)}</span><span class="small">${x.r.d.slice(5).replace('-', '/')}・${x.r.n}かい まちがい</span></div>
        <div class="qsent en-font" style="font-size:21px">${esc(full).replace(esc(x.q.o[x.q.a]), `<b class="hl">${esc(x.q.o[x.q.a])}</b>`)} <button class="play mini" data-say="${esc(full)}">🔊</button></div>
        <div class="small">えらんだ こたえ：<s class="en-font">${esc(x.r.pick || '')}</s> → 正しくは <b class="en-font">${esc(x.q.o[x.q.a])}</b></div>
        <div class="small">かたちのヒント：${esc(x.g.tip || '')}</div>
        <div style="margin-top:8px"><button class="btn sm sub rvok" data-k="${x.r.k}">✓ いっしょに見た</button></div></div>`; }).join('')}</div>
    ${items.length ? '<button class="btn big purple" id="rvq">もういちど チャレンジ ▶</button><p class="small center">チャレンジで正かいすると リストから きえるよ</p>' : ''}</div>`);
  $$('[data-say]').forEach(b => b.onclick = () => say(b.dataset.say));
  $$('.rvok').forEach(b => b.onclick = () => { S.review = S.review.filter(x => x.k !== b.dataset.k); save(); sfx('ok'); review(); });
  if ($('#rvq')) $('#rvq').onclick = () => runSeq({ title: 'おさらい', bonus: 3, again: null, items: shuffle(items).slice(0, 8).map(x => ctx => grammarQ(ctx, x.q, { fromReview: true })), onFinish: () => S.review.length ? `<div class="small">のこり ${S.review.length}こ</div>` : '<div class="panel">📒 ぜんぶ クリア！</div>' });
}

/* ========== ことばずかん ========== */
function zukan() {
  const card = c => {
    const ws_ = c.words.filter(inLevel), m = ws_.filter(mastered).length;
    return `<button class="cat" data-c="${c.id}">${m === ws_.length && ws_.length ? '<span class="stamp">💮</span>' : ''}<div class="i">${c.icon}</div><div class="n">${esc(c.name)}</div>${c.sub ? `<div class="small en-font">${esc(c.sub)}</div>` : ''}<div class="small">${m} / ${ws_.length}</div><div class="meter" style="height:8px;margin:4px 0 0"><i style="width:${ws_.length ? m / ws_.length * 100 : 0}%"></i></div></button>`;
  };
  const book = CATEGORIES.filter(c => c.book), theme = CATEGORIES.filter(c => !c.book);
  show(`<div class="sub">${subHead('📚 ことばずかん')}${mimiRow('3回 正かいすると カードが かんせい！ ぜんぶ あつめよう')}
    ${book.length ? `<div class="sec-title">📖 ほんの レッスン</div><div class="cats">${book.map(card).join('')}</div><div class="sec-title">🗂️ テーマべつ（英検の ことば）</div>` : ''}
    <div class="cats">${theme.map(card).join('')}</div></div>`);
  $$('.cat').forEach(b => b.onclick = () => zukanCat(b.dataset.c));
}
function zukanCat(id) {
  const c = CMAP[id];
  const ws_ = c.words.filter(inLevel);
  show(`<div class="sub">${subHead(c.icon + ' ' + c.name, zukan)}${mimiRow('カードを タッチすると 音が でるよ')}
    <button class="btn big mint" id="themeL" style="margin:0 0 14px">${c.book ? 'このレッスンで れんしゅう ▶' : 'このテーマで レッスン ▶'}</button>
    <div class="cards">${ws_.map(w => { const s = S.words[w.id]; const b = s ? s.b : 0;
      return `<button class="card ${s ? '' : 'new'}" data-w="${esc(w.id)}">${w.em ? pic(w) : '<span class="emo" style="opacity:.35">❔</span>'}${w.art ? `<div class="small en-font">${w.art}</div>` : ''}<div class="e en-font">${esc(w.en)}</div><div class="j">${esc(w.ja)}</div><div class="dots">${'★'.repeat(Math.min(3, b))}${'☆'.repeat(Math.max(0, 3 - b))}</div>${w.lv === 4 ? '<span class="tag p">4級</span>' : ''}</button>`; }).join('')}</div></div>`);
  $('#themeL').onclick = () => startLesson(id);
  $$('.card').forEach(b => b.onclick = () => wordModal(WMAP[b.dataset.w]));
}
function wordModal(w) {
  const m = modal(`<div class="wcard"><div class="pic">${pic(w)}</div>${w.art ? `<div class="art en-font">${w.art}</div>` : ''}<div class="en en-font">${esc(w.en)}</div><div class="ja">${esc(w.ja)}</div>
    <div class="row"><button class="btn sm purple" id="mp1">🔊</button><button class="btn sm sub" id="mp2">🐢</button>${SR ? '<button class="btn sm mint" id="mmic">🎤 いってみる</button>' : ''}</div>
    <div class="small" id="mmsg" style="margin-top:8px"></div></div><button class="btn big sub" id="mcl">とじる</button>`);
  $('#mp1', m).onclick = () => say(w.en);
  $('#mp2', m).onclick = () => say(w.art ? w.art + ' ' + w.en : w.en, 0.55);
  $('#mcl', m).onclick = closeModal;
  if (SR) $('#mmic', m).onclick = async e => {
    const btn = e.currentTarget; stopVoice(); btn.disabled = true; $('#mmsg').textContent = '🎙️ きいてるよ…';
    const r = await hear(); btn.disabled = false; const box = $('#mmsg'); if (!box) return;
    if (r === null) box.textContent = 'マイクが つかえないみたい';
    else if (!r.length) box.textContent = 'きこえなかったよ。もういちど！';
    else if (heardOK(r, [w.en, ...(isNum(w) ? [w.em] : [])])) { sfx('ok'); box.textContent = 'じょうず！ ✨'; }
    else box.textContent = `「${r[0]}」って きこえたよ。もういちど！`;
  };
  say(w.en);
}

/* ========== 英検ミニテスト ========== */
function mockMenu() {
  show(`<div class="sub">${subHead('📝 英検ミニテスト')}${mimiRow('ほんばんに にた もんだいに チャレンジ！')}
    <div class="panel">ぜんぶで 22もん（10〜15ふん）。<br>
    ・ごい 5もん ・ぶんぽう 3もん ・かいわ 4もん ・ならべかえ 2もん<br>・リスニング（え）4もん ・リスニング（おうとう）4もん
    <div class="small" style="margin-top:6px">※ 形式は英検の問題に にせていますが、問題数・むずかしさは ほんばんと ちがいます。6わり いじょう できたら ごうかくラインの ちかく（めやす）。</div></div>
    <button class="btn big" id="m5">英検5級ふう ▶</button><button class="btn big purple" id="m4">英検4級ふう ▶</button>
    ${S.mock.length ? `<div class="panel" style="margin-top:16px"><b>これまでの きろく</b>${S.mock.slice(-8).reverse().map(x => `<div class="small">${x.d}　${x.lv}級　${x.s}/${x.t}（${Math.round(x.s / x.t * 100)}%）</div>`).join('')}</div>` : ''}</div>`);
  $('#m5').onclick = () => mock(5); $('#m4').onclick = () => mock(4);
}
function mock(L) {
  const pool = WORDS.filter(w => w.lv >= L);
  const wsec = (name, f) => ctx => { ctx.sec = name; f(ctx); };
  const items = [];
  shuffle(pool).slice(0, 5).forEach(w => items.push(wsec('ごい', ctx => {
    const ch = shuffle([w, ...distractors(w, 3, 'en')]);
    choiceQ(ctx, { mimi: 'いみに あう えいごは？', prompt: `<div class="qword ja">「${esc(w.ja)}」</div>`, opts: ch.map(x => `<span class="en-font">${esc(x.en)}</span>`), ans: ch.indexOf(w), sayAfter: w.en });
  })));
  shuffle(GRAMMAR.filter(g => g.lv >= L).flatMap(g => g.quiz)).slice(0, 3).forEach(q => items.push(wsec('ぶんぽう', ctx => grammarQ(ctx, q))));
  const ds = shuffle(DIALOGS.filter(d => (d.lv || 5) >= L));
  ds.slice(0, 4).forEach(d => items.push(wsec('かいわ', ctx => dialogQ(ctx, d, { listen: false }))));
  shuffle(SENTENCES.filter(s => (s.lv || 5) >= L)).slice(0, 2).forEach(s => items.push(wsec('ならべかえ', ctx => orderQ(ctx, s))));
  shuffle(pool.filter(w => w.em)).slice(0, 4).forEach(w => items.push(wsec('リスニング（え）', ctx => {
    const ch = shuffle([w, ...distractors(w, 3, 'em')]);
    choiceQ(ctx, { mimi: 'きいて、えを えらんでね', prompt: `<div class="qtext">リスニング</div>${playBtns(false)}`, autoplay: w.en, opts: ch.map(pic), optCls: 'pic', ans: ch.indexOf(w) });
  })));
  ds.slice(4, 8).forEach(d => items.push(wsec('リスニング（おうとう）', ctx => dialogQ(ctx, d, { listen: true }))));
  runSeq({
    title: `${L}級ふう`, items, bonus: 5, intro: 'リラックスして いこう！',
    onFinish: ({ score, answered }) => {
      S.mock.push({ d: todayKey(), lv: L, s: score, t: answered }); if (S.mock.length > 30) S.mock.shift();
      const p = answered ? score / answered : 0;
      return `<div class="panel" style="margin-top:8px">${p >= .6 ? '🎉 ごうかくラインの めやす（6わり）を こえたよ！' : `あと ${Math.max(1, Math.ceil(answered * .6) - score)}もんで めやすの 6わり！`}</div>`;
    },
  });
}

/* ========== きせかえ ========== */
function dress() {
  show(`<div class="sub">${subHead('👗 きせかえ')}
    <div class="stage-big"><div class="mimi mood-happy" id="dm">${mimiSVG()}</div></div>
    <div style="text-align:center;margin:10px 0"><span class="chip">⭐ <b id="starN">${S.stars}</b></span></div>
    <div class="sec-title">アイテム（タッチで つける・はずす）</div>
    <div class="shop">${OUTFITS.map(o => { const own = S.own.includes(o.id), on = S.wear.includes(o.id);
      return `<button class="item ${on ? 'on' : ''} ${own ? '' : 'lock'}" data-o="${o.id}"><div class="i">${o.icon}</div><div class="n">${o.name}</div><div class="c">${own ? (on ? 'つけてる' : 'もってる') : '⭐' + o.cost}</div></button>`; }).join('')}</div>
    <div class="sec-title">はいけい</div>
    <div class="shop">${BACKS.map(b => { const own = S.own.includes(b.id), on = S.bg === b.id;
      return `<button class="item ${on ? 'on' : ''} ${own ? '' : 'lock'}" data-b="${b.id}"><div class="swatch" style="background:linear-gradient(${b.c[0]},${b.c[1]})"></div><div class="n">${b.name}</div><div class="c">${own ? (on ? 'つかってる' : 'もってる') : '⭐' + b.cost}</div></button>`; }).join('')}</div></div>`);
  const buy = (id, cost, name) => {
    if (S.stars < cost) { toast(`⭐が あと ${cost - S.stars}こ たりないよ`); return false; }
    if (!confirm(`⭐${cost}こ で「${name}」を かう？`)) return false;
    S.stars -= cost; S.own.push(id); sfx('buy'); confetti(); return true;
  };
  $$('[data-o]').forEach(b => b.onclick = () => {
    const o = OUTFITS.find(x => x.id === b.dataset.o);
    if (!S.own.includes(o.id)) { if (!buy(o.id, o.cost, o.name)) return; S.wear.push(o.id); }
    else if (S.wear.includes(o.id)) S.wear = S.wear.filter(x => x !== o.id); else S.wear.push(o.id);
    save(); dress(); say('So cute!');
  });
  $$('[data-b]').forEach(b => b.onclick = () => {
    const g = BACKS.find(x => x.id === b.dataset.b);
    if (!S.own.includes(g.id) && !buy(g.id, g.cost, g.name)) return;
    S.bg = g.id; save(); dress();
  });
}

/* ========== せってい ========== */
function settings() {
  const vs = VOICES.length ? VOICES : (('speechSynthesis' in window) ? (loadVoices(), VOICES) : []);
  const profs = Object.entries(root.profiles);
  const seg = (id, vals, cur) => `<div class="seg" id="${id}">${vals.map(([v, l]) => `<button data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  show(`<div class="sub">${subHead('⚙️ せってい')}
  <div class="panel">
    <div class="field"><label>なまえ</label><input type="text" id="sName" value="${esc(S.name)}" maxlength="12"></div>
    <div class="field"><label>めざす級</label>${seg('sLv', [[5, '英検5級'], [4, '英検4級']], S.set.lvl)}</div>
    <div class="field"><label>1回の あたらしいことば</label>${seg('sNew', [[3, '3こ'], [5, '5こ'], [8, '8こ']], S.set.nNew)}</div>
    <div class="field"><label>まちがいさがし（1日の まい数）</label>${seg('sMg', [[1, '1まい'], [2, '2まい'], [3, '3まい']], S.set.mgMax)}</div>
    <div class="field"><label>よみあげの はやさ</label>${seg('sRate', [[0.7, 'ゆっくり'], [0.85, 'ふつう'], [1, 'はやい']], S.set.rate)}</div>
    <div class="switch"><b>こうかおん</b><button class="tog ${S.set.sfx ? 'on' : ''}" id="sSfx"></button></div>
    <div class="switch"><span><b>ワンセットが おわるまで ゲームを ロック</b><br><span class="small">おうちの人用。ずかん・きせかえ・ABC は いつでも ひらけます</span></span><button class="tog ${S.set.lock ? 'on' : ''}" id="sLock"></button></div>
    ${BOOKWORDS.length ? `<div class="switch"><span><b>あたらしいことばは 本の じゅんばんで</b><br><span class="small">本のことば ${BOOKWORDS.length}こ</span></span><button class="tog ${S.set.src === 'book' ? 'on' : ''}" id="sSrc"></button></div>` : ''}
  </div>
  <div class="panel">
    <b>こえ（おうちの人へ）</b>
    <div class="field"><select id="sVoice"><option value="">じどう（Google 英語(米国) をゆうせん）</option>${vs.map(v => `<option value="${esc(v.name)}" ${v.name === S.set.voice ? 'selected' : ''}>${esc(v.name)}（${esc(v.lang)}）</option>`).join('')}</select></div>
    <button class="btn sm purple" id="sTest">🔊 ためす</button>
    <p class="small">${vs.length ? `英語の声：${vs.length}こ 見つかりました。` : '英語の声が見つかりません。'}<br>
    声が出ない・カタコトのとき：Androidの「設定」→「システム」→「言語と入力」→「テキスト読み上げの出力」で、エンジンを「Google の音声サービス」にし、⚙️から「音声データをインストール」→「英語(米国)」を入れてください（機種によりメニュー名がちがいます）。</p>
  </div>
  <div class="panel">
    <b>なかまたち</b><div class="small">アプリを ひらいた日ごとに じゅんばんに こうたいします。タッチすると きょうの なかまを かえられます。</div>
    <div class="buddies">${BUDDIES.map((B, k) => `<button class="bud ${k === (S.bi || 0) ? 'on' : ''}" data-b="${k}"><div class="mimi mood-happy">${mimiSVG([], B.id)}</div><b>${B.name}</b><span class="small">${B.who}</span><span class="bond">💗${(S.bond || {})[B.id] || 0}</span></button>`).join('')}</div>
  </div>
  <div class="panel">
    <b>つかう人</b>
    <div class="list" style="margin-top:8px">${profs.map(([id, p]) => `<button class="row-btn" data-p="${id}"><span class="i">${id === root.cur ? '🐰' : '👤'}</span><span class="t">${esc(p.name || '（なまえなし）')}</span><span class="small">⭐${p.earned}</span></button>`).join('')}</div>
    <button class="btn sm sub" id="addP" style="margin-top:10px">＋ 人を ふやす</button>
  </div>
  <div class="panel">
    <b>🔧 おためしモード（おうちの人用）</b>
    <div class="switch"><span class="small">オンのあいだは ⭐・れんぞく日数・おぼえたことば が保存されません。オフにすると もとにもどります。</span><button class="tog ${trial ? 'on' : ''}" id="sTrial"></button></div>
  </div>
  <div class="panel">
    <b>💾 バックアップ</b>
    <p class="small">きろくは この端末のブラウザの中に保存されています。機種変更や、ブラウザのデータ消去の前に「書き出し」してください。</p>
    <div class="seg"><button id="exp">書き出し（ファイル）</button><button id="imp">読み込み</button></div>
    <input type="file" id="impF" accept=".json,application/json" style="display:none">
  </div>
  <div class="panel">
    <b>リセット</b>
    <p class="small">いまの人（${esc(S.name)}）の きろくを ぜんぶ けします。</p>
    <button class="btn sm sub" id="reset">きろくを けす</button>
  </div>
  <p class="small center">ミミィのえいご v${APP_VER}／ことば ${WORDS.length}こ・かいわ ${DIALOGS.length}・ならべかえ ${SENTENCES.length}・ぶんぽう ${GRAMMAR.length}</p></div>`);
  const segBind = (id, fn) => $$(`#${id} button`).forEach(b => b.onclick = () => { $$(`#${id} button`).forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.v); save(); });
  $('#sName').onchange = e => { const v = e.target.value.trim(); if (v) { S.name = v; save(); } };
  const reset0 = () => { if (S.today && !S.today.st) S.today = null; };
  segBind('sLv', v => { S.set.lvl = +v; reset0(); });
  segBind('sNew', v => { S.set.nNew = +v; reset0(); });
  segBind('sMg', v => S.set.mgMax = +v);
  segBind('sRate', v => { S.set.rate = +v; say('Hello! How are you?'); });
  $('#sSfx').onclick = e => { S.set.sfx = !S.set.sfx; e.currentTarget.classList.toggle('on', S.set.sfx); save(); sfx('ok'); };
  $$('.bud').forEach(b => b.onclick = () => { S.bi = +b.dataset.b; S.bd = todayKey(); save(); settings(); });
  $('#sLock').onclick = e => { S.set.lock = !S.set.lock; e.currentTarget.classList.toggle('on', S.set.lock); save(); };
  if ($('#sSrc')) $('#sSrc').onclick = e => { S.set.src = S.set.src === 'book' ? 'all' : 'book'; e.currentTarget.classList.toggle('on', S.set.src === 'book'); S.today = null; save(); };
  $('#sVoice').onchange = e => { S.set.voice = e.target.value; save(); say('Hello! I am Mimi.'); };
  $('#sTest').onclick = () => say('Hello! I am Mimi. Let\'s learn English together!');
  $$('[data-p]').forEach(b => b.onclick = () => { if (trial) { toast('おためしモードを オフにしてね'); return; } root.cur = b.dataset.p; S = root.profiles[root.cur]; save(); home(); });
  $('#addP').onclick = () => {
    if (trial) { toast('おためしモードを オフにしてね'); return; }
    const n = prompt('なまえを 入れてね'); if (!n || !n.trim()) return;
    const id = 'p' + Date.now().toString(36); root.profiles[id] = freshProfile(n.trim()); root.cur = id; S = root.profiles[id]; save(); home();
  };
  $('#sTrial').onclick = () => {
    if (!trial) { save(); trial = true; S = JSON.parse(JSON.stringify(S)); toast('おためしモード オン'); }
    else { trial = false; loadRoot(); toast('おためしモード オフ（もとにもどしました）'); }
    settings();
  };
  $('#exp').onclick = () => {
    const data = trial ? localStorage.getItem(KEY) : (save(), localStorage.getItem(KEY));
    const blob = new Blob([data || '{}'], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `mimi-eigo-backup-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  $('#imp').onclick = () => $('#impF').click();
  $('#impF').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const j = JSON.parse(await f.text()); if (!j.profiles) throw 0;
      if (!confirm('いまの きろくを、このファイルの きろくで おきかえます。よろしいですか？')) return;
      localStorage.setItem(KEY, JSON.stringify(j)); trial = false; loadRoot(); toast('読み込みました'); home();
    } catch (err) { alert('ファイルを 読み込めませんでした'); }
  };
  $('#reset').onclick = () => {
    if (!confirm(`${S.name} の きろくを ぜんぶ けします。よろしいですか？`)) return;
    const n = S.name, set = S.set; S = freshProfile(n); S.set = set; root.profiles[root.cur] = S; trial = false; save(); home();
  };
}

/* ========== 起動 ========== */
const FREE = ['zukan', 'dress', 'abc', 'review']; // ワンセット前でも ひらけるもの
const MODES = { listen: gListen, pairs: gPairs, meaning: gMeaning, spell: gSpell, dialog: gDialog, order: gOrder, abc, grammar, review, zukan, mock: mockMenu, dress };
loadRoot();
home();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
