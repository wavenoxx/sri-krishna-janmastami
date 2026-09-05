/* ───────────────────────── setup ───────────────────────── */
const glCanvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false });
renderer.setPixelRatio(Q.dpr);
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setClearColor(0x000000, 1);
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 520);
const post = new Post(renderer);
const sound = new Sound();
const cell = buildCell();
const river = buildRiver();
const gk = river.gk;

const gate = $('#gate'), enterBtn = $('#enter'), cardEl = $('#card'), cdEl = $('#cd'), cdT = $('#cd .t'), cdN = $('#cd .n'), witnessBtn = $('#witness'), nextBtn = $('#next'), hintEl = $('#hint'), markEl = $('#mark'), dotsEl = $('#dots'), soundBtn = $('#sound'), inviteEl = $('#invite'), nameInput = $('#forname'), copyBtn = $('#copylink'), shareBtn = $('#sharebtn'), secretEl = $('#secret');
for (let i = 0; i < 7; i++) { const d = document.createElement('i'); dotsEl.appendChild(d); }
const dotEls = dotsEl.querySelectorAll('i');
function dots(i) { dotEls.forEach((d, k) => d.classList.toggle('on', k === i)); }
let cardTimer = 0;
function card(k, title, sub, dur = 5000) { cardEl.querySelector('.k').textContent = k; cardEl.querySelector('h2').textContent = title; cardEl.querySelector('p').textContent = sub; cardEl.classList.add('show'); clearTimeout(cardTimer); cardTimer = setTimeout(() => cardEl.classList.remove('show'), dur); }
function setHint(t) { if (!t) { hintEl.classList.remove('show'); return; } hintEl.textContent = t; hintEl.classList.add('show'); }
function setNext(label) { if (!label) { nextBtn.classList.remove('show'); return; } nextBtn.textContent = label; nextBtn.classList.add('show'); }
if (!navigator.share) shareBtn.style.display = 'none';

/* ───────────────────────── state ───────────────────────── */
const S = {
  mode: 'gate', time: 0, modeT: 0, t: 0, vel: 0, goal: null, push: 0,
  lat: 0, latVel: 0, bank: 0,
  yaw: 0, pitch: 0, yawT: 0, pitchT: 0, locked: false,
  gyroYaw: 0, gyroPitch: 0, gyroRoll: 0, gyroActive: false,
  wind: new THREE.Vector2(0.25, 0), windT: new THREE.Vector2(0.25, 0),
  flash: 0, flashT: 0, flashOn: false, flashPower: 1, nextFlash: 4,
  storm: 1, dawn: 0, glowBoost: 0,
  birthT: 0, snapped: false, conch: false, bornCard: false,
  white: 0, exposure: 1, diyaI: 1, birthI: 0, doorA: 0, flare: 0,
  chapter: 'cell', chapterT: 0, idle: 0, notes: 0, dawnK: 0, sunDir: new THREE.Vector3(0, -1, 0), sunI: 0, ambCol: new THREE.Color(0.11, 0.14, 0.24), fogCol: new THREE.Color(0x0a1029), fogDen: 0.009, basketK: 1,
  secrets: { star: false, moon: false, lamp: false }, lampTaps: 0
};
let targetGyroYaw = 0, targetGyroPitch = 0, targetGyroRoll = 0;
let lastHeading = null;
let gyroRequested = false;
const cam = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), tween: null };
const GATE_TGT = new THREE.Vector3(1.4, 0.5, 1.5);
const CELL_POS = new THREE.Vector3(0, 1.7, 3.4), CELL_TGT = new THREE.Vector3(0, 1.9, -6);
const DOOR_POS = new THREE.Vector3(0, 1.8, -3.0), DOOR_TGT = new THREE.Vector3(0, 2.4, -7);
cam.pos.set(2.2, 0.46, 2.2); cam.tgt.copy(GATE_TGT);
function tweenCam(toPos, toTgt, dur) { cam.tween = { fp: cam.pos.clone(), ft: cam.tgt.clone(), tp: toPos.clone(), tt: toTgt.clone(), t: 0, dur }; }
function updateCam(dt) {
  if (cam.tween) { const w = cam.tween; w.t += dt; const k = easeInOut(w.t / w.dur); cam.pos.lerpVectors(w.fp, w.tp, k); cam.tgt.lerpVectors(w.ft, w.tt, k); if (w.t >= w.dur) cam.tween = null; }
  camera.position.copy(cam.pos); camera.lookAt(cam.tgt);

  if (S.gyroActive) {
    const kG = Math.min(1, dt * 12.0);
    S.gyroYaw += (targetGyroYaw - S.gyroYaw) * kG;
    S.gyroPitch += (targetGyroPitch - S.gyroPitch) * kG;
    S.gyroRoll += (targetGyroRoll - S.gyroRoll) * kG;
  } else if (!P.down && (Math.abs(S.yawT) > 0.005 || Math.abs(S.pitchT) > 0.005)) {
    S.yawT *= Math.exp(-dt * 2.2);
    S.pitchT *= Math.exp(-dt * 2.2);
  }

  const k = Math.min(1, dt * 3.5);
  S.yaw += (S.yawT - S.yaw) * k; S.pitch += (S.pitchT - S.pitch) * k;
  camera.rotateY(S.yaw + S.gyroYaw); camera.rotateX(S.pitch + S.gyroPitch);
  const totalRoll = (S.bank || 0) + S.gyroRoll;
  if (totalRoll) camera.rotateZ(totalRoll);
}

