/* ───────────────────────── procedural textures ───────────────────────── */
function radialTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(255,255,255,0.38)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.06)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function cloudTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
  for (let i = 0; i < 28; i++) { const x = rand(90, 422), y = rand(70, 186), r = rand(40, 115); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function peacockFeatherTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
  g.strokeStyle = '#2d5a27'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(128, 512); g.lineTo(128, 160); g.stroke();
  for (let i = 0; i < 180; i++) {
    const y = 80 + i * 2.1;
    const spread = Math.sin((i / 180) * Math.PI) * 90;
    g.strokeStyle = i % 2 === 0 ? 'rgba(16, 120, 60, 0.75)' : 'rgba(30, 185, 90, 0.65)';
    g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(128, y); g.quadraticCurveTo(128 - spread * 0.6, y - 10, 128 - spread, y + 8); g.stroke();
    g.beginPath(); g.moveTo(128, y); g.quadraticCurveTo(128 + spread * 0.6, y - 10, 128 + spread, y + 8); g.stroke();
  }
  const grG = g.createRadialGradient(128, 175, 20, 128, 175, 75);
  grG.addColorStop(0, 'rgba(195, 140, 35, 0.95)'); grG.addColorStop(0.7, 'rgba(160, 95, 20, 0.9)'); grG.addColorStop(1, 'rgba(16, 110, 50, 0)');
  g.fillStyle = grG; g.beginPath(); g.ellipse(128, 175, 75, 90, 0, 0, Math.PI * 2); g.fill();
  const grT = g.createRadialGradient(128, 175, 12, 128, 175, 48);
  grT.addColorStop(0, 'rgba(20, 210, 230, 0.95)'); grT.addColorStop(0.85, 'rgba(15, 150, 190, 0.9)'); grT.addColorStop(1, 'rgba(160, 95, 20, 0)');
  g.fillStyle = grT; g.beginPath(); g.ellipse(128, 175, 48, 58, 0, 0, Math.PI * 2); g.fill();
  const grP = g.createRadialGradient(128, 180, 0, 128, 180, 28);
  grP.addColorStop(0, 'rgba(12, 18, 70, 1)'); grP.addColorStop(0.75, 'rgba(20, 35, 110, 0.98)'); grP.addColorStop(1, 'rgba(20, 210, 230, 0)');
  g.fillStyle = grP; g.beginPath(); g.ellipse(128, 180, 28, 36, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#060a28'; g.beginPath(); g.ellipse(128, 186, 15, 18, 0, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function serpentScaleTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#222'; g.fillRect(0, 0, 256, 256);
  const size = 16;
  for (let y = -size; y < 256 + size; y += size) {
    for (let x = -size; x < 256 + size; x += size) {
      const ox = (Math.floor(y / size) % 2) * (size * 0.5);
      const cx = x + ox, cy = y;
      const gr = g.createRadialGradient(cx, cy, 1, cx, cy, size * 0.7);
      gr.addColorStop(0, '#eee'); gr.addColorStop(0.5, '#888'); gr.addColorStop(0.9, '#222'); gr.addColorStop(1, '#050505');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(cx, cy - size * 0.55); g.lineTo(cx + size * 0.5, cy); g.lineTo(cx, cy + size * 0.55); g.lineTo(cx - size * 0.5, cy); g.closePath(); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t;
}
function babyFaceTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  const bg = g.createRadialGradient(256, 256, 50, 256, 256, 256);
  bg.addColorStop(0, '#5a8cb8'); bg.addColorStop(0.7, '#43709b'); bg.addColorStop(1, '#335578');
  g.fillStyle = bg; g.fillRect(0, 0, 512, 512);
  const blushL = g.createRadialGradient(180, 310, 10, 180, 310, 65);
  blushL.addColorStop(0, 'rgba(235, 110, 130, 0.45)'); blushL.addColorStop(1, 'rgba(235, 110, 130, 0)');
  g.fillStyle = blushL; g.beginPath(); g.arc(180, 310, 65, 0, Math.PI * 2); g.fill();
  const blushR = g.createRadialGradient(332, 310, 10, 332, 310, 65);
  blushR.addColorStop(0, 'rgba(235, 110, 130, 0.45)'); blushR.addColorStop(1, 'rgba(235, 110, 130, 0)');
  g.fillStyle = blushR; g.beginPath(); g.arc(332, 310, 65, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#080c18'; g.lineWidth = 4.5; g.lineCap = 'round';
  g.beginPath(); g.arc(185, 260, 32, 0.25 * Math.PI, 0.85 * Math.PI, false); g.stroke();
  g.lineWidth = 2.0;
  for (let a = 0.35 * Math.PI; a <= 0.75 * Math.PI; a += 0.1 * Math.PI) {
    const ex = 185 + Math.cos(a) * 32, ey = 260 + Math.sin(a) * 32;
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + Math.cos(a) * 8, ey + Math.sin(a) * 8); g.stroke();
  }
  g.lineWidth = 4.5;
  g.beginPath(); g.arc(327, 260, 32, 0.15 * Math.PI, 0.75 * Math.PI, false); g.stroke();
  g.lineWidth = 2.0;
  for (let a = 0.25 * Math.PI; a <= 0.65 * Math.PI; a += 0.1 * Math.PI) {
    const ex = 327 + Math.cos(a) * 32, ey = 260 + Math.sin(a) * 32;
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + Math.cos(a) * 8, ey + Math.sin(a) * 8); g.stroke();
  }
  g.strokeStyle = '#121c2e'; g.lineWidth = 3.2;
  g.beginPath(); g.arc(185, 255, 42, 1.25 * Math.PI, 1.75 * Math.PI, false); g.stroke();
  g.beginPath(); g.arc(327, 255, 42, 1.25 * Math.PI, 1.75 * Math.PI, false); g.stroke();
  g.fillStyle = '#f8f4ec';
  g.beginPath();
  g.moveTo(246, 175); g.lineTo(249, 215); g.quadraticCurveTo(256, 222, 263, 215); g.lineTo(266, 175);
  g.lineTo(260, 175); g.lineTo(258, 205); g.lineTo(254, 205); g.lineTo(252, 175); g.closePath();
  g.fill();
  g.fillStyle = '#d62839'; g.beginPath(); g.arc(256, 208, 4.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(35, 55, 80, 0.25)'; g.beginPath(); g.arc(256, 298, 9, 0, Math.PI, false); g.fill();
  g.fillStyle = 'rgba(175, 215, 245, 0.35)'; g.beginPath(); g.arc(256, 292, 5, 0, Math.PI * 2); g.fill();
  const lipsG = g.createRadialGradient(256, 345, 2, 256, 345, 24);
  lipsG.addColorStop(0, '#e85d75'); lipsG.addColorStop(0.7, '#c83f58'); lipsG.addColorStop(1, 'rgba(200, 63, 88, 0)');
  g.fillStyle = lipsG;
  g.beginPath(); g.moveTo(234, 344); g.quadraticCurveTo(246, 338, 256, 341); g.quadraticCurveTo(266, 338, 278, 344); g.quadraticCurveTo(256, 347, 234, 344); g.fill();
  g.beginPath(); g.moveTo(238, 344); g.quadraticCurveTo(256, 355, 274, 344); g.quadraticCurveTo(256, 346, 238, 344); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function serpentBellyTex() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#bfa15f'; g.fillRect(0, 0, 128, 256);
  for (let y = 0; y < 256; y += 16) {
    const gr = g.createLinearGradient(0, y, 0, y + 16);
    gr.addColorStop(0, '#dfc588'); gr.addColorStop(0.65, '#b89448'); gr.addColorStop(1, '#4e3b18');
    g.fillStyle = gr; g.fillRect(6, y + 1, 116, 14);
    g.strokeStyle = '#2a1e08'; g.lineWidth = 1.5; g.strokeRect(6, y + 1, 116, 14);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3); return t;
}

/* ───────────────────────── chapter I: the cell in Mathura ───────────────────────── */
function buildCell() {
  const scene = new THREE.Scene();
  const W = 10, H = 6, D = 12, N_LINK = 12;
  const diyaPos = new THREE.Vector3(1.4, 0, 1.5);
  const birthPos = new THREE.Vector3(0, 1.5, -1.6);
  const winDir = new THREE.Vector3(-1, -0.75, -0.25).normalize();

  const stone = new THREE.ShaderMaterial({
    uniforms: { uDiya: { value: new THREE.Vector3(1.4, 0.4, 1.5) }, uDiyaI: { value: 1 }, uBirth: { value: birthPos.clone() }, uBirthI: { value: 0 }, uFlash: { value: 0 }, uWinDir: { value: winDir }, uTime: { value: 0 } },
    vertexShader: STONE_VS, fragmentShader: STONE_FS
  });
  const plane = (w, h, pos, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), stone); m.position.set(...pos); m.rotation.set(...rot); scene.add(m); return m; };
  plane(W, D, [0, 0, 0], [-Math.PI / 2, 0, 0]);
  plane(W, D, [0, H, 0], [Math.PI / 2, 0, 0]);
  plane(D, H, [-W / 2, H / 2, 0], [0, Math.PI / 2, 0]);
  plane(D, H, [W / 2, H / 2, 0], [0, -Math.PI / 2, 0]);
  plane(W, H, [0, H / 2, D / 2], [0, Math.PI, 0]);
  plane(3, H, [-3.5, H / 2, -D / 2], [0, 0, 0]);
  plane(3, H, [3.5, H / 2, -D / 2], [0, 0, 0]);
  plane(4, H - 4.2, [0, 4.2 + (H - 4.2) / 2, -D / 2], [0, 0, 0]);

  scene.add(new THREE.AmbientLight(0x35406a, 0.9)); scene.add(new THREE.HemisphereLight(0x55659f, 0x3a2414, 1.8));
  const diyaLight = new THREE.PointLight(0xffb070, 7, 16, 2); diyaLight.position.set(1.4, 0.5, 1.5); scene.add(diyaLight);
  const birthLight = new THREE.PointLight(0xffe2b0, 0, 30, 2); birthLight.position.copy(birthPos); scene.add(birthLight);
  const flashLight = new THREE.DirectionalLight(0xc9d6ff, 0); flashLight.position.set(6, 9, 4); scene.add(flashLight);

  const diya = new THREE.Mesh(
    new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.24, 0), new THREE.Vector2(0.31, 0.06), new THREE.Vector2(0.28, 0.12), new THREE.Vector2(0.15, 0.13), new THREE.Vector2(0.12, 0.09)], 26),
    new THREE.MeshStandardMaterial({ color: 0x5e2a16, roughness: 1.0, side: THREE.DoubleSide }));
  diya.position.copy(diyaPos); scene.add(diya);
  const oil = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), new THREE.MeshStandardMaterial({ color: 0x5a3a12, roughness: 0.2, metalness: 0.4 })); oil.rotation.x = -Math.PI / 2; oil.position.set(1.4, 0.095, 1.5); scene.add(oil);
  const flameMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uI: { value: 1 } }, vertexShader: VS_UV, fragmentShader: FLAME_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const flame = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.36), flameMat); flame.position.set(1.4, 0.30, 1.5); scene.add(flame);

  const winMat = new THREE.ShaderMaterial({ uniforms: { uFlash: { value: 0 } }, vertexShader: VS_UV, fragmentShader: WIN_FS });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), winMat); win.position.set(4.97, 3.6, 0); win.rotation.y = -Math.PI / 2; scene.add(win);
  const barMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.3, roughness: 0.5 });
  for (const z of [-0.5, 0, 0.5]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.3, 0.07), barMat); b.position.set(4.9, 3.6, z); scene.add(b); }

  const linkMat = new THREE.MeshStandardMaterial({ color: 0x6a6a74, metalness: 0.3, roughness: 0.5 });
  const roots = [new THREE.Vector3(-3.1, H, -2.3), new THREE.Vector3(3.1, H, -2.9)];
  const chains = new THREE.InstancedMesh(new THREE.TorusGeometry(0.11, 0.032, 8, 16), linkMat, N_LINK * 2); scene.add(chains);
  const links = [];
  roots.forEach((root, ci) => {
    for (let i = 0; i < N_LINK; i++) links.push({ ci, i, pos: new THREE.Vector3(root.x, root.y - i * 0.19 - 0.08, root.z), vel: new THREE.Vector3(), rot: new THREE.Euler(0, i % 2 ? Math.PI / 2 : 0, 0), ang: new THREE.Vector3(), free: false, rest: false, mesh: null });
    const sh = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 10, 24), linkMat); sh.position.set(root.x, root.y - N_LINK * 0.19 - 0.22, root.z); scene.add(sh);
    links.push({ ci, i: N_LINK, pos: sh.position, vel: new THREE.Vector3(), rot: sh.rotation, ang: new THREE.Vector3(), free: false, rest: false, mesh: sh });
  });
  const ringHook = (r) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), linkMat); h.position.set(r.x, H - 0.02, r.z); h.rotation.x = Math.PI / 2; scene.add(h); };
  roots.forEach(ringHook);

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x8a6444, roughness: 0.85, metalness: 0.05 });
  const studMat = new THREE.MeshStandardMaterial({ color: 0x45454e, metalness: 0.3, roughness: 0.45 });
  const mkDoor = (hx, sign) => {
    const g = new THREE.Group(); g.position.set(hx, 0, -D / 2 + 0.08);
    const p = new THREE.Mesh(new THREE.BoxGeometry(2, 4.2, 0.14), doorMat); p.position.set(sign * 1, 2.1, 0); g.add(p);
    for (let y = 0.45; y < 4.1; y += 0.9) for (let x = 0.25; x < 2; x += 0.5) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), studMat); s.position.set(sign * x, y, 0.08); g.add(s); }
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.03), studMat); band.position.set(sign * 1, 2.1, 0.09); g.add(band);
    scene.add(g); return g;
  };
  const doorL = mkDoor(-2, 1), doorR = mkDoor(2, -1);
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 0) })); doorGlow.position.set(0, 3, -D / 2 - 0.7); scene.add(doorGlow);

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(5.5, 4.6, 3.2) }));
  sphere.position.copy(birthPos); sphere.scale.setScalar(0.001); scene.add(sphere);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex(), color: 0xffd9a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  glow.position.copy(birthPos); glow.scale.set(6, 6, 1); scene.add(glow);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  function update(dt, S, camera) {
    const t = S.time;
    const flick = 0.86 + 0.14 * Math.sin(t * 23) * Math.sin(t * 7.3) + 0.07 * Math.sin(t * 41 + 1);
    const di = S.diyaI * flick;
    stone.uniforms.uDiyaI.value = di * 1.7; stone.uniforms.uBirthI.value = S.birthI * 0.85; stone.uniforms.uFlash.value = S.flash; stone.uniforms.uTime.value = t;
    flameMat.uniforms.uTime.value = t; flameMat.uniforms.uI.value = S.diyaI * (0.9 + 0.1 * flick);
    flame.rotation.y = Math.atan2(camera.position.x - flame.position.x, camera.position.z - flame.position.z);
    diyaLight.intensity = 7 * di; birthLight.intensity = S.birthI * 60; birthLight.position.copy(sphere.position); stone.uniforms.uBirth.value.copy(sphere.position);
    flashLight.intensity = S.flash * 2.5; winMat.uniforms.uFlash.value = S.flash;
    doorL.rotation.y = S.doorA; doorR.rotation.y = -S.doorA;
    const dg = Math.min(1, S.birthI); doorGlow.material.color.setRGB(1.5 * dg, 1.25 * dg, 0.9 * dg);
    glow.material.opacity = Math.min(1, S.birthI) * 0.45; glow.position.copy(sphere.position); glow.scale.setScalar(2.5 + S.birthI * 2);
    let idx = 0;
    for (const L of links) {
      if (!L.free) { const sway = Math.sin(t * 0.9 + L.ci * 2.1) * 0.05 * (L.i / N_LINK); L.pos.x = roots[L.ci].x + sway; }
      else if (!L.rest) {
        L.vel.y -= 9.8 * dt; L.pos.addScaledVector(L.vel, dt); L.rot.x += L.ang.x * dt; L.rot.z += L.ang.z * dt;
        if (L.pos.y < 0.06) { L.pos.y = 0.06; L.vel.y = -L.vel.y * 0.28; L.vel.x *= 0.55; L.vel.z *= 0.55; L.ang.multiplyScalar(0.4); if (Math.abs(L.vel.y) < 0.6) { L.vel.set(0, 0, 0); L.rest = true; } }
      }
      if (!L.mesh) { m4.compose(L.pos, q.setFromEuler(L.rot), one); chains.setMatrixAt(idx++, m4); }
    }
    chains.instanceMatrix.needsUpdate = true;
  }
  function snap() { for (const L of links) { L.free = true; L.vel.set(rand(-0.9, 0.9), rand(-0.2, 0.8), rand(-0.9, 0.9)); L.ang.set(rand(-7, 7), 0, rand(-7, 7)); } }
  return { scene, update, snap, sphere, diyaPos, flame };
}

