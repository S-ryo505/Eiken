'use strict';
/* ===== いっしょに まなぶ なかまたち =====
   どのキャラも 200×232 のマスにかく。
   表情は同じ名前のパーツを切りかえる：
     目  e-n(ふつう) / e-h(にっこり)
     口  m-n(ふつう) / m-h(せいかい) / m-o(おしい) / m-t(しゃべる)
     sweat(あせ)、earL / earR(しゃべるとき ゆれるパーツ)
   slots は きせかえアイテムを つける場所 [x, y, よこの大きさ, たての大きさ]。 */
const INK = '#4b3550';
const BUDDIES = [
{
  id: 'mimi', name: 'ミミィ', who: 'おおきな みみの うさぎ',
  hello: 'みみを すませて いっしょに きこうね！',
  face: { e: [[74, 146], [126, 146]], k: 1, m: [100, 167] },
  lines: { ok: ['きこえた！', 'みみ ピーン！', 'いい おと〜'], ng: ['みみを すまそう', 'もういっかい きこうね'], great: ['みみが よろこんでる', 'うさぎジャンプ！'], tap: ['ふわふわでしょ', 'みみは ひっぱらないで〜', 'ぴょん'], sleepy: ['…すぅ…', '…みみも ねむい…'] },
  slots: {},
  draw() {
    const line = '#f2a7c3';
    return `<g transform="rotate(-10 76 104)"><g class="earL"><ellipse cx="76" cy="56" rx="20" ry="50" fill="#fff" stroke="${line}" stroke-width="4"/><ellipse cx="76" cy="62" rx="9" ry="34" fill="#ffc6da"/></g></g>
<g transform="rotate(10 124 104)"><g class="earR"><ellipse cx="124" cy="56" rx="20" ry="50" fill="#fff" stroke="${line}" stroke-width="4"/><ellipse cx="124" cy="62" rx="9" ry="34" fill="#ffc6da"/></g></g>
<ellipse cx="38" cy="186" rx="15" ry="12" fill="#fff" stroke="${line}" stroke-width="4"/>
<ellipse cx="162" cy="186" rx="15" ry="12" fill="#fff" stroke="${line}" stroke-width="4"/>
<ellipse cx="100" cy="150" rx="72" ry="64" fill="#fff" stroke="${line}" stroke-width="4"/>
<g class="eyes"><g class="pup"><ellipse cx="74" cy="146" rx="5.5" ry="6.5" fill="${INK}"/><ellipse cx="126" cy="146" rx="5.5" ry="6.5" fill="${INK}"/></g></g>
<ellipse cx="56" cy="164" rx="11" ry="6" fill="#ffb0c9" opacity=".55"/><ellipse cx="144" cy="164" rx="11" ry="6" fill="#ffb0c9" opacity=".55"/>
<ellipse cx="100" cy="157" rx="3.6" ry="2.6" fill="#f58fb2"/>
<path class="m-n" d="M94 166 H106" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<path class="m-h" d="M93 165 Q100 169.5 107 165" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<path class="m-o" d="M93 168 Q100 164 107 168" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<ellipse class="m-t" cx="100" cy="167" rx="3.8" ry="4" fill="${INK}"/>
<path class="sweat" d="M160 112 Q152 124 156 130 Q162 134 166 128 Q168 120 160 112Z" fill="#9fd8ff"/>`;
  },
},
{
  id: 'nyame', name: 'ニャメ', who: 'ねこみみの ちびザメ',
  hello: 'ギザギザの はで ニカッ！ げんきに いこう！',
  face: { e: [[72, 108], [128, 108]], k: 1.5, m: [100, 166] },
  mg: `<path d="M56 146 Q100 160 144 146 Q100 212 56 146 Z" fill="#ff8fab" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M60 149 Q100 162 140 149 L136 158 Q100 168 64 158 Z" fill="#fff"/><path d="M74 152 v8 M88 155 v8 M100 156 v8 M112 155 v8 M126 152 v8" stroke="${INK}" stroke-width="2"/>`,
  lines: { ok: ['ニカッ', 'ギザッと せいかい', 'さすが'], ng: ['ギザ…', 'ドンマイ。ニカッ'], great: ['ギザギザ だいかんげき', 'ヒレが とまらない'], tap: ['ニカッ', 'かまないよ', 'ヒレ、さわる？'], sleepy: ['…ニカ…zzz', '…ねてても わらってる…'] },
  slots: { crown: [100, 70, .9], ribbon: [142, 70, 1], flower: [58, 72, 1], glasses: [100, 110, 1.15], scarf: [100, 196, .8], phones: [100, 112, .95, 1.05], wand: [160, 176, 1], cape: [100, 150, 1] },
  draw() {
    const body = '#a8d8f4', belly = '#f4fbff';
    const teeth = [72, 86, 100, 114, 128].map(x => { const t = (x - 58) / 84, k = t * (1 - t); return `<path d="M${x} ${(148 + 24 * k).toFixed(1)} V${(148 + 88 * k).toFixed(1)}" stroke="${INK}" stroke-width="2"/>`; }).join('');
    return `<g style="transform-box:view-box;transform-origin:44px 156px"><g class="earL"><path d="M44 146 Q20 166 14 200 Q32 184 50 182 Z" fill="${body}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g></g>
<g style="transform-box:view-box;transform-origin:156px 156px"><g class="earR"><path d="M156 146 Q180 166 186 200 Q168 184 150 182 Z" fill="${body}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g></g>
<path d="M42 106 L48 30 L98 72 Z" fill="${body}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M54 90 L57 50 L84 72 Z" fill="#ffc6da"/>
<path d="M158 106 L152 30 L102 72 Z" fill="${body}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M146 90 L143 50 L116 72 Z" fill="#ffc6da"/>
<ellipse cx="72" cy="212" rx="18" ry="10" fill="${body}" stroke="${INK}" stroke-width="3.5"/><ellipse cx="128" cy="212" rx="18" ry="10" fill="${body}" stroke="${INK}" stroke-width="3.5"/>
<ellipse cx="100" cy="138" rx="64" ry="72" fill="${body}" stroke="${INK}" stroke-width="3.5"/>
<path d="M58 178 Q100 160 142 178 Q132 206 100 208 Q68 206 58 178 Z" fill="${belly}"/>
<path d="M84 186 h32 M80 195 h40 M88 203 h24" stroke="#b9d6e6" stroke-width="2.5" stroke-linecap="round"/>
<g class="eyes"><circle cx="72" cy="108" r="17" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="128" cy="108" r="17" fill="#fff" stroke="${INK}" stroke-width="3"/>
<g class="pup"><circle cx="72" cy="109" r="3.4" fill="${INK}"/><circle cx="128" cy="109" r="3.4" fill="${INK}"/></g></g>
<ellipse cx="100" cy="128" rx="3.4" ry="3" fill="${INK}"/>
<ellipse cx="54" cy="138" rx="10" ry="5.5" fill="#ffb0c9" opacity=".5"/><ellipse cx="146" cy="138" rx="10" ry="5.5" fill="#ffb0c9" opacity=".5"/>
<path d="M44 134 l4 -6 M50 134 l4 -6 M56 134 l4 -6 M144 134 l4 -6 M150 134 l4 -6 M156 134 l4 -6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
${[0, 1, 2].map(k => `<g class="${['m-n', 'm-h', 'm-o'][k]}"><path d="M58 148 Q100 160 142 148 Q100 196 58 148 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${teeth}</g>`).join('')}
<g class="m-t"><path d="M58 148 Q100 160 142 148 Q100 200 58 148 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M70 160 Q100 168 130 160 Q100 184 70 160 Z" fill="#ff8fab"/>${teeth}</g>
<path class="sweat" d="M166 78 Q158 90 162 96 Q168 100 172 94 Q174 86 166 78Z" fill="#9fd8ff"/>`;
  },
},
{
  id: 'tama', name: 'タマゴン', who: 'ながぐつの たまごくん',
  hello: 'きょうも コツコツ いっしょに やろうね〜',
  face: { e: [[78, 106], [122, 106]], k: 1.25, m: [100, 141] },
  lines: { ok: ['コツコツの せいかだね', 'わ〜', 'ながぐつ ふみふみ'], ng: ['われてないから だいじょうぶ', 'つぎ いこう〜'], great: ['ひよこに なっちゃいそう', 'アツアツの ゆでたまご'], tap: ['われちゃう〜', 'ころころ', 'つるつるでしょ'], sleepy: ['…ぽか…ぽか…', '…あたためられてる…'] },
  slots: { crown: [100, 34, .8], ribbon: [128, 44, .9], flower: [72, 46, .9], glasses: [100, 108, .88], scarf: [100, 178, .95], phones: [100, 112, .9, 1.3], wand: [162, 152, 1], cape: [100, 150, 1] },
  draw() {
    const body = '#fff1d0';
    return `<path d="M84 194 V210 M116 194 V210" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<path d="M70 208 h20 v10 q0 6 -6 6 h-20 q-6 0 -5 -6 q2 -6 11 -10 z" fill="#ff7b7b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M130 208 h-20 v10 q0 6 6 6 h20 q6 0 5 -6 q-2 -6 -11 -10 z" fill="#ff7b7b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<g style="transform-box:view-box;transform-origin:44px 118px"><g class="earL"><path d="M45 114 C20 108 14 140 32 150" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="35" cy="150" r="7" fill="${body}" stroke="${INK}" stroke-width="3"/></g></g>
<g style="transform-box:view-box;transform-origin:156px 118px"><g class="earR"><path d="M155 114 C180 108 186 140 168 150" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="165" cy="150" r="7" fill="${body}" stroke="${INK}" stroke-width="3"/></g></g>
<path d="M100 30 C142 30 160 92 160 140 C160 178 136 198 100 198 C64 198 40 178 40 140 C40 92 58 30 100 30 Z" fill="${body}" stroke="${INK}" stroke-width="3.5"/>
<path d="M70 52 Q80 40 94 38" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>
<g class="eyes"><ellipse cx="78" cy="106" rx="11" ry="13" fill="#fff" stroke="${INK}" stroke-width="3"/><ellipse cx="122" cy="106" rx="11" ry="13" fill="#fff" stroke="${INK}" stroke-width="3"/>
<g class="pup"><circle cx="80" cy="107" r="6" fill="#5b3424"/><circle cx="120" cy="107" r="6" fill="#5b3424"/></g></g>
<ellipse cx="100" cy="124" rx="4.6" ry="3.4" fill="#ffd9b0" stroke="${INK}" stroke-width="2.5"/>
<ellipse cx="62" cy="132" rx="9" ry="5" fill="#ffb0c9" opacity=".5"/><ellipse cx="138" cy="132" rx="9" ry="5" fill="#ffb0c9" opacity=".5"/>
<path class="m-n" d="M89 140 Q100 143 111 140" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<path class="m-h" d="M89 139 Q100 146 111 139" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<path class="m-o" d="M90 143 Q100 139 110 143" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<ellipse class="m-t" cx="100" cy="141" rx="4" ry="4" fill="${INK}"/>
<path class="sweat" d="M146 68 Q138 80 142 86 Q148 90 152 84 Q154 76 146 68Z" fill="#9fd8ff"/>`;
  },
},
{
  id: 'musubi', name: 'むすび', who: 'のりを まいた おにぎり',
  hello: 'ごはんパワーで がんばろう！',
  face: { e: [[85, 114], [115, 114]], k: .85, m: [100, 132] },
  lines: { ok: ['…うまい', 'ごはん パワー', 'のり、ぴしっ'], ng: ['…しょっぱい', 'つぎは ふっくら いこう'], great: ['ごはん おかわり！', 'つやつや'], tap: ['…にぎにぎ', 'ごはんつぶ ついた？', '…むすっ'], sleepy: ['…ふっくら…zzz', '…おべんとうばこの なか…'] },
  slots: { crown: [100, 46, .7], ribbon: [118, 62, .8], flower: [82, 64, .8], glasses: [100, 112, .62], scarf: [100, 146, .95], phones: [100, 118, .95, 1.1], wand: [168, 178, 1], cape: [100, 170, 1] },
  draw() {
    const grain = [[70, 96], [128, 92], [58, 150], [144, 146], [100, 70], [84, 166], [118, 170], [52, 180], [150, 178]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="2.6" fill="#ece6da" transform="rotate(${(k * 37) % 90 - 45} ${x} ${y})"/>`).join('');
    return `<path d="M100 40 C124 40 172 120 176 168 C179 196 160 208 100 208 C40 208 21 196 24 168 C28 120 76 40 100 40 Z" fill="#fffdf6" stroke="${INK}" stroke-width="3.5"/>
${grain}
<path d="M70 156 H130 V206 Q100 210 70 206 Z" fill="#2e3a33" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M76 164 V198" stroke="#4a5a50" stroke-width="4" stroke-linecap="round"/>
<path d="M88 58 Q96 50 106 50" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
<g class="eyes"><g class="pup"><circle cx="85" cy="114" r="4.6" fill="${INK}"/><circle cx="115" cy="114" r="4.6" fill="${INK}"/></g></g>
<ellipse cx="70" cy="128" rx="8" ry="4.6" fill="#ffb0c9" opacity=".5"/><ellipse cx="130" cy="128" rx="8" ry="4.6" fill="#ffb0c9" opacity=".5"/>
<path class="m-n" d="M95 131 H105" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<path class="m-h" d="M94 130 Q100 135 106 130" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<path class="m-o" d="M94 133 Q100 129 106 133" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<ellipse class="m-t" cx="100" cy="132" rx="3.4" ry="3.6" fill="${INK}"/>
<path class="sweat" d="M136 76 Q128 88 132 94 Q138 98 142 92 Q144 84 136 76Z" fill="#9fd8ff"/>`;
  },
},
{
  id: 'mocchi', name: 'もっちー', who: 'まんまるハムスター',
  hello: 'ひまわりのたね もって いざ しゅっぱ〜つ！',
  face: { e: [[79, 110], [121, 110]], k: .9, m: [100, 131] },
  lines: { ok: ['もぐもぐ せいかい', 'たね ゲット', 'もちもち〜'], ng: ['ほっぺに たね しまっとこ', 'まだまだ〜'], great: ['たね だいほうさく！', 'まわしぐるま ぜんかい'], tap: ['もちっ', 'ほっぺ ぷにぷに', 'たねは あげないよ'], sleepy: ['…くるくる…zzz', '…ふかふか…'] },
  slots: { crown: [100, 76, .85], ribbon: [136, 82, .9], flower: [64, 84, .9], glasses: [100, 112, .85], scarf: [100, 190, 1.05], phones: [100, 116, 1.05, 1], wand: [172, 170, 1], cape: [100, 150, 1.1] },
  draw() {
    const fur = '#e9dfd2';
    return `<g style="transform-box:view-box;transform-origin:62px 86px"><g class="earL"><path d="M46 98 Q44 64 52 58 Q60 56 82 78 Z" fill="${fur}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M54 88 Q53 70 57 67 Q62 66 72 78 Z" fill="#ffc6da"/></g></g>
<g style="transform-box:view-box;transform-origin:138px 86px"><g class="earR"><path d="M154 98 Q156 64 148 58 Q140 56 118 78 Z" fill="${fur}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M146 88 Q147 70 143 67 Q138 66 128 78 Z" fill="#ffc6da"/></g></g>
<ellipse cx="70" cy="208" rx="16" ry="9" fill="${fur}" stroke="${INK}" stroke-width="3.5"/><ellipse cx="130" cy="208" rx="16" ry="9" fill="${fur}" stroke="${INK}" stroke-width="3.5"/>
<ellipse cx="100" cy="140" rx="76" ry="70" fill="${fur}" stroke="${INK}" stroke-width="3.5"/>
<path d="M32 172 Q58 122 100 120 Q146 122 170 176 Q150 208 100 209 Q52 208 32 172 Z" fill="#fffaf2"/>
<ellipse cx="100" cy="164" rx="13" ry="20" fill="#5a5450" stroke="${INK}" stroke-width="2.5"/>
<path d="M94 148 Q92 164 96 182 M100 145 V184 M106 148 Q108 164 104 182" stroke="#d8d2c8" stroke-width="2" fill="none" stroke-linecap="round"/>
<ellipse cx="84" cy="160" rx="8" ry="6" fill="${fur}" stroke="${INK}" stroke-width="2.5"/><ellipse cx="116" cy="160" rx="8" ry="6" fill="${fur}" stroke="${INK}" stroke-width="2.5"/>
<g class="eyes"><g class="pup"><circle cx="79" cy="110" r="4.6" fill="${INK}"/><circle cx="121" cy="110" r="4.6" fill="${INK}"/></g></g>
<ellipse cx="100" cy="121" rx="4.6" ry="3.4" fill="#f58fb2" stroke="${INK}" stroke-width="2"/>
<ellipse cx="62" cy="126" rx="10" ry="5.5" fill="#ffb0c9" opacity=".5"/><ellipse cx="138" cy="126" rx="10" ry="5.5" fill="#ffb0c9" opacity=".5"/>
${['m-n', 'm-h'].map(c => `<path class="${c}" d="M100 124 V128 M90 127 Q95 133 100 128 Q105 133 110 127" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
<path class="m-o" d="M100 124 V128 M93 132 H107" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
<g class="m-t"><path d="M100 124 V127" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="100" cy="131" rx="3.4" ry="3.6" fill="${INK}"/></g>
<path class="sweat" d="M162 84 Q154 96 158 102 Q164 106 168 100 Q170 92 162 84Z" fill="#9fd8ff"/>`;
  },
},
];
// きせかえアイテム（ミミィの体にあわせた位置でかいて、キャラごとの slots へうつす）
const ACC_BASE = { crown: [100, 98], ribbon: [130, 96], flower: [70, 98], glasses: [100, 144], scarf: [100, 200], phones: [100, 146], wand: [164, 186], cape: [100, 150] };
const ACC = {
  cape: `<path d="M34 132 Q2 232 100 232 Q198 232 166 132 Z" fill="#7b6cf6"/><path d="M60 160 Q52 214 100 216 Q148 214 140 160Z" fill="#9b8fff" opacity=".6"/>`,
  phones: `<path d="M30 146 Q28 70 100 70 Q172 70 170 146" fill="none" stroke="#7c6cf0" stroke-width="9" stroke-linecap="round"/><rect x="20" y="128" width="22" height="36" rx="10" fill="#9b8cff"/><rect x="158" y="128" width="22" height="36" rx="10" fill="#9b8cff"/>`,
  glasses: `<g fill="rgba(255,255,255,.25)" stroke="#6b4f8a" stroke-width="4"><circle cx="74" cy="144" r="17"/><circle cx="126" cy="144" r="17"/></g><path d="M91 142 Q100 136 109 142" fill="none" stroke="#6b4f8a" stroke-width="4"/>`,
  scarf: `<path d="M42 190 Q100 214 158 190 L160 204 Q100 230 40 204 Z" fill="#ff6b6b"/><rect x="128" y="200" width="16" height="28" rx="5" fill="#ff8585" transform="rotate(-12 136 214)"/><path d="M50 196 Q100 216 150 196" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 6" opacity=".7"/>`,
  crown: `<path d="M78 98 L82 70 L92 84 L100 64 L108 84 L118 70 L122 98 Z" fill="#ffd34d" stroke="#e0a800" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="88" r="4" fill="#ff6f9f"/>`,
  ribbon: `<g transform="translate(130 96)"><path d="M0 0 L-19 -12 L-19 12 Z" fill="#ff5c93"/><path d="M0 0 L19 -12 L19 12 Z" fill="#ff5c93"/><circle r="6" fill="#ff8fb5"/></g>`,
  flower: `<g transform="translate(70 98)">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 9).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 9).toFixed(1)}" r="7" fill="#fff59d" stroke="#ffd54f" stroke-width="2"/>`).join('')}<circle r="6" fill="#ff9f43"/></g>`,
  wand: `<path d="M164 186 L188 138" stroke="#b28dff" stroke-width="6" stroke-linecap="round"/><path d="M190 120 l4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4-9.4-4.9-9.4 4.9 1.8-10.4-7.6-7.4 10.5-1.5z" fill="#ffd34d" stroke="#e0a800" stroke-width="2"/>`,
};
function placeAcc(B, k) {
  const b = ACC_BASE[k], s = B.slots[k];
  if (!s) return ACC[k];
  const sx = s[2] || 1, sy = s[3] || sx;
  return `<g transform="translate(${s[0]} ${s[1]}) scale(${sx} ${sy}) translate(${-b[0]} ${-b[1]})">${ACC[k]}</g>`;
}
// せいかいの ときは 顔は かえずに キラキラで よろこぶ（むひょうじょうキャラ）
const spark = (x, y, r) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`;
const FX = `<g class="fx-h"><path d="${spark(170, 44, 11)}" fill="#ffd43b"/><path d="${spark(188, 72, 6)}" fill="#ffd43b"/><path d="${spark(26, 60, 7)}" fill="#ffd43b"/></g>`;
const heartP = (x, y, s) => `M${x} ${y + s * .9} C${x - s * 1.6} ${y - s * .2} ${x - s * .6} ${y - s * 1.3} ${x} ${y - s * .4} C${x + s * .6} ${y - s * 1.3} ${x + s * 1.6} ${y - s * .2} ${x} ${y + s * .9}Z`;
// 表情パーツ（どのキャラにも 目と口の位置から 自動でつける）
function faceFx(B) {
  const f = B.face; if (!f) return '';
  const k = f.k, [mx, my] = f.m, st = `fill="none" stroke="${INK}" stroke-width="${(3.4 * Math.min(1.3, k)).toFixed(1)}" stroke-linecap="round"`;
  const E = fn => f.e.map(([x, y]) => fn(x, y)).join('');
  return `<g class="e-g">${E((x, y) => `<path d="M${x - 7 * k} ${y + 2 * k} Q${x} ${y - 8 * k} ${x + 7 * k} ${y + 2 * k}" ${st}/>`)}</g>
<g class="e-s">${E((x, y) => `<path d="M${x - 6 * k} ${y + 2} Q${x} ${y + 5} ${x + 6 * k} ${y + 2}" ${st}/>`)}</g>
<g class="e-w">${E((x, y) => `<circle cx="${x}" cy="${y}" r="${6.5 * k}" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${2 * k}" fill="${INK}"/>`)}</g>
<g class="e-x">${E((x, y) => `<path d="M${x - 5 * k} ${y - 4 * k} L${x + 4 * k} ${y} L${x - 5 * k} ${y + 4 * k}" ${st} transform="${x > 100 ? `rotate(180 ${x} ${y})` : ''}"/>`)}</g>
<g class="m-g">${B.mg || `<path d="M${mx - 10} ${my - 3} Q${mx} ${my + 14} ${mx + 10} ${my - 3} Z" fill="#ff8fab" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`}</g>
<g class="m-w"><ellipse cx="${mx}" cy="${my + 1}" rx="5" ry="6" fill="#ff8fab" stroke="${INK}" stroke-width="3"/></g>`;
}
const FX2 = `<g class="fx-g"><path d="${heartP(32, 96, 8)}" fill="#ff6f9f"/><path d="${heartP(174, 100, 7)}" fill="#ff8fb5"/><path d="${heartP(150, 26, 6)}" fill="#ff6f9f"/></g>
<g class="fx-q"><text x="168" y="44" font-size="34" font-weight="800" fill="#8a7bff" font-family="sans-serif">?</text></g>
<g class="fx-z"><text x="150" y="54" font-size="22" font-weight="800" fill="#8a7bff" font-family="sans-serif">Z</text><text x="170" y="34" font-size="15" font-weight="800" fill="#b7adff" font-family="sans-serif">z</text></g>
<g class="fx-n"><text x="166" y="50" font-size="36" font-weight="800" fill="#ff6b6b" font-family="sans-serif">!</text></g>`;
function buddySVG(B, wear) {
  const has = id => wear.includes(id);
  return `<svg viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" aria-label="${B.name}" style="overflow:visible">
${has('cape') ? placeAcc(B, 'cape') : ''}<g class="bodyg">${B.draw()}${faceFx(B)}
${['glasses', 'scarf', 'phones', 'crown', 'ribbon', 'flower', 'wand'].filter(has).map(k => placeAcc(B, k)).join('')}
${FX}${FX2}</g></svg>`;
}