/* ───────────────────────── lightning ───────────────────────── */
function updateFlash(dt) {
  if (S.time >= S.nextFlash && S.mode !== 'birth' && S.dawnK < 0.45) {
    const calm = S.mode === 'river' && S.storm < 0.4;
    const power = calm ? rand(0.2, 0.45) : rand(0.55, 1.3);
    S.flashPower = power; S.flashT = 0; S.flashOn = true;
    const delay = rand(0.25, 1.9);
    if (sound.on && S.mode !== 'gate') sound.thunder(delay, power * (1.15 - delay * 0.35) * (S.mode === 'cell' ? 0.55 : 1));
    S.nextFlash = S.time + (calm ? rand(11, 24) : rand(3.5, 9.5));
  }
  if (S.flashOn) {
    S.flashT += dt; const ft = S.flashT;
    let f = Math.exp(-ft * 11) + 0.6 * Math.exp(-Math.abs(ft - 0.14) * 32) + 0.35 * Math.exp(-Math.abs(ft - 0.33) * 22);
    f *= S.flashPower; if (ft > 1.3) { S.flashOn = false; f = 0; } S.flash = f;
  } else S.flash = 0;
}

/* ───────────────────────── countdown ───────────────────────── */
let cdLast = '';
function updateCountdown() {
  const now = new Date(); const mid = new Date(now); mid.setHours(24, 0, 0, 0); const diff = mid - now;
  const nishita = now.getHours() === 0 && now.getMinutes() < 44;
  let txt;
  if (nishita) { txt = '00:00:00'; cdN.textContent = 'The sacred window is open right now, until 12:43 am.'; }
  else { const s = Math.floor(diff / 1000); txt = `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
  if (txt !== cdLast) { cdLast = txt; cdT.textContent = txt; }
  if (S.mode === 'cell' && !nishita && diff < 1200 && S.modeT > 6) startBirth();
}

/* ───────────────────────── chapter one and the birth ───────────────────────── */
enterBtn.addEventListener('click', () => {
  if (S.mode !== 'gate') return;
  initGyro();
  try { sound.init(); } catch (e) { console.warn('audio unavailable', e); }
  if (sound.on) { sound.tanpuraOn = true; sound.set('crickets', 0.05, 4); sound.set('rain', 0.055, 4); sound.set('wind', 0.03, 4); sound.set('tanpura', 0.24, 5); setTimeout(() => { sound.heart = true; }, 3800); }
  if (isMobile && document.documentElement.requestFullscreen) { try { document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {} }
  gate.classList.add('hidden');
  S.mode = 'cell'; S.modeT = 0;
  tweenCam(CELL_POS, CELL_TGT, 5.2);
  setTimeout(() => card('Chapter one', 'Nishita', 'Mathura. A prison cell. The eighth night of the dark fortnight.', 6500), 1800);
  setTimeout(() => { markEl.classList.add('show'); soundBtn.classList.add('show'); dotsEl.classList.add('show'); dots(0); }, 4300);
  setTimeout(() => { if (S.mode !== 'cell') return; cdEl.classList.add('show'); setHint(isMobile ? 'Move your phone or drag to look around. Wait for midnight, or witness now.' : 'Move the mouse to look around. Wait for midnight, or witness the birth now.'); }, 9000);
  setTimeout(() => { if (S.mode === 'cell') witnessBtn.classList.add('show'); }, 10500);
});
witnessBtn.addEventListener('click', startBirth);
function startBirth() {
  if (S.mode !== 'cell') return;
  S.mode = 'birth'; S.modeT = 0; S.birthT = 0; S.snapped = false; S.conch = false; S.bornCard = false;
  cdEl.classList.remove('show'); witnessBtn.classList.remove('show'); setHint('');
  S.flashPower = 1.7; S.flashT = 0; S.flashOn = true;
  sound.heart = false;
  if (sound.on) { const n = sound.ctx.currentTime; sound.thunder(0.15, 1.3); sound.drone(); sound.bell(n + 0.3, 660, 0.5); sound.bell(n + 1.1, 880, 0.4); sound.bell(n + 2.4, 1320, 0.3); sound.setSmooth('rain', 0.02); sound.setSmooth('crickets', 0); }
}
function updateBirth(dt) {
  const bt = (S.birthT += dt);
  S.birthI = smooth(bt / 4.5) + smooth((bt - 8) / 3) * 0.3;
  S.diyaI = 1 + smooth(bt / 3) * 1.4;
  cell.sphere.scale.setScalar(0.05 + easeOut(bt / 5) * 1.25);
  cell.sphere.position.y = 1.5 + easeOut(bt / 6) * 0.7;
  post.rayStrength = smooth((bt - 0.8) / 3) * 0.7; post.lightPos.copy(cell.sphere.position);
  if (bt > 3 && !S.snapped) { S.snapped = true; cell.snap(); if (sound.on) sound.chains(); }
  if (bt > 4.5 && !S.bornCard) { S.bornCard = true; card('The Nishita hour', 'He is born.', 'The chains fall. The doors open. The river is waiting.', 6000); }
  if (bt > 5.5 && !S.conch) { S.conch = true; if (sound.on) sound.conch(sound.ctx.currentTime); }
  S.doorA = easeInOut((bt - 5.5) / 3.2) * 1.9;
  const k = smooth((bt - 4.5) / 6); cam.pos.lerpVectors(CELL_POS, DOOR_POS, k); cam.tgt.lerpVectors(CELL_TGT, DOOR_TGT, k);
  S.exposure = 1 + smooth((bt - 8.5) / 3) * 0.3;
  S.white = smooth((bt - 9.6) / 1.8);
  if (bt >= 11.5) startRiver();
}

/* ───────────────────────── the open world road: chapters one to seven ───────────────────────── */
const RAIL_LEN = river.rail.getLength();
const M = m => m / RAIL_LEN;                      // metres → rail units
function tAtZ(z) { for (let i = 0; i <= 3000; i++) { const u = i / 3000; if (river.rail.getPointAt(u).z <= z) return u; } return 1; }
const STATIONS = [
  { name: 'cell', t: 0.0, z: 78, label: '1. Nishita' },
  { name: 'river', t: tAtZ(15), z: 15, label: '2. Yamuna' },
  { name: 'shore', t: tAtZ(-104), z: -104, label: '3. Kadamba' },
  { name: 'flute', t: tAtZ(-166.5), z: -166.5, label: '4. Venu Gaanam' },
  { name: 'lane', t: tAtZ(-193), z: -193, label: '5. Utlotsavam' },
  { name: 'card', t: tAtZ(-221), z: -221, label: '6. Aahvaanam' },
  { name: 'vrindavan', t: tAtZ(-285), z: -285, label: '7. Vrindavan' }
];
const MILESTONES = STATIONS.map(s => s.t);
const NEXT_LABEL = {
  river: 'Reach the shore',
  shore: 'Walk into Gokulam',
  grove: 'Follow the morning',
  flute: 'Follow the laughter',
  lane: 'The golden card',
  card: 'Enter Vrindavan',
  vrindavan: 'Retrace to Yamuna'
};
const MAXV = M(9.5);
const MAX_LAT = 9.0;
const WALK = () => M(S.chapter === 'river' ? 3.4 : 3.0);
let lookForward = true;
const targetLook = new THREE.Vector3();

function stationHere() {
  for (const st of STATIONS) if (Math.abs(S.t - st.t) < M(3.5)) return st;
  return null;
}
function walkTo(targetT) {
  lookForward = (targetT >= S.t);
  S.goal = clamp(targetT, 0, 1);
}
function travelToStation(targetT) {
  if (S.mode === 'cell' || S.mode === 'gate') {
    startRiver();
    setTimeout(() => { walkTo(targetT); }, 600);
    return;
  }
  if (S.mode !== 'river') return;
  walkTo(targetT);
}
function nextMilestone() {
  for (const m of MILESTONES) if (m > S.t + M(3)) return m;
  return 1;
}
function prevMilestone() {
  for (let i = MILESTONES.length - 1; i >= 0; i--) if (MILESTONES[i] < S.t - M(3)) return MILESTONES[i];
  return 0;
}
function advance(mps) {
  if (S.mode !== 'river') return;
  S.goal = null;
  if (mps > 0.1) lookForward = true;
  else if (mps < -0.1 && !S.gyroActive) lookForward = false;
  S.vel = clamp(S.vel + M(mps), -MAXV, MAXV);
}
function steer(dLat) {
  if (S.mode !== 'river') return;
  S.latVel = clamp(S.latVel + dLat, -8.0, 8.0);
}
function updateWalk(dt) {
  if (S.goal !== null) {
    const dist = S.goal - S.t, dir = Math.sign(dist);
    if (Math.abs(dist) > M(0.5)) lookForward = (dir >= 0);
    const desired = dir * Math.min(WALK() * 2.5, Math.max(M(1.4), Math.sqrt(2 * M(3.5) * Math.abs(dist))));
    S.vel += (desired - S.vel) * Math.min(1, dt * 4.5);
    if (Math.abs(dist) < M(0.12)) { S.t = S.goal; S.vel = 0; S.goal = null; }
  } else {
    // Pure natural inertia
    S.vel *= Math.exp(-dt * 3.2);
  }
  S.t = clamp(S.t + S.vel * dt, 0, 1);

  // Lateral steering physics & banking roll (Mini GTA / Open World feeling)
  S.latVel *= Math.exp(-dt * 4.0);
  S.lat = clamp(S.lat + S.latVel * dt, -MAX_LAT, MAX_LAT);
  const targetBank = -clamp(S.latVel * 0.012, -0.06, 0.06);
  S.bank += (targetBank - S.bank) * Math.min(1, dt * 6.0);
}
function startRiver() {
  S.mode = 'river'; S.chapter = 'river'; S.chapterT = 0; S.modeT = 0; S.t = 0; S.vel = 0; S.goal = null; S.white = 1; S.exposure = 1; post.rayStrength = 0; S.yawT = 0; S.pitchT = 0; S.nextFlash = S.time + 2.5; cam.tween = null;
  lookForward = true;
  if (sound.on) { sound.setSmooth('rain', 0.3); sound.setSmooth('wind', 0.12); sound.setSmooth('water', 0.22); sound.setSmooth('crickets', 0); sound.setSmooth('tanpura', 0.1); }
  setTimeout(() => card('Chapter two', 'Yamuna', 'The storm bows. The river rises to touch His feet.', 6500), 2800);
  dots(1);
}
const CHAPTER = {
  river: () => { dots(1); if (sound.on) { sound.dholOn = false; sound.setSmooth('rain', 0.28); sound.setSmooth('water', 0.22); } },
  shore: () => { card('Gokulam', 'The far bank', 'The rain lets go. Somewhere ahead, a village is still asleep.', 7000); dots(2); if (sound.on) { sound.setSmooth('crickets', 0.05); sound.motif(); } },
  grove: () => { card('Chapter three', 'Gokulam wakes', 'Kadamba trees, fireflies, the first birds of the morning.', 7000); dots(2); if (sound.on) { sound.birdsOn = true; sound.setSmooth('tanpura', 0.2); } },
  flute: () => { card('Chapter four', 'Venu Gaanam', 'His flute is waiting for your hand.', 7000); dots(3); S.notes = 0; S.idle = -9; gk.setGuides(1, -1); if (sound.on) sound.setSmooth('tanpura', 0.12); setTimeout(() => playPhrase(PHRASES[0]), 2400); },
  lane: () => { card('Chapter five', 'Utlotsavam', 'Seven pots of butter hang over the lane. He would not leave one whole.', 7000); dots(4); gk.setGuides(0, -1); if (sound.on) { sound.dholOn = true; sound.setSmooth('tanpura', 0.15); } },
  card: () => { card('Chapter six', 'Aahvaanam', 'An invitation, written in gold, for whoever you carry in your heart.', 8000); dots(5); setTimeout(() => { if (S.chapter === 'card') { inviteEl.classList.add('show'); } }, 4000); if (sound.on) { sound.dholOn = false; sound.setSmooth('tanpura', 0.26); sound.birdsOn = true; } if (isMobile) askGyro(); },
  vrindavan: () => { card('Chapter seven', 'Vrindavan Sanctuary', 'Nanda Bhavan welcomes the Lord. The sacred journey lives forever in Gokulam.', 8000); dots(6); if (sound.on) { sound.dholOn = false; sound.setSmooth('tanpura', 0.28); sound.birdsOn = true; const n = sound.ctx.currentTime; sound.bell(n + 0.4, 880, 0.4); sound.bell(n + 1.2, 1320, 0.3); } },
  end: () => { }
};
function setChapter(c) {
  if (S.chapter === c) return;
  S.chapter = c;
  S.chapterT = 0;
  (CHAPTER[c] || (() => {}))();
}
function updateRiver(dt) {
  S.white = 1 - smooth((S.modeT - 0.4) / 3.2);
  S.chapterT += dt;
  updateWalk(dt);

  const u = clamp(S.t, 0, 1);
  const railP = river.rail.getPointAt(u);
  const camZ = railP.z;

  // Tangent & perpendicular normal for 3D lateral steering
  const tan = river.rail.getTangentAt(u).normalize();
  const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  const camPos = railP.clone().addScaledVector(norm, S.lat);
  cam.pos.copy(camPos);

  const lookAheadT = clamp(S.t + (lookForward ? M(7.5) : -M(7.5)), 0, 1);
  const aheadP = river.rail.getPointAt(lookAheadT);
  const aheadTan = river.rail.getTangentAt(lookAheadT).normalize();
  const aheadNorm = new THREE.Vector3(-aheadTan.z, 0, aheadTan.x).normalize();
  const ahead = aheadP.clone().addScaledVector(aheadNorm, S.lat * 0.65);

  S.storm = 1 - smooth((-camZ - 52) / 40) * 0.96;
  S.dawnK = smooth((-camZ - 82) / 62);
  S.dawn = 0.42 * smooth((S.dawnK - 0.05) / 0.4) * (1 - 0.6 * smooth((S.dawnK - 0.7) / 0.3));
  S.basketK = 1 - smooth((-camZ - 86) / 10);
  S.glowBoost = 0;
  const bP = river.rail.getPointAt(clamp(S.t + M(6), 0, 1)); bP.y = 0.62 + Math.sin(S.time * 1.6) * 0.1;
  river.setBasket(bP);

  // Dynamic 3D Camera LookAt Kinematics
  if (S.chapter === 'flute' && lookForward && Math.abs(camZ - gk.FLUTE_Z) < 8) {
    targetLook.set(0, gk.groundY(gk.FLUTE_Z) + 1.3, gk.FLUTE_Z);
  } else if (S.chapter === 'lane' && lookForward && Math.abs(camZ - gk.LANE_Z) < 9) {
    targetLook.set(0, gk.groundY(gk.LANE_Z) + 2.4, gk.LANE_Z);
  } else if (S.chapter === 'card' && lookForward && Math.abs(camZ - gk.CARD_Z) < 10) {
    targetLook.set(0, gk.groundY(gk.CARD_Z) + 1.95 - (innerWidth > innerHeight ? 0.55 : 0.35), gk.CARD_Z);
  } else if (S.chapter === 'vrindavan' && lookForward && Math.abs(camZ - gk.VRINDAVAN_Z) < 14) {
    targetLook.set(0, gk.groundY(gk.VRINDAVAN_Z) + 2.1, gk.VRINDAVAN_Z);
  } else if (S.basketK > 0.5 && lookForward) {
    targetLook.set(bP.x, bP.y + 0.9, bP.z - 9);
  } else if (!lookForward) {
    targetLook.set(ahead.x, ahead.y + 0.15, ahead.z + 6);
  } else {
    targetLook.set(ahead.x, ahead.y - 0.35, ahead.z - 6);
  }
  cam.tgt.lerp(targetLook, Math.min(1, dt * 5.0));

  // Determine chapter based on Z
  if (camZ > -88) setChapter('river');
  else if (camZ > -104) setChapter('shore');
  else if (camZ > -158) setChapter('grove');
  else if (camZ > -184) setChapter('flute');
  else if (camZ > -208) setChapter('lane');
  else if (camZ > -248) setChapter('card');
  else setChapter('vrindavan');

  if (S.chapter === 'flute') { S.idle += dt; if (S.idle > 11) { S.idle = -8; playPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]); } }
  if (S.chapter === 'lane' && gk.potsLeft() === 0) finale();

  post.lightPos.copy(river.moonWorld()); post.rayStrength = 0.14 * (0.5 + 0.5 * S.storm) * (1 - S.dawnK);
  if (sound.on) {
    const inland = smooth((-camZ - 96) / 30);
    sound.setSmooth('rain', 0.03 + 0.3 * S.storm); sound.setSmooth('wind', 0.03 + 0.12 * S.storm * (0.5 + Math.abs(S.wind.x)));
    sound.setSmooth('water', 0.22 * (1 - inland)); sound.setSmooth('crickets', 0.05 * (1 - S.dawnK) * smooth((-camZ - 60) / 30));
    if (S.dawnK > 0.3) sound.birdsOn = true;
  }
}
const PHRASES = [[0, 1, 2, 3, 4, 3, 2, 1, 0], [2, 3, 4, 5, 4, 3, 2, 1, 2], [4, 5, 6, 7, 6, 5, 4, 3, 4], [0, 2, 3, 4, 7, 4, 3, 2, 0]];
function playPhrase(ph) { ph.forEach((n, i) => setTimeout(() => { if (S.chapter === 'flute') { gk.playNote(n, 0.4); gk.setGuides(1, n); setTimeout(() => { if (hotHole < 0) gk.setGuides(1, -1); }, 300); } }, i * 470)); }
let finaleDone = false;
function finale() {
  if (finaleDone) return; finaleDone = true;
  if (sound.on) { const n = sound.ctx.currentTime; [660, 880, 1100, 1320, 1760].forEach((f, i) => sound.bell(n + 0.15 * i, f, 0.4)); for (let i = 0; i < 8; i++) sound.dholHit(n + 0.12 * i, i % 3 === 2 ? 'tin' : 'dha', 0.6); }
  card('Utlotsavam', 'Seven pots, seven laughs.', 'Every mother in Gokulam has hidden her butter. None of it is safe.', 5000);
}
function lightLamps() {
  if (gk.finaleOn()) return; gk.lightLamps(); inviteEl.classList.remove('show');
  if (sound.on) { const n = sound.ctx.currentTime; sound.conch(n); [0, 1, 2, 3, 4, 7].forEach((k, i) => sound.bell(n + 1.6 + i * 0.22, 293.66 * gk.NOTES[k] * 2, 0.35)); setTimeout(() => sound.motif(), 2600); sound.setSmooth('tanpura', 0.3); }
  setTimeout(() => card('Gokulam', 'A thousand lamps', 'One for every year He has been loved. Jai Sri Krishna.', 9000), 2500);
}

/* ───────────────────────── the invitation: name, link, share, tilt ───────────────────────── */
const params = new URLSearchParams(location.search);
const forName = (params.get('for') || '').trim().slice(0, 28);
if (forName) { nameInput.value = forName; gk.setCardName(forName); }
nameInput.addEventListener('input', () => gk.setCardName(nameInput.value.trim().slice(0, 28)));
function inviteLink() { const u = new URL(location.href); u.search = ''; const n = nameInput.value.trim(); if (n) u.searchParams.set('for', n); return u.toString(); }
copyBtn.addEventListener('click', async () => { const link = inviteLink(); try { await navigator.clipboard.writeText(link); copyBtn.textContent = 'Link copied'; } catch (e) { prompt('Copy this link', link); } setTimeout(() => { copyBtn.textContent = 'Copy the invitation link'; }, 2500); });
shareBtn.addEventListener('click', async () => { try { await navigator.share({ title: 'Gokulam, a midnight journey', text: 'You are invited to the night He was born.', url: inviteLink() }); } catch (e) {} });
function initGyro() {
  if (gyroRequested && S.gyroActive) return;
  gyroRequested = true;
  const DOE = window.DeviceOrientationEvent;
  if (!DOE) return;
  const startListening = () => {
    if (S.gyroActive) return;
    S.gyroActive = true;
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
  };
  if (typeof DOE.requestPermission === 'function') {
    DOE.requestPermission()
      .then(res => { if (res === 'granted') startListening(); })
      .catch(() => {});
  } else {
    startListening();
  }
}
const askGyro = initGyro;

function onDeviceOrientation(e) {
  if (e.beta == null || e.gamma == null) return;
  gk.setTilt(clamp(e.gamma / 30, -1, 1), clamp((e.beta - 45) / 35, -1, 1));

  const orient = (window.orientation || (screen.orientation && screen.orientation.angle) || 0);
  let pitchDeg, rollDeg;
  if (orient === 90) {
    pitchDeg = clamp(e.gamma, -85, 85);
    rollDeg = clamp(-(e.beta - 55), -45, 45);
  } else if (orient === -90 || orient === 270) {
    pitchDeg = clamp(-e.gamma, -85, 85);
    rollDeg = clamp(e.beta - 55, -45, 45);
  } else {
    pitchDeg = clamp(e.beta - 55, -85, 85);
    rollDeg = clamp(e.gamma, -45, 45);
  }

  targetGyroPitch = pitchDeg * (Math.PI / 180);
  targetGyroRoll = rollDeg * (Math.PI / 180) * 0.35;

  let heading = null;
  if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
    heading = -e.webkitCompassHeading;
  } else if (e.alpha !== null && e.alpha !== undefined) {
    heading = e.alpha;
  }

  if (heading !== null) {
    if (lastHeading === null) {
      lastHeading = heading;
    } else {
      let dh = heading - lastHeading;
      if (dh > 180) dh -= 360;
      else if (dh < -180) dh += 360;
      lastHeading = heading;
      targetGyroYaw += dh * (Math.PI / 180);
    }
  }
}

/* ───────────────────────── secrets ───────────────────────── */
function foundSecret(key, title, text) {
  if (S.secrets[key]) return; S.secrets[key] = true;
  card('A secret', title, text, 6500);
  if (sound.on) { const n = sound.ctx.currentTime; sound.bell(n, 1760, 0.3); sound.bell(n + 0.18, 2200, 0.25); sound.bell(n + 0.36, 2640, 0.2); }
  const found = Object.values(S.secrets).filter(Boolean).length;
  secretEl.textContent = `${found} of 3 secrets`; secretEl.classList.add('show'); setTimeout(() => secretEl.classList.remove('show'), 5000);
}
function tapWorld(ndc) {
  if (S.mode === 'cell' || S.mode === 'gate') {
    if (gk.rayHit(ndc, camera, [cell.flame])) { S.flare = 1.6; S.lampTaps++; if (sound.on) sound.bell(sound.ctx.currentTime, 2200, 0.15); if (S.lampTaps >= 3) foundSecret('lamp', 'The lamp', 'It has waited five thousand years for this night, and for you.'); }
    return;
  }
  if (S.mode !== 'river') return;
  if (S.chapter === 'river' || S.chapter === 'shore') {
    if (gk.rayHit(ndc, camera, [river.rohini])) foundSecret('star', 'Rohini', 'The star under which He was born. It has been pulsing for you all night.');
    else if (gk.rayHit(ndc, camera, [river.moon])) { foundSecret('moon', 'The Ashtami moon', 'Half lit, just risen. It rose with Him.'); if (sound.on) sound.conch(sound.ctx.currentTime + 0.5); }
  }
}

/* ───────────────────────── input ───────────────────────── */
const P = { down: false, sx: 0, sy: 0, lx: 0, ly: 0, moved: 0, mode: null };
let hotHole = -1, lastHole = -1;
let lastTapTime = 0;
const ndcV = new THREE.Vector3();
function fluteAt(nx, ny) {
  let best = -1, bd = 1e9;
  for (let i = 0; i < 8; i++) { const p = gk.holeNDC(i, camera, ndcV); if (p.z > 1) continue; const dx = (p.x - nx) * (innerWidth / innerHeight), dy = p.y - ny; const d = dx * dx + dy * dy * 0.35; if (d < bd) { bd = d; best = i; } }
  return bd < 0.5 ? best : -1;
}
function flutePointer(nx, ny, playing) {
  if (S.chapter !== 'flute') { hotHole = -1; return; }
  const h = fluteAt(nx, ny); hotHole = h; gk.setGuides(1, h);
  if (playing && h >= 0 && h !== lastHole) { lastHole = h; gk.playNote(h); S.notes++; S.idle = 0; }
  if (h < 0) lastHole = -1;
}
function tapAt(cx, cy) {
  const ndc = new THREE.Vector2((cx / innerWidth) * 2 - 1, 1 - (cy / innerHeight) * 2);
  if (S.chapter === 'lane' && S.mode === 'river') {
    if (gk.tapPot(ndc, camera)) { const left = gk.potsLeft(); setHint(left === 0 ? '' : left === 1 ? 'One pot left.' : `${['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][left]} pots remain.`); }
    return;
  }
  if (S.chapter === 'flute' && S.mode === 'river') { const h = fluteAt(ndc.x, ndc.y); if (h >= 0) { gk.playNote(h); S.notes++; S.idle = 0; } return; }
  tapWorld(ndc);
}
addEventListener('pointerdown', e => {
  P.down = true; P.sx = P.lx = e.clientX; P.sy = P.ly = e.clientY; P.moved = 0; P.mode = null; lastHole = -1;
  if (!gyroRequested) initGyro();
  if (e.pointerType === 'touch') {
    const now = performance.now();
    if (now - lastTapTime < 320) {
      targetGyroYaw = 0; S.gyroYaw = 0; S.yaw = 0; S.yawT = 0; S.pitch = 0; S.pitchT = 0;
    }
    lastTapTime = now;
  }
  if (e.pointerType !== 'touch' && S.chapter === 'flute') {
    const nx = (e.clientX / innerWidth) * 2 - 1, ny = 1 - (e.clientY / innerHeight) * 2;
    flutePointer(nx, ny, true);
  }
});
addEventListener('pointerup', e => {
  if (P.down && P.moved < 15 && !(e.pointerType !== 'touch' && S.chapter === 'flute')) tapAt(e.clientX, e.clientY);
  P.down = false; P.mode = null; lastHole = -1;
});
addEventListener('pointercancel', () => { P.down = false; P.mode = null; lastHole = -1; });
addEventListener('pointermove', e => {
  const nx = (e.clientX / innerWidth) * 2 - 1, ny = (e.clientY / innerHeight) * 2 - 1;
  if (!reducedMotion) spawnTrail(e.clientX, e.clientY);
  S.windT.set(0.15 + nx * 0.45, ny * 0.15);
  if (S.chapter === 'card' || S.chapter === 'end') gk.setTilt(nx, -ny);
  if (S.chapter === 'lane' && S.mode === 'river') gk.hoverPot(new THREE.Vector2(nx, -ny), camera);

  if (e.pointerType === 'touch') {
    if (!P.down) return;
    const dx = e.clientX - P.lx, dy = e.clientY - P.ly;
    P.lx = e.clientX; P.ly = e.clientY;
    P.moved += Math.hypot(dx, dy);

    if (S.chapter === 'flute' && S.locked) { flutePointer(nx, -ny, true); return; }

    if (S.mode === 'cell' || S.mode === 'gate') {
      S.yawT = clamp(S.yawT - dx * 0.003, -1.8, 1.8);
      S.pitchT = clamp(S.pitchT - dy * 0.002, -0.8, 0.8);
      return;
    }

    const absX = Math.abs(dx), absY = Math.abs(dy);
    // Vertical swipe: swipe up moves forward, swipe down steps backward
    if (absY > absX * 0.6) {
      advance(-dy * 0.022);
    }
    // Horizontal swipe: swipe right steers right, swipe left steers left
    if (absX > absY * 0.6) {
      steer(dx * 0.015);
    }

    if (!S.gyroActive) {
      S.yawT = clamp(S.yawT - dx * 0.002, -1.2, 1.2);
      S.pitchT = clamp(S.pitchT - dy * 0.0015, -0.6, 0.6);
    }
  } else {
    S.yawT = -nx * 0.42; S.pitchT = -ny * 0.22;
    flutePointer(nx, -ny, true);
  }
});
addEventListener('wheel', e => {
  e.preventDefault();
  // Scroll down -> forward, Scroll up -> backward
  if (Math.abs(e.deltaY) > 0.5) {
    advance(clamp(e.deltaY, -120, 120) * 0.038);
  }
  // Scroll right -> steer right, Scroll left -> steer left
  if (Math.abs(e.deltaX) > 1.5) {
    steer(clamp(e.deltaX, -100, 100) * 0.038);
  }
}, { passive: false });
addEventListener('touchmove', e => e.preventDefault(), { passive: false });
addEventListener('keydown', e => {
  if (e.target === nameInput) return;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
    if (S.mode === 'gate') enterBtn.click();
    else advance(4.5);
    e.preventDefault();
  } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
    advance(-4.5);
    e.preventDefault();
  } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
    steer(-3.8);
    e.preventDefault();
  } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
    steer(3.8);
    e.preventDefault();
  } else if (e.key === ' ' || e.key === 'PageDown') {
    if (S.mode === 'gate') enterBtn.click();
    else advance(4.5);
    e.preventDefault();
  } else if (e.key === 'PageUp') {
    advance(-4.5);
    e.preventDefault();
  } else if (e.key === 'm' || e.key === 'M') {
    toggleSound();
  } else if (e.key >= '1' && e.key <= '8' && S.chapter === 'flute') {
    gk.playNote(+e.key - 1); S.notes++; S.idle = 0;
  } else if (e.key === 'Enter') {
    if (S.mode === 'gate') enterBtn.click();
    else if (S.mode === 'cell') startBirth();
  }
});
function toggleSound() { if (!sound.on) return; sound.setMuted(!sound.muted); soundBtn.classList.toggle('muted', sound.muted); }
soundBtn.addEventListener('click', toggleSound);
soundBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSound(); } });
document.addEventListener('visibilitychange', () => { if (!sound.on) return; if (document.hidden) sound.setMuted(true); else if (!soundBtn.classList.contains('muted')) sound.setMuted(false); });

