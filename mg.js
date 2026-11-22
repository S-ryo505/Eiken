'use strict';
/* ===== まちがいさがし（自動生成） =====
   日付から乱数の種をつくり、部品を組み合わせて絵をかく。
   右の絵だけ、小さな部品を2か所かえる（色・数・あるなし・向き・文字）。
   同じ日は家族みんな同じ問題になる。 */
const MG = (() => {
  const INK = '#3d2b40';
  const O = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  const O1 = `stroke="${INK}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
  const CL = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac'];
  const f1 = n => Math.round(n * 10) / 10;
  const D2R = Math.PI / 180;

  function rng(seed) {
    let a = seed >>> 0;
    const f = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    return {
      f, i: (lo, hi) => lo + Math.floor(f() * (hi - lo + 1)), pick: arr => arr[Math.floor(f() * arr.length)], ch: p => f() < p,
      sh: arr => { arr = [...arr]; for (let k = arr.length - 1; k > 0; k--) { const j = Math.floor(f() * (k + 1)); [arr[k], arr[j]] = [arr[j], arr[k]]; } return arr; },
    };
  }
  function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // 色をかえるときは、パレットで2つ以上はなれた色にする（気づける差にする）
  function other(c, R) { const i = CL.indexOf(c); return R.pick(CL.filter((x, k) => x !== c && (i < 0 || Math.abs(k - i) >= 2))); }
  const SIM = { A: 'R', B: 'P', C: 'G', D: 'O', E: 'F', F: 'E', G: 'C', H: 'N', I: 'L', K: 'X', L: 'I', M: 'N', N: 'M', O: 'C', P: 'R', Q: 'O', R: 'P', S: 'Z', T: 'I', U: 'V', V: 'U', W: 'V', X: 'K', Y: 'V', Z: 'S' };
  const swapAt = (w, i) => w.slice(0, i) + (SIM[w[i]] || 'Q') + w.slice(i + 1);
  function star(cx, cy, r) { let d = ''; for (let k = 0; k < 10; k++) { const a = -90 + k * 36, rr = k % 2 ? r * .45 : r; d += (k ? 'L' : 'M') + f1(cx + Math.cos(a * D2R) * rr) + ' ' + f1(cy + Math.sin(a * D2R) * rr); } return d + 'Z'; }
  function heart(cx, cy, s) { return `M${cx} ${f1(cy + s * .9)} C${f1(cx - s * 1.6)} ${f1(cy - s * .2)} ${f1(cx - s * .6)} ${f1(cy - s * 1.3)} ${cx} ${f1(cy - s * .4)} C${f1(cx + s * .6)} ${f1(cy - s * 1.3)} ${f1(cx + s * 1.6)} ${f1(cy - s * .2)} ${cx} ${f1(cy + s * .9)}Z`; }
  const txt = (x, y, s, w, extra = '') => `<text x="${f1(x)}" y="${f1(y)}" font-size="${s}" font-family="monospace" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="${INK}" ${extra}>${w}</text>`;
  const MONO = .6; // monospace 1文字のはば（フォントサイズ比）

  /* ---------- 部品ライブラリ ----------
     make: 初期パラメータ / draw: SVG / feats: かえられる場所 {x,y,r,mut} / box: 手前にあるとき後ろをかくす範囲 */
  const L = {
    sun: {
      make: R => ({ n: R.i(8, 10), miss: -1, face: R.ch(.7), wink: false, c: R.pick(['#ffd43b', '#ffc078']) }),
      draw: p => {
        let s = '';
        for (let k = 0; k < p.n; k++) { if (k === p.miss) continue; const a = k / p.n * Math.PI * 2; s += `<line x1="${f1(Math.cos(a) * 28)}" y1="${f1(Math.sin(a) * 28)}" x2="${f1(Math.cos(a) * 38)}" y2="${f1(Math.sin(a) * 38)}" stroke="#f59f00" stroke-width="3.5" stroke-linecap="round"/>`; }
        s += `<circle r="22" fill="${p.c}" ${O}/>`;
        if (p.face) s += (p.wink ? `<path d="M-10 -4 q3 -4 6 0" fill="none" ${O}/>` : `<circle cx="-7" cy="-4" r="2.5" fill="${INK}"/>`) + `<circle cx="7" cy="-4" r="2.5" fill="${INK}"/><path d="M-7 6 q7 7 14 0" fill="none" ${O}/>`;
        return s;
      },
      feats: p => { const k = Math.floor(p.n / 3), a = k / p.n * Math.PI * 2; const o = [{ x: Math.cos(a) * 33, y: Math.sin(a) * 33, r: 9, mut: q => q.miss = k }]; if (p.face) o.push({ x: -7, y: -4, r: 6, mut: q => q.wink = true }); return o; },
    },
    cloud: {
      make: R => ({ ex: R.ch(.5) }),
      draw: p => `<g fill="#fff" ${O}><path d="M-34 8 q-12 0 -10 -12 q2 -12 16 -10 q4 -16 22 -14 q16 0 18 14 q16 -2 18 10 q2 12 -12 12 z"/>${p.ex ? '<path d="M28 -6 q12 -2 12 8 q0 8 -12 6"/>' : ''}</g>`,
      feats: () => [{ x: 34, y: 0, r: 9, mut: q => q.ex = !q.ex }],
    },
    gulls: {
      make: R => ({ n: R.i(2, 3) }),
      draw: p => { let s = ''; for (let k = 0; k < p.n; k++) { const x = k * 26, y = (k % 2) * 8; s += `<path d="M${x} ${y} q5 -6 10 0 q5 -6 10 0" fill="none" ${O}/>`; } return s; },
      feats: p => [{ x: (p.n - 1) * 26 + 10, y: ((p.n - 1) % 2) * 8 - 3, r: 9, mut: q => q.n-- }],
    },
    house: {
      box: [-52, -100, 52, 0],
      make: R => ({ wall: R.pick(['#fff3bf', '#ffe3e3', '#e7f5ff', '#f3f0ff']), roof: R.pick(['#ff8787', '#748ffc', '#38d9a9', '#ffa94d']), door: R.pick(CL), ch: R.i(14, 20), cross: [true, true], knob: true, pot: R.pick(CL) }),
      draw: p => `<rect x="22" y="${-70 - p.ch}" width="12" height="${p.ch + 10}" fill="#c9a27e" ${O}/>
<rect x="-42" y="-62" width="84" height="62" fill="${p.wall}" ${O}/><path d="M-52 -60 L0 -100 L52 -60 Z" fill="${p.roof}" ${O}/>
<rect x="-12" y="-36" width="24" height="36" rx="3" fill="${p.door}" ${O}/>${p.knob ? `<circle cx="6" cy="-18" r="2.4" fill="#ffd43b" ${O1}/>` : ''}
${[-32, 18].map((x, k) => `<rect x="${x}" y="-54" width="14" height="14" fill="#a5d8ff" ${O}/>${p.cross[k] ? `<path d="M${x + 7} -54 v14 M${x} -47 h14" fill="none" ${O1}/>` : ''}`).join('')}
<circle cx="20" cy="-39" r="2.6" fill="#f783ac"/><circle cx="25" cy="-40" r="2.6" fill="#ffd43b"/><circle cx="30" cy="-39" r="2.6" fill="#f783ac"/>
<rect x="16" y="-37" width="18" height="6" fill="${p.pot}" ${O1}/>`,
      feats: p => [
        { x: 28, y: -70 - p.ch, r: 9, mut: q => q.ch += 12 },
        { x: -25, y: -47, r: 8, mut: q => q.cross[0] = false },
        { x: 6, y: -18, r: 5, mut: q => q.knob = false },
        { x: 25, y: -34, r: 7, mut: (q, R) => q.pot = other(q.pot, R) },
      ],
    },
    tree: {
      box: [-36, -92, 36, 0],
      make: R => { const n = R.i(3, 5), ap = []; for (let k = 0; k < n; k++) ap.push([R.i(-24, 24), R.i(-80, -46)]); return { ap, hole: R.ch(.6), bird: R.ch(.5), bc: R.pick(['#74c0fc', '#ffd43b', '#ff8787']), cr: R.pick(['#69db7c', '#51cf66', '#8ce99a']) }; },
      draw: p => `<rect x="-7" y="-40" width="14" height="40" fill="#a47148" ${O}/>${p.hole ? `<ellipse cx="0" cy="-20" rx="3" ry="4" fill="#5c3d2e"/>` : ''}
<g fill="${p.cr}" ${O}><circle cx="-20" cy="-52" r="18"/><circle cx="20" cy="-52" r="18"/><circle cx="0" cy="-64" r="27"/></g>
${p.ap.map(a => a ? `<circle cx="${a[0]}" cy="${a[1]}" r="4.5" fill="#fa5252" ${O1}/>` : '').join('')}
${p.bird ? `<g transform="translate(12 -92)"><ellipse rx="7" ry="5" fill="${p.bc}" ${O1}/><circle cx="4" cy="-4" r="3.5" fill="${p.bc}" ${O1}/><path d="M7 -4 l3 1 l-3 1z" fill="#ffa94d"/></g>` : ''}`,
      feats: p => {
        const o = [{ x: p.ap[0][0], y: p.ap[0][1], r: 6, mut: q => q.ap[0] = null }];
        if (p.hole) o.push({ x: 0, y: -20, r: 6, mut: q => q.hole = false });
        if (p.bird) o.push({ x: 12, y: -92, r: 8, mut: (q, R) => q.bc = other(q.bc, R) });
        return o;
      },
    },
    bunny: {
      box: [-24, -96, 24, 0],
      make: R => ({ fur: R.pick(['#ffffff', '#f3e3d3', '#e9ecef']), cl: R.pick(CL), bow: R.pick(CL), btn: R.i(2, 3), open: false, inner: [true, true] }),
      draw: p => {
        let s = '';
        [-9, 9].forEach((x, k) => { s += `<ellipse cx="${x}" cy="-80" rx="7" ry="18" fill="${p.fur}" ${O}/>`; if (p.inner[k]) s += `<ellipse cx="${x}" cy="-79" rx="2.8" ry="12" fill="#ffc9de"/>`; });
        s += `<path d="M-15 -32 L15 -32 L23 0 L-23 0 Z" fill="${p.cl}" ${O}/>`;
        for (let k = 0; k < p.btn; k++) s += `<circle cx="0" cy="${-24 + k * 8}" r="2.3" fill="#fff" ${O1}/>`;
        s += `<circle cx="0" cy="-52" r="21" fill="${p.fur}" ${O}/><circle cx="-7" cy="-54" r="2.6" fill="${INK}"/><circle cx="7" cy="-54" r="2.6" fill="${INK}"/><ellipse cx="-13" cy="-46" rx="4" ry="2.5" fill="#ffb3c6"/><ellipse cx="13" cy="-46" rx="4" ry="2.5" fill="#ffb3c6"/>`;
        s += p.open ? `<ellipse cx="0" cy="-43" rx="3" ry="3.5" fill="#ff8fab" ${O1}/>` : `<path d="M-4 -45 q4 4 8 0" fill="none" ${O1}/>`;
        s += `<path d="M12 -70 L4 -75 L4 -65Z M12 -70 L20 -75 L20 -65Z" fill="${p.bow}" ${O1}/><circle cx="12" cy="-70" r="2.2" fill="${p.bow}" ${O1}/>`;
        return s;
      },
      feats: p => [
        { x: 12, y: -70, r: 8, mut: (q, R) => q.bow = other(q.bow, R) },
        { x: 0, y: -24 + (p.btn - 1) * 8, r: 5, mut: q => q.btn-- },
        { x: 0, y: -44, r: 5, mut: q => q.open = !q.open },
        { x: -9, y: -82, r: 7, mut: q => q.inner[0] = false },
      ],
    },
    cat: {
      box: [-20, -70, 20, 0],
      make: R => ({ fur: R.pick(['#ffc078', '#ced4da', '#ffffff', '#c9a27e']), wh: [3, 3], tail: R.i(24, 32), tip: true, bell: R.pick(['#ffd43b', '#74c0fc', '#ff8787']), str: R.i(2, 3) }),
      draw: p => {
        const tp = `M14 -8 q${p.tail} 2 ${f1(p.tail * .7)} -${p.tail}`;
        let s = `<path d="${tp}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="${tp}" fill="none" stroke="${p.fur}" stroke-width="4" stroke-linecap="round"/>`;
        if (p.tip) s += `<circle cx="${f1(14 + p.tail * .7)}" cy="${-8 - p.tail}" r="4.2" fill="#fff" ${O1}/>`;
        s += `<ellipse cx="0" cy="-20" rx="17" ry="20" fill="${p.fur}" ${O}/><path d="M-15 -60 L-13 -76 L-3 -66 Z M15 -60 L13 -76 L3 -66 Z" fill="${p.fur}" ${O}/><circle cx="0" cy="-52" r="17" fill="${p.fur}" ${O}/>`;
        for (let k = 0; k < p.str; k++) s += `<path d="M${f1((k - (p.str - 1) / 2) * 5)} -68 v6" ${O1}/>`;
        s += `<circle cx="-6" cy="-53" r="2.4" fill="${INK}"/><circle cx="6" cy="-53" r="2.4" fill="${INK}"/><path d="M-2 -47 h4 l-2 2.5z" fill="#f783ac" ${O1}/>`;
        [-1, 1].forEach((d, k) => { for (let j = 0; j < p.wh[k]; j++) s += `<path d="M${d * 8} -46 L${d * 22} ${-50 + j * 4}" ${O1}/>`; });
        s += `<path d="M-12 -37 q12 5 24 0" fill="none" stroke="#e03131" stroke-width="2.5"/><circle cx="0" cy="-34" r="3.6" fill="${p.bell}" ${O1}/>`;
        return s;
      },
      feats: p => [
        { x: 18, y: -46, r: 8, mut: q => q.wh[1]-- },
        { x: 14 + p.tail * .7, y: -8 - p.tail, r: 6, mut: q => q.tip = false },
        { x: 0, y: -34, r: 5, mut: (q, R) => q.bell = other(q.bell, R) },
        { x: 0, y: -65, r: 6, mut: q => q.str-- },
      ],
    },
    flower: {
      box: [-10, -40, 10, 0],
      make: R => ({ c: R.pick(['#ff8787', '#f783ac', '#ffd43b', '#b197fc', '#74c0fc']), n: R.i(5, 6), miss: -1, mid: R.pick(['#ffd43b', '#ffa94d']), leaf: true, h: R.i(18, 26) }),
      draw: p => {
        let s = `<path d="M0 0 V${-p.h}" stroke="#2f9e44" stroke-width="2.5"/>`;
        if (p.leaf) s += `<ellipse cx="5" cy="${f1(-p.h / 2)}" rx="5" ry="2.5" fill="#51cf66" ${O1} transform="rotate(-30 5 ${f1(-p.h / 2)})"/>`;
        for (let k = 0; k < p.n; k++) { if (k === p.miss) continue; const a = k / p.n * Math.PI * 2 - Math.PI / 2; s += `<circle cx="${f1(Math.cos(a) * 6)}" cy="${f1(-p.h - 7 + Math.sin(a) * 6)}" r="4.2" fill="${p.c}" ${O1}/>`; }
        return s + `<circle cx="0" cy="${-p.h - 7}" r="3.6" fill="${p.mid}" ${O1}/>`;
      },
      feats: p => [
        { x: 0, y: -p.h - 13, r: 5, mut: q => q.miss = 0 },
        { x: 5, y: -p.h / 2, r: 6, mut: q => q.leaf = false },
      ],
    },
    balloon: {
      box: [-15, -76, 15, -40],
      make: R => ({ c: R.pick(['#ff6b6b', '#4dabf7', '#ffd43b', '#b197fc', '#69db7c']), hi: true, bow: true, len: R.i(32, 40) }),
      draw: p => `<path d="M0 0 q-4 ${-p.len / 4} 0 ${-p.len / 2} q4 ${-p.len / 4} 0 ${-p.len / 2}" fill="none" ${O1}/>${p.bow ? `<path d="M0 ${-p.len / 2} l-5 -3 v6z M0 ${-p.len / 2} l5 -3 v6z" fill="#ff8fab" ${O1}/>` : ''}
<ellipse cx="0" cy="${-p.len - 17}" rx="14" ry="17" fill="${p.c}" ${O}/><path d="M-3 ${-p.len} l3 -2 l3 2z" fill="${p.c}" ${O1}/>${p.hi ? `<ellipse cx="-5" cy="${-p.len - 24}" rx="3" ry="5" fill="#fff" opacity=".85"/>` : ''}`,
      feats: p => [{ x: -5, y: -p.len - 24, r: 6, mut: q => q.hi = false }, { x: 0, y: -p.len / 2, r: 6, mut: q => q.bow = false }],
    },
    butterfly: {
      box: [-16, -12, 16, 11],
      make: R => ({ c: R.pick(['#ffa94d', '#b197fc', '#74c0fc', '#f783ac']), sp: [true, true], an: [true, true] }),
      draw: p => {
        let s = `<g fill="${p.c}" ${O1}><ellipse cx="-8" cy="-4" rx="8" ry="7"/><ellipse cx="8" cy="-4" rx="8" ry="7"/><ellipse cx="-6" cy="6" rx="6" ry="5"/><ellipse cx="6" cy="6" rx="6" ry="5"/></g>`;
        if (p.sp[0]) s += `<circle cx="-9" cy="-5" r="2.2" fill="#fff"/>`; if (p.sp[1]) s += `<circle cx="9" cy="-5" r="2.2" fill="#fff"/>`;
        s += `<ellipse rx="2" ry="9" fill="${INK}"/>`;
        [-1, 1].forEach((d, k) => { if (p.an[k]) s += `<path d="M${d} -8 q${d * 2} -6 ${d * 6} -8" fill="none" ${O1}/><circle cx="${d * 7}" cy="-16" r="1.5" fill="${INK}"/>`; });
        return s;
      },
      feats: () => [{ x: 9, y: -5, r: 5, mut: q => q.sp[1] = false }, { x: -5, y: -14, r: 6, mut: q => q.an[0] = false }],
    },
    bench: {
      box: [-36, -36, 36, 0],
      make: R => ({ c: R.pick(['#c9a27e', '#4dabf7', '#69db7c', '#ff8787']), sl: 3, arm: true }),
      draw: p => {
        let s = `<rect x="-30" y="-36" width="4" height="36" fill="#868e96" ${O1}/><rect x="26" y="-36" width="4" height="36" fill="#868e96" ${O1}/>`;
        for (let k = 0; k < p.sl; k++) s += `<rect x="-34" y="${-34 + k * 7}" width="68" height="4.5" rx="1" fill="${p.c}" ${O1}/>`;
        s += `<rect x="-36" y="-14" width="72" height="5" rx="1" fill="${p.c}" ${O1}/>`;
        if (p.arm) s += `<path d="M-36 -26 h7 v12" fill="none" stroke="${INK}" stroke-width="3"/>`;
        return s;
      },
      feats: () => [{ x: 0, y: -18, r: 26, mut: q => q.sl = 2 }, { x: -33, y: -22, r: 7, mut: q => q.arm = false }],
    },
    sign: {
      box: [-28, -60, 28, 0],
      make: R => ({ w: R.pick(['PARK', 'ZOO', 'SHOP', 'CAFE', 'POOL']), d: R.ch(.5) ? 1 : -1, c: R.pick(['#ffe066', '#a5d8ff', '#d0bfff']) }),
      draw: p => { const d = p.d; return `<rect x="-3" y="-50" width="6" height="50" fill="#a47148" ${O}/><path d="M${-26 * d} -60 L${18 * d} -60 L${28 * d} -50 L${18 * d} -40 L${-26 * d} -40 Z" fill="${p.c}" ${O}/>${txt(-2 * d, -50, 11, p.w)}`; },
      feats: p => [{ x: -2 * p.d + (1 - (p.w.length - 1) / 2) * 11 * MONO, y: -50, r: 7, mut: q => q.w = swapAt(q.w, 1) }],
    },
    // --- レストラン ---
    table: {
      box: [-200, -12, 200, 110],
      make: R => ({ c1: R.pick(['#ff8787', '#74c0fc', '#8ce99a', '#ffd43b']), fc: R.i(1, 10), fr: R.i(0, 1), flip: false }),
      draw: p => {
        let s = `<rect x="-200" y="-12" width="400" height="32" fill="#fff" ${O}/>`;
        for (let r = 0; r < 3; r++) for (let c = 0; c < 13; c++) {
          let on = (r + c) % 2 === 0; if (p.flip && r === p.fr && c === p.fc) on = !on;
          s += `<rect x="${-208 + c * 32}" y="${20 + r * 32}" width="32" height="32" fill="${on ? p.c1 : '#fff'}" ${O1}/>`;
        }
        return s;
      },
      feats: p => [{ x: -208 + p.fc * 32 + 16, y: 20 + p.fr * 32 + 16, r: 13, mut: q => q.flip = true }],
    },
    pizza: {
      box: [-34, -15, 34, 15],
      make: R => { const n = R.i(5, 7), pe = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + R.f() * .4, r = R.i(9, 16); pe.push([f1(Math.cos(a) * r), f1(Math.sin(a) * r * .42)]); } return { pe, ba: true }; },
      draw: p => `<ellipse rx="34" ry="15" fill="#fff" ${O}/><ellipse rx="27" ry="11.5" fill="#ffc078" ${O}/><ellipse rx="22.5" ry="9" fill="#ffe066"/>
${[0, 60, 120].map(a => { const x = f1(Math.cos(a * D2R) * 23), y = f1(Math.sin(a * D2R) * 9.5); return `<path d="M${x} ${y} L${-x} ${-y}" stroke="#e8a35a" stroke-width="1.2"/>`; }).join('')}
${p.pe.map(e => e ? `<ellipse cx="${e[0]}" cy="${e[1]}" rx="3.6" ry="2" fill="#e03131"/>` : '').join('')}${p.ba ? '<ellipse cx="-3" cy="-1" rx="4" ry="1.8" fill="#2f9e44"/>' : ''}`,
      feats: p => [{ x: p.pe[0][0], y: p.pe[0][1], r: 5, mut: q => q.pe[0] = null }, { x: -3, y: -1, r: 5, mut: q => q.ba = false }],
    },
    cake: {
      box: [-24, -46, 24, 6],
      make: R => ({ cr: R.pick(['#fff', '#ffdeeb', '#fff3bf']), ly: R.pick(['#ffc078', '#ffa8a8', '#d0bfff']), leaf: true, dot: R.i(3, 4) }),
      draw: p => {
        let s = `<ellipse rx="26" ry="6" fill="#fff" ${O1}/><rect x="-16" y="-30" width="32" height="28" fill="#ffe8cc" ${O}/><rect x="-16" y="-19" width="32" height="6" fill="${p.ly}"/>
<rect x="-18" y="-35" width="36" height="7" rx="3" fill="${p.cr}" ${O}/>`;
        for (let k = 0; k < p.dot; k++) s += `<circle cx="${-10 + k * 7}" cy="-7" r="1.7" fill="#f783ac"/>`;
        s += `<circle cx="0" cy="-40" r="6" fill="#ff6b6b" ${O1}/>`;
        if (p.leaf) s += `<path d="M-4 -45 L0 -49 L4 -45 Z" fill="#51cf66" ${O1}/>`;
        return s;
      },
      feats: p => [
        { x: 0, y: -46, r: 5, mut: q => q.leaf = false },
        { x: -8, y: -16, r: 7, mut: q => q.ly = q.ly === '#d0bfff' ? '#ffc078' : '#d0bfff' },
        { x: -10 + (p.dot - 1) * 7, y: -7, r: 4, mut: q => q.dot-- },
      ],
    },
    cup: {
      box: [-20, -28, 20, 0],
      make: R => ({ c: R.pick(CL), st: 3, heart: R.ch(.6), side: R.ch(.5) ? 1 : -1, band: true }),
      draw: p => {
        let s = '';
        for (let k = 0; k < p.st; k++) s += `<path d="M${-6 + k * 6} -31 q-3 -5 0 -9 q3 -5 0 -9" fill="none" stroke="#adb5bd" stroke-width="2" stroke-linecap="round"/>`;
        s += `<circle cx="${13 * p.side}" cy="-13" r="6" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="${13 * p.side}" cy="-13" r="6" fill="none" stroke="${p.c}" stroke-width="2.5"/>`;
        s += `<rect x="-12" y="-26" width="24" height="26" rx="4" fill="${p.c}" ${O}/>`;
        if (p.band) s += `<rect x="-12" y="-23" width="24" height="3.5" fill="#fff" opacity=".9"/>`;
        if (p.heart) s += `<path d="${heart(0, -11, 4)}" fill="#fff"/>`;
        return s;
      },
      feats: p => {
        const o = [{ x: -6 + (p.st - 1) * 6, y: -40, r: 7, mut: q => q.st-- }, { x: 0, y: -21, r: 9, mut: q => q.band = false }];
        if (p.heart) o.push({ x: 0, y: -11, r: 5, mut: q => q.heart = false });
        return o;
      },
    },
    fork: {
      box: [-7, -50, 7, 0],
      make: () => ({ t: 4 }),
      draw: p => `<rect x="-2.5" y="-32" width="5" height="32" rx="2" fill="#dee2e6" ${O1}/><rect x="-7" y="-38" width="14" height="6" rx="2" fill="#dee2e6" ${O1}/>
${[-5.5, -1.8, 1.8, 5.5].slice(0, p.t).map(x => `<path d="M${x} -38 V-50" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`).join('')}`,
      feats: () => [{ x: 5.5, y: -44, r: 6, mut: q => q.t = 3 }],
    },
    menu: {
      box: [-17, -34, 17, 0],
      make: R => ({ w: R.pick(['MENU', 'CAFE', 'SOUP']), c: R.pick(['#ffe066', '#ffc9c9', '#d0bfff']), heart: true }),
      draw: p => `<path d="M-16 0 L-12 -33 L12 -33 L16 0 Z" fill="${p.c}" ${O}/>${txt(0, -21, 8.5, p.w)}${p.heart ? `<path d="${heart(0, -9, 3.2)}" fill="#ff6b6b"/>` : ''}`,
      feats: p => [{ x: (2 - (p.w.length - 1) / 2) * 8.5 * MONO, y: -21, r: 6, mut: q => q.w = swapAt(q.w, 2) }, { x: 0, y: -9, r: 5, mut: q => q.heart = false }],
    },
    clock: {
      box: [-21, -21, 21, 21],
      make: R => ({ c: R.pick(['#ffc9c9', '#a5d8ff', '#ffec99', '#d3f9d8']), h: R.i(0, 11), m: R.pick([0, 2, 4, 6, 8, 10]), tk: [true, true, true, true] }),
      draw: p => {
        let s = `<circle r="21" fill="${p.c}" ${O}/><circle r="16" fill="#fff" ${O1}/>`;
        p.tk.forEach((on, k) => { if (!on) return; const a = k * 90 * D2R; s += `<path d="M${f1(Math.sin(a) * 11.5)} ${f1(-Math.cos(a) * 11.5)} L${f1(Math.sin(a) * 15)} ${f1(-Math.cos(a) * 15)}" stroke="${INK}" stroke-width="2.6"/>`; });
        const ha = p.h * 30 * D2R, ma = p.m * 30 * D2R;
        s += `<path d="M0 0 L${f1(Math.sin(ha) * 8)} ${f1(-Math.cos(ha) * 8)}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M0 0 L${f1(Math.sin(ma) * 13)} ${f1(-Math.cos(ma) * 13)}" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><circle r="1.8" fill="#e03131"/>`;
        return s;
      },
      feats: p => { const ha = p.h * 30 * D2R; return [{ x: Math.sin(ha) * 5, y: -Math.cos(ha) * 5, r: 8, mut: q => q.h = (q.h + 4) % 12 }, { x: 13, y: 0, r: 5, mut: q => q.tk[1] = false }]; },
    },
    win: {
      box: [-46, -64, 46, 5],
      make: R => ({ cur: R.pick(['#ffa8a8', '#91a7ff', '#8ce99a', '#ffd8a8']), tie: (c => [c, c])(R.pick(CL)), star: R.ch(.5), sky: R.pick(['#d0ebff', '#c5f6fa']) }),
      draw: p => `<rect x="-40" y="-60" width="80" height="60" fill="${p.sky}" ${O}/>${p.star ? `<path d="${star(16, -44, 6)}" fill="#ffd43b" ${O1}/>` : ''}
<path d="M0 -60 V0 M-40 -30 H40" stroke="${INK}" stroke-width="3"/>
<path d="M-44 -62 Q-30 -40 -36 -2 L-44 -2 Z" fill="${p.cur}" ${O}/><path d="M44 -62 Q30 -40 36 -2 L44 -2 Z" fill="${p.cur}" ${O}/>
<rect x="-44" y="-32" width="10" height="5" rx="2" fill="${p.tie[0]}" ${O1}/><rect x="34" y="-32" width="10" height="5" rx="2" fill="${p.tie[1]}" ${O1}/>
<rect x="-48" y="0" width="96" height="5" fill="#fff" ${O1}/>`,
      feats: p => { const o = [{ x: -39, y: -29.5, r: 6, mut: (q, R) => q.tie[0] = other(q.tie[0], R) }]; if (p.star) o.push({ x: 16, y: -44, r: 7, mut: q => q.star = false }); return o; },
    },
    frame: {
      box: [-30, -24, 30, 24],
      make: R => ({ fc: R.pick(['#e8a87c', '#ffd43b', '#ced4da']), sun: true, snow: true, mt: R.pick(['#8ce99a', '#74c0fc', '#b197fc']) }),
      draw: p => `<rect x="-30" y="-24" width="60" height="48" fill="${p.fc}" ${O}/><rect x="-24" y="-18" width="48" height="36" fill="#e7f5ff" ${O1}/>
<path d="M-24 18 L-6 -8 L8 8 L14 2 L24 18 Z" fill="${p.mt}" ${O1}/>${p.snow ? `<path d="M-10.2 -2 L-6 -8 L-1.9 -2 Z" fill="#fff" ${O1}/>` : ''}${p.sun ? `<circle cx="14" cy="-9" r="4" fill="#ffd43b" ${O1}/>` : ''}`,
      feats: () => [{ x: 14, y: -9, r: 6, mut: q => q.sun = false }, { x: -6, y: -4, r: 5, mut: q => q.snow = false }],
    },
    // --- うみ ---
    boat: {
      box: [-38, -62, 38, 12],
      make: R => ({ hull: R.pick(['#ff8787', '#4dabf7', '#ffd43b']), fl: R.pick(['#ff6b6b', '#51cf66', '#9775fa']), ph: R.i(2, 3), stripe: true }),
      draw: p => {
        let s = `<path d="M0 -4 V-62" stroke="${INK}" stroke-width="2.5"/><path d="M3 -60 L30 -8 L3 -8 Z" fill="#fff" ${O}/>`;
        if (p.stripe) s += `<path d="M3 -30 L18.6 -30 L22.7 -22 L3 -22 Z" fill="#ff8787"/>`;
        s += `<path d="M0 -62 L-14 -57 L0 -52 Z" fill="${p.fl}" ${O1}/><path d="M-38 -4 L38 -4 L28 12 L-28 12 Z" fill="${p.hull}" ${O}/>`;
        for (let k = 0; k < p.ph; k++) s += `<circle cx="${-18 + k * 12}" cy="4" r="3" fill="#fff" ${O1}/>`;
        return s;
      },
      feats: p => [
        { x: -6, y: -57, r: 6, mut: (q, R) => q.fl = other(q.fl, R) },
        { x: -18 + (p.ph - 1) * 12, y: 4, r: 5, mut: q => q.ph-- },
        { x: 12, y: -26, r: 7, mut: q => q.stripe = false },
      ],
    },
    fish: {
      make: R => ({ c: R.pick(['#ffa94d', '#ffd43b', '#f783ac', '#b197fc']), st: R.i(2, 3), d: R.ch(.5) ? 1 : -1, bub: R.i(2, 3) }),
      draw: p => {
        const d = p.d;
        let s = `<path d="M${-14 * d} 0 L${-26 * d} -8 L${-26 * d} 8 Z" fill="${p.c}" ${O1}/><ellipse rx="16" ry="10" fill="${p.c}" ${O1}/>`;
        for (let k = 0; k < p.st; k++) s += `<path d="M${(-6 + k * 6) * d} -9 q${3 * d} 9 0 18" fill="none" ${O1}/>`;
        s += `<circle cx="${9 * d}" cy="-3" r="2" fill="${INK}"/>`;
        for (let k = 0; k < p.bub; k++) s += `<circle cx="${(20 + k * 3) * d}" cy="${-12 - k * 9}" r="${2.5 + k * .7}" fill="none" stroke="#fff" stroke-width="1.6"/>`;
        return s;
      },
      feats: p => [
        { x: (-6 + (p.st - 1) * 6) * p.d + 1.5 * p.d, y: 0, r: 6, mut: q => q.st-- },
        { x: (20 + (p.bub - 1) * 3) * p.d, y: -12 - (p.bub - 1) * 9, r: 6, mut: q => q.bub-- },
      ],
    },
    umb: {
      box: [-42, -112, 42, -64],
      make: R => ({ c1: R.pick(['#ff6b6b', '#4dabf7', '#9775fa', '#ffa94d']), alt: null }),
      draw: p => {
        let s = `<path d="M0 0 V-70" stroke="${INK}" stroke-width="3"/>`;
        for (let k = 0; k < 4; k++) {
          const a1 = Math.PI + k * Math.PI / 4, a2 = a1 + Math.PI / 4;
          const c = k === 2 && p.alt ? p.alt : (k % 2 ? '#fff' : p.c1);
          s += `<path d="M0 -70 L${f1(Math.cos(a1) * 42)} ${f1(-70 + Math.sin(a1) * 42)} A42 42 0 0 1 ${f1(Math.cos(a2) * 42)} ${f1(-70 + Math.sin(a2) * 42)} Z" fill="${c}" ${O}/>`;
        }
        return s + `<circle cx="0" cy="-113" r="3" fill="${INK}"/>`;
      },
      feats: () => { const a = Math.PI + 2.5 * Math.PI / 4; return [{ x: Math.cos(a) * 27, y: -70 + Math.sin(a) * 27, r: 11, mut: (q, R) => q.alt = other(q.c1, R) }]; },
    },
    castle: {
      box: [-34, -48, 34, 0],
      make: R => ({ fd: 1, fl: R.pick(['#ff6b6b', '#4dabf7', '#9775fa']), win: true, shell: R.ch(.6) }),
      draw: p => {
        const sand = '#ffd8a8';
        let s = `<path d="M27 -40 V-62" stroke="${INK}" stroke-width="1.8"/><path d="M27 -62 L${27 + p.fd * 12} -57 L27 -52 Z" fill="${p.fl}" ${O1}/>`;
        s += `<g fill="${sand}" ${O}><rect x="-22" y="-28" width="44" height="28"/><path d="M-34 0 V-44 h4 v4 h3 v-4 h3 v4 h4 V0Z"/><path d="M20 0 V-44 h4 v4 h3 v-4 h3 v4 h4 V0Z"/></g>`;
        s += `<path d="M-6 0 V-10 q6 -8 12 0 V0Z" fill="#a47148" ${O1}/>`;
        if (p.win) s += `<rect x="-29.5" y="-33" width="5" height="6" fill="#a47148" ${O1}/>`;
        if (p.shell) s += `<path d="M11 -4 q4 -8 8 0z" fill="#ffc9de" ${O1}/>`;
        return s;
      },
      feats: p => { const o = [{ x: 27 + p.fd * 6, y: -57, r: 8, mut: q => q.fd = -q.fd }, { x: -27, y: -30, r: 6, mut: q => q.win = false }]; if (p.shell) o.push({ x: 15, y: -6, r: 6, mut: q => q.shell = false }); return o; },
    },
    crab: {
      box: [-26, -28, 26, 0],
      make: R => ({ c: R.pick(['#ff6b6b', '#ff922b']), eye: [true, true], lg: [3, 3] }),
      draw: p => {
        let s = '';
        [-1, 1].forEach((d, k) => { for (let j = 0; j < p.lg[k]; j++) s += `<path d="M${d * 12} ${-9 + j * 3} L${d * 24} ${-4 + j * 4}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`; });
        s += `<ellipse cx="0" cy="-10" rx="16" ry="10" fill="${p.c}" ${O}/>`;
        [-1, 1].forEach(d => s += `<path d="M${d * 12} -16 L${d * 20} -22" ${O1}/><circle cx="${d * 22}" cy="-23" r="5.5" fill="${p.c}" ${O1}/><path d="M${d * 22} -23 l${d * 5} -3" ${O1}/>`);
        [-1, 1].forEach((d, k) => { if (p.eye[k]) s += `<path d="M${d * 5} -18 L${d * 6} -25" ${O1}/><circle cx="${d * 6}" cy="-26" r="2.6" fill="#fff" ${O1}/><circle cx="${d * 6}" cy="-26" r="1.1" fill="${INK}"/>`; });
        return s;
      },
      feats: () => [{ x: -6, y: -25, r: 5, mut: q => q.eye[0] = false }, { x: 22, y: 1, r: 6, mut: q => q.lg[1]-- }],
    },
    bucket: {
      box: [-17, -27, 17, 0],
      make: R => ({ c: R.pick(['#4dabf7', '#ff8787', '#69db7c']), star: true, sh: R.pick(['#ffd43b', '#b197fc', '#ff922b']) }),
      draw: p => `<path d="M8 -20 L20 -40" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M15 -42 l8 -8 l6 6 l-8 8z" fill="${p.sh}" ${O1}/>
<path d="M-16 -26 L16 -26 L12 0 L-12 0 Z" fill="${p.c}" ${O}/><path d="M-16 -24 Q0 -46 16 -24" fill="none" ${O1}/>${p.star ? `<path d="${star(0, -12, 5)}" fill="#fff" ${O1}/>` : ''}`,
      feats: () => [{ x: 0, y: -12, r: 6, mut: q => q.star = false }, { x: 22, y: -45, r: 7, mut: (q, R) => q.sh = other(q.sh, R) }],
    },
    ring: {
      box: [-17, -17, 17, 17],
      make: R => ({ c: R.pick(['#ff6b6b', '#4dabf7', '#9775fa']), alt: null }),
      draw: p => {
        let s = `<circle r="16" fill="#fff"/>`;
        [45, 135, 225, 315].forEach((a, k) => { const x = f1(Math.cos(a * D2R) * 12), y = f1(Math.sin(a * D2R) * 12); s += `<rect x="-5" y="-4.5" width="10" height="9" fill="${k === 1 && p.alt ? p.alt : p.c}" transform="translate(${x} ${y}) rotate(${a + 90})"/>`; });
        return s + `<circle r="16" fill="none" ${O}/><circle r="7" fill="#ffe8a3" ${O}/>`;
      },
      feats: () => [{ x: Math.cos(135 * D2R) * 12, y: Math.sin(135 * D2R) * 12, r: 6, mut: (q, R) => q.alt = other(q.c, R) }],
    },
    // --- おへや ---
    shelf: {
      box: [-55, -36, 55, 6],
      make: R => { const n = R.i(5, 7), bk = []; let x = -50; for (let k = 0; k < n; k++) { const w = R.i(9, 12), h = R.i(22, 32); bk.push({ x, w, h, c: R.pick(CL), lab: R.ch(.5) }); x += w + 1.5; } return { bk, miss: -1 }; },
      draw: p => `${p.bk.map((b, k) => k === p.miss ? '' : `<rect x="${b.x}" y="${-b.h}" width="${b.w}" height="${b.h}" fill="${b.c}" ${O1}/>${b.lab ? `<rect x="${b.x + 2}" y="${-b.h + 6}" width="${b.w - 4}" height="4" fill="#fff"/>` : ''}`).join('')}<rect x="-56" y="0" width="112" height="6" fill="#a47148" ${O}/>`,
      feats: p => { const m = Math.floor(p.bk.length / 2), b = p.bk[m], c = p.bk[1]; return [{ x: b.x + b.w / 2, y: -b.h / 2, r: 8, mut: q => q.miss = m }, { x: c.x + c.w / 2, y: -c.h / 2, r: 7, mut: (q, R) => q.bk[1].c = other(q.bk[1].c, R) }]; },
    },
    blocks: {
      box: [-38, -28, 38, 0],
      make: R => ({ L: R.sh('ABCDEFGHKLMNOPRSTUVW'.split('')).slice(0, 3), c: [R.pick(CL), R.pick(CL), R.pick(CL)] }),
      draw: p => p.L.map((ch, k) => { const x = -36 + k * 24; return `<path d="M${x} -22 l5 -6 h20 l-5 6z" fill="#fff" ${O1}/><path d="M${x + 22} -22 l5 -6 v20 l-5 8z" fill="${p.c[k]}" opacity=".7" ${O1}/><rect x="${x}" y="-22" width="22" height="22" fill="${p.c[k]}" ${O1}/>${txt(x + 11, -11, 14, ch)}`; }).join(''),
      feats: () => [{ x: -36 + 24 + 11, y: -11, r: 9, mut: q => q.L[1] = SIM[q.L[1]] || 'Q' }],
    },
    teddy: {
      box: [-24, -58, 24, 0],
      make: R => ({ c: R.pick(['#c68b59', '#e0b084', '#adb5bd']), tie: R.pick(CL), btn: true, inner: [true, true] }),
      draw: p => `<g fill="${p.c}" ${O}><circle cx="-11" cy="-4" r="7"/><circle cx="11" cy="-4" r="7"/><ellipse cx="0" cy="-17" rx="17" ry="16"/><ellipse cx="-17" cy="-20" rx="5" ry="8"/><ellipse cx="17" cy="-20" rx="5" ry="8"/>
<circle cx="-12" cy="-53" r="6"/><circle cx="12" cy="-53" r="6"/><circle cx="0" cy="-41" r="15"/></g>
${p.inner[0] ? '<circle cx="-12" cy="-53" r="3" fill="#ffc9de"/>' : ''}${p.inner[1] ? '<circle cx="12" cy="-53" r="3" fill="#ffc9de"/>' : ''}
<ellipse cx="0" cy="-36" rx="6.5" ry="4.5" fill="#fff3e0" ${O1}/><ellipse cx="0" cy="-38" rx="2.2" ry="1.6" fill="${INK}"/><circle cx="-6" cy="-44" r="2" fill="${INK}"/><circle cx="6" cy="-44" r="2" fill="${INK}"/>
<path d="M0 -26 l-6 -3.5 v7z M0 -26 l6 -3.5 v7z" fill="${p.tie}" ${O1}/>${p.btn ? `<circle cx="0" cy="-14" r="2" fill="#fff" ${O1}/>` : ''}`,
      feats: () => [{ x: 0, y: -26, r: 6, mut: (q, R) => q.tie = other(q.tie, R) }, { x: 12, y: -53, r: 6, mut: q => q.inner[1] = false }, { x: 0, y: -14, r: 5, mut: q => q.btn = false }],
    },
    rug: {
      box: [-80, -22, 80, 22],
      make: R => ({ c: R.pick(['#ffc9c9', '#d0bfff', '#a5d8ff']), dc: R.pick(['#fff', '#ffd43b']), miss: -1, odd: null }),
      draw: p => {
        let s = `<ellipse rx="80" ry="22" fill="${p.c}" ${O}/><ellipse rx="70" ry="16" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 5"/>`;
        for (let k = 0; k < 10; k++) { if (k === p.miss) continue; const a = k / 10 * Math.PI * 2; s += `<circle cx="${f1(Math.cos(a) * 52)}" cy="${f1(Math.sin(a) * 9)}" r="3" fill="${k === 7 && p.odd ? p.odd : p.dc}" ${O1}/>`; }
        return s;
      },
      feats: () => { const a2 = 2 / 10 * Math.PI * 2, a7 = 7 / 10 * Math.PI * 2; return [{ x: Math.cos(a2) * 52, y: Math.sin(a2) * 9, r: 5, mut: q => q.miss = 2 }, { x: Math.cos(a7) * 52, y: Math.sin(a7) * 9, r: 5, mut: q => q.odd = q.dc === '#fff' ? '#69db7c' : '#4dabf7' }]; },
    },
    plant: {
      box: [-22, -46, 22, 0],
      make: R => ({ pot: R.pick(['#e8590c', '#4dabf7', '#f783ac']), lv: R.i(5, 6), miss: -1, band: true }),
      draw: p => {
        let s = '';
        for (let k = 0; k < p.lv; k++) { if (k === p.miss) continue; const a = -60 + k * 120 / (p.lv - 1), cx = f1(Math.sin(a * D2R) * 16), cy = f1(-22 - Math.cos(a * D2R) * 16); s += `<ellipse cx="${cx}" cy="${cy}" rx="5" ry="12" fill="#51cf66" ${O1} transform="rotate(${f1(a)} ${cx} ${cy})"/>`; }
        s += `<path d="M-16 -22 L16 -22 L12 0 L-12 0 Z" fill="${p.pot}" ${O}/>`;
        if (p.band) s += `<rect x="-15" y="-17" width="30" height="5" fill="#fff" opacity=".85"/>`;
        return s;
      },
      feats: p => { const a = -60 + 1 * 120 / (p.lv - 1); return [{ x: Math.sin(a * D2R) * 18, y: -22 - Math.cos(a * D2R) * 18, r: 7, mut: q => q.miss = 1 }, { x: 0, y: -14.5, r: 7, mut: q => q.band = false }]; },
    },
  };

  /* ---------- シーン ---------- */
  const flowers = (R, n, y0, y1) => Array.from({ length: n }, () => ({ t: 'flower', x: R.i(18, 382), y: R.i(y0, y1), s: .9 }));
  const SCENES = [
    R => {
      const bg = `<rect width="400" height="300" fill="#d0ebff"/><path d="M0 172 Q100 138 200 168 T400 158 V300 H0Z" fill="#b2f2bb" ${O}/><path d="M0 222 Q200 200 400 225 V300 H0Z" fill="#8ce99a"/><path d="M150 300 Q190 252 238 218 L262 219 Q222 256 212 300Z" fill="#ffe8cc"/>`;
      const sunL = R.ch(.5), bx = R.i(85, 105);
      const o = [{ t: 'sun', x: sunL ? R.i(42, 70) : R.i(330, 358), y: R.i(42, 52), s: .9 }];
      (sunL ? [170, 280] : [60, 190]).forEach(x => o.push({ t: 'cloud', x: x + R.i(-20, 20), y: R.i(40, 75), s: .7 + R.f() * .25 }));
      o.push({ t: 'gulls', x: R.i(130, 240), y: R.i(95, 110), s: .7 });
      o.push({ t: 'tree', x: R.i(38, 62), y: R.i(205, 212), s: .95 + R.f() * .15 });
      o.push({ t: 'tree', x: R.i(200, 225), y: R.i(186, 194), s: .8 });
      o.push({ t: 'house', x: R.i(300, 330), y: R.i(198, 206), s: 1 });
      o.push({ t: 'butterfly', x: R.i(140, 180), y: R.i(140, 160), s: .8 });
      o.push({ t: 'bench', x: R.i(150, 170), y: 252, s: .9 });
      o.push({ t: 'sign', x: R.i(362, 376), y: 282, s: .85 });
      o.push({ t: 'balloon', x: bx + 22, y: 252, s: .9 });
      o.push({ t: 'bunny', x: bx, y: 286, s: 1.05 });
      o.push({ t: 'cat', x: R.i(250, 280), y: 290, s: .95 });
      o.push(...flowers(R, R.i(4, 6), 284, 298));
      return { name: 'こうえん', bg, o };
    },
    R => {
      const bg = `<rect width="400" height="300" fill="#fff4e6"/><g opacity=".5">${Array.from({ length: 10 }, (_, k) => `<path d="${star(20 + k * 40, k % 2 ? 22 : 14, 4)}" fill="#ffd8a8"/>`).join('')}</g><rect y="150" width="400" height="50" fill="#ffe8cc"/>${Array.from({ length: 21 }, (_, k) => `<path d="M${k * 20} 150 V200" stroke="#f5d0a9" stroke-width="2"/>`).join('')}`;
      const o = [
        { t: 'win', x: R.i(70, 90), y: 150, s: 1 }, { t: 'frame', x: R.i(205, 225), y: R.i(78, 90), s: 1 }, { t: 'clock', x: R.i(325, 345), y: R.i(52, 62), s: 1 },
        { t: 'plant', x: 375, y: 200, s: .9 },
        { t: 'bunny', x: R.i(140, 160), y: 222, s: 1.15 }, { t: 'cat', x: R.i(255, 275), y: 222, s: 1.15 },
        { t: 'table', x: 200, y: 208, s: 1 },
        { t: 'fork', x: R.i(48, 58), y: 214, s: .9 }, { t: 'pizza', x: R.i(105, 120), y: 212, s: 1 }, { t: 'cake', x: R.i(200, 215), y: 214, s: .9 },
        { t: 'cup', x: R.i(285, 300), y: 214, s: 1 }, { t: 'menu', x: R.i(345, 358), y: 214, s: .9 }, { t: 'flower', x: R.i(170, 180), y: 212, s: .7 },
      ];
      return { name: 'レストラン', bg, o };
    },
    R => {
      const bg = `<rect width="400" height="300" fill="#c5f6fa"/><rect y="118" width="400" height="92" fill="#4dabf7"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${(k * 70 + 10) % 400} ${135 + k * 11} q8 -5 16 0 q8 -5 16 0" fill="none" stroke="#a5d8ff" stroke-width="2"/>`).join('')}
