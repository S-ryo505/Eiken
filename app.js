'use strict';
/* ===== ここえいご  app.js ===== */
const APP_VER = '2.4.0';
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
    set: { rate: 0.85, voice: '', nNew: 5, lvl: 5, sfx: true, lock: true, src: 'book', mgMax: 1, rev: 20 }
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
function addStar(n) {
  S.stars += n; S.earned += n; const el = $('#starN'); if (el) el.textContent = S.stars;
  const L = dlog(); L.st = (L.st || 0) + n; checkReward();
}
/* ---- いつ・どのくらい やったかの きろく（おうちの人が グラフで見る） ---- */
function dlog(d = todayKey()) { S.log = S.log || {}; return S.log[d] || (S.log[d] = { q: 0, ok: 0, ms: 0, h: {}, st: 0 }); }
let lastAns = 0;
function logAnswer(ok) {
  const L = dlog(), now = Date.now(), hr = new Date().getHours();
  L.q++; if (ok) L.ok++; L.h[hr] = (L.h[hr] || 0) + 1;
  L.ms += lastAns ? Math.min(now - lastAns, 60000) : 15000; // 1もん さいだい 60びょう として かぞえる
  lastAns = now;
}
/* ---- パパからの ごほうび（⭐の数で） ----
   1日に カウントする⭐は さいだい rwCap こ（おかわりや ゲームの やりすぎで ふえすぎないように） */
const RW = () => ({ stars: S.set.rwStars || 400, yen: S.set.rwYen || 100, cap: S.set.rwCap || 80 });
function rewardPts() { const c = RW().cap; return Object.values(S.log || {}).reduce((a, L) => a + Math.min(L.st || 0, c), 0); }
function checkReward() {
  const r = RW(), n = Math.floor(rewardPts() / r.stars); S.rw = S.rw || [];
  while (S.rw.length < n) {
    S.rw.push({ d: todayKey(), yen: r.yen, paid: false });
    setTimeout(() => { confetti(); sfx('fan'); modal(`<div class="center"><div style="font-size:64px">🎉</div><b style="font-size:22px">⭐${r.stars}こ たっせい！</b><p>パパから ごほうび ${r.yen}えん！<br>パパに この がめんを 見せてね</p><button class="btn big" onclick="closeModal()">やったー！</button></div>`); }, 600);
  }
}
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
// 正解するたびに 次のふくしゅうまでの日数がのびる：1→3→7→14→30→60→120日（まちがえたら 1日後に もどる）
const IV = [0, 1, 3, 7, 14, 30, 60, 120];
let SESSION = new Set();
let PRACTICE = false; // おかわり中は 日数を のばさない（まちがえたら あしたに もどすだけ）
function ws(en) { return S.words[en] || (S.words[en] = { b: 0, d: 0, ok: 0, ng: 0 }); }
function grade(en, ok) {
  const s = ws(en), now = Date.now();
  if (ok) s.ok++; else s.ng++;
  if (PRACTICE) { if (!ok) { s.b = Math.min(s.b || 1, 1); s.d = now + DAY - 3 * 3600e3; } return; }
  if (SESSION.has(en)) { if (!ok) { s.b = 1; s.d = now + DAY - 3 * 3600e3; } return; }
  SESSION.add(en);
  s.b = ok ? Math.min(IV.length - 1, s.b + 1) : 1;
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

/* ---------- マイク（はなすれんしゅう） ----------
   ・「どうぞ！」が でてから はなす（じゅんび前の こえは ひろえないため）
   ・とちゅうの ききとりも ひろう／9びょう まで まつ
   ・つづりが すこし ちがっても 音が ちかければ OK（おなじ音の ことば・数字も OK）
   ・ちがったら おてほんと きこえた ことばを くらべて、日本人が まちがえやすい 音の コツを 出す */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const NUMW = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const numWord = n => n < 20 ? NUMW[n] : n === 100 ? 'hundred' : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + NUMW[n % 10] : '');
const norm = s => String(s).toLowerCase().replace(/[-_]/g, ' ').replace(/\b\d{1,3}\b/g, d => +d <= 100 ? numWord(+d) : d).replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const HOMO = [['eye', 'i', 'aye'], ['two', 'to', 'too'], ['four', 'for', 'fore'], ['one', 'won'], ['eight', 'ate'], ['bee', 'be', 'b'], ['sea', 'see', 'c'], ['tea', 'tee', 't'],
  ['pear', 'pair', 'pare'], ['flour', 'flower'], ['right', 'write', 'rite'], ['night', 'knight'], ['hi', 'high'], ['blue', 'blew'], ['meat', 'meet'], ['week', 'weak'], ['sun', 'son'],
  ['hour', 'our'], ['dear', 'deer'], ['bear', 'bare'], ['tail', 'tale'], ['wood', 'would'], ['know', 'no'], ['new', 'knew'], ['by', 'buy', 'bye'], ['why', 'y'], ['you', 'u'], ['are', 'r'],
  ['okay', 'ok'], ['pe', 'p e', 'pee'], ['tv', 't v'], ['cd', 'c d'], ['ufo', 'u f o'], ['mom', 'mum'], ['gray', 'grey'], ['color', 'colour'], ['doughnut', 'donut'], ['ice cream', 'icecream']];
function lev(a, b) { const m = b.length; let prev = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= m; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[m]; }
const simi = (a, b) => (!a && !b) ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length);
// かんたんな 音の キー（つづりの ちがいより 音の ちかさを 見る）
const pkey = w => w.replace(/[^a-z]/g, '').replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/q/g, 'k').replace(/x/g, 'ks')
  .replace(/wh/g, 'w').replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/gh/g, '').replace(/dge/g, 'j').replace(/(.)\1+/g, '$1').replace(/(?!^)[aeiouy]+/g, 'a');