/* ───────────────────────── peacock cursor trail ───────────────────────── */
const fx = $('#fx'), fctx = fx.getContext('2d'); let fxScale = 1; const parts = [];
function spawnTrail(x, y) { if (parts.length > 220) return; for (let i = 0; i < 2; i++) parts.push({ x, y, vx: rand(-0.5, 0.5), vy: rand(-0.7, 0.2), life: 1, r: rand(1.4, 3.2), c: Math.random() < 0.6 ? '47,181,159' : '229,181,103' }); }
function drawTrail(dt) {
  fctx.clearRect(0, 0, fx.width, fx.height); if (!parts.length) return;
  fctx.globalCompositeOperation = 'lighter';
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt * 1.3; if (p.life <= 0) { parts.splice(i, 1); continue; }
    p.x += p.vx; p.y += p.vy; p.vy -= 0.015;
    const a = p.life * p.life * 0.85, r = p.r * (0.5 + p.life) * fxScale * 3, X = p.x * fxScale, Y = p.y * fxScale;
    const g = fctx.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, `rgba(${p.c},${a})`); g.addColorStop(1, `rgba(${p.c},0)`);
    fctx.fillStyle = g; fctx.beginPath(); fctx.arc(X, Y, r, 0, Math.PI * 2); fctx.fill();
  }
  fctx.globalCompositeOperation = 'source-over';
}

