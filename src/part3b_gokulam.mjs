/* ───────────────────────── Phase 2: Gokulam (chapters three, four, five) ───────────────────────── */
const LAND_VS = `
varying vec3 vPos; varying vec3 vN;
void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vPos = wp.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*wp; }`;
const LAND_FS = `
uniform vec3 uSunDir; uniform vec3 uSunCol; uniform float uSunI; uniform vec3 uAmb; uniform vec3 uFogCol; uniform float uFogDen; uniform vec3 uCam; uniform float uFlash; uniform vec3 uMoonDir; uniform float uMoonI;
varying vec3 vPos; varying vec3 vN;
${NOISE}
void main(){
  vec3 N = normalize(vN);
  float n1 = fbm(vPos.xz*0.35); float n2 = noise2(vPos.xz*2.6); float n3 = noise2(vPos.xz*9.0);
  vec3 grass = mix(vec3(0.045,0.11,0.035), vec3(0.15,0.25,0.06), n1) * (0.75 + 0.35*n2) * (0.85 + 0.3*n3);
  vec3 sand = vec3(0.30,0.24,0.15) * (0.85 + 0.3*n2);
  float path = smoothstep(4.2, 1.6, abs(vPos.x + sin(vPos.z*0.045)*1.2));
  float shore = smoothstep(-110.0, -99.0, vPos.z);
  vec3 alb = mix(grass, sand, max(path*0.75, shore));
  float dif = max(dot(N, uSunDir), 0.0);
  vec3 col = alb * (uAmb + uSunCol*uSunI*dif + vec3(0.35,0.42,0.62)*uMoonI*max(dot(N,uMoonDir),0.0)) + alb*uFlash*vec3(0.5,0.55,0.8);
  float dd = distance(uCam, vPos)*uFogDen;
  col = mix(col, uFogCol, 1.0 - exp(-dd*dd));
  gl_FragColor = vec4(col,1.0);
}`;
const FIRE_VS = `
attribute float aPhase; attribute float aSize; uniform float uTime; uniform float uPixelRatio; varying float vA;
void main(){ vec3 p = position; p.x += sin(uTime*0.55 + aPhase*20.0)*1.3; p.y += sin(uTime*0.9 + aPhase*33.0)*0.45; p.z += cos(uTime*0.5 + aPhase*17.0)*1.3;
  float tw = pow(0.5 + 0.5*sin(uTime*(1.2+aPhase*3.0) + aPhase*50.0), 6.0); vA = tw;
  vec4 mv = modelViewMatrix*vec4(p,1.0); gl_PointSize = aSize*uPixelRatio*(0.4+tw)*(70.0/max(1.0,-mv.z)); gl_Position = projectionMatrix*mv; }`;