function sayScore(alts, target, extra = []) {
  const tg = [target, ...extra].map(norm).filter(Boolean);
  let best = { lv: 0, sim: 0, text: norm(alts[0] || '') };
  for (const alt of alts) {
    const n = norm(alt), words = n.split(' ');
    for (const t of tg) {
      if (n === t || (' ' + n + ' ').includes(' ' + t + ' ')) return { lv: 2, sim: 1, text: t };
      const h = HOMO.find(g => g.includes(t)); if (h && h.some(x => (' ' + n + ' ').includes(' ' + x + ' '))) return { lv: 2, sim: 1, text: t };
      const L = t.split(' ').length;
      for (let len = Math.max(1, L - 1); len <= L + 1; len++) for (let i = 0; i + len <= words.length; i++) {
        const seg = words.slice(i, i + len).join(' ');
        const sm = Math.max(simi(seg.replace(/ /g, ''), t.replace(/ /g, '')), .95 * simi(pkey(seg), pkey(t)));
        if (sm > best.sim) best = { sim: sm, text: seg };
      }
    }
  }
  best.lv = best.sim >= .85 ? 2 : best.sim >= .6 ? 1 : 0;
  return best;
}
// おてほん と きこえた ことばを 1もじずつ くらべる（ちがう ところに 下せん）
function lcsDiff(a, b) {
  const n = a.length, m = b.length, D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) D[i][j] = a[i] === b[j] ? D[i + 1][j + 1] + 1 : Math.max(D[i + 1][j], D[i][j + 1]);
  let i = 0, j = 0, t = '', h = ''; const X = c => `<b class="dx">${esc(c === ' ' ? '␣' : c)}</b>`;
  while (i < n && j < m) { if (a[i] === b[j]) { t += esc(a[i]); h += esc(b[j]); i++; j++; } else if (D[i + 1][j] >= D[i][j + 1]) { t += X(a[i]); i++; } else { h += X(b[j]); j++; } }
  while (i < n) t += X(a[i++]); while (j < m) h += X(b[j++]);
  return { t, h };
}
// 日本人が まちがえやすい 音の コツ
function pronTips(target, heard) {
  const t = norm(target), h = norm(heard), tips = [];
  if (/r/.test(t) && /l/.test(h) && !/l/.test(t)) tips.push('<b>R</b>：したを どこにも つけずに、くちを すこし まるめて「ゥル」');
  else if (/l/.test(t) && /r/.test(h) && !/r/.test(t)) tips.push('<b>L</b>：したの さきを 上の はの うらに ピタッと つけて「ル」');
  if (/th/.test(t) && !/th/.test(h)) tips.push('<b>TH</b>：したの さきを 上と下の はで かるく はさんで、いきを だす');
  if (/v/.test(t) && !/v/.test(h)) tips.push('<b>V</b>：上の はを 下くちびるに あてて「ヴ」と ふるわせる');
  if (/f/.test(t) && !/f/.test(h)) tips.push('<b>F</b>：上の はを 下くちびるに あてて「フッ」と いきだけ');
  if (/sh/.test(t) && !/sh/.test(h)) tips.push('<b>SH</b>：くちびるを まえに つきだして「シュ」');
  else if (/(^| )s[ei]/.test(t) && /sh/.test(h)) tips.push('<b>S</b>：はを かるく とじて「スィ」。「シ」に ならないように');
  if (/[bdgkptmns]$/.test(t) && /[aeiou]$/.test(h)) tips.push('さいごに「ウ」や「オ」を つけない。さいごの 音は みじかく とめる');
  if (/(er|ir|ur)/.test(t) && !/(er|ir|ur)/.test(h)) tips.push('<b>er / ir / ur</b>：したを おくに まるめて「アー」');
  if (tips.length < 2) tips.push('🐢 ゆっくり を きいて、おなじ リズム・おなじ つよさで まねしよう');
  return tips.slice(0, 2);
}
function hear(onState = () => { }) {
  return new Promise(res => {
    if (!SR) return res({ alts: [], err: 'unsupported' });
    let r; try { r = new SR(); } catch (e) { return res({ alts: [], err: 'unsupported' }); }
    r.lang = 'en-US'; r.maxAlternatives = 10; r.interimResults = true; r.continuous = false;
    let finals = [], interim = '', err = null, done = false, t1 = 0;
    r.onaudiostart = () => onState('ready');
    r.onspeechstart = () => onState('speech');
    r.onresult = e => { for (let i = e.resultIndex; i < e.results.length; i++) { const R = e.results[i];
      if (R.isFinal) finals.push(...[...R].map(a => a.transcript)); else { interim = R[0].transcript; onState('interim', interim); } } };
    r.onerror = e => { if (e.error !== 'aborted') err = e.error; };
    r.onend = () => { if (done) return; done = true; clearTimeout(t1); const alts = finals.length ? finals : (interim ? [interim] : []); res({ alts, err: alts.length ? null : (err || 'no-speech') }); };
    try { r.start(); onState('start'); } catch (e) { return res({ alts: [], err: 'busy' }); }
    t1 = setTimeout(() => { try { r.stop(); } catch (e) { } }, 9000);
  });
}
// けっかを 出す ばしょ（ボタンの ちかくに つくる）
function micBox(btn) {
  const row = btn.closest('.ex-row');
  if (row) { let b = row.nextElementSibling; if (!b || !b.classList.contains('micbox')) { b = document.createElement('div'); b.className = 'micbox'; row.after(b); } return b; }
  const host = btn.closest('.wcard') || btn.parentElement;
  let b = host.querySelector('.micbox'); if (!b) { b = document.createElement('div'); b.className = 'micbox'; host.appendChild(b); } return b;
}
const MIC_ERR = {
  'no-speech': 'こえが とどかなかったよ。「🎤 どうぞ！」が でてから いってね',
  'audio-capture': 'マイクが みつからないよ。おうちの人に きいてね',
  'not-allowed': 'マイクが つかえない せっていに なってるよ（おうちの人へ：Chromeの サイトの せっていで マイクを「許可」に）',
  'service-not-allowed': 'マイクが つかえない せっていに なってるよ（おうちの人へ：Chromeの サイトの せっていで マイクを「許可」に）',
  'network': 'インターネットに つながってないと ききとれないよ',
  'unsupported': 'この ブラウザでは つかえないよ。Chromeで ひらいてね', 'busy': 'ちょっと まって もういちど おしてね',
};
let micBusy = false; const micMiss = {};
async function tryMic(btn, target, extra = []) {
  if (!SR || micBusy) return;
  micBusy = true; stopVoice();
  const box = micBox(btn), old = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '⏳ じゅんび…';
  box.innerHTML = '<span class="small">ちょっと まってね…（まだ いわないでね）</span>';
  const r = await hear((st, txt) => {
    if (st === 'ready') { btn.innerHTML = '🎙️ どうぞ！'; btn.classList.add('live'); box.innerHTML = '<b class="go">🎤 どうぞ！ いってみて</b><div class="small">おおごえ じゃなくて ふつうの こえで OK</div>'; setMimi('think', 'どうぞ！ 👂'); }
    else if (st === 'interim') box.innerHTML = `<span class="small">きこえてる… </span><b class="en-font">${esc(txt)}</b>`;
  });
  micBusy = false; btn.disabled = false; btn.innerHTML = old; btn.classList.remove('live');
  if (!box.isConnected) return;
  const tgt = norm(target);
  if (!r.alts.length) {
    micMiss[tgt] = (micMiss[tgt] || 0) + 1;
    let msg = MIC_ERR[r.err] || MIC_ERR['no-speech'];
    if (micMiss[tgt] >= 2 && (r.err === 'no-speech' || !MIC_ERR[r.err])) msg += '<ul class="tips"><li>タブレットの マイク（ちいさい あな）に 20cmくらい ちかづいてね</li><li>まわりが うるさいと ききとりにくいよ</li><li>むずかしい ときは 🐢 を きいて まねする だけでも だいじょうぶ！</li></ul>';
    box.innerHTML = msg; setMimi('oops', 'うまく きこえなかったみたい'); return;
  }
  micMiss[tgt] = 0;
  const sc = sayScore(r.alts, target, extra);
  const giveStar = () => { const t = todayKey(); if (S.spokeDay !== t) { S.spokeDay = t; S.spoke = []; } if (!S.spoke.includes(tgt)) { S.spoke.push(tgt); addStar(1); } save(); };
  if (sc.lv === 2) { sfx('ok'); giveStar(); box.innerHTML = '<b class="okk">◎ ばっちり！ ちゃんと つたわったよ ✨</b>'; setMimi('happy', 'じょうず！ ✨'); return; }
  const d = lcsDiff(tgt, sc.text), tips = sc.sim < .35 ? ['ちがう ことばに きこえたみたい。🔊 で おてほんを きいてから いってみよう', '🐢 ゆっくり を きいて、おなじ リズムで まねしよう'] : pronTips(target, sc.text);
  const cmp = `<div class="cmpbox"><div><span class="lab">おてほん</span><b class="en-font">${d.t}</b><button class="play mini" data-say="${esc(target)}">🔊</button><button class="play mini slowb" data-slow="${esc(target)}">🐢</button></div>
    <div><span class="lab">きこえた</span><span class="en-font">${d.h || '…'}</span></div></div><ul class="tips">${tips.map(x => `<li>${x}</li>`).join('')}</ul>`;
  if (sc.lv === 1) { sfx('ok'); giveStar(); box.innerHTML = `<b class="okk">○ おしい！ ほとんど つたわったよ</b>${cmp}`; setMimi('happy', 'おしい！ あと ちょっと！'); }
  else { box.innerHTML = `<b>△ 「<span class="en-font">${esc(sc.text)}</span>」って きこえたよ</b>${cmp}<div class="small">下せんの ところが ちがって きこえたよ。🔊 を きいて もういちど！</div>`; setMimi('think', 'もういちど いってみよう！'); }
  $$('[data-say]', box).forEach(x => x.onclick = () => say(x.dataset.say));
  $$('[data-slow]', box).forEach(x => x.onclick = () => say(x.dataset.slow, 0.55));
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
  let msg = text || (Math.random() < .5 && bline('ng') ? bline('ng') : pick(NGMSG));
  if (MISS >= 2) msg += '<br><span class="small">わからない ときは「🤔 わからない」を おしてね。それも だいじな べんきょうだよ</span>';
  setMimi('oops', msg);
}
// 「わからない」を おしたとき（せめない。こたえを いっしょに おぼえる）
function idkSay() {
  COMBO = 0; MISS = 0; tone([523, 440], .1, 'sine', .08);
  setMimi('normal', pick(['おしえてくれて ありがとう！ こたえは これだよ。いっしょに おぼえよう', 'わからないって いえるの、えらいよ！ こたえを よく 見て きいてね', 'だいじょうぶ！ つぎに でたとき わかれば いいんだよ']));
}
const idkBtn = () => `<button class="btn sm sub idk ${MISS >= 2 ? 'pulse' : ''}" id="idk">🤔 わからない</button>`;
function pulseIdk() { const b = $('#idk'); if (b) b.classList.add('pulse'); }
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
    .sort((a, b) => S.words[a.id].d - S.words[b.id].d);
  // ふくしゅうを 先に。たまっている時は あたらしいことばを へらして、わすれる前に くりかえせるようにする
  const cap = theme ? 4 : (S.set.rev || 20), backlog = due.length;
  due.splice(cap);
  let nNew = S.set.nNew;
  if (!theme) nNew = backlog <= cap ? nNew : backlog <= cap * 1.5 ? Math.min(nNew, 3) : backlog <= cap * 2.5 ? Math.min(nNew, 2) : 1;
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
  <div class="stage3d" id="m3d"><div class="t3d">ここえいご</div><div class="hint3d">どんぐりむっつりおにぎり ・ 👆 さわって まわせるよ</div></div>
  <div class="hero"><div class="mimi mood-happy">${mimiSVG()}</div>
   <div class="bubble">${esc(S.name)}ちゃん、${gJa}！<br><span class="small">きょうの なかまは <b>${BB.name}</b>（${BB.who}）</span><br><span class="bond">なかよし ${'💗'.repeat(Math.min(5, Math.ceil(((S.bond || {})[BB.id] || 0) / 3)))}${'🤍'.repeat(5 - Math.min(5, Math.ceil(((S.bond || {})[BB.id] || 0) / 3)))}</span><br>${esc(BB.hello)}<br><button class="say" id="greet">🔊 ${gEn}</button></div></div>
  <div class="set-card ${doneToday ? 'done' : ''}">
   <div class="t">${doneToday ? '💮 きょうの ワンセット クリア！' : '🌟 きょうの ワンセット'}</div>
   <div class="d">${doneToday ? 'すごい！ あしたも いっしょに やろうね' : `やくそく：まいにち これだけは やろうね（${T.fresh.length ? `あたらしいことば ${T.fresh.length}こ` : 'ふくしゅうの日'}${T.due.length ? `・ふくしゅう ${T.due.length}こ` : ''}）`}</div>
   <div class="steps">${STAGES.map((st, k) => `<div class="step ${k < T.st ? 'ok' : k === T.st && !doneToday ? 'now' : ''}"><div class="si">${k < T.st ? '✅' : st.icon}</div><div class="sn">${st.name}</div></div>`).join('')}</div>
   ${doneToday ? okwCard() : `<button class="btn big" id="setBtn">${T.st ? `つづきから（${T.st + 1}/${STAGES.length}）▶` : 'スタート ▶'}</button>`}
  </div>
  <div class="week">${week}</div>
  ${(() => { const r = RW(), pts = rewardPts(), cur = pts % r.stars; return `<div class="rwline">🎁 ⭐${r.stars}こで パパから ごほうび！ <b>${cur}</b> / ${r.stars}<div class="meter" style="height:8px;margin:3px 0 0"><i style="width:${cur / r.stars * 100}%"></i></div><span class="small">※ 1日 ⭐${r.cap}こまで かぞえるよ</span></div>`; })()}
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
  <p class="small center" style="margin-top:18px">ここえいご v${APP_VER}</p>
 </div>`);
  $('#gear').onclick = settings;
  $('#greet').onclick = () => say(gEn);
  stage3d($('#m3d'));
  if ($('#setBtn')) $('#setBtn').onclick = () => runStage(T.st);
  if ($('#moreBtn')) $('#moreBtn').onclick = () => okawari();
  if ($('#giftBtn')) $('#giftBtn').onclick = () => MG.open();
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

// トップの3Dキャラ。読みこめないときは 2Dの むすびを かわりに出す
function stage3d(el) {
  if (!el) return;
  const ok = typeof Mascot3D !== 'undefined' && Mascot3D.mount(el, () => { tone([660, 990], .08); say(pick(['Hello!', 'Hi!', "Let's study!", 'Good job!'])); });
  if (!ok) el.insertAdjacentHTML('beforeend', `<div class="mimi mood-happy" style="width:150px;margin:20px auto 0">${mimiSVG([], 'musubi')}</div>`);
}
/* ========== はじめて ========== */
function welcome() {
  show(`<div class="welcome center">
   <div class="stage3d" id="m3d"><div class="t3d">ここえいご</div><div class="hint3d">👆 さわって まわせるよ</div></div>
   <div class="bubble" style="text-align:left">ここえいご へ ようこそ！<br>まいにち かわる なかまたちと いっしょに、えいごを きいて おぼえようね。<br>あなたの なまえを おしえて？</div>
   <div class="field" style="margin-top:16px"><input type="text" id="nm" placeholder="なまえ" maxlength="12" style="font-size:22px;text-align:center"></div>
   <div class="field"><label>めざす級</label><div class="seg" id="lvSeg" style="justify-content:center"><button data-v="5" class="on">英検5級</button><button data-v="4">英検4級</button></div></div>
   <button class="btn big" id="go">はじめる ▶</button>
   <p class="small">※ 音が出ます。タブレットの音量を あげてね</p></div>`);
  stage3d($('#m3d'));
  let lv = 5;
  $$('#lvSeg button').forEach(b => b.onclick = () => { lv = +b.dataset.v; $$('#lvSeg button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#go').onclick = () => {
    const v = $('#nm').value.trim(); if (!v) { $('#nm').focus(); return; }
    S.name = v; S.set.lvl = lv; save();
    say('Hello! Nice to meet you!'); home();
  };
}

/* ========== 問題のしくみ ========== */
function runSeq({ title, items, bonus = 2, onFinish, again, intro, nextStep, practice = false }) {
  COMBO = 0; MISS = 0; PRACTICE = practice;
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
      const t = todayKey(); S.days[t] = (S.days[t] || 0) + 1; logAnswer(ok);
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
    if ($('#okwGo')) $('#okwGo').onclick = () => okawari();
    if ($('#giftGo')) $('#giftGo').onclick = () => MG.open();
    $('#toHome').onclick = home;
  }
  step();
}

// 選択問題の共通部品
function choiceQ(ctx, { prompt, opts, ans, word, autoplay, sayAfter, onWrong, onAnswer, cls = '', optCls = '', reveal, mimi }) {
  const st = $('#stage');
  if (mimi) thinkQ(mimi);
  st.innerHTML = `<div class="qcard">${prompt}</div><div class="opts wait ${cls}">${opts.map((o, i) => `<button class="opt ${optCls}" data-i="${i}">${o}</button>`).join('')}</div><div class="idk-row">${idkBtn()}</div><div class="after"></div>`;
  // さいごまで きく（見る）までは えらべない → あてずっぽうを ふせぐ
  let ready = false;
  const setReady = () => { if (ready) return; ready = true; const o = $('.opts', st); if (o) o.classList.remove('wait'); };
  if (autoplay) { bindPlay(st, autoplay); setTimeout(async () => { await say(autoplay); setReady(); }, 350); setTimeout(setReady, 7000); }
  else setTimeout(setReady, 900);
  let locked = false;
  const finish = async (ok, reveal_) => {
    if (reveal_) {
      $('.after', st).insertAdjacentHTML('beforeend', `<div class="reveal">${reveal_}</div>`);
      $$('.after [data-say]', st).forEach(x => x.onclick = () => say(x.dataset.say));
    }
    const ir = $('.idk-row', st); if (ir) ir.remove();
    if (ok && !reveal_) {
      await sleep(350); if (sayAfter) await say(sayAfter); await sleep(350);
      if ($('#stage') === st) ctx.next();
    } else {
      $('.after', st).insertAdjacentHTML('beforeend', '<button class="btn big next">つぎへ ▶</button>');
      $('.next', st).onclick = () => ctx.next();
      await sleep(350); if (sayAfter) say(sayAfter);
    }
  };
  $('#idk', st).onclick = () => {
    if (locked) return; locked = true; setReady();
    $$('.opt', st)[ans].classList.add('right');
    if (word) grade(word.id, false);
    if (onAnswer) onAnswer(false, -1);
    ctx.answered(false); idkSay(); if (onWrong) onWrong();
    finish(false, reveal || ' ');
  };
  $$('.opt', st).forEach(b => b.onclick = async () => {
    if (locked) return;
    if (!ready) { setMimi('think', 'さいごまで きいてから えらぼうね 👂'); return; }
    locked = true;
    const i = +b.dataset.i, ok = i === ans;
    b.classList.add(ok ? 'right' : 'wrong');
    if (!ok) $$('.opt', st)[ans].classList.add('right');
    if (word) grade(word.id, ok);
    if (onAnswer) onAnswer(ok, i);
    ctx.answered(ok);
    if (ok) cheer();
    else { boo(); if (onWrong) onWrong(); }
    finish(ok, reveal);
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
// ならべる もんだいで まちがった もじ（ことば）を 2〜3こ えらんだら、やさしく おしえる
function gentle(n, words) {
  if (n === 2) setMimi('think', `あれ？ ちがう ${words ? 'ことば' : 'もじ'}が まざってるかも。⌫ で けして、${words ? 'にほんごを よく 見て' : '🔊 で もういちど きいて'} みよう`);
  else if (n === 3) { setMimi('normal', 'むずかしかったら「🤔 わからない」を おしてね。こたえを いっしょに おぼえよう'); pulseIdk(); }
}
function spellQ(ctx, w, opt = {}) {
  thinkQ('きいて、もじを じゅんばんに タッチ！');
  const letters = w.en.split('');
  const extra = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !letters.includes(c))).slice(0, letters.length > 5 ? 2 : 1);
  const tiles = shuffle([...letters, ...extra]).map((c, k) => ({ c, k, used: false }));
  let ansT = [], locked = false;
  const st = $('#stage');
  st.innerHTML = `<div class="qcard"><div>${w.em ? pic(w) : ''}</div><div class="qtext">${esc(w.ja)}</div>${playBtns()}</div>
    <div class="slots" id="slots"></div><div class="pool" id="pool"></div>
    <div class="after"><button class="btn sm sub" id="bk">⌫ ひとつ けす</button> ${idkBtn()}</div>`;
  bindPlay(st, w.en); setTimeout(() => say(w.en), 350);
  let wrongTaps = 0;
  function draw() {
    $('#slots').innerHTML = letters.map((_, k) => `<div class="slot ${ansT[k] ? 'fill' : ''}">${ansT[k] ? ansT[k].c : ''}</div>`).join('');
    $('#pool').innerHTML = tiles.map(t => `<button class="ltile en-font ${t.used ? 'used' : ''}" data-k="${t.k}">${t.c}</button>`).join('');
    $$('#pool .ltile').forEach(b => b.onclick = () => {
      if (locked) return; const t = tiles.find(x => x.k === +b.dataset.k); if (t.used) return;
      if (t.c !== letters[ansT.length]) { wrongTaps++; gentle(wrongTaps); }
      t.used = true; ansT.push(t); tone([600 + ansT.length * 40], 0.05); draw();
      if (ansT.length === letters.length) check();
    });
  }
  $('#bk').onclick = () => { if (locked || !ansT.length) return; ansT.pop().used = false; draw(); };
  $('#idk', st).onclick = async () => {
    if (locked) return; locked = true;
    $('#slots').innerHTML = letters.map(ch => `<div class="slot fill" style="color:var(--purple)">${ch}</div>`).join('');
    grade(w.id, false); ctx.answered(false); idkSay();
    $('.after', st).innerHTML = '<button class="btn big next">つぎへ ▶</button>';
    $('.next', st).onclick = () => ctx.next();
    if (opt.requeue && !opt.requeued) { opt.requeued = true; ctx.requeue(qItem(w, 'lm', { requeued: true })); }
    await say(w.en); await sleep(300); say(w.en, 0.55);
  };
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
    <div class="after"><button class="btn sm sub" id="bk">⌫ ひとつ もどす</button> ${idkBtn()}</div>`;
  let wrongTaps = 0;
  function draw() {
    $('#slots').innerHTML = ansT.length ? ansT.map(t => `<span class="chunk en-font">${esc(t.c)}</span>`).join('') : '<span class="small">ここに ならぶよ</span>';
    $('#pool').innerHTML = tiles.map((t, idx) => `<button class="ltile w en-font ${t.used ? 'used' : ''}" data-x="${idx}">${esc(t.c)}</button>`).join('');
    $$('#pool .ltile').forEach(b => b.onclick = () => {
      if (locked) return; const t = tiles[+b.dataset.x]; if (t.used) return;
      if (t.c !== toks[ansT.length]) { wrongTaps++; gentle(wrongTaps, true); }
      t.used = true; ansT.push(t); tone([600 + ansT.length * 40], 0.05); draw();
      if (ansT.length === toks.length) check();
    });
  }
  $('#bk').onclick = () => { if (locked || !ansT.length) return; ansT.pop().used = false; draw(); };
  $('#idk', st).onclick = async () => {
    if (locked) return; locked = true;
    $('#slots').innerHTML = toks.map(c => `<span class="chunk en-font" style="color:var(--purple)">${esc(c)}</span>`).join('');
    ctx.answered(false); idkSay();
    $('.after', st).innerHTML = `<div class="reveal">${esc(s.ja)}</div><button class="btn big next">つぎへ ▶</button>`;
    $('.next', st).onclick = () => ctx.next();
    await say(s.en);
  };
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
        S.lessonDay = todayKey(); dlog().set = Date.now(); addStar(10);
        const bid = buddy().id; S.bond = S.bond || {}; S.bond[bid] = (S.bond[bid] || 0) + 1;
        return `<div class="panel" style="font-size:20px"><b>💮 きょうの ワンセット ぜんぶ クリア！</b><br>ボーナス ⭐10 ／ ほかの あそびも できるよ<br><span class="bond">💗 ${buddy().name}との なかよしが アップ！（${S.bond[buddy().id]}）</span></div><button class="btn big" id="okwGo">🍙 もう1かい できるよ！ ▶</button>`;
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