/* ───────────────────────── chapter II: the Yamuna ───────────────────────── */
function buildRiver() {
  const scene = new THREE.Scene();
  const moonDir = new THREE.Vector3(-0.42, 0.24, -0.88).normalize();
  const skyGroup = new THREE.Group(); scene.add(skyGroup);

  const skyMat = new THREE.ShaderMaterial({ uniforms: { uZenith: { value: new THREE.Color(0x04051a) }, uHorizon: { value: new THREE.Color(0x111838) }, uGround: { value: new THREE.Color(0x02030a) }, uMoonDir: { value: moonDir }, uFlash: { value: 0 }, uDawn: { value: 0 }, uSunDir: { value: new THREE.Vector3(-0.3, -0.06, -0.95).normalize() }, uSunI: { value: 0 }, uMoonI: { value: 1 } }, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false });
  scene.fog = new THREE.FogExp2(0x0a1029, 0.009);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 48, 32), skyMat); sky.renderOrder = -10; skyGroup.add(sky);

  const n = Q.stars, pos = new Float32Array(n * 3), sz = new Float32Array(n), ph = new Float32Array(n);
  for (let i = 0; i < n; i++) { const th = Math.random() * Math.PI * 2; const y = 0.02 + 0.98 * Math.pow(Math.random(), 0.75); const r = Math.sqrt(1 - y * y); pos[i * 3] = Math.cos(th) * r * 290; pos[i * 3 + 1] = y * 290; pos[i * 3 + 2] = Math.sin(th) * r * 290; sz[i] = 1.1 + Math.pow(Math.random(), 4) * 3.4; ph[i] = Math.random(); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); starGeo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); starGeo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  const starMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Q.dpr }, uOpacity: { value: 1 }, uColor: { value: new THREE.Color(0.9, 0.93, 1.0) } }, vertexShader: STAR_VS, fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const stars = new THREE.Points(starGeo, starMat); stars.frustumCulled = false; skyGroup.add(stars);

  const lit = new THREE.Vector3().crossVectors(moonDir, new THREE.Vector3(0, 1, 0)).normalize(); lit.y += 0.3; lit.normalize();
  const moon = new THREE.Mesh(new THREE.SphereGeometry(7.5, 40, 28), new THREE.ShaderMaterial({ uniforms: { uLit: { value: lit } }, vertexShader: MOON_VS, fragmentShader: MOON_FS })); moon.position.copy(moonDir).multiplyScalar(270); skyGroup.add(moon);
  const haloTex = radialTex();
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0x8ea6ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.28 })); halo.position.copy(moonDir).multiplyScalar(266); halo.scale.set(58, 58, 1); skyGroup.add(halo);

  const rohini = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffb08a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 })); rohini.position.set(0.38, 0.5, -0.78).normalize().multiplyScalar(284); rohini.scale.set(7, 7, 1); skyGroup.add(rohini);
  const cTex = cloudTex(); const clouds = [];
  for (let i = 0; i < Q.clouds; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cTex, transparent: true, depthWrite: false, opacity: rand(0.35, 0.55), color: 0x1d2440 })); s.userData.a = rand(0, Math.PI * 2); s.userData.r = rand(90, 190); s.userData.y = rand(26, 60); s.userData.spd = rand(0.5, 1.3); s.scale.set(rand(90, 180), rand(40, 75), 1); skyGroup.add(s); clouds.push(s); }

  const wg = new THREE.PlaneGeometry(500, 600, Q.waterSeg, Q.waterSeg); wg.rotateX(-Math.PI / 2);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBasket: { value: new THREE.Vector3(0, 1, 0) }, uRise: { value: 0.45 }, uStorm: { value: 1 }, uWind: { value: new THREE.Vector2(0.25, 0) }, uFlash: { value: 0 }, uRain: { value: 1 }, uDawn: { value: 0 }, uMoonDir: { value: moonDir }, uMoonColor: { value: new THREE.Color(0.75, 0.82, 1.0) }, uDeep: { value: new THREE.Color(0x04081a) }, uShallow: { value: new THREE.Color(0x0e2745) }, uFog: { value: new THREE.Color(0x0a1029) }, uGlow: { value: new THREE.Color(1.0, 0.7, 0.32) }, uGlowI: { value: 1 }, uFogDen: { value: 0.009 }, uCam: { value: new THREE.Vector3() } },
    vertexShader: WATER_VS, fragmentShader: WATER_FS
  });
  const water = new THREE.Mesh(wg, waterMat); water.frustumCulled = false; scene.add(water);

  const rn = Q.rain, rp = new Float32Array(rn * 6), rs = new Float32Array(rn * 6), re = new Float32Array(rn * 2);
  for (let i = 0; i < rn; i++) { const sx = Math.random(), sy = Math.random(), szz = Math.random(); for (let k = 0; k < 2; k++) { const j = i * 2 + k; rs[j * 3] = sx; rs[j * 3 + 1] = sy; rs[j * 3 + 2] = szz; re[j] = k; } }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); rg.setAttribute('aSeed', new THREE.BufferAttribute(rs, 3)); rg.setAttribute('aEnd', new THREE.BufferAttribute(re, 1));
  const rainMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(70, 32, 70) }, uWind: { value: new THREE.Vector2(0.25, 0) }, uSpeed: { value: 22 }, uBasket: { value: new THREE.Vector3() }, uPart: { value: 1 }, uLen: { value: 0.9 }, uOpacity: { value: 0.5 }, uColor: { value: new THREE.Color(0.55, 0.66, 0.92) } }, vertexShader: RAIN_VS, fragmentShader: RAIN_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const rain = new THREE.LineSegments(rg, rainMat); rain.frustumCulled = false; scene.add(rain);

  scene.add(new THREE.HemisphereLight(0x2a3d6e, 0x050810, 0.55));
  const hemi = scene.children.find(o => o.isHemisphereLight);
  const moonLight = new THREE.DirectionalLight(0xaabbff, 0.55); moonLight.position.copy(moonDir).multiplyScalar(50); scene.add(moonLight);
  const sunLight = new THREE.DirectionalLight(0xffb070, 0); scene.add(sunLight);
  const flashLight = new THREE.DirectionalLight(0xd0d8ff, 0); flashLight.position.set(20, 60, -10); scene.add(flashLight);

  // --- 1. Woven Wicker / Cane Basket (Traditional Shurpa / Tokri) ---
  const vessel = new THREE.Group(); scene.add(vessel);
  const caneMat = new THREE.MeshStandardMaterial({ color: 0x9e6a38, roughness: 0.82, metalness: 0.04 });
  const caneDarkMat = new THREE.MeshStandardMaterial({ color: 0x6e451e, roughness: 0.88 });
  const basket = new THREE.Mesh(
    new THREE.LatheGeometry([
      new THREE.Vector2(0.001, 0),
      new THREE.Vector2(0.58, 0.02),
      new THREE.Vector2(0.76, 0.28),
      new THREE.Vector2(0.78, 0.44),
      new THREE.Vector2(0.70, 0.45),
      new THREE.Vector2(0.66, 0.32),
      new THREE.Vector2(0.50, 0.08),
      new THREE.Vector2(0.001, 0.08)
    ], 36),
    caneMat
  );
  vessel.add(basket);

  // Braided rim around top
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.046, 12, 48), caneDarkMat);
  rim.rotation.x = Math.PI * 0.5; rim.position.y = 0.44; vessel.add(rim);

  // Middle weave band
  const midBand = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.028, 10, 42), caneDarkMat);
  midBand.rotation.x = Math.PI * 0.5; midBand.position.y = 0.24; vessel.add(midBand);

  // Radial cane ribs (18 vertical stays around basket)
  const ribGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.42, 6);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, caneDarkMat);
    rib.position.set(Math.cos(a) * 0.66, 0.23, Math.sin(a) * 0.66);
    rib.rotation.z = -Math.cos(a) * 0.26;
    rib.rotation.x = Math.sin(a) * 0.26;
    vessel.add(rib);
  }

  // --- 2. Sacred Silk Bedding (Crimson & Saffron Pleats) ---
  const silkRedMat = new THREE.MeshStandardMaterial({ color: 0x8a151b, roughness: 0.68 });
  const silkGoldMat = new THREE.MeshStandardMaterial({ color: 0xe5a32b, roughness: 0.55, metalness: 0.12 });
  const bedBase = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 14), silkRedMat);
  bedBase.scale.set(1, 0.28, 1); bedBase.position.y = 0.18; vessel.add(bedBase);

  // Gold silk throw folds
  const bedGold = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 12), silkGoldMat);
  bedGold.scale.set(0.92, 0.22, 0.92); bedGold.position.set(0.04, 0.22, 0.02); vessel.add(bedGold);

  // --- 3. Sculpted Infant Sri Krishna (Bala Mukunda) ---
  const krishna = new THREE.Group(); krishna.position.set(0, 0.24, 0.04); vessel.add(krishna);
  const faceTexture = babyFaceTex();
  const faceSkinMat = new THREE.MeshStandardMaterial({ map: faceTexture, roughness: 0.38, metalness: 0.06 });
  const plainSkinMat = new THREE.MeshStandardMaterial({ color: 0x4876a2, roughness: 0.42, metalness: 0.06 }); // Megha-shyamala divine dusky blue
  const pitambaraMat = new THREE.MeshStandardMaterial({ color: 0xf5be36, roughness: 0.48, metalness: 0.18 }); // Sacred golden yellow silk
  const pitambaraBorderMat = new THREE.MeshStandardMaterial({ color: 0xd68918, roughness: 0.42, metalness: 0.32 }); // Rich zari border
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x080b12, roughness: 0.85 });
  const goldJewelMat = new THREE.MeshStandardMaterial({ color: 0xffd24d, roughness: 0.3, metalness: 0.82 });
  const rubyMat = new THREE.MeshStandardMaterial({ color: 0xca142e, roughness: 0.25, metalness: 0.4, emissive: 0x330308 });
  const altaMat = new THREE.MeshStandardMaterial({ color: 0xb52438, roughness: 0.5 }); // Sacred red Alta/Kumkum for baby lotus feet

  // Swaddled body core (tapered)
  const swaddle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.54, 20), pitambaraMat);
  swaddle.rotation.z = Math.PI * 0.5; swaddle.rotation.y = 0.15; swaddle.position.set(0, 0.08, 0);
  krishna.add(swaddle);

  // Pleated fabric folds wrapping the infant snugly
  for (let i = -2; i <= 2; i++) {
    const pleat = new THREE.Mesh(new THREE.TorusGeometry(0.17 - Math.abs(i) * 0.012, 0.022, 10, 24), i % 2 === 0 ? pitambaraBorderMat : pitambaraMat);
    pleat.rotation.y = Math.PI * 0.5;
    pleat.position.set(i * 0.09, 0.08, 0);
    krishna.add(pleat);
  }

  // Little sculpted lotus feet (Charan Kamal) peeking tenderly from golden wrap
  const feetGroup = new THREE.Group(); feetGroup.position.set(-0.28, 0.07, 0.05); krishna.add(feetGroup);
  // Left foot
  const footL = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 10), plainSkinMat);
  footL.scale.set(1.45, 0.72, 0.85); footL.position.set(0, 0, 0.04); feetGroup.add(footL);
  // Red Alta sole on left foot
  const altaL = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), altaMat);
  altaL.scale.set(1.35, 0.25, 0.8); altaL.position.set(0, -0.015, 0.04); feetGroup.add(altaL);
  // Right foot
  const footR = new THREE.Mesh(new THREE.SphereGeometry(0.043, 12, 10), plainSkinMat);
  footR.scale.set(1.45, 0.72, 0.85); footR.position.set(0.02, 0.05, -0.06); feetGroup.add(footR);
  // Red Alta sole on right foot
  const altaR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), altaMat);
  altaR.scale.set(1.35, 0.25, 0.8); altaR.position.set(0.02, 0.035, -0.06); feetGroup.add(altaR);
  // Tiny toes
  for (let t = 0; t < 5; t++) {
    const toeL = new THREE.Mesh(new THREE.SphereGeometry(0.013 - t * 0.0015, 8, 6), plainSkinMat);
    toeL.position.set(-0.062, -0.002, 0.015 + t * 0.012); feetGroup.add(toeL);
    const toeR = new THREE.Mesh(new THREE.SphereGeometry(0.012 - t * 0.0015, 8, 6), plainSkinMat);
    toeR.position.set(-0.042, 0.048, -0.085 + t * 0.012); feetGroup.add(toeR);
  }
  // Golden baby anklets (Nupura / Payal) with tiny bells
  const ankletL = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.007, 8, 16), goldJewelMat);
  ankletL.rotation.y = Math.PI * 0.5; ankletL.position.set(0.04, 0.01, 0.04); feetGroup.add(ankletL);
  const ankletR = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.007, 8, 16), goldJewelMat);
  ankletR.rotation.y = Math.PI * 0.5; ankletR.position.set(0.06, 0.05, -0.06); feetGroup.add(ankletR);

  // Infant chest with animated gentle breathing
  const krishnaChest = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 14), pitambaraMat);
  krishnaChest.position.set(0.04, 0.16, 0.01); krishna.add(krishnaChest);

  // Auspicious Kaustubha jewel pendant on Krishna's chest
  const kaustubhaPendant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.022), rubyMat);
  kaustubhaPendant.position.set(0.05, 0.22, 0.12); krishna.add(kaustubhaPendant);
  const kaustubhaNecklace = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.006, 8, 20), goldJewelMat);
  kaustubhaNecklace.rotation.x = Math.PI * 0.45; kaustubhaNecklace.position.set(0.08, 0.21, 0.02); krishna.add(kaustubhaNecklace);

  // Chubby baby arms folded tenderly over the chest
  const armL = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.033, 10, 20, Math.PI * 0.88), plainSkinMat);
  armL.rotation.x = Math.PI * 0.5; armL.position.set(0.06, 0.15, 0.08); krishna.add(armL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), plainSkinMat);
  handL.position.set(0.02, 0.15, 0.04); krishna.add(handL);
  const bangleL = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 16), goldJewelMat);
  bangleL.rotation.y = Math.PI * 0.5; bangleL.position.set(0.05, 0.15, 0.05); krishna.add(bangleL);

  // Infant Head resting gently on silk pillow
  const head = new THREE.Group(); head.position.set(0.24, 0.18, 0); krishna.add(head);

  // Sculpted head with detailed procedural babyFaceTex
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.132, 28, 24), faceSkinMat);
  face.rotation.x = -Math.PI * 0.46; face.rotation.z = Math.PI * 0.05;
  head.add(face);

  // Chubby sculpted baby cheeks
  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), plainSkinMat);
  cheekL.position.set(-0.03, -0.01, 0.07); head.add(cheekL);
  const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), plainSkinMat);
  cheekR.position.set(-0.03, -0.01, -0.07); head.add(cheekR);

  // Cute baby ears with golden earrings (Kundala)
  const earGeo = new THREE.TorusGeometry(0.025, 0.008, 8, 16, Math.PI);
  const earL = new THREE.Mesh(earGeo, plainSkinMat);
  earL.rotation.y = Math.PI * 0.5; earL.rotation.z = 0.2; earL.position.set(-0.06, 0.02, 0.11); head.add(earL);
  const earringL = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), goldJewelMat);
  earringL.position.set(-0.06, -0.01, 0.115); head.add(earringL);
  const earR = new THREE.Mesh(earGeo, plainSkinMat);
  earR.rotation.y = -Math.PI * 0.5; earR.rotation.z = -0.2; earR.position.set(-0.06, 0.02, -0.11); head.add(earR);
  const earringR = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), goldJewelMat);
  earringR.position.set(-0.06, -0.01, -0.115); head.add(earringR);

  // Silky dark baby curls framing the face
  const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.138, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat);
  hairBase.rotation.x = -0.32; hairBase.position.set(-0.015, 0.02, 0); head.add(hairBase);
  // Cluster of cute soft curls
  const curlGeo = new THREE.SphereGeometry(0.038, 10, 8);
  [
    [-0.05, 0.10, 0.05], [-0.05, 0.10, -0.05], [-0.02, 0.12, 0.08], [-0.02, 0.12, -0.08],
    [-0.08, 0.06, 0.09], [-0.08, 0.06, -0.09], [-0.10, 0.04, 0]
  ].forEach(p => {
    const curl = new THREE.Mesh(curlGeo, hairMat);
    curl.position.set(...p); head.add(curl);
  });
  // Topknot baby bun
  const topKnot = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 10), hairMat);
  topKnot.position.set(-0.01, 0.14, 0); head.add(topKnot);
  const knotBand = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.006, 8, 16), goldJewelMat);
  knotBand.rotation.x = Math.PI * 0.5; knotBand.position.set(-0.01, 0.12, 0); head.add(knotBand);

  // Golden Mukuta (Circlet coronet with rubies)
  const coronet = new THREE.Mesh(new THREE.TorusGeometry(0.128, 0.013, 8, 28), goldJewelMat);
  coronet.rotation.x = Math.PI * 0.45; coronet.position.set(0.01, 0.03, 0); head.add(coronet);
  // Mukuta crest crown points
  for (let cp = -1; cp <= 1; cp++) {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.045, 6), goldJewelMat);
    crest.position.set(0.03 + Math.abs(cp) * 0.01, 0.11, cp * 0.04);
    crest.rotation.z = -0.3; head.add(crest);
    const rubyCrest = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), rubyMat);
    rubyCrest.position.set(0.035, 0.13, cp * 0.04); head.add(rubyCrest);
  }

  // --- Authentic Iridescent Peacock Feather (Mayur Pankh) ---
  const feather = new THREE.Group(); feather.position.set(0.03, 0.14, 0.02); feather.rotation.z = -0.32; feather.rotation.y = 0.22; head.add(feather);
  const featherStem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.007, 0.28, 8), goldJewelMat);
  featherStem.position.y = 0.12; feather.add(featherStem);
  // High-fidelity textured Mayur Pankh vane
  const featherMat = new THREE.MeshStandardMaterial({
    map: peacockFeatherTex(),
    transparent: true,
    alphaTest: 0.06,
    side: THREE.DoubleSide,
    roughness: 0.24,
    metalness: 0.25
  });
  const featherMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.36), featherMat);
  featherMesh.position.set(0, 0.18, 0.005);
  featherMesh.rotation.y = 0.1;
  feather.add(featherMesh);

  // Divine Tejas Halo Sprite & Soft Radiant Light
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffc46a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.88 }));
  glowSprite.position.set(0.24, 0.22, 0); glowSprite.scale.set(4.2, 4.2, 1); krishna.add(glowSprite);
  const blueAura = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0x4aa5ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.42 }));
  blueAura.position.set(0.24, 0.22, 0); blueAura.scale.set(6.0, 6.0, 1); krishna.add(blueAura);
  const basketLight = new THREE.PointLight(0xffb862, 34, 15, 2); basketLight.position.set(0.15, 0.35, 0); vessel.add(basketLight);

  // --- 4. Adisesha (The 5-Headed King of Serpents Shielding Krishna) ---
  const scaleTexture = serpentScaleTex();
  const bellyTexture = serpentBellyTex();
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.25, 0);
  hoodShape.bezierCurveTo(-0.98, 0.55, -1.25, 1.25, -0.95, 1.95);
  hoodShape.bezierCurveTo(-0.62, 2.48, 0.62, 2.48, 0.95, 1.95);
  hoodShape.bezierCurveTo(1.25, 1.25, 0.98, 0.55, 0.25, 0);
  hoodShape.closePath();
  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 22 });
  const hoodMat = new THREE.MeshStandardMaterial({
    color: 0x031c12,
    bumpMap: scaleTexture,
    bumpScale: 0.04,
    roughness: 0.32,
    metalness: 0.38,
    emissive: 0x010d08
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    map: bellyTexture,
    color: 0xdfb462,
    roughness: 0.5,
    metalness: 0.2
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.4, 0.7) });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const gemMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.5, 1.2, 0.4) }); // Radiant Nagaratna red-gold jewel
  const godRayMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(2.2, 1.5, 0.6),
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const hoods = new THREE.Group();
  [-1.38, -0.7, 0, 0.7, 1.38].forEach((a, idx) => {
    const h = new THREE.Group();
    const hm = new THREE.Mesh(hoodGeo, hoodMat); h.add(hm);

    // Golden segmented underside belly plate
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.23, 1.45, 10), bellyMat);
    belly.scale.set(0.9, 1, 0.22); belly.position.set(0, 1.05, 0.05); h.add(belly);

    // Piercing serpent eyes with vertical slit pupils
    for (const ex of [-0.22, 0.22]) {
      const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 8), eyeMat);
      eyeOrb.position.set(ex, 1.68, 0.14); h.add(eyeOrb);
      const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 6), pupilMat);
      pupil.position.set(ex, 1.68, 0.165); pupil.rotation.z = 0.05; h.add(pupil);
    }

    // Sacred Nagaratna Jewel on top of each hood (Multifaceted glowing gem)
    const gem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.075), gemMat);
    gem.position.set(0, 2.38, 0.06); h.add(gem);

    // Downward radiant God-Ray Light Cone from each Nagaratna jewel shielding Krishna
    const rayCone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 2.2, 12, 1, true), godRayMat);
    rayCone.position.set(0, 1.15, 0.22); rayCone.rotation.x = Math.PI; h.add(rayCone);

    const sc = a === 0 ? 1.02 : (Math.abs(a) < 0.8 ? 0.92 : 0.80);
    h.scale.set(0.86 * sc, 0.94 * sc, sc);
    h.rotation.y = a;
    h.position.set(Math.sin(a) * 1.02, -Math.abs(a) * 0.22, (1 - Math.cos(a)) * 0.6);
    hoods.add(h);
  });
  // Canopy arching overhead like a divine umbrella protecting Bala Krishna
  hoods.position.set(0, 0.45, -0.75); hoods.rotation.x = 0.28; vessel.add(hoods);

  // Central Nagaratna Crown Light casting divine golden illumination
  const nagaLight = new THREE.PointLight(0xffaa44, 28, 12, 2);
  nagaLight.position.set(0, 2.8, -0.4); hoods.add(nagaLight);

  // Massive coiled serpent body supporting the basket
  const bodyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.6, -0.78),
    new THREE.Vector3(0.3, 0.0, -1.5),
    new THREE.Vector3(1.1, -0.85, -2.8),
    new THREE.Vector3(2.3, -1.6, -4.5)
  ]);
  const body = new THREE.Mesh(new THREE.TubeGeometry(bodyCurve, 32, 0.22, 12, false), hoodMat); vessel.add(body);
  // Coiling underneath support ring
  const underCoil = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.16, 10, 28), hoodMat);
  underCoil.rotation.x = Math.PI * 0.5; underCoil.position.y = -0.05; vessel.add(underCoil);

  // --- 5. Sacred Yamuna Water Parting & Golden Foam Ripple ---
  const rippleGeo = new THREE.RingGeometry(0.72, 1.25, 40);
  const rippleMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.3, 0.6), transparent: true, opacity: 0.45, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ripple = new THREE.Mesh(rippleGeo, rippleMat);
  ripple.rotation.x = Math.PI * 0.5; ripple.position.y = 0.02; vessel.add(ripple);

  // Flanking river cliffs & distant watchtowers (River is completely open and infinite along Z!)
  const bankMat = new THREE.MeshBasicMaterial({ color: 0x030705 });
  const bankL = new THREE.Mesh(new THREE.BoxGeometry(80, 16, 1100), bankMat); bankL.position.set(-145, 0, 250); scene.add(bankL);
  const bankR = new THREE.Mesh(new THREE.BoxGeometry(80, 16, 1100), bankMat); bankR.position.set(145, 0, 250); scene.add(bankR);
  for (let i = 0; i < 24; i++) {
    const tw = new THREE.Mesh(new THREE.BoxGeometry(rand(6, 12), rand(12, 26), 8), bankMat);
    const side = (i % 2 === 0 ? -1 : 1);
    tw.position.set(side * rand(108, 138), 6, rand(-80, 720));
    scene.add(tw);
  }

  const vn = 90, vp = new Float32Array(vn * 3), vs = new Float32Array(vn), vph = new Float32Array(vn);
  for (let i = 0; i < vn; i++) { const z = rand(-125, -104); vp[i * 3] = (Math.random() < 0.5 ? -1 : 1) * rand(7, 90); vp[i * 3 + 1] = 1.9 + rand(0.8, 3.2); vp[i * 3 + 2] = z; vs[i] = rand(3, 7); vph[i] = Math.random(); }
  const vGeo = new THREE.BufferGeometry(); vGeo.setAttribute('position', new THREE.BufferAttribute(vp, 3)); vGeo.setAttribute('aSize', new THREE.BufferAttribute(vs, 1)); vGeo.setAttribute('aPhase', new THREE.BufferAttribute(vph, 1));
  const villageMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Q.dpr }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(1.6, 1.1, 0.45) } }, vertexShader: STAR_VS, fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const village = new THREE.Points(vGeo, villageMat); village.frustumCulled = false; scene.add(village);
  const villageGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xe5a24a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); villageGlow.position.set(0, 6, -150); villageGlow.scale.set(260, 60, 1); scene.add(villageGlow);

  // Extended Infinite Yamuna Spline Rail (Seamless traversal backwards into positive Z)
  const rail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.7, 750),
    new THREE.Vector3(2.5, 2.7, 600),
    new THREE.Vector3(-2.0, 2.65, 460),
    new THREE.Vector3(2.0, 2.65, 320),
    new THREE.Vector3(-1.5, 2.7, 200),
    new THREE.Vector3(0, 2.7, 120),
    new THREE.Vector3(0, 2.7, 78),
    new THREE.Vector3(0, 3.0, 62),
    new THREE.Vector3(3, 2.6, 44),
    new THREE.Vector3(-2.5, 2.4, 24),
    new THREE.Vector3(1.5, 2.5, 4),
    new THREE.Vector3(-1, 2.7, -18),
    new THREE.Vector3(0, 3.0, -40),
    new THREE.Vector3(0, 3.2, -62),
    new THREE.Vector3(0, 2.7, -94),
    new THREE.Vector3(0, 2.9, -104),
    new THREE.Vector3(1.2, 3.4, -116),
    new THREE.Vector3(-1.5, 3.45, -132),
    new THREE.Vector3(1.2, 3.45, -148),
    new THREE.Vector3(0, 3.4, -160),
    new THREE.Vector3(0, 3.4, -168),
    new THREE.Vector3(0, 3.4, -176),
    new THREE.Vector3(0, 3.4, -184),
    new THREE.Vector3(0, 3.45, -196),
    new THREE.Vector3(0, 3.5, -208),
    new THREE.Vector3(0, 3.55, -222),
    new THREE.Vector3(0, 3.6, -236),
    new THREE.Vector3(0.8, 3.65, -252),
    new THREE.Vector3(-0.8, 3.7, -272),
    new THREE.Vector3(0, 3.75, -292),
    new THREE.Vector3(0, 3.8, -316)
  ], false, 'catmullrom', 0.5);
  const gk = buildGokulam(scene, haloTex);

  const fwd = new THREE.Vector3(), basketPos = new THREE.Vector3(0, 1, 0), moonW = new THREE.Vector3();
  const cloudCol = new THREE.Color(), cBase = new THREE.Color(0x1d2440), cFlash = new THREE.Color(0x8b9ad0), cDawn = new THREE.Color(0xe8a070);
  const PAL = { night: [0x04051a, 0x111838, 0x02030a, 0x0a1029], violet: [0x0b1240, 0x4a2f5e, 0x120d18, 0x2a1f3a], dawn: [0x2a4a90, 0xe09a55, 0x2a2418, 0x9a8a80] };
  const cz = new THREE.Color(), ch = new THREE.Color(), cg = new THREE.Color(), cf = new THREE.Color(), tmpC = new THREE.Color();
  const lerp3 = (out, a, b, c, k) => { if (k < 0.5) out.setHex(a).lerp(tmpC.setHex(b), k * 2); else out.setHex(b).lerp(tmpC.setHex(c), (k - 0.5) * 2); return out; };
  const sunDirBase = new THREE.Vector3(-0.3, 0, -0.95).normalize();
  let basketRotY = 0;
  function setBasket(p, rotY = 0) { basketPos.copy(p); vessel.position.copy(p); basketRotY = rotY; }
  function setBasketRotation(rotY) { basketRotY = rotY; }
  function moonWorld() { return moonW.copy(moonDir).multiplyScalar(270).add(skyGroup.position); }
  function update(dt, S, camera) {
    const t = S.time;
    skyGroup.position.copy(camera.position);
    water.position.z = Math.floor(camera.position.z / 20) * 20;
    const dawn = S.dawnK;
    lerp3(cz, PAL.night[0], PAL.violet[0], PAL.dawn[0], dawn); lerp3(ch, PAL.night[1], PAL.violet[1], PAL.dawn[1], dawn); lerp3(cg, PAL.night[2], PAL.violet[2], PAL.dawn[2], dawn); lerp3(cf, PAL.night[3], PAL.violet[3], PAL.dawn[3], dawn);
    S.sunDir.copy(sunDirBase); S.sunDir.y = -0.08 + 0.34 * smooth((dawn - 0.35) / 0.65); S.sunDir.normalize();
    S.sunI = smooth((dawn - 0.4) / 0.6); S.fogCol.copy(cf); S.fogDen = 0.0055 + 0.0065 * S.storm; S.ambCol.setRGB(0.11, 0.14, 0.24).lerp(tmpC.setRGB(0.3, 0.28, 0.3), dawn);
    scene.fog.color.copy(cf); scene.fog.density = S.fogDen;
    const sk = skyMat.uniforms; sk.uZenith.value.copy(cz); sk.uHorizon.value.copy(ch); sk.uGround.value.copy(cg); sk.uFlash.value = S.flash; sk.uDawn.value = S.dawn; sk.uSunDir.value.copy(S.sunDir); sk.uSunI.value = S.sunI; sk.uMoonI.value = 1 - smooth((dawn - 0.4) / 0.5);
    starMat.uniforms.uTime.value = t; starMat.uniforms.uOpacity.value = (1 - smooth((dawn - 0.25) / 0.45)) * (1 - S.flash * 0.6);
    halo.material.opacity = 0.28 * (1 - smooth((dawn - 0.35) / 0.4)); moon.visible = dawn < 0.85;
    rohini.material.opacity = (0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.7), 3)) * (1 - smooth((dawn - 0.2) / 0.4)) * (1 - S.flash); rohini.scale.setScalar(6 + 2.5 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.7), 3));
    sunLight.position.copy(S.sunDir).multiplyScalar(80); sunLight.intensity = 2.4 * S.sunI; sunLight.color.setRGB(1, 0.72, 0.45).lerp(tmpC.setRGB(1, 0.9, 0.75), smooth((dawn - 0.8) / 0.2));
    hemi.intensity = 0.55 + 1.1 * dawn; hemi.color.setHex(0x2a3d6e).lerp(tmpC.setHex(0x8fa0d8), dawn); hemi.groundColor.setHex(0x050810).lerp(tmpC.setHex(0x3a2a14), dawn);
    moonLight.intensity = 0.55 * (1 - dawn);
    for (const c of clouds) { const u = c.userData; u.a += dt * u.spd * 0.012 * (0.4 + Math.abs(S.wind.x)); c.position.set(Math.cos(u.a) * u.r, u.y, Math.sin(u.a) * u.r); cloudCol.copy(cBase).lerp(cDawn, dawn * 0.85).lerp(cFlash, Math.min(1, S.flash)); c.material.color.copy(cloudCol); c.material.opacity = (0.45 - 0.25 * dawn); }
    const w = waterMat.uniforms; w.uTime.value = t; w.uCam.value.copy(camera.position); w.uBasket.value.copy(basketPos); w.uStorm.value = S.storm; w.uFlash.value = S.flash; w.uRain.value = S.storm; w.uDawn.value = S.dawn; w.uWind.value.copy(S.wind); w.uGlowI.value = (1 + 0.25 * Math.sin(t * 2.3) + S.glowBoost) * S.basketK; w.uRise.value = 0.45 * S.basketK;
    w.uFog.value.copy(cf); w.uFogDen.value = S.fogDen; w.uMoonDir.value.copy(moonDir).lerp(S.sunDir, smooth((dawn - 0.4) / 0.4)).normalize(); w.uMoonColor.value.setRGB(0.75, 0.82, 1.0).lerp(tmpC.setRGB(1.0, 0.72, 0.42), smooth((dawn - 0.4) / 0.4));
    camera.getWorldDirection(fwd);
    const r = rainMat.uniforms; r.uTime.value = t; r.uCenter.value.copy(camera.position).addScaledVector(fwd, 10); r.uWind.value.copy(S.wind); r.uBasket.value.copy(basketPos); r.uOpacity.value = 0.55 * S.storm + 0.02; r.uSpeed.value = 18 + 8 * S.storm;
    vessel.rotation.y = basketRotY;
    vessel.rotation.z = Math.sin(t * 1.1) * 0.04; vessel.rotation.x = Math.sin(t * 0.8 + 1) * 0.035;
    hoods.rotation.z = Math.sin(t * 0.7) * 0.03; hoods.scale.y = 1 + 0.015 * Math.sin(t * 1.4);
    krishnaChest.scale.y = 1 + 0.05 * Math.sin(t * 2.2);
    nagaLight.intensity = 28 * (1 + 0.2 * Math.sin(t * 3.2));
    ripple.scale.setScalar(1 + 0.08 * Math.sin(t * 3.0));
    rippleMat.opacity = (0.35 + 0.15 * Math.sin(t * 3.0)) * S.basketK;
    basketLight.intensity = 34 * (1 + 0.18 * Math.sin(t * 2.3) + S.glowBoost) * S.basketK;
    glowSprite.material.opacity = (0.8 + 0.15 * Math.sin(t * 2.3) + S.glowBoost * 0.3) * S.basketK;
    vessel.visible = S.basketK > 0.01; vessel.scale.setScalar(Math.max(0.001, S.basketK));
    flashLight.intensity = S.flash * 2.2;
    const vis = smooth((-camera.position.z - 20) / 45) * (1 - smooth((dawn - 0.45) / 0.35));
    villageMat.uniforms.uTime.value = t; villageMat.uniforms.uOpacity.value = vis; villageGlow.material.opacity = 0.2 * vis;
    gk.update(dt, S, camera);
  }
  return { scene, update, setBasket, setBasketRotation, moonWorld, rail, waterMat, rainMat, skyMat, halo, hoods, hoodMat, gk, moon, rohini, skyGroup, krishna, basket };
}