<path d="M0 205 Q60 196 120 204 T240 202 T400 206 V300 H0Z" fill="#ffe8a3" ${O}/>${Array.from({ length: 14 }, (_, k) => `<circle cx="${(k * 53 + 17) % 400}" cy="${225 + (k * 37) % 70}" r="1.4" fill="#e8c27a"/>`).join('')}`;
      const o = [
        { t: 'sun', x: R.i(330, 360), y: R.i(40, 50), s: .85 }, { t: 'cloud', x: R.i(60, 110), y: R.i(40, 60), s: .8 }, { t: 'cloud', x: R.i(190, 240), y: R.i(55, 80), s: .65 },
        { t: 'gulls', x: R.i(120, 170), y: R.i(80, 95), s: .75 },
        { t: 'boat', x: R.i(250, 320), y: 150, s: .9 }, { t: 'fish', x: R.i(140, 175), y: 176, s: .7 }, { t: 'fish', x: R.i(205, 240), y: 194, s: .55 },
        { t: 'umb', x: R.i(65, 85), y: 288, s: 1.1 }, { t: 'ring', x: R.i(350, 370), y: 236, s: .9 },
        { t: 'castle', x: R.i(200, 225), y: 282, s: 1 }, { t: 'bucket', x: R.i(140, 155), y: 292, s: .85 },
        { t: 'bunny', x: R.i(285, 300), y: 290, s: .9 }, { t: 'crab', x: R.i(345, 365), y: 292, s: .8 },
      ];
      return { name: 'うみ', bg, o };
    },
    R => {
      const bg = `<rect width="400" height="300" fill="#f3f0ff"/>${Array.from({ length: 24 }, (_, k) => `<circle cx="${(k % 8) * 50 + (Math.floor(k / 8) % 2) * 25 + 12}" cy="${Math.floor(k / 8) * 70 + 30}" r="2.5" fill="#d0bfff"/>`).join('')}