/* ───────────────────────── resize + loop ───────────────────────── */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 72 : 58; camera.updateProjectionMatrix();
  const size = renderer.getDrawingBufferSize(new THREE.Vector2()); post.setSize(size.x, size.y);
  fxScale = Math.min(Q.dpr, 2); fx.width = w * fxScale; fx.height = h * fxScale;
}
addEventListener('resize', resize); resize();

function update(dt) {
  S.time += dt; S.modeT += dt;
  S.wind.lerp(S.windT, Math.min(1, dt * 1.5));
  S.flare *= Math.exp(-dt * 2.2);
  updateFlash(dt);
  if (S.mode === 'gate') { const a = S.time * 0.13; cam.pos.set(1.4 + Math.cos(a) * 1.15, 0.62 + Math.sin(S.time * 0.4) * 0.05, 1.5 + Math.sin(a) * 1.15); cam.tgt.copy(GATE_TGT); S.diyaI = 1 + S.flare; }
  else if (S.mode === 'cell') { updateCountdown(); S.diyaI = 1 + S.flare; }
  else if (S.mode === 'birth') updateBirth(dt);
  else updateRiver(dt);
  updateCam(dt);
  sound.update();
  if (S.mode === 'gate' || S.mode === 'cell' || S.mode === 'birth') cell.update(dt, S, camera);
  else river.update(dt, S, camera);
}
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt);
  post.comp.uniforms.uWhite.value = S.white; post.comp.uniforms.uExposure.value = S.exposure;
  post.render((S.mode === 'gate' || S.mode === 'cell' || S.mode === 'birth') ? cell.scene : river.scene, camera, S.time);
  drawTrail(dt);
}
window.gokulam = { S, startBirth, startRiver, river, gk, cell, camera, advance, walkTo, travelToStation, lookForward: () => lookForward, turnAround: () => { lookForward = !lookForward; }, sound, post, STATIONS, MILESTONES, setChapter, tAtZ, lightLamps, hdr: post.hdr, mobile: isMobile, gyro: () => S.gyroActive, recenter: () => { targetGyroYaw = 0; S.gyroYaw = 0; S.yaw = 0; S.yawT = 0; S.pitch = 0; S.pitchT = 0; }, ff: sec => { for (let i = 0; i < sec / 0.05; i++) update(0.05); } };
window.__gokulamReady = true;
requestAnimationFrame(frame);