/* ========== おかわり（ワンセットのあと） ==========
   ワンセットのあとに「もう1かい」できる。1かい クリアすると その日の まちがいさがしが あそべる。
   おかわりは れんしゅうなので、ふくしゅうの 日数は のばさない（まちがえたら あしたに もう1かい）。 */
const okwToday = () => (S.okw && S.okw.d === todayKey()) ? S.okw.n : 0;
const mgUnlocked = () => setDone() && okwToday() >= 1;
const mgDoneToday = () => S.mg && S.mg.d === todayKey() && S.mg.n >= (S.set.mgMax || 1);
function okwCard() {
  if (!mgUnlocked()) return `<div class="okw"><div class="gift shake">🍙</div><div class="okw-t"><b>もう1かい できるよ！</b><br>おかわり 10もんで ⭐を もっと あつめよう</div></div>
    <button class="btn big" id="moreBtn">🍙 もう1かい やる ▶</button>`;
  if (!mgDoneToday()) return `<div class="okw open"><div class="gift pop">🔍</div><div class="okw-t"><b>まちがいさがし が できるよ！</b><br>みつけられるかな？</div></div>
    <button class="btn big mint" id="giftBtn">🔍 あそぶ</button><button class="btn sm sub" id="moreBtn" style="margin-top:10px">🍙 もう1かい やる</button>`;
  return `<div class="okw"><div class="gift">🍙</div><div class="okw-t"><b>もう1かい できるよ！</b><br>⭐を もっと あつめよう</div></div>
    <button class="btn" id="moreBtn">🍙 もう1かい やる ▶</button>`;
}
function okawari() {
  const T = todaySet(), now = Date.now();
  const today = [...T.fresh, ...T.due].map(W).filter(Boolean);
  const weak = WORDS.filter(w => seen(w) && inLevel(w) && !today.includes(w)).sort((a, b) => (S.words[a.id].b - S.words[b.id].b) || (S.words[b.id].ng - S.words[a.id].ng)).slice(0, 12);
  let pool = shuffle(today).slice(0, 5).concat(shuffle(weak).slice(0, 8 - Math.min(5, today.length)));
  if (pool.length < 8) pool = pool.concat(shuffle(WORDS.filter(w => inLevel(w) && seen(w) && !pool.includes(w))).slice(0, 8 - pool.length));
  const items = pool.map(w => qItem(w, anyType(w)));
  const d = pick(DIALOGS.filter(x => (x.lv || 5) >= S.set.lvl || x.u)), sn = pick(SENTENCES.filter(x => (x.lv || 5) >= S.set.lvl || x.u));
  items.push(ctx => dialogQ(ctx, d), ctx => orderQ(ctx, sn));
  const first = okwToday() === 0;
  runSeq({
    title: 'おかわり', items: shuffle(items), bonus: 3, practice: true, again: null,
    intro: first ? 'もう1かい いってみよう！' : 'もういっちょ！ ⭐を あつめよう',
    onFinish: () => {
      S.okw = { d: todayKey(), n: okwToday() + 1 };
      if (first) return `<div class="panel center"><div class="gift big pop">🔍</div><b style="font-size:20px">まちがいさがし が できるように なったよ！</b></div><button class="btn big mint" id="giftGo">🔍 あそぶ</button>`;
      return '';
    },
  });
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
        const pickTxt = i >= 0 ? q.o[order[i]] : 'わからない';
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
    </div><button class="btn big sub" id="mcl">とじる</button>`);
  $('#mp1', m).onclick = () => say(w.en);
  $('#mp2', m).onclick = () => say(w.art ? w.art + ' ' + w.en : w.en, 0.55);
  $('#mcl', m).onclick = closeModal;
  if (SR) $('#mmic', m).onclick = e => tryMic(e.currentTarget, w.en, isNum(w) ? [w.em] : []);
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
/* ---- おうちの人むけ グラフ（いつ・どのくらい） ---- */
function drawCharts() {
  const el = $('#chartPanel'); if (!el) return;
  const N = 30, days = [];
  for (let k = N - 1; k >= 0; k--) { const d = dayOffset(-k); const L = (S.log || {})[d] || { q: S.days[d] || 0, ms: 0, h: {} }; days.push({ d, q: L.q || 0, min: Math.round((L.ms || 0) / 60000), set: !!L.set || (S.lessonDay === d), h: L.h || {} }); }
  const act = days.filter(x => x.q > 0), setN = days.filter(x => x.set).length;
  let best = 0, cur = 0; days.forEach(x => { cur = x.q > 0 ? cur + 1 : 0; best = Math.max(best, cur); });
  const avgMin = act.length ? Math.round(act.reduce((a, x) => a + x.min, 0) / act.length) : 0;
  const maxQ = Math.max(10, ...days.map(x => x.q));
  // 1) 日ごとの もんだい数（棒）＋ワンセットたっせい（✓）
  const W = 330, H = 150, pl = 26, pb = 22, bw = (W - pl) / N;
  const yt = [0, Math.round(maxQ / 2), maxQ];
  let bars = yt.map(v => { const y = H - pb - (v / maxQ) * (H - pb - 8); return `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="#eee6ee" stroke-width="1"/><text x="${pl - 4}" y="${y}" font-size="9" fill="#7a6580" text-anchor="end" dominant-baseline="central">${v}</text>`; }).join('');
  days.forEach((x, i) => {
    const h = (x.q / maxQ) * (H - pb - 8), X = pl + i * bw + 1.5, wd = bw - 3, Y = H - pb - h;
    if (x.q) bars += `<path d="M${X} ${H - pb} V${Y + 3} Q${X} ${Y} ${X + 3} ${Y} H${X + wd - 3} Q${X + wd} ${Y} ${X + wd} ${Y + 3} V${H - pb} Z" fill="#8a7bff"/>`;
    if (x.set) bars += `<text x="${X + wd / 2}" y="${H - pb + 9}" font-size="9" text-anchor="middle" fill="#1fa774" font-weight="800">✓</text>`;
    const dt = new Date(x.d); if (dt.getDay() === 1 || i === N - 1) bars += `<text x="${i === N - 1 ? W : X + wd / 2}" y="${H - 2}" font-size="8.5" text-anchor="${i === N - 1 ? 'end' : 'middle'}" fill="#7a6580">${x.d.slice(5).replace('-', '/')}</text>`;
    bars += `<rect class="hit" data-i="${i}" x="${pl + i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/>`;
  });
  // 2) なんじに やったか（日 × 時間 の マス）
  const H0 = 6, H1 = 22, cols = H1 - H0 + 1, rowsD = days.slice(-14), cw = (W - 40) / cols, ch = 11;
  const maxH = Math.max(1, ...rowsD.flatMap(x => Object.values(x.h)));
  const ramp = ['#f4f1fb', '#d6cffd', '#a596ff', '#7a68f0', '#5543c9'];
  let grid = '';
  for (let c = 0; c <= cols; c += 3) grid += `<text x="${40 + c * cw}" y="9" font-size="8.5" fill="#7a6580" text-anchor="middle">${H0 + c}じ</text>`;
  rowsD.forEach((x, r) => {
    const y = 14 + r * (ch + 2);
    grid += `<text x="36" y="${y + ch / 2}" font-size="8.5" fill="#7a6580" text-anchor="end" dominant-baseline="central">${x.d.slice(5).replace('-', '/')}</text>`;
    for (let c = 0; c < cols; c++) { const v = x.h[H0 + c] || 0, lv = v ? Math.min(4, 1 + Math.floor(3 * v / maxH)) : 0;
      grid += `<rect x="${40 + c * cw + 1}" y="${y}" width="${cw - 2}" height="${ch}" rx="2" fill="${ramp[lv]}"><title>${x.d} ${H0 + c}じ台：${v}もん</title></rect>`; }
  });
  const GH = 14 + rowsD.length * (ch + 2);
  el.innerHTML = `<b>📊 がくしゅうの きろく（さいきん30日）</b>
    <div class="stats"><div><b>${act.length}</b><span>やった日</span></div><div><b>${setN}</b><span>ワンセット<br>たっせい日</span></div><div><b>${avgMin}</b><span>1日へいきん<br>（ふん）</span></div><div><b>${best}</b><span>さいちょう<br>れんぞく</span></div></div>
    <div class="small" style="margin-top:8px">1日の もんだい数（✓＝ワンセット たっせい）。ぼうを おすと くわしく 出ます</div>
    <svg viewBox="0 0 ${W} ${H}" class="chart" id="barChart">${bars}</svg><div class="tip small" id="barTip">　</div>
    <div class="small" style="margin-top:6px">なんじに やったか（さいきん14日、こい色ほど たくさん）</div>
    <svg viewBox="0 0 ${W} ${GH}" class="chart">${grid}</svg>
    <div class="legend small">すくない <i style="background:${ramp[1]}"></i><i style="background:${ramp[2]}"></i><i style="background:${ramp[3]}"></i><i style="background:${ramp[4]}"></i> おおい</div>
    <div class="small" style="margin-top:6px">※ 時間は こたえた かんかくから 計算した めやすです（1もん さいだい1分）。v2.3.0 より前の日は もんだい数だけ わかります。</div>`;
  $$('#barChart .hit').forEach(r => { const f = () => { const x = days[+r.dataset.i]; $('#barTip').textContent = `${x.d.slice(5).replace('-', '/')}：${x.q}もん・やく${x.min}ふん${x.set ? '・ワンセット ✓' : ''}`; $$('#barChart .hit').forEach(z => z.setAttribute('fill', 'transparent')); r.setAttribute('fill', 'rgba(138,123,255,.12)'); }; r.addEventListener('pointerenter', f); r.addEventListener('click', f); });
}
let DEBUG = false, verTaps = [];
function settings() {
  const vs = VOICES.length ? VOICES : (('speechSynthesis' in window) ? (loadVoices(), VOICES) : []);
  const profs = Object.entries(root.profiles);
  const seg = (id, vals, cur) => `<div class="seg" id="${id}">${vals.map(([v, l]) => `<button data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  show(`<div class="sub">${subHead('⚙️ せってい')}
  <div class="panel">
    <div class="field"><label>なまえ</label><input type="text" id="sName" value="${esc(S.name)}" maxlength="12"></div>
    <div class="field"><label>めざす級</label>${seg('sLv', [[5, '英検5級'], [4, '英検4級']], S.set.lvl)}</div>
    <div class="field"><label>1回の あたらしいことば</label>${seg('sNew', [[3, '3こ'], [5, '5こ'], [8, '8こ']], S.set.nNew)}</div>
    <div class="field"><label>1日の ふくしゅう（さいだい）</label>${seg('sRev', [[12, '12こ'], [20, '20こ'], [30, '30こ']], S.set.rev || 20)}<div class="small">ふくしゅうが たまると、あたらしいことばは じどうで へります</div></div>
    <div class="field"><label>よみあげの はやさ</label>${seg('sRate', [[0.7, 'ゆっくり'], [0.85, 'ふつう'], [1, 'はやい']], S.set.rate)}</div>
    <div class="switch"><b>こうかおん</b><button class="tog ${S.set.sfx ? 'on' : ''}" id="sSfx"></button></div>
    ${BOOKWORDS.length ? `<div class="switch"><span><b>あたらしいことばは 本の じゅんばんで</b><br><span class="small">本のことば ${BOOKWORDS.length}こ</span></span><button class="tog ${S.set.src === 'book' ? 'on' : ''}" id="sSrc"></button></div>` : ''}
  </div>
  <div class="panel">
    <b>つかう人</b>
    <div class="list" style="margin-top:8px">${profs.map(([id, p]) => `<button class="row-btn" data-p="${id}"><span class="i">${id === root.cur ? '🐰' : '👤'}</span><span class="t">${esc(p.name || '（なまえなし）')}</span><span class="small">⭐${p.earned}</span></button>`).join('')}</div>
    <button class="btn sm sub" id="addP" style="margin-top:10px">＋ 人を ふやす</button>
  </div>
  ${DEBUG ? `<div class="panel" style="border:3px dashed var(--purple)">
    <b>🔧 おうちの人モード</b><div class="small">バージョンを 5かい つづけて おすと 出たり きえたり します</div>
    <div class="switch"><span><b>ワンセットが おわるまで ゲームを ロック</b><br><span class="small">ずかん・きせかえ・ABC・おうちの人と見る は いつでも ひらけます</span></span><button class="tog ${S.set.lock ? 'on' : ''}" id="sLock"></button></div>
    <div class="field"><label>ごほうび：⭐なんこで</label>${seg('sRwS', [[300, '300こ'], [400, '400こ'], [500, '500こ']], RW().stars)}</div>
    <div class="field"><label>ごほうび：いくら</label>${seg('sRwY', [[50, '50円'], [100, '100円'], [200, '200円']], RW().yen)}</div>
    <div class="field"><label>1日に かぞえる⭐の上限</label>${seg('sRwC', [[60, '60こ'], [80, '80こ'], [100, '100こ']], RW().cap)}</div>
    <div class="small">いまの ごほうび⭐：${rewardPts()}こ（上限こみ）</div>
    ${(S.rw || []).length ? `<div class="list" style="margin-top:6px">${S.rw.map((x, i) => `<div class="row-btn"><span class="i">🎁</span><span class="t">${x.d.slice(5).replace('-', '/')}　${x.yen}円</span><button class="btn sm ${x.paid ? 'mint' : 'sub'}" data-rw="${i}">${x.paid ? 'わたした ✓' : 'まだ'}</button></div>`).join('')}</div>` : '<div class="small">まだ ごほうびは ありません</div>'}
    <div class="field"><label>まちがいさがし 1日の まい数</label>${seg('sMg', [[1, '1まい'], [2, '2まい'], [3, '3まい']], S.set.mgMax)}</div>
  </div>
  <div class="panel" id="chartPanel"></div>
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
  </div>` : ''}
  <p class="small center" id="ver" style="padding:10px 0">ここえいご v${APP_VER}／ことば ${WORDS.length}こ・かいわ ${DIALOGS.length}・ならべかえ ${SENTENCES.length}・ぶんぽう ${GRAMMAR.length}</p></div>`);
  const segB = (id, fn) => $$(`#${id} button`).forEach(b => b.onclick = () => { $$(`#${id} button`).forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.v); save(); });
  const reset1 = () => { if (S.today && !S.today.st) S.today = null; };
  function bindBasic() {
    $('#sName').onchange = e => { const v = e.target.value.trim(); if (v) { S.name = v; save(); } };
    segB('sLv', v => { S.set.lvl = +v; reset1(); });
    segB('sNew', v => { S.set.nNew = +v; reset1(); });
    segB('sRev', v => { S.set.rev = +v; reset1(); });
    segB('sRate', v => { S.set.rate = +v; say('Hello! How are you?'); });
    $('#sSfx').onclick = e => { S.set.sfx = !S.set.sfx; e.currentTarget.classList.toggle('on', S.set.sfx); save(); sfx('ok'); };
    $$('[data-p]').forEach(b => b.onclick = () => { if (trial) { toast('おためしモードを オフにしてね'); return; } root.cur = b.dataset.p; S = root.profiles[root.cur]; save(); home(); });
    $('#addP').onclick = () => {
      if (trial) { toast('おためしモードを オフにしてね'); return; }
      const n = prompt('なまえを 入れてね'); if (!n || !n.trim()) return;
      const id = 'p' + Date.now().toString(36); root.profiles[id] = freshProfile(n.trim()); root.cur = id; S = root.profiles[id]; save(); home();
    };
  }
  bindBasic();
  $('#ver').onclick = () => {
    const now = Date.now(); verTaps = verTaps.filter(t => now - t < 3000); verTaps.push(now);
    if (verTaps.length >= 5) { verTaps = []; DEBUG = !DEBUG; toast(DEBUG ? '🔧 おうちの人モード' : 'ふつうの せってい'); settings(); }
  };
  if (!DEBUG) return;
  const segBind = (id, fn) => $$(`#${id} button`).forEach(b => b.onclick = () => { $$(`#${id} button`).forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.v); save(); });
  const reset0 = () => { if (S.today && !S.today.st) S.today = null; };
  segBind('sMg', v => S.set.mgMax = +v);
  segBind('sRwS', v => { S.set.rwStars = +v; settings(); });
  segBind('sRwY', v => S.set.rwYen = +v);
  segBind('sRwC', v => { S.set.rwCap = +v; settings(); });
  $$('[data-rw]').forEach(b => b.onclick = () => { const x = S.rw[+b.dataset.rw]; x.paid = !x.paid; save(); settings(); });
  drawCharts();
  $$('.bud').forEach(b => b.onclick = () => { S.bi = +b.dataset.b; S.bd = todayKey(); save(); settings(); });
  $('#sLock').onclick = e => { S.set.lock = !S.set.lock; e.currentTarget.classList.toggle('on', S.set.lock); save(); };
  $('#sVoice').onchange = e => { S.set.voice = e.target.value; save(); say('Hello! I am Mimi.'); };
  $('#sTest').onclick = () => say('Hello! I am Mimi. Let\'s learn English together!');
  $('#sTrial').onclick = () => {
    if (!trial) { save(); trial = true; S = JSON.parse(JSON.stringify(S)); toast('おためしモード オン'); }
    else { trial = false; loadRoot(); toast('おためしモード オフ（もとにもどしました）'); }
    settings();
  };
  $('#exp').onclick = () => {
    const data = trial ? localStorage.getItem(KEY) : (save(), localStorage.getItem(KEY));
    const blob = new Blob([data || '{}'], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `kokoeigo-backup-${todayKey()}.json`;
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
if (!S.log) { S.log = {}; if (S.lastDay === todayKey()) dlog().st = Math.min(S.earned, RW().cap); }
home();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