<rect y="222" width="400" height="78" fill="#e6c9a8"/><path d="M0 222 H400" stroke="${INK}" stroke-width="2"/>${Array.from({ length: 5 }, (_, k) => `<path d="M${k * 90 + 40} 222 L${k * 90 + 10} 300" stroke="#d4b08c" stroke-width="2"/>`).join('')}`;
      const o = [
        { t: 'rug', x: 200, y: 272, s: 1 },
        { t: 'shelf', x: R.i(80, 100), y: 120, s: 1 }, { t: 'clock', x: R.i(200, 225), y: R.i(48, 58), s: .9 }, { t: 'frame', x: R.i(200, 220), y: 140, s: .8 }, { t: 'win', x: R.i(315, 330), y: 165, s: .9 },
        { t: 'teddy', x: R.i(55, 75), y: 268, s: 1 }, { t: 'bunny', x: R.i(160, 180), y: 268, s: 1.1 }, { t: 'blocks', x: R.i(245, 260), y: 290, s: .9 },
        { t: 'cat', x: R.i(300, 315), y: 286, s: .85 }, { t: 'plant', x: R.i(365, 378), y: 262, s: 1 },
      ];
      return { name: 'おへや', bg, o };
    },
  ];

  /* ---------- 問題をつくる ---------- */
  function gen(seed) {
    const R = rng(seed);
    const sc = R.pick(SCENES)(R);
    sc.o.forEach(o => o.p = L[o.t].make(R));
    const cand = [];
    sc.o.forEach((o, i) => (L[o.t].feats(o.p) || []).forEach((f, j) => {
      const gx = o.x + f.x * o.s, gy = o.y + f.y * o.s, gr = f.r * o.s;
      if (gx < 14 || gx > 386 || gy < 14 || gy > 288) return;
      for (let k = i + 1; k < sc.o.length; k++) { // 手前の部品にかくれていないか
        const q = sc.o[k], b = L[q.t].box; if (!b) continue;
        if (gx > q.x + b[0] * q.s - 3 && gx < q.x + b[2] * q.s + 3 && gy > q.y + b[1] * q.s - 3 && gy < q.y + b[3] * q.s + 3) return;
      }
      cand.push({ i, j, gx, gy, gr });
    }));
    const sh = R.sh(cand);
    const d1 = sh[0];
    // 2つとも極小にならないように：1つめが小さければ2つめは少し大きめから
    if (d1.gr < 6) { const big = sh.filter(c => c.gr >= 6); if (big.length) sh.splice(0, sh.length, d1, ...big); }
    const d2 = sh.find(c => c.i !== d1.i && Math.hypot(c.gx - d1.gx, c.gy - d1.gy) >= 100) || sh.find(c => c.i !== d1.i && Math.hypot(c.gx - d1.gx, c.gy - d1.gy) >= 60) || sh.find(c => c.i !== d1.i);
    const B = JSON.parse(JSON.stringify(sc.o));
    [d1, d2].forEach(d => L[B[d.i].t].feats(B[d.i].p)[d.j].mut(B[d.i].p, R));
    return { name: sc.name, bg: sc.bg, A: sc.o, B, diffs: [d1, d2] };
  }
  function svg(bg, objs, side) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" data-side="${side}">${bg}${objs.map(o => `<g transform="translate(${o.x} ${o.y}) scale(${o.s})">${L[o.t].draw(o.p)}</g>`).join('')}<g class="marks"></g></svg>`;
  }

  /* ---------- 画面 ---------- */
  const fmt = ms => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function state() { const t = todayKey(); if (!S.mg || S.mg.d !== t) S.mg = { d: t, n: 0, best: (S.mg && S.mg.best) || 0 }; return S.mg; }
  const maxN = () => S.set.mgMax || 1;
  function card() {
    if (!setDone()) return `<div class="mg-card lock"><div class="mg-ic">🔍</div><div><b>まちがいさがし</b><div class="small">🔒 ワンセットを クリアすると あそべるよ</div></div></div>`;
    const st = state();
    if (st.n >= maxN()) return `<button class="mg-card" id="mgCard"><div class="mg-ic">🔍</div><div><b>まちがいさがし ✅</b><div class="small">きょうは クリア！ またあしたね（もういちど 見る）</div></div></button>`;
    return `<button class="mg-card ready" id="mgCard"><div class="mg-ic">🔍</div><div><b>きょうの まちがいさがし</b><div class="small">あそべるよ！ かなり むずかしいよ〜（${st.n + 1}/${maxN()}まいめ）</div></div><div class="go">▶</div></button>`;
  }
  function bindCard() { const c = $('#mgCard'); if (c) c.onclick = open; }
  function open() {
    if (!setDone() && !trial) { toast('さきに ワンセットを やろう！'); return; }
    const st = state();
    if (st.n >= maxN()) return play(st.n - 1, true);
    play(st.n, false);
  }
  let timer = null;
  function play(n, replay) {
    const g = gen(hashStr(todayKey() + '|mg|' + n));
    const found = [false, false]; let miss = 0, hintUsed = false, done = false; const t0 = Date.now();
    show(`<div class="sub">${subHead('🔍 まちがいさがし')}
      <div class="mg-paper">
        <div class="mg-ribbon">まちがいさがし</div>
        <div class="mg-info"><span>ひだりと みぎで <b>2つ</b> ちがうよ！ みつけたら タッチ</span><span class="mg-stat"><span id="mgF"><i class="mg-dot"></i><i class="mg-dot"></i></span><span id="mgT">0:00</span></span></div>
        <div class="mg-pics"><div class="mg-pic">${svg(g.bg, g.A, 'A')}</div><div class="mg-pic">${svg(g.bg, g.B, 'B')}</div></div>
        <div class="mg-foot"><span class="small">ばしょ：${g.name}${replay ? '（見なおし）' : ''}</span><span><button class="btn sm sub" id="mgHint" hidden>💡 ヒント</button> <button class="btn sm sub" id="mgGive" hidden>🏳️ こたえ</button></span></div>
      </div>
      ${mimiRow(`${buddy().name}も いっしょに さがすね… じーっ 👀`)}</div>`);
    clearInterval(timer);
    timer = setInterval(() => {
      const t = $('#mgT'); if (!t) { clearInterval(timer); return; }
      if (done) return;
      const el = Date.now() - t0; t.textContent = fmt(el);
      if (el > 60e3) $('#mgHint').hidden = false;
      if (el > 180e3) $('#mgGive').hidden = false;
    }, 500);
    const mark = (d, cls) => $$('.mg-pic svg .marks').forEach(m => m.insertAdjacentHTML('beforeend', `<circle class="${cls}" cx="${f1(d.gx)}" cy="${f1(d.gy)}" r="${f1(Math.max(d.gr, 9) + 7)}"/>`));
    const upd = () => { $$('#mgF .mg-dot').forEach((e, k) => e.classList.toggle('on', found[k])); };
    function finish(gaveUp) {
      done = true; clearInterval(timer);
      const el = Date.now() - t0;
      let starN = 0, msg;
      if (!replay) {
        const st = state(); st.n++;
        starN = gaveUp ? 1 : hintUsed ? 3 : 5;
        if (!gaveUp && (!st.best || el < st.best)) st.best = el;
        addStar(starN); markActive(); save();
      }
      msg = gaveUp ? 'こたえは ここだったよ！ またチャレンジしよう' : `みつけた！ タイム <b>${fmt(el)}</b>${!replay && state().best === el ? ' 🏆じこベスト！' : ''}`;
      setMimi(gaveUp ? 'normal' : 'happy', msg);
      if (!gaveUp) { sfx('fan'); confetti(); say('You found them! Great job!'); }
      $('.mg-foot').innerHTML = `<span>${starN ? `⭐ +${starN}` : ''}</span><span>${!replay && state().n < maxN() ? '<button class="btn sm" id="mgNext">もう1まい ▶</button> ' : ''}<button class="btn sm sub" id="mgHome">ホームへ</button></span>`;
      if ($('#mgNext')) $('#mgNext').onclick = () => play(state().n, false);
      $('#mgHome').onclick = home;
    }
    $$('.mg-pic svg').forEach(sv => sv.addEventListener('pointerdown', e => {
      if (done) return;
      const pt = sv.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(sv.getScreenCTM().inverse());
      const k = g.diffs.findIndex((d, i) => !found[i] && Math.hypot(p.x - d.gx, p.y - d.gy) <= Math.max(d.gr, 10) + 9);
      if (k >= 0) {
        found[k] = true; mark(g.diffs[k], 'mg-ok'); upd(); sfx('ok');
        if (found.every(Boolean)) finish(false); else setMimi('happy', 'あった！ あと 1つ！');
      } else {
        miss++; tone([220], .08, 'sine', .08);
        sv.querySelector('.marks').insertAdjacentHTML('beforeend', `<text class="mg-x" x="${f1(p.x)}" y="${f1(p.y)}" text-anchor="middle" dominant-baseline="central">×</text>`);
        const xs = sv.querySelectorAll('.mg-x'); const last = xs[xs.length - 1]; setTimeout(() => last && last.remove(), 700);
        if (miss >= 4) $('#mgHint').hidden = false;
        if (miss % 4 === 0) setMimi('normal', 'むずかしいね… こまかい ところを よく見て！');
      }
    }));
    $('#mgHint').onclick = () => {
      const k = found.findIndex(f => !f); if (k < 0) return;
      hintUsed = true; const d = g.diffs[k];
      const ox = (Math.random() - .5) * 50, oy = (Math.random() - .5) * 40; // ちょっとずらして ざっくりの場所だけ
      $$('.mg-pic svg .marks').forEach(m => m.insertAdjacentHTML('beforeend', `<circle class="mg-hint" cx="${f1(Math.min(345, Math.max(55, d.gx + ox)))}" cy="${f1(Math.min(250, Math.max(50, d.gy + oy)))}" r="62"/>`));
      setMimi('normal', '💡 この あたりが あやしいよ…');
      $('#mgHint').hidden = true;
    };
    $('#mgGive').onclick = () => { if (!confirm('こたえを 見る？')) return; g.diffs.forEach((d, i) => { if (!found[i]) mark(d, 'mg-ans'); }); finish(true); };
  }
  return { card, bindCard, open, gen, svg, _L: L };
})();
