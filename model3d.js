'use strict';
/* ===== トップページの3Dキャラ「どんぐりむっつりおにぎり」 =====
   もとの mutsuri_simple.html の形をそのまま使い、アプリの中で何度でも
   出し入れできるようにした（WebGLは1つだけ作って使い回す）。 */
const Mascot3D = (() => {
  let R3 = null, host = null, raf = 0, hopT = 0, resumeT = 0, onTap = null;

  function build() {
    /* ---- 形状パラメータ（r=内接円半径） ---- */
    const r = 1, T = 0.64, E = 0.66, K = 3.6;
    const NORM = [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6];
    const BULGE = 0.10;
    function R(t) { let s = 0, b = 0; for (const a of NORM) { const c = Math.cos(t - a); s += Math.exp(K * c); if (c > 0) b += Math.pow(c, 4); } return r / (Math.log(s) / K) * (1 + BULGE * b); }
    /* ---- 手足 ---- */
    const KL = 2.4, LIMBS = [], GAP = 0.045;
    function sstep(a, b, x) { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); }
    function addLimb(V, halfD) {
      const L = (i, j) => Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1]);
      const a = L(1, 2), b = L(2, 0), c = L(0, 1), P = a + b + c;
      const I = [(a * V[0][0] + b * V[1][0] + c * V[2][0]) / P, (a * V[0][1] + b * V[1][1] + c * V[2][1]) / P];
      const area = Math.abs((V[1][0] - V[0][0]) * (V[2][1] - V[0][1]) - (V[2][0] - V[0][0]) * (V[1][1] - V[0][1])) / 2;
      const al = [[0, 1], [1, 2], [2, 0]].map(([i, j]) => { let nx = V[j][1] - V[i][1], ny = -(V[j][0] - V[i][0]);
        const mx = (V[i][0] + V[j][0]) / 2 - I[0], my = (V[i][1] + V[j][1]) / 2 - I[1]; if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; } return Math.atan2(ny, nx); });
      const O = [(V[0][0] + V[2][0]) / 2, (V[0][1] + V[2][1]) / 2], D = [V[1][0] - O[0], V[1][1] - O[1]];
      LIMBS.push({ I, ri: 2 * area / P, al, halfD, O, D, D2: D[0] * D[0] + D[1] * D[1] });
    }
    function inward(L, x, y) { return ((x - L.O[0]) * L.D[0] + (y - L.O[1]) * L.D[1]) / L.D2; }
    function RLf(L, t) { let s = 0; for (const q of L.al) s += Math.exp(KL * Math.cos(t - q)); return 1.28 * L.ri / (Math.log(s) / KL); }
    function limbOff(L, x, y) { return -0.55 * L.halfD + (0.55 * L.halfD + GAP) * sstep(0.15, 0.7, inward(L, x, y)); }
    function filletH(x, y) { let h = 0;
      for (const L of LIMBS) { const dx = x - L.I[0], dy = y - L.I[1], p = Math.hypot(dx, dy) / RLf(L, Math.atan2(dy, dx));
        h += 0.6 * L.halfD * Math.max(0, 1 - 0.3 * p * p) / (1 + Math.pow(p, 6)) * (1 - sstep(0.2, 0.55, inward(L, x, y))); }
      return h; }
    const ARM = [[0.75, 0.34], [0.49, -0.07], [0.87, -0.19]];
    const LEG = [[0.96, -0.18], [0.30, -1.07], [1.16, -1.07]];
    [1, -1].forEach(sd => { addLimb(ARM.map(([x, y]) => [sd * x, y]), 0.11); addLimb(LEG.map(([x, y]) => [sd * x, y]), 0.16); });
    function surfZ(x, y) { const t = Math.atan2(y, x); const rho = Math.min(Math.hypot(x, y) / R(t), 0.999);
      const s = Math.pow(rho, 1 / E); return T * Math.pow(Math.sqrt(1 - s * s), E); }
    function surfN(x, y) { const h = 1e-3; const dx = (surfZ(x + h, y) - surfZ(x - h, y)) / (2 * h), dy = (surfZ(x, y + h) - surfZ(x, y - h)) / (2 * h);
      return new THREE.Vector3(-dx, -dy, 1).normalize(); }
    function surfP(x, y, off) { const n = surfN(x, y); return new THREE.Vector3(x, y, surfZ(x, y)).addScaledVector(n, off || 0); }

    /* ---- シーン ---- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false; controls.enableZoom = false;
    controls.target.set(0, 0.12, 0); controls.autoRotate = true; controls.autoRotateSpeed = 2.2;
    controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.75;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbdb6a6, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.85); sun.position.set(3, 6, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20 });
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.35); fill.position.set(-5, 2, 3); scene.add(fill);

    /* ---- ごはん粒テクスチャ ---- */
    function riceCanvas(bump) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
      g.fillStyle = bump ? '#808080' : '#e3b62c'; g.fillRect(0, 0, 256, 256); g.scale(0.5, 0.5);
      for (let i = 0; i < 2600; i++) { const x = Math.random() * 512, y = Math.random() * 512, a = Math.random() * Math.PI;
        const v = bump ? 150 + Math.random() * 80 : (Math.random() < .5 ? '#eac143' : '#d9aa22');
        g.fillStyle = bump ? `rgb(${v | 0},${v | 0},${v | 0})` : v;
        g.beginPath(); g.ellipse(x, y, 7 + Math.random() * 3, 3 + Math.random() * 1.5, a, 0, Math.PI * 2); g.fill(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3); return t; }
    const map = riceCanvas(false); map.encoding = THREE.sRGBEncoding;

    /* ---- 本体 ---- */
    const g = new THREE.SphereGeometry(1, 150, 100, -Math.PI / 2);
    const P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const s = Math.hypot(x, y), t = Math.atan2(y, x), rr = Math.pow(s, E) * R(t);
      const X = Math.cos(t) * rr, Y = Math.sin(t) * rr;
      const u = Math.min(1, Math.max(0, (z + 0.5) / 0.7)), w = u * u * (3 - 2 * u);
      P.setXYZ(i, X, Y, Math.sign(z) * Math.pow(Math.abs(z), E) * T + w * filletH(X, Y)); }
    g.computeVertexNormals();
    const riceMat = new THREE.MeshStandardMaterial({ map, bumpMap: riceCanvas(true), bumpScale: 0.012, roughness: 0.85, color: 0xffffff });
    const body = new THREE.Mesh(g, riceMat); body.receiveShadow = true; body.castShadow = true;
    function buildLimb(L) { const gg = new THREE.SphereGeometry(1, 56, 36, -Math.PI / 2), pp = gg.attributes.position;
      for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i);
        const s = Math.hypot(x, y), t = Math.atan2(y, x), rr = Math.pow(s, E) * RLf(L, t);
        let X = L.I[0] + Math.cos(t) * rr, Y = L.I[1] + Math.sin(t) * rr;
        const rb = Math.hypot(X, Y) / R(Math.atan2(Y, X));
        if (rb > 0.8) { const nr = 0.8 + 0.15 * Math.tanh((rb - 0.8) / 0.15); X *= nr / rb; Y *= nr / rb; }
        const sz = surfZ(X, Y), prof = Math.pow(Math.abs(z), E);
        const o = limbOff(L, X, Y);
        pp.setXYZ(i, X, Y, sz + o + Math.sign(z) * prof * L.halfD); }
      gg.computeVertexNormals();
      const m = new THREE.Mesh(gg, riceMat); m.castShadow = true; m.receiveShadow = true; return m; }
    const figure = new THREE.Group(); figure.add(body); scene.add(figure);

    /* ---- 顔 ---- */
    const ink = new THREE.MeshStandardMaterial({ color: 0x1e1e1c, roughness: 0.35 });
    function stroke(pts, rad) { const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => surfP(x, y, rad * 0.55)));
      figure.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, rad, 8, false), ink));
      [curve.getPoint(0), curve.getPoint(1)].forEach(p => { const cap = new THREE.Mesh(new THREE.SphereGeometry(rad, 8, 6), ink); cap.position.copy(p); figure.add(cap); }); }
    function eye(x, y) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), ink);
      m.scale.set(0.068, 0.084, 0.032); m.position.copy(surfP(x, y, 0));
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfN(x, y)); figure.add(m); return m; }
    const EYE_X = 0.29, EYE_Y = 0.57, EYE_H = 0.095;
    const B_IN = [0.12, 0.82], B_ANG = (18.4 + 15) * Math.PI / 180, B_LEN = 0.095;
    const BROW = [0, 0.5, 1].map(f => [B_IN[0] + f * B_LEN * Math.cos(B_ANG), B_IN[1] + f * B_LEN * Math.sin(B_ANG)]);
    stroke(BROW.map(([x, y]) => [-x, y]), 0.024);
    stroke(BROW, 0.024);
    const eyes = [eye(-EYE_X, EYE_Y), eye(EYE_X, EYE_Y)];
    const MY = EYE_Y - EYE_H;
    stroke([[-0.09, MY], [0, MY], [0.09, MY]], 0.036);

    /* ---- どんぐり ---- */
    function gradTex(stops) { const c = document.createElement('canvas'); c.width = 8; c.height = 128; const x = c.getContext('2d');
      const gr = x.createLinearGradient(0, 0, 0, 128); stops.forEach(([o, col]) => gr.addColorStop(o, col)); x.fillStyle = gr; x.fillRect(0, 0, 8, 128);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
    const acorn = new THREE.Group(), acornGroup = new THREE.Group(); figure.add(acornGroup);
    const nutPts = new THREE.SplineCurve([[0, -0.6], [0.08, -0.595], [0.18, -0.56], [0.28, -0.47], [0.36, -0.32], [0.405, -0.14], [0.415, 0.03], [0.395, 0.14], [0.34, 0.2]]
      .map(([x, y]) => new THREE.Vector2(x, y))).getPoints(22);
    const nutMat = new THREE.MeshStandardMaterial({ map: gradTex([[0, '#8f5226'], [0.75, '#c07a3f'], [1, '#d79a5c']]), roughness: 0.55 });
    acorn.add(new THREE.Mesh(new THREE.LatheGeometry(nutPts, 36), nutMat));
    const navel = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), nutMat); navel.position.y = -0.6; acorn.add(navel);
    const dots = (bump) => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
      x.fillStyle = bump ? '#555' : '#7e5b3b'; x.fillRect(0, 0, 256, 256);
      for (let row = 0; row < 6; row++) for (let col = 0; col < 8; col++) { const cx = (col + (row % 2) * 0.5) * 32, cy = row * 43 + 20;
        const gd = x.createRadialGradient(cx, cy - 3, 2, cx, cy, 19); gd.addColorStop(0, bump ? '#ddd' : '#8d6845'); gd.addColorStop(1, bump ? '#555' : '#7e5b3b');
        x.fillStyle = gd; x.beginPath(); x.arc(cx, cy, 18, 0, Math.PI * 2); x.fill(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); if (!bump) t.encoding = THREE.sRGBEncoding; return t; };
    const capMat = new THREE.MeshStandardMaterial({ map: dots(false), bumpMap: dots(true), bumpScale: 0.025, roughness: 0.85 });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.44, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2 + 0.2), capMat);
    cap.scale.y = 0.66; cap.position.y = 0.17; acorn.add(cap);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.425, 0.055, 10, 40), capMat); rim.rotation.x = Math.PI / 2; rim.position.y = 0.125; acorn.add(rim);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x6b4b2c, roughness: 0.8 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 10), stemMat); stem.position.set(0, 0.5, 0); acorn.add(stem);
    const stemTop = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), stemMat); stemTop.position.set(0, 0.56, 0); acorn.add(stemTop);
    acorn.position.set(0, -0.36, 0.80); acorn.rotation.x = -0.1;
    acorn.updateMatrix();
    acorn.children.slice().forEach(m => {
      m.updateMatrix(); const gm = m.geometry; gm.applyMatrix4(m.matrix); const pa = gm.attributes.position;
      const lz = []; for (let i = 0; i < pa.count; i++) lz.push(pa.getZ(i));
      gm.applyMatrix4(acorn.matrix);
      for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), zb = surfZ(x, y) + filletH(x, y) - 0.015;
        const w = sstep(0, 0.12, -lz[i]);
        let z = pa.getZ(i); z = z + (zb - z) * w; pa.setZ(i, Math.max(z, zb)); }
      gm.computeVertexNormals();
      const mm = new THREE.Mesh(gm, m.material); mm.castShadow = true; mm.receiveShadow = true; acornGroup.add(mm); });

    for (const L of LIMBS) figure.add(buildLimb(L));

    /* ---- 床（影だけ） ---- */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.16 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -(1 + BULGE) - 0.005; floor.receiveShadow = true; scene.add(floor);

    // さわっている間は 自動でまわるのを止め、はなして4びょうたったら また まわる
    controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(resumeT); });
    controls.addEventListener('end', () => { clearTimeout(resumeT); resumeT = setTimeout(() => { controls.autoRotate = true; requestRender(); }, 4000); });
    controls.addEventListener('change', requestRender);
    // タップ（ほとんど動かさずに はなした）で ぴょんと はねる
    let down = null;
    renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY, Date.now()]; });
    renderer.domElement.addEventListener('pointerup', e => {
      if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
      if (moved < 8 && Date.now() - down[2] < 400) { hopT = performance.now(); requestRender(); if (onTap) onTap(); }
      down = null;
    });
    return { renderer, scene, camera, controls, figure, eyes };
  }

  function frame(now) {
    raf = 0;
    if (!R3 || !host || !host.isConnected) return;
    const moved = R3.controls.update();
    let busy = R3.controls.autoRotate;
    // ぴょん
    const t = hopT ? (now - hopT) / 650 : 2;
    if (t < 1) { R3.figure.position.y = 0.45 * Math.sin(Math.PI * t); R3.figure.rotation.y = Math.PI * 2 * (1 - Math.cos(Math.PI * t)) / 2; R3.renderer.shadowMap.needsUpdate = true; busy = true; }
    else if (R3.figure.position.y !== 0) { R3.figure.position.y = 0; R3.figure.rotation.y = 0; R3.renderer.shadowMap.needsUpdate = true; }
    // ときどき まばたき
    const bl = (now % 4200) / 4200, sy = bl > .96 ? 0.15 : 1;
    R3.eyes.forEach(e => e.scale.y = 0.084 * sy);
    R3.renderer.render(R3.scene, R3.camera);
    if (moved || busy) requestRender();
  }
  function requestRender() { if (!raf) raf = requestAnimationFrame(frame); }
  function resize() {
    if (!R3 || !host) return;
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    R3.renderer.setSize(w, h, false);
    R3.camera.aspect = w / h; R3.camera.updateProjectionMatrix();
    const tan = Math.tan(THREE.MathUtils.degToRad(R3.camera.fov / 2));
    const d = Math.max(4.7 / (2 * tan), 4.7 / (2 * tan * R3.camera.aspect));
    const dir = R3.camera.position.clone().sub(R3.controls.target); if (dir.lengthSq() < 1e-6) dir.set(Math.sin(.45), .12, Math.cos(.45));
    dir.setLength(d); R3.camera.position.copy(R3.controls.target).add(dir);
    R3.renderer.shadowMap.needsUpdate = true; requestRender();
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestRender(); });

  // el の中に 3Dキャラを出す。できなければ false
  function mount(el, tapFn) {
    onTap = tapFn || null;
    if (!window.THREE || !THREE.OrbitControls) return false;
    try { if (!R3) R3 = build(); } catch (e) { R3 = null; return false; }
    host = el; el.appendChild(R3.renderer.domElement);
    R3.camera.position.set(Math.sin(.35) * 7, .12 + 7 * .14, Math.cos(.35) * 7);
    resize(); R3.renderer.shadowMap.needsUpdate = true; requestRender();
    return true;
  }
  function hop() { if (R3) { hopT = performance.now(); requestRender(); } }
  return { mount, hop };
})();