function featherTex() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g = c.getContext('2d');
  const cx = 64; g.lineCap = 'round';
  for (let y = 250; y > 30; y -= 2.6) {
    const k = (250 - y) / 220; const len = 8 + 46 * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.05)), 0.6);
    const hue = 150 + 25 * k; g.strokeStyle = `hsla(${hue},62%,${28 + 14 * k}%,0.9)`; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(cx, y); g.lineTo(cx - len, y - 14); g.moveTo(cx, y); g.lineTo(cx + len, y - 14); g.stroke();
  }
  const eye = (rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx, 66, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  eye(34, 44, '#b98a2c'); eye(26, 34, '#22a08a'); eye(15, 21, '#15267a'); eye(6, 8, '#0a1440');
  g.strokeStyle = '#e6cf8a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(cx, 256); g.lineTo(cx, 96); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function potTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#b8623a'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${60 + Math.random() * 60 | 0},${20 + Math.random() * 30 | 0},${10 + Math.random() * 20 | 0},${0.12})`; g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
  g.fillStyle = '#f2e6c8'; g.fillRect(0, 96, 256, 14); g.fillRect(0, 150, 256, 8);
  g.fillStyle = '#e9b53f'; g.fillRect(0, 116, 256, 22);
  g.fillStyle = '#f2e6c8'; for (let x = 8; x < 256; x += 24) { g.beginPath(); g.arc(x, 127, 5, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#f2e6c8'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= 256; x += 16) g.lineTo(x, 178 + (x / 16 % 2 ? 10 : 0)); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function buildGokulam(scene, haloTex) {
  const groundY = z => 0.15 + 1.6 * smooth((-z - 96) / 16);
  const land = (() => {
    const g = new THREE.PlaneGeometry(760, 500, 152, 100); g.rotateX(-Math.PI / 2); g.translate(0, 0, -345);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const hills = (0.6 * Math.sin(x * 0.05) * Math.cos(z * 0.07) + 0.35 * Math.sin(x * 0.11 + 1.3) * Math.sin(z * 0.09) + 0.2 * Math.sin(x * 0.23) * Math.cos(z * 0.19)) * smooth((Math.abs(x) - 5) / 12) * smooth((-z - 100) / 10);
      p.setY(i, groundY(z) + hills + 0.9 * smooth((-z - 240) / 120) * (1 + 0.5 * Math.sin(x * 0.03)));
    }
    g.computeVertexNormals();
    const mat = new THREE.ShaderMaterial({ uniforms: { uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color(1.0, 0.72, 0.45) }, uSunI: { value: 0 }, uAmb: { value: new THREE.Color(0.06, 0.08, 0.14) }, uFogCol: { value: new THREE.Color(0x0a1029) }, uFogDen: { value: 0.009 }, uCam: { value: new THREE.Vector3() }, uFlash: { value: 0 }, uMoonDir: { value: new THREE.Vector3(-0.42, 0.24, -0.88).normalize() }, uMoonI: { value: 1 } }, vertexShader: LAND_VS, fragmentShader: LAND_FS });
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; scene.add(m); return m;
  })();

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d7a3a, roughness: 0.9 });
  const canopyGeo = new THREE.IcosahedronGeometry(1, 3);
  { const p = canopyGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 0.9 + 0.1 * Math.sin(x * 5.1 + y * 3.7) * Math.cos(z * 4.3 + x * 2.2) + 0.06 * Math.sin(y * 9.0 + z * 7.0); p.setXYZ(i, x * k, y * k * 0.88, z * k); } canopyGeo.computeVertexNormals(); }
  const NT = 64, trees = [];
  for (let i = 0; i < NT; i++) {
    const side = i % 2 ? 1 : -1; const z = -108 - (i / NT) * 138 + rand(-3, 3);
    const nearClearing = z < -158 && z > -178, nearLane = z < -191;
    const x = side * (nearClearing ? rand(11, 30) : nearLane ? rand(9, 26) : rand(6.5, 28)) + rand(-2, 2);
    trees.push({ x, z, s: rand(0.8, 1.35), r: Math.random() * Math.PI * 2 });
  }
  for (let i = 0; i < 26; i++) trees.push({ x: rand(-120, 120), z: rand(-225, -300), s: rand(1.2, 2.2), r: Math.random() * 6 });
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.32, 3.6, 7), trunkMat, trees.length);
  const canopies = new THREE.InstancedMesh(canopyGeo, leafMat, trees.length * 3);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), sc = new THREE.Vector3();
  const flowerPos = [];
  trees.forEach((t, i) => {
    const gy = groundY(t.z);
    m4.compose(v3.set(t.x, gy + 1.8 * t.s, t.z), q.setFromEuler(new THREE.Euler(0, t.r, 0)), sc.set(t.s, t.s, t.s)); trunks.setMatrixAt(i, m4);
    for (let k = 0; k < 3; k++) {
      const cx = t.x + (k ? rand(-1.3, 1.3) * t.s : 0), cz = t.z + (k ? rand(-1.3, 1.3) * t.s : 0), cy = gy + (3.9 + (k ? rand(-0.7, 0.6) : 0.3)) * t.s, cr = (k ? rand(1.6, 2.2) : 2.5) * t.s;
      m4.compose(v3.set(cx, cy, cz), q.setFromEuler(new THREE.Euler(rand(0, 6), rand(0, 6), 0)), sc.set(cr, cr, cr)); canopies.setMatrixAt(i * 3 + k, m4);
      canopies.setColorAt(i * 3 + k, new THREE.Color().setHSL(0.29 + rand(-0.04, 0.04), 0.5, 0.42 + rand(0, 0.14)));
      if (t.z > -230) for (let f = 0; f < 5; f++) { const a = rand(0, Math.PI * 2), b = rand(-0.4, 0.9); const rr = cr * 0.98; flowerPos.push(cx + Math.cos(a) * Math.cos(b) * rr, cy + Math.sin(b) * rr, cz + Math.sin(a) * Math.cos(b) * rr); }
    }
  });
  trunks.instanceMatrix.needsUpdate = true; canopies.instanceMatrix.needsUpdate = true; if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true;
  scene.add(trunks); scene.add(canopies);
  const fGeo = new THREE.BufferGeometry(); const fn = flowerPos.length / 3; fGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(flowerPos), 3));
  fGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(fn).map(() => rand(1.1, 2.0)), 1)); fGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(fn).map(Math.random), 1));
  const flowerMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Q.dpr }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(1.3, 0.62, 0.12) } }, vertexShader: FIRE_VS.replace('pow(0.5 + 0.5*sin(uTime*(1.2+aPhase*3.0) + aPhase*50.0), 6.0)', '0.85').replace('p.x += sin(uTime*0.55 + aPhase*20.0)*1.3; p.y += sin(uTime*0.9 + aPhase*33.0)*0.45; p.z += cos(uTime*0.5 + aPhase*17.0)*1.3;', ''), fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const flowers = new THREE.Points(fGeo, flowerMat); flowers.frustumCulled = false; scene.add(flowers);

  const NF = 380, fp = new Float32Array(NF * 3), fph = new Float32Array(NF), fsz = new Float32Array(NF);
  for (let i = 0; i < NF; i++) { const z = rand(-104, -200); fp[i * 3] = rand(-26, 26); fp[i * 3 + 1] = groundY(z) + rand(0.6, 5.5); fp[i * 3 + 2] = z; fph[i] = Math.random(); fsz[i] = rand(0.5, 1.0); }
  const fireGeo = new THREE.BufferGeometry(); fireGeo.setAttribute('position', new THREE.BufferAttribute(fp, 3)); fireGeo.setAttribute('aPhase', new THREE.BufferAttribute(fph, 1)); fireGeo.setAttribute('aSize', new THREE.BufferAttribute(fsz, 1));
  const fireMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Q.dpr }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(1.5, 1.8, 0.6) } }, vertexShader: FIRE_VS, fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const fireflies = new THREE.Points(fireGeo, fireMat); fireflies.frustumCulled = false; scene.add(fireflies);

  const fTex = featherTex();
  const featherGeo = new THREE.PlaneGeometry(0.34, 0.68);
  const featherMat = new THREE.MeshBasicMaterial({ map: fTex, transparent: true, alphaTest: 0.15, side: THREE.DoubleSide, depthWrite: false });
  const NFE = 34, feathers = new THREE.InstancedMesh(featherGeo, featherMat, NFE); feathers.frustumCulled = false; scene.add(feathers);
  const fe = []; for (let i = 0; i < NFE; i++) { const z = rand(-106, -215); fe.push({ x: rand(-9, 9), z, y: groundY(z) + rand(0.5, 9), ph: Math.random() * 6.28, sp: rand(0.28, 0.5), r: rand(0, 6.28) }); }

  const flock = []; const flockTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 32; const g = c.getContext('2d'); g.strokeStyle = 'rgba(0,0,0,0.9)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(4, 24); g.quadraticCurveTo(20, 6, 32, 18); g.quadraticCurveTo(44, 6, 60, 24); g.stroke(); return new THREE.CanvasTexture(c); })();
  for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flockTex, transparent: true, opacity: 0, depthWrite: false })); s.scale.set(1.6, 0.8, 1); s.userData = { ox: rand(-5, 5), oy: rand(-1.5, 1.5), oz: rand(-3, 3), ph: rand(0, 6) }; scene.add(s); flock.push(s); }

  /* the flute */
  const flute = new THREE.Group(); flute.scale.setScalar(1.3); const FLUTE_POS = new THREE.Vector3(0, 0, -171.5);
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd9b46a, roughness: 0.4, metalness: 0.05, emissive: 0x4a3410 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.7, 14), bambooMat); body.rotation.z = Math.PI / 2; flute.add(body);
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xe0b34a, roughness: 0.35, metalness: 0.6 });
  for (const x of [-0.84, -0.6, 0.66, 0.84]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 20), goldMat); r.rotation.y = Math.PI / 2; r.position.x = x; flute.add(r); }
  const NOTES = [1, 1.125, 1.25, 1.5, 1.6667, 2, 2.25, 2.5], holes = [], holeGlows = [];
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x1a1008 });
  NOTES.forEach((n, i) => { const x = -0.48 + i * 0.15; const h = new THREE.Mesh(new THREE.CircleGeometry(0.016, 12), holeMat); h.position.set(x, 0.0, 0.051); flute.add(h); holes.push(h); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffd27a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); gl.position.set(x, 0, 0.06); gl.scale.set(0.5, 0.5, 1); flute.add(gl); holeGlows.push(gl); });
  const guides = []; NOTES.forEach((n, i) => { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffe2a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); g.position.set(-0.48 + i * 0.15, 0.22, 0.04); g.scale.set(0.22, 0.22, 1); flute.add(g); guides.push(g); });
  let guideOn = 0, hotHole = -1;
  const tassel = new THREE.Group(); tassel.position.set(0.86, -0.02, 0);
  const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.36, 5), new THREE.MeshBasicMaterial({ color: 0xa0202a })); thread.position.y = -0.18; tassel.add(thread);
  const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xb8232e, roughness: 0.8 })); tuft.position.y = -0.4; tuft.rotation.x = Math.PI; tassel.add(tuft);
  const fFeather = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.42), featherMat); fFeather.position.set(0.04, -0.34, 0.02); fFeather.rotation.z = 0.25; tassel.add(fFeather);
  flute.add(tassel);
  const fluteLight = new THREE.PointLight(0xffd27a, 0, 6, 2); flute.add(fluteLight);
  flute.visible = false; scene.add(flute);
  const rings = []; for (let i = 0; i < 8; i++) { const r = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.5, 48), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); r.visible = false; scene.add(r); rings.push({ m: r, life: 0 }); }
  const blooms = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(featherGeo, featherMat.clone()); m.visible = false; scene.add(m); blooms.push({ m, life: 0, vel: new THREE.Vector3(), rot: 0, sp: 0 }); }

  /* the pots */
  const LANE_Z = -200, LANE_GY = groundY(LANE_Z);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3f28, roughness: 0.9 });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 0.2), woodMat); beam.position.set(0, LANE_GY + 4.7, LANE_Z); scene.add(beam);
  for (const x of [-5, 5]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 4.8, 8), woodMat); post.position.set(x, LANE_GY + 2.4, LANE_Z); scene.add(post); }
  const pTex = potTex();
  const potMat = new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.85 });
  const potGeo = new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.2, 0), new THREE.Vector2(0.36, 0.12), new THREE.Vector2(0.43, 0.32), new THREE.Vector2(0.38, 0.5), new THREE.Vector2(0.27, 0.6), new THREE.Vector2(0.25, 0.64), new THREE.Vector2(0.31, 0.68), new THREE.Vector2(0.31, 0.72), new THREE.Vector2(0.23, 0.72), new THREE.Vector2(0.23, 0.58), new THREE.Vector2(0.001, 0.55)], 26);
  const butterMat = new THREE.MeshStandardMaterial({ color: 0xfff1cc, roughness: 0.55, emissive: 0x2a2010 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb69a6a, roughness: 1 });
  const pots = [];
  const layout = [[-3.6, 2.2], [-2.4, 3.1], [-1.2, 2.5], [0, 3.4], [1.2, 2.3], [2.4, 3.0], [3.6, 2.6]];
  layout.forEach(([x, h], i) => {
    const g = new THREE.Group(); g.position.set(x, LANE_GY + 4.6, LANE_Z); scene.add(g);
    const len = 4.6 - h - 0.72;
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 6), ropeMat); rope.position.y = -len / 2; g.add(rope);
    const pot = new THREE.Mesh(potGeo, potMat); pot.position.y = -len - 0.72; g.add(pot); pot.userData.i = i;
    const butter = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), butterMat); butter.scale.set(1, 0.55, 1); butter.position.y = -len - 0.72 + 0.5; g.add(butter);
    const proxy = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); proxy.position.y = -len - 0.72 + 0.35; g.add(proxy); proxy.userData.i = i;
    pot.material = potMat.clone();
    pots.push({ g, rope, pot, butter, proxy, len, broken: false, ph: rand(0, 6), w: rand(0.9, 1.4), shards: [], drop: null, spray: null, hot: 0 });
  });
  const shardGeo = new THREE.TetrahedronGeometry(0.13); const shardPool = [];
  for (let i = 0; i < 7 * 12; i++) { const m = new THREE.Mesh(shardGeo, potMat); m.visible = false; scene.add(m); shardPool.push({ m, vel: new THREE.Vector3(), ang: new THREE.Vector3(), life: 0, rest: false }); }
  let shardIdx = 0;
  const sprayGeo = new THREE.BufferGeometry(); const NSP = 7 * 22; const spPos = new Float32Array(NSP * 3); sprayGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  const sprayMat = new THREE.PointsMaterial({ color: 0xfff1cc, size: 0.09, transparent: true, opacity: 0.95, depthWrite: false }); const spray = new THREE.Points(sprayGeo, sprayMat); spray.frustumCulled = false; scene.add(spray);
  const spV = []; for (let i = 0; i < NSP; i++) { spV.push({ v: new THREE.Vector3(), life: 0 }); spPos[i * 3 + 1] = -100; }
  let spIdx = 0;
  const lamps = []; for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffb14a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 })); const x = i % 2 ? 6.5 : -6.5; const z = -194 - Math.floor(i / 2) * 9; s.position.set(x, groundY(z) + 2.4, z); s.scale.set(2.2, 2.2, 1); scene.add(s); lamps.push(s); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.6, 6), woodMat); post.position.set(x, groundY(z) + 1.3, z); scene.add(post); }

  function playNote(i, vol = 0.45) {
    const g = holeGlows[i]; if (g) g.material.opacity = 1;
    fluteLight.intensity = 6;
    for (const r of rings) if (r.life <= 0) { r.life = 1; r.m.visible = true; r.m.position.copy(flute.position); r.m.position.x += holes[i].position.x * 0.9; r.m.scale.setScalar(0.3); break; }
    let n = 0; for (const b of blooms) { if (n >= 2) break; if (b.life <= 0) { n++; b.life = 1; b.m.visible = true; b.m.position.copy(flute.position); b.m.position.x += holes[i].position.x; b.m.position.y -= 0.05; b.vel.set(rand(-0.5, 0.5), rand(1.4, 2.0), rand(-0.3, 0.3)); b.sp = rand(-2, 2); b.m.rotation.set(rand(-0.3, 0.3), rand(0, 6), rand(-0.4, 0.4)); } }
    if (sound.on) sound.flute(293.66 * NOTES[i], sound.ctx.currentTime, 0.5, vol);
  }
  function breakPot(i) {
    const P = pots[i]; if (P.broken) return false; P.broken = true;
    const wp = new THREE.Vector3(); P.pot.getWorldPosition(wp); P.pot.visible = false; P.butter.visible = false; P.rope.scale.y = 0.35; P.rope.position.y = -P.len * 0.175;
    for (let k = 0; k < 12; k++) { const s = shardPool[shardIdx++ % shardPool.length]; s.m.visible = true; s.m.position.copy(wp).add(new THREE.Vector3(rand(-0.3, 0.3), rand(0.05, 0.6), rand(-0.3, 0.3))); s.m.scale.setScalar(rand(0.6, 1.3)); s.vel.set(rand(-3, 3), rand(0.5, 3), rand(-3, 3)); s.ang.set(rand(-9, 9), rand(-9, 9), rand(-9, 9)); s.life = 6; s.rest = false; }
    for (let k = 0; k < 22; k++) { const sp = spV[spIdx % NSP]; const j = spIdx % NSP; spIdx++; spPos[j * 3] = wp.x + rand(-0.15, 0.15); spPos[j * 3 + 1] = wp.y + 0.45; spPos[j * 3 + 2] = wp.z + rand(-0.15, 0.15); sp.v.set(rand(-2.2, 2.2), rand(-1, 1.8), rand(-2.2, 2.2)); sp.life = 3; }
    P.drop = { m: new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), butterMat), vel: new THREE.Vector3(rand(-0.4, 0.4), 0, rand(-0.4, 0.4)), rest: false }; P.drop.m.position.copy(wp).add(new THREE.Vector3(0, 0.45, 0)); P.drop.m.scale.set(1, 0.55, 1); scene.add(P.drop.m);
    if (sound.on) { const n = sound.ctx.currentTime; sound.crack(); sound.bell(n + 0.05, 1320, 0.35); sound.bell(n + 0.35, 1760, 0.25); sound.dholHit(n, 'dha'); }
    return true;
  }
  const raycaster = new THREE.Raycaster();
  function potAt(ndc, camera) { raycaster.setFromCamera(ndc, camera); const hits = raycaster.intersectObjects(pots.filter(p => !p.broken).map(p => p.proxy), false); return hits.length ? hits[0].object.userData.i : -1; }
  function tapPot(ndc, camera) { const i = potAt(ndc, camera); return i >= 0 ? breakPot(i) : false; }
  function hoverPot(ndc, camera) { const i = potAt(ndc, camera); pots.forEach((p, k) => { p.hot = k === i ? 1 : 0; }); return i; }
  const potsLeft = () => pots.filter(p => !p.broken).length;
  function holeNDC(i, camera, out) { return out.copy(holes[i].position).applyMatrix4(flute.matrixWorld).project(camera); }
  function setGuides(on, hot) { guideOn = on; hotHole = hot; }
  function rayHit(ndc, camera, objs) { raycaster.setFromCamera(ndc, camera); return raycaster.intersectObjects(objs, false).length > 0; }

  /* chapter six: the invitation */
  const CARD_Z = -221; let cardName = '';
  function drawInvite(name, back) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1280; const g = c.getContext('2d'); g.scale(2, 2);
    const bg = g.createLinearGradient(0, 0, 1024, 640); bg.addColorStop(0, '#0b1030'); bg.addColorStop(1, '#18204f'); g.fillStyle = bg; g.fillRect(0, 0, 1024, 640);
    g.strokeStyle = '#e5b567'; g.lineWidth = 3; g.strokeRect(28, 28, 968, 584); g.lineWidth = 1; g.strokeRect(40, 40, 944, 560);
    const fc = document.createElement('canvas'); fc.width = 128; fc.height = 256; fc.getContext('2d').drawImage(fTex.image, 0, 0);
    const fe = (x, y, rot, s) => { g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = 0.9; g.drawImage(fc, -32 * s, -64 * s, 64 * s, 128 * s); g.restore(); };
    g.textAlign = 'center'; g.fillStyle = '#f3d89a';
    if (back) { fe(512, 300, 0.15, 3.2); g.font = '400 54px Georgia, serif'; g.fillText('G O K U L A M', 512, 560); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
    fe(110, 560, -0.6, 1.5); fe(914, 560, 0.6, 1.5);
    g.font = 'italic 30px Georgia, serif'; g.fillStyle = '#e5b567'; g.fillText('Krishna Janmashtami', 512, 112);
    g.font = '400 62px Georgia, serif'; g.fillStyle = '#f3d89a'; g.fillText(name ? `${name}, you are invited` : 'You are invited', 512, 196);
    g.font = 'italic 34px Georgia, serif'; g.fillStyle = '#f1e8d6'; g.fillText('to the night He was born', 512, 246);
    g.font = '400 30px Georgia, serif'; g.fillStyle = '#f1e8d6';
    g.fillText('Friday, the fourth of September, 2026', 512, 322);
    g.fillText('Lamps at dusk. Nishita puja at midnight, 11:57 to 12:43.', 512, 366);
    g.fillText('Dahi Handi the next morning, the fifth.', 512, 410);
    g.font = 'italic 30px Georgia, serif'; g.fillStyle = '#e5b567'; g.fillText('Bring a diya, a sweet, and someone you love.', 512, 486);
    g.font = '400 22px Georgia, serif'; g.fillStyle = 'rgba(241,232,214,0.6)'; g.fillText('Gokulam, on the far bank of the Yamuna', 512, 566);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const card = new THREE.Group(); card.visible = false; scene.add(card);
  const cardBody = new THREE.Mesh(new THREE.BoxGeometry(1.64, 1.04, 0.04), new THREE.MeshStandardMaterial({ color: 0xe0b34a, roughness: 0.35, metalness: 0.5, emissive: 0x3a2a08 })); card.add(cardBody);
  const frontMat = new THREE.MeshStandardMaterial({ map: drawInvite('', false), roughness: 0.55, emissive: 0x111428 });
  const backMat = new THREE.MeshStandardMaterial({ map: drawInvite('', true), roughness: 0.55, emissive: 0x111428 });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), frontMat); front.position.z = 0.045; card.add(front);
  const backp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), backMat); backp.position.z = -0.045; backp.rotation.y = Math.PI; card.add(backp);
  const cardLight = new THREE.PointLight(0xffd27a, 0, 7, 2); cardLight.position.set(0, 0.6, 1.4); card.add(cardLight);
  const cardGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffc46a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); cardGlow.scale.set(4.5, 3.4, 1); card.add(cardGlow);
  const sparkN = 60, sparkPos = new Float32Array(sparkN * 3), sparkSz = new Float32Array(sparkN), sparkPh = new Float32Array(sparkN);
  for (let i = 0; i < sparkN; i++) { sparkPos[i * 3] = rand(-1.4, 1.4); sparkPos[i * 3 + 1] = rand(-0.9, 0.9); sparkPos[i * 3 + 2] = rand(-0.4, 0.4); sparkSz[i] = rand(0.3, 0.6); sparkPh[i] = Math.random(); }
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3)); sparkGeo.setAttribute('aSize', new THREE.BufferAttribute(sparkSz, 1)); sparkGeo.setAttribute('aPhase', new THREE.BufferAttribute(sparkPh, 1));
  const sparkMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Q.dpr }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(1.8, 1.4, 0.6) } }, vertexShader: FIRE_VS, fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const sparks = new THREE.Points(sparkGeo, sparkMat); sparks.frustumCulled = false; card.add(sparks);
  function setCardName(n) { cardName = n; frontMat.map = drawInvite(n, false); frontMat.needsUpdate = true; }
  const tilt = new THREE.Vector2(), tiltT = new THREE.Vector2();
  function setTilt(x, y) { tiltT.set(clamp(x, -1, 1), clamp(y, -1, 1)); }

  /* the finale: a thousand lamps rising */
  const ND = isMobile ? 2200 : 4200, dp = new Float32Array(ND * 3), dph = new Float32Array(ND), dsz = new Float32Array(ND), dBase = [];
  for (let i = 0; i < ND; i++) { const near = i % 3 === 0; const x = near ? rand(-14, 14) : rand(-110, 110), z = near ? rand(-205, -250) : rand(-150, -330); dBase.push(x, z, rand(0, 1)); dp[i * 3] = x; dp[i * 3 + 1] = -50; dp[i * 3 + 2] = z; dph[i] = Math.random(); dsz[i] = rand(2.4, 4.2); }
  const diyaGeo = new THREE.BufferGeometry(); diyaGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3)); diyaGeo.setAttribute('aPhase', new THREE.BufferAttribute(dph, 1)); diyaGeo.setAttribute('aSize', new THREE.BufferAttribute(dsz, 1));
  const diyaMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Q.dpr }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(2.2, 1.25, 0.4) } }, vertexShader: FIRE_VS.replace('pow(0.5 + 0.5*sin(uTime*(1.2+aPhase*3.0) + aPhase*50.0), 6.0)', '(0.7 + 0.3*sin(uTime*(6.0+aPhase*4.0) + aPhase*50.0))').replace('(70.0/max(1.0,-mv.z))', '(130.0/max(2.0,-mv.z)); gl_PointSize = min(gl_PointSize, 34.0*uPixelRatio)'), fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const diyas = new THREE.Points(diyaGeo, diyaMat); diyas.frustumCulled = false; scene.add(diyas);
  let finaleT = -1;
  function lightLamps() { if (finaleT < 0) finaleT = 0; }

  const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(1, 1, 1);
  function update(dt, S, camera) {
    const t = S.time, dawn = S.dawnK, camZ = camera.position.z;
    const lu = land.material.uniforms; lu.uSunDir.value.copy(S.sunDir); lu.uSunI.value = S.sunI; lu.uAmb.value.copy(S.ambCol); lu.uFogCol.value.copy(S.fogCol); lu.uFogDen.value = S.fogDen; lu.uCam.value.copy(camera.position); lu.uFlash.value = S.flash; lu.uMoonI.value = 1 - smooth((dawn - 0.4) / 0.5);
    flowerMat.uniforms.uTime.value = t; flowerMat.uniforms.uOpacity.value = 0.35 + 0.65 * dawn;
    fireMat.uniforms.uTime.value = t; fireMat.uniforms.uOpacity.value = smooth((-camZ - 84) / 14) * (1 - smooth((dawn - 0.55) / 0.35));
    if (camZ < -80) {
      for (let i = 0; i < NFE; i++) { const f = fe[i]; f.y -= f.sp * dt; f.ph += dt; if (f.y < groundY(f.z) + 0.25) { f.y = groundY(f.z) + rand(7, 11); f.x = rand(-9, 9); } const sway = Math.sin(f.ph * 1.3) * 0.9; tmpE.set(Math.sin(f.ph * 1.1) * 0.5, f.r + f.ph * 0.4, Math.cos(f.ph * 0.9) * 0.6 + 0.4); m4.compose(tmpV.set(f.x + sway, f.y, f.z + Math.cos(f.ph) * 0.4), tmpQ.setFromEuler(tmpE), tmpS); feathers.setMatrixAt(i, m4); }
      feathers.instanceMatrix.needsUpdate = true;
    }
    const fl = smooth((dawn - 0.45) / 0.25) * (1 - smooth((dawn - 0.95) / 0.05));
    flock.forEach((s, i) => { const u = s.userData; const k = ((t * 0.045 + i * 0.01) % 1); s.position.set(-90 + k * 180 + u.ox, 22 + u.oy + Math.sin(t * 1.8 + u.ph) * 0.4, camZ - 70 + u.oz); s.material.opacity = fl * 0.85; s.scale.y = 0.8 * (0.6 + 0.4 * Math.abs(Math.sin(t * 6 + u.ph))); });
    flute.visible = camZ < -140;
    if (flute.visible) { flute.position.set(FLUTE_POS.x, groundY(FLUTE_POS.z) + 1.3 + Math.sin(t * 0.8) * 0.06, FLUTE_POS.z); flute.rotation.set(Math.sin(t * 0.5) * 0.08, Math.sin(t * 0.3) * 0.18, Math.sin(t * 0.7) * 0.05); fluteLight.intensity *= Math.pow(0.02, dt); for (const g of holeGlows) g.material.opacity *= Math.pow(0.05, dt); }
    for (const r of rings) if (r.life > 0) { r.life -= dt * 0.9; const k = 1 - r.life; r.m.scale.setScalar(0.3 + k * 2.4); r.m.material.opacity = (1 - k) * 0.8; r.m.lookAt(camera.position); if (r.life <= 0) r.m.visible = false; }
    for (const b of blooms) if (b.life > 0) { b.life -= dt * 0.4; b.vel.y -= dt * 0.9; b.vel.multiplyScalar(1 - dt * 0.6); b.m.position.addScaledVector(b.vel, dt); b.m.rotation.y += b.sp * dt; b.m.rotation.z += Math.sin(t * 3) * dt; b.m.material.opacity = Math.min(1, b.life * 2); if (b.life <= 0) b.m.visible = false; }
    for (const P of pots) { P.g.rotation.z = Math.sin(t * P.w + P.ph) * (P.broken ? 0.03 : 0.07); P.g.rotation.x = Math.sin(t * P.w * 0.7 + P.ph) * 0.03; if (P.drop && !P.drop.rest) { const d = P.drop; d.vel.y -= 9.8 * dt; d.m.position.addScaledVector(d.vel, dt); const gy = groundY(d.m.position.z) + 0.06; if (d.m.position.y < gy) { d.m.position.y = gy; d.rest = true; d.m.scale.set(1.7, 0.28, 1.7); } } }
    for (const s of shardPool) if (s.life > 0 && !s.rest) { s.vel.y -= 9.8 * dt; s.m.position.addScaledVector(s.vel, dt); s.m.rotation.x += s.ang.x * dt; s.m.rotation.y += s.ang.y * dt; const gy = groundY(s.m.position.z) + 0.05; if (s.m.position.y < gy) { s.m.position.y = gy; s.vel.y = -s.vel.y * 0.3; s.vel.x *= 0.6; s.vel.z *= 0.6; s.ang.multiplyScalar(0.4); if (Math.abs(s.vel.y) < 0.5) { s.rest = true; } } }
    let any = false; for (let i = 0; i < NSP; i++) { const sp = spV[i]; if (sp.life > 0) { any = true; sp.life -= dt; sp.v.y -= 9.8 * dt; spPos[i * 3] += sp.v.x * dt; spPos[i * 3 + 1] += sp.v.y * dt; spPos[i * 3 + 2] += sp.v.z * dt; const gy = groundY(spPos[i * 3 + 2]) + 0.03; if (spPos[i * 3 + 1] < gy) { spPos[i * 3 + 1] = gy; sp.v.set(0, 0, 0); } if (sp.life <= 0) spPos[i * 3 + 1] = -100; } }
    if (any) sprayGeo.attributes.position.needsUpdate = true;
    lamps.forEach((s, i) => { s.material.opacity = (0.55 + 0.15 * Math.sin(t * 5 + i)) * (1 - dawn * 0.6); });
    if (flute.visible) guides.forEach((g, i) => { const target = guideOn * (i === hotHole ? 1 : 0.28 + 0.12 * Math.sin(t * 2 + i)); g.material.opacity += (target - g.material.opacity) * Math.min(1, dt * 8); g.scale.setScalar(i === hotHole ? 0.36 : 0.22); });
    for (const P of pots) { const e = P.pot.material.emissive; e.setRGB(0.25 * P.hot, 0.16 * P.hot, 0.05 * P.hot); }
    card.visible = camZ < -200;
    if (card.visible) {
      tilt.lerp(tiltT, Math.min(1, dt * 4));
      const hf = Math.tan(camera.fov * Math.PI / 360) * camera.aspect; card.scale.setScalar(clamp(0.74 * 2 * 4.6 * hf / 1.64, 0.9, 3.4));
      card.position.set(0, groundY(CARD_Z) + 1.95 + Math.sin(t * 0.9) * 0.05, CARD_Z);
      card.rotation.set(-tilt.y * 0.28 + Math.sin(t * 0.6) * 0.02, tilt.x * 0.45 + Math.sin(t * 0.4) * 0.05, Math.sin(t * 0.5) * 0.015);
      const near = smooth((-camZ - 196) / 8); cardLight.intensity = 9 * near; cardGlow.material.opacity = 0.35 * near; sparkMat.uniforms.uTime.value = t; sparkMat.uniforms.uOpacity.value = near;
    }
    if (finaleT >= 0) {
      finaleT += dt; const pos = diyaGeo.attributes.position.array;
      for (let i = 0; i < ND; i++) { const b = dBase[i * 3 + 2]; const life = finaleT - b * 18; if (life < 0) { pos[i * 3 + 1] = -50; continue; } const rise = Math.min(60, life * (0.4 + 0.35 * b)); pos[i * 3] = dBase[i * 3] + Math.sin(life * 0.5 + b * 9) * 1.2; pos[i * 3 + 1] = groundY(dBase[i * 3 + 1]) + 0.3 + rise; pos[i * 3 + 2] = dBase[i * 3 + 1] + Math.cos(life * 0.4 + b * 7) * 0.8; }
      diyaGeo.attributes.position.needsUpdate = true; diyaMat.uniforms.uTime.value = t; diyaMat.uniforms.uOpacity.value = Math.min(1, finaleT * 0.4);
    }
  }
  return { update, playNote, tapPot, hoverPot, potsLeft, breakPot, pots, groundY, NOTES, flute, FLUTE_Z: FLUTE_POS.z, LANE_Z, CARD_Z, holes, holeNDC, setGuides, rayHit, card, setCardName, setTilt, lightLamps, finaleOn: () => finaleT >= 0 };
}
