import * as THREE from 'three';

/* ───────────────────────── utilities ───────────────────────── */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeInOut = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

const isMobile = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const qParam = new URLSearchParams(location.search).get('q');
const lowQ = qParam === 'low' || (qParam !== 'high' && isMobile);
const Q = {
  dpr: Math.min(window.devicePixelRatio || 1, lowQ ? 1.5 : 2),
  waterSeg: lowQ ? 100 : 200,
  rain: lowQ ? 1200 : 3000,
  stars: lowQ ? 1200 : 2400,
  rays: !lowQ,
  bloomScale: lowQ ? 0.25 : 0.5,
  clouds: lowQ ? 7 : 12,
};

/* ───────────────────────── GLSL ───────────────────────── */
const NOISE = `
float hash21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise2(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f); float a=hash21(i); float b=hash21(i+vec2(1.0,0.0)); float c=hash21(i+vec2(0.0,1.0)); float d=hash21(i+vec2(1.0,1.0)); return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<4;i++){ v+=a*noise2(p); p*=2.03; a*=0.5; } return v; }
`;

const VS_UV = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const VS_QUAD = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.0,1.0); }`;

const STONE_VS = `
varying vec3 vPos; varying vec3 vNormal;
void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vPos = wp.xyz; vNormal = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*wp; }`;

const STONE_FS = `
uniform vec3 uDiya; uniform float uDiyaI; uniform vec3 uBirth; uniform float uBirthI; uniform float uFlash; uniform vec3 uWinDir; uniform float uTime;
varying vec3 vPos; varying vec3 vNormal;
${NOISE}
void main(){
  vec3 N = normalize(vNormal);
  vec3 an = abs(N);
  vec2 uv = an.y > 0.5 ? vPos.xz : (an.x > 0.5 ? vPos.zy : vPos.xy);
  float rowH = 0.52; float brickW = 1.15;
  float row = floor(uv.y / rowH);
  float off = mod(row, 2.0) * 0.5 * brickW;
  vec2 b = vec2(mod(uv.x + off, brickW), mod(uv.y, rowH));
  float mortar = smoothstep(0.0,0.05,b.x)*smoothstep(brickW,brickW-0.05,b.x)*smoothstep(0.0,0.045,b.y)*smoothstep(rowH,rowH-0.045,b.y);
  vec2 id = vec2(floor((uv.x+off)/brickW), row) + floor(an*3.0).xy;
  float shade = 0.7 + 0.6*hash21(id);
  float grain = fbm(uv*3.5) ;
  float crack = smoothstep(0.66,0.70,fbm(uv*9.0+id)) * 0.18;
  vec3 albedo = vec3(0.34,0.30,0.27) * shade * (0.65 + 0.55*grain) * (1.0-crack);
  albedo = mix(vec3(0.10,0.09,0.085), albedo, mortar);
  vec3 col = albedo * vec3(0.10,0.13,0.22) * 0.30;
  col += albedo * vec3(0.45,0.55,0.85) * 0.06 * max(dot(N,-uWinDir),0.0);
  vec3 L = uDiya - vPos; float d = length(L); L /= d;
  col += albedo * vec3(1.0,0.62,0.30) * max(dot(N,L),0.0) * uDiyaI / (1.0 + d*d*0.16);
  vec3 Lb = uBirth - vPos; float db = length(Lb); Lb /= db;
  col += albedo * vec3(1.0,0.86,0.62) * (max(dot(N,Lb),0.0)*0.8+0.2) * uBirthI / (1.0 + db*db*0.3);
  vec3 back = -uWinDir;
  float tt = (5.0 - vPos.x) / max(back.x, 0.001);
  vec3 Qp = vPos + back*tt;
  float inWin = step(0.0,tt)*step(3.0,Qp.y)*step(Qp.y,4.2)*step(-1.0,Qp.z)*step(Qp.z,1.0);
  float bars = 1.0 - clamp(step(abs(Qp.z+0.5),0.05)+step(abs(Qp.z),0.05)+step(abs(Qp.z-0.5),0.05), 0.0, 1.0);
  float win = inWin * bars * max(dot(N,-uWinDir),0.0);
  col += albedo * vec3(0.62,0.72,1.0) * uFlash * (win*2.6 + 0.14);
  gl_FragColor = vec4(col,1.0);
}`;

const FLAME_FS = `
uniform float uTime; uniform float uI; varying vec2 vUv;
${NOISE}
void main(){
  vec2 uv = vUv; float t = uTime;
  float n = fbm(vec2(uv.x*3.0, uv.y*3.2 - t*2.6)) - 0.5;
  float x = (uv.x - 0.5) + n*0.38*uv.y;
  float w = 0.26*pow(1.0-uv.y,0.7)*(0.85+0.4*(1.0-uv.y)) + 0.01;
  float body = 1.0 - smoothstep(0.0, w, abs(x));
  body *= smoothstep(0.0,0.08,uv.y) * (1.0 - smoothstep(0.55,1.0,uv.y + n*0.3));
  float core = 1.0 - smoothstep(0.0, w*0.42, abs(x)); core *= smoothstep(0.05,0.2,uv.y)*(1.0-smoothstep(0.3,0.75,uv.y));
  vec3 col = mix(vec3(1.0,0.33,0.04), vec3(1.0,0.78,0.30), core) * body;
  col += vec3(0.18,0.38,1.0) * (1.0-smoothstep(0.0,0.18,uv.y)) * body * 0.9;
  col *= uI * 2.4;
  gl_FragColor = vec4(col, body);
}`;

const WIN_FS = `
uniform float uFlash; varying vec2 vUv;
void main(){ vec3 sky = mix(vec3(0.025,0.035,0.10), vec3(0.08,0.10,0.21), vUv.y); sky += uFlash*vec3(1.5,1.6,2.0); gl_FragColor = vec4(sky,1.0); }`;

const SKY_VS = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const SKY_FS = `
uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGround; uniform vec3 uMoonDir; uniform float uFlash; uniform float uDawn; uniform vec3 uSunDir; uniform float uSunI; uniform float uMoonI;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 sky = mix(uHorizon, uZenith, pow(clamp(h,0.0,1.0),0.5));
  sky = mix(uGround, sky, smoothstep(-0.04,0.02,h));
  float m = max(dot(d,uMoonDir),0.0);
  sky += uMoonI * vec3(0.80,0.86,1.0) * (pow(m,120.0)*0.7 + pow(m,10.0)*0.09);
  float su = max(dot(d,uSunDir),0.0);
  sky += uSunI * vec3(1.0,0.58,0.28) * (pow(su,1200.0)*3.5 + pow(su,18.0)*0.22 + pow(su,2.0)*0.11);
  float band = pow(clamp(1.0 - h*4.0,0.0,1.0),3.0) * step(0.0,h);
  float toSun = max(dot(normalize(vec3(d.x,0.0,d.z)), normalize(vec3(uSunDir.x,0.0,uSunDir.z))),0.0);
  sky += uDawn * vec3(1.0,0.5,0.22) * band * (0.35 + 0.65*toSun*toSun);
  sky += uFlash * vec3(0.5,0.58,0.85) * (0.3 + 0.7*pow(clamp(1.0-h,0.0,1.0),2.0));
  gl_FragColor = vec4(sky,1.0);
}`;

const STAR_VS = `
attribute float aSize; attribute float aPhase; uniform float uTime; uniform float uPixelRatio; varying float vA;
void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); float tw = 0.6 + 0.4*sin(uTime*(1.2+aPhase*2.5) + aPhase*40.0); vA = tw; gl_PointSize = aSize*uPixelRatio*(0.7+0.3*tw); gl_Position = projectionMatrix*mv; }`;
const STAR_FS = `
uniform float uOpacity; uniform vec3 uColor; varying float vA;
void main(){ vec2 c = gl_PointCoord-0.5; float d = length(c); float a = smoothstep(0.5,0.0,d); a = a*a; float k = a*vA*uOpacity; gl_FragColor = vec4(uColor*k, k); }`;

const MOON_VS = `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix)*normal); vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const MOON_FS = `
uniform vec3 uLit; varying vec3 vN; varying vec3 vP;
${NOISE}
void main(){ float lit = smoothstep(-0.08,0.12,dot(normalize(vN),uLit)); float cr = 0.82 + 0.34*fbm(vP.xy*0.55 + vP.z*0.31); vec3 col = mix(vec3(0.012,0.014,0.03), vec3(1.75,1.8,1.95)*cr, lit); gl_FragColor = vec4(col,1.0); }`;

const WATER_VS = `
uniform float uTime; uniform vec3 uBasket; uniform float uRise; uniform float uStorm; uniform vec2 uWind;
varying vec3 vPos; varying vec3 vNormal; varying float vCrest;
vec3 gerstner(vec2 p, float t){
  vec3 d = vec3(0.0);
  vec2 dirs[4]; dirs[0]=normalize(vec2(1.0,0.35)); dirs[1]=normalize(vec2(-0.6,1.0)); dirs[2]=normalize(vec2(0.4,-1.0)); dirs[3]=normalize(vec2(-1.0,-0.25));
  float wl[4]; wl[0]=15.0; wl[1]=8.5; wl[2]=4.6; wl[3]=2.3;
  float st[4]; st[0]=0.085; st[1]=0.08; st[2]=0.075; st[3]=0.06;
  float sp = 0.75 + 0.35*uStorm + 0.25*abs(uWind.x);
  for(int i=0;i<4;i++){
    float k = 6.28318/wl[i]; float c = sqrt(9.8/k); float a = st[i]/k * (0.55 + 0.75*uStorm);
    float f = k*(dot(dirs[i],p) - c*t*sp);
    d.x += dirs[i].x*a*cos(f); d.z += dirs[i].y*a*cos(f); d.y += a*sin(f);
  }
  return d;
}
float rise(vec2 p, float t){ return uRise * smoothstep(5.5,0.0,distance(p,uBasket.xz)) * (0.8 + 0.2*sin(t*2.1)); }
void main(){
  vec2 xz = (modelMatrix * vec4(position, 1.0)).xz; float e = 0.4;
  vec3 P  = vec3(xz.x,0.0,xz.y)   + gerstner(xz,uTime)                + vec3(0.0,rise(xz,uTime),0.0);
  vec3 PX = vec3(xz.x+e,0.0,xz.y) + gerstner(xz+vec2(e,0.0),uTime)   + vec3(0.0,rise(xz+vec2(e,0.0),uTime),0.0);
  vec3 PZ = vec3(xz.x,0.0,xz.y+e) + gerstner(xz+vec2(0.0,e),uTime)   + vec3(0.0,rise(xz+vec2(0.0,e),uTime),0.0);
  vec3 n = normalize(cross(PZ-P, PX-P));
  vec4 wp = vec4(P,1.0);
  vPos = wp.xyz; vNormal = n; vCrest = P.y;
  gl_Position = projectionMatrix*viewMatrix*wp;
}`;
const WATER_FS = `
uniform float uTime; uniform float uFlash; uniform float uRain; uniform float uDawn;
uniform vec3 uMoonDir; uniform vec3 uMoonColor; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFog;
uniform vec3 uBasket; uniform vec3 uGlow; uniform float uGlowI; uniform float uFogDen; uniform vec3 uCam;
varying vec3 vPos; varying vec3 vNormal; varying float vCrest;
${NOISE}
void main(){
  vec3 N = normalize(vNormal);
  float rip = (noise2(vPos.xz*6.0 + uTime*3.0)-0.5) + (noise2(vPos.xz*11.0 - uTime*4.2)-0.5);
  N = normalize(N + vec3(rip,0.0,rip*0.8)*0.14*uRain);
  vec3 V = normalize(uCam - vPos);
  float fres = pow(1.0 - max(dot(N,V),0.0), 3.0);
  vec3 base = mix(uDeep, uShallow, smoothstep(-0.35,0.45,vCrest));
  vec3 H = normalize(uMoonDir + V);
  float ndh = max(dot(N,H),0.0);
  float spec = pow(ndh,220.0)*2.8 + pow(ndh,28.0)*0.16;
  vec3 col = base + uMoonColor*spec*(0.85 + uFlash*2.5);
  vec3 skyRef = mix(uFog, vec3(0.22,0.28,0.48), 0.5) * (0.28 + uFlash*2.2);
  col = mix(col, skyRef, fres*0.5);
  vec3 Lg = uBasket - vPos; float dg = length(Lg); Lg /= dg;
  vec3 Hg = normalize(Lg + V);
  float gspec = pow(max(dot(N,Hg),0.0),70.0);
  float gdiff = max(dot(N,Lg),0.0);
  float att = uGlowI / (1.0 + dg*dg*0.09);
  col += uGlow * (gspec*3.2 + gdiff*0.35) * att;
  col += uFlash * vec3(0.22,0.26,0.4) * (0.3 + 0.7*max(N.y,0.0));
  float foam = smoothstep(0.28,0.55,vCrest) * (0.35 + 0.65*noise2(vPos.xz*3.0 + uTime));
  col = mix(col, vec3(0.55,0.62,0.72), foam*0.16);
  col += uDawn * vec3(0.95,0.45,0.2) * fres * 0.55;
  float dd = distance(uCam,vPos)*uFogDen;
  col = mix(col, uFog, 1.0 - exp(-dd*dd));
  gl_FragColor = vec4(col,1.0);
}`;

const RAIN_VS = `
attribute vec3 aSeed; attribute float aEnd;
uniform float uTime; uniform vec3 uCenter; uniform vec3 uBox; uniform vec2 uWind; uniform float uSpeed; uniform vec3 uBasket; uniform float uPart; uniform float uLen;
varying float vA;
void main(){
  float sp = uSpeed*(0.7+0.6*aSeed.y);
  float y = mod(aSeed.y*uBox.y - uTime*sp, uBox.y);
  float x = mod(aSeed.x*uBox.x + uWind.x*uTime*sp*0.45 + 4000.0, uBox.x);
  float z = mod(aSeed.z*uBox.z + uWind.y*uTime*sp*0.45 + 4000.0, uBox.z);
  vec3 p = uCenter + vec3(x,y,z) - uBox*0.5;
  vec2 rel = p.xz - uBasket.xz; float r = length(rel); float R = 3.6;
  float inside = step(r,R) * step(p.y, uBasket.y+3.2) * step(uBasket.y-1.5, p.y);
  p.xz += normalize(rel + vec2(0.001,0.0)) * (R - r + 0.4) * inside * uPart;
  vec3 dir = normalize(vec3(uWind.x*0.45, -1.0, uWind.y*0.45));
  p += dir * uLen * aEnd;
  vA = 0.3 + 0.7*aSeed.x;
  gl_Position = projectionMatrix*viewMatrix*vec4(p,1.0);
}`;
const RAIN_FS = `uniform float uOpacity; uniform vec3 uColor; varying float vA; void main(){ float k = vA*uOpacity; gl_FragColor = vec4(uColor*k, k); }`;

const BRIGHT_FS = `
uniform sampler2D tDiffuse; uniform float uThreshold; varying vec2 vUv;
void main(){ vec3 c = texture2D(tDiffuse,vUv).rgb; float l = dot(c,vec3(0.2126,0.7152,0.0722)); float m = smoothstep(uThreshold, uThreshold+0.7, l); gl_FragColor = vec4(c*m,1.0); }`;
const BLUR_FS = `
uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv;
void main(){ float w[5]; w[0]=0.227027; w[1]=0.1945946; w[2]=0.1216216; w[3]=0.054054; w[4]=0.016216;
  vec3 s = texture2D(tDiffuse,vUv).rgb*w[0];
  for(int i=1;i<5;i++){ vec2 o = uDir*float(i); s += texture2D(tDiffuse,vUv+o).rgb*w[i]; s += texture2D(tDiffuse,vUv-o).rgb*w[i]; }
  gl_FragColor = vec4(s,1.0); }`;
const RAYS_FS = `
uniform sampler2D tDiffuse; uniform vec2 uLight; uniform float uDensity; uniform float uDecay; uniform float uWeight; varying vec2 vUv;
void main(){ vec2 d = (vUv - uLight) * (uDensity/32.0); vec2 p = vUv; float il = 1.0; vec3 c = vec3(0.0);
  for(int i=0;i<32;i++){ p -= d; c += texture2D(tDiffuse,p).rgb*il*uWeight; il *= uDecay; }
  gl_FragColor = vec4(c,1.0); }`;
const COMP_FS = `
uniform sampler2D tScene; uniform sampler2D tBloom; uniform sampler2D tRays;
uniform float uBloom; uniform float uRays; uniform float uExposure; uniform float uTime; uniform float uWhite; uniform float uGrain; uniform float uAberr; uniform vec2 uRes;
varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
void main(){
  vec2 uv = vUv; vec2 cc = uv-0.5; float r2 = dot(cc,cc);
  vec2 ab = cc*r2*uAberr*0.02;
  vec3 col; col.r = texture2D(tScene,uv+ab).r; col.g = texture2D(tScene,uv).g; col.b = texture2D(tScene,uv-ab).b;
  col += texture2D(tBloom,uv).rgb*uBloom;
  col += texture2D(tRays,uv).rgb*uRays;
  col *= uExposure;
  col = aces(col);
  col *= mix(1.0, 0.42, smoothstep(0.1,0.58,r2));
  col += (hash(uv*uRes + fract(uTime)*7.0)-0.5)*uGrain;
  col = mix(col, vec3(1.0), uWhite);
  col = pow(max(col,0.0), vec3(1.0/2.2));
  gl_FragColor = vec4(col,1.0);
}`;

/* ───────────────────────── post-processing ───────────────────────── */
class Post {
  constructor(renderer) {
    this.r = renderer;
    const hasHalf = renderer.capabilities.isWebGL2 && (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
    this.hdr = hasHalf;
    const type = hasHalf ? THREE.HalfFloatType : THREE.UnsignedByteType;
    const mk = depth => new THREE.WebGLRenderTarget(2, 2, { type, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: depth, stencilBuffer: false, generateMipmaps: false });
    this.rtScene = mk(true); this.rtA = mk(false); this.rtB = mk(false); this.rtRays = mk(false);
    this.quadScene = new THREE.Scene();
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial());
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
    const mat = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VS_QUAD, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    this.bright = mat(BRIGHT_FS, { tDiffuse: { value: null }, uThreshold: { value: hasHalf ? 1.0 : 0.6 } });
    this.blur = mat(BLUR_FS, { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.rays = mat(RAYS_FS, { tDiffuse: { value: null }, uLight: { value: new THREE.Vector2(0.5, 0.5) }, uDensity: { value: 0.92 }, uDecay: { value: 0.955 }, uWeight: { value: 0.045 } });
    this.comp = mat(COMP_FS, { tScene: { value: null }, tBloom: { value: null }, tRays: { value: null }, uBloom: { value: hasHalf ? 0.75 : 0.9 }, uRays: { value: 0 }, uExposure: { value: 1 }, uWhite: { value: 0 }, uGrain: { value: 0.03 }, uAberr: { value: 0.6 }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } });
    this.rayStrength = 0;
    this.lightPos = new THREE.Vector3();
    this._p = new THREE.Vector3();
  }
  setSize(w, h) {
    const s = Q.bloomScale;
    this.rtScene.setSize(w, h);
    this.rtA.setSize(Math.max(2, (w * s) | 0), Math.max(2, (h * s) | 0));
    this.rtB.setSize(Math.max(2, (w * s) | 0), Math.max(2, (h * s) | 0));
    this.rtRays.setSize(Math.max(2, (w * 0.5) | 0), Math.max(2, (h * 0.5) | 0));
    this.comp.uniforms.uRes.value.set(w, h);
    for (const rt of [this.rtScene, this.rtA, this.rtB, this.rtRays]) { this.r.setRenderTarget(rt); this.r.clear(); }
    this.r.setRenderTarget(null);
  }
  pass(mat, target) { this.quad.material = mat; this.r.setRenderTarget(target); this.r.render(this.quadScene, this.quadCam); }
  render(scene, camera, t) {
    const r = this.r;
    r.setRenderTarget(this.rtScene); r.clear(); r.render(scene, camera);
    this.bright.uniforms.tDiffuse.value = this.rtScene.texture; this.pass(this.bright, this.rtA);
    const bw = this.rtA.width, bh = this.rtA.height, bu = this.blur.uniforms;
    bu.tDiffuse.value = this.rtA.texture; bu.uDir.value.set(1.5 / bw, 0); this.pass(this.blur, this.rtB);
    bu.tDiffuse.value = this.rtB.texture; bu.uDir.value.set(0, 1.5 / bh); this.pass(this.blur, this.rtA);
    bu.tDiffuse.value = this.rtA.texture; bu.uDir.value.set(3.4 / bw, 0); this.pass(this.blur, this.rtB);
    bu.tDiffuse.value = this.rtB.texture; bu.uDir.value.set(0, 3.4 / bh); this.pass(this.blur, this.rtA);
    let rayAmt = 0;
    if (Q.rays && this.rayStrength > 0.002) {
      const p = this._p.copy(this.lightPos).project(camera);
      if (p.z < 1) {
        this.rays.uniforms.uLight.value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5);
        this.rays.uniforms.tDiffuse.value = this.rtA.texture;
        this.pass(this.rays, this.rtRays);
        rayAmt = this.rayStrength * clamp(1.25 - Math.hypot(p.x, p.y) * 0.55, 0, 1);
      }
    }
    const u = this.comp.uniforms;
    u.tScene.value = this.rtScene.texture; u.tBloom.value = this.rtA.texture; u.tRays.value = this.rtRays.texture; u.uRays.value = rayAmt; u.uTime.value = t;
    this.pass(this.comp, null);
  }
}

/* ───────────────────────── sound engine (fully procedural) ───────────────────────── */
class Sound {
  constructor() { this.ctx = null; this.on = false; this.muted = false; this.layers = {}; this.bus = {}; this.tanpuraOn = false; this.heart = false; this.strings = [220.0, 146.83, 146.83, 73.42]; this.si = 0; this.nextPluck = 0; this.nextBeat = 0; this.level = 0.72; this.birdsOn = false; this.nextBird = 0; this.dholOn = false; this.dholVol = 0.4; this.nextDhol = 0; this.dholStep = 0; this.dholPattern = ['dha', '', 'tin', 'tin', 'dha', '', 'tin', 'dha', 'dha', '', 'tin', 'tin', 'dha', 'tin', '', 'tin']; }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.ctx = new AC();
    if (c.state === 'suspended') c.resume();
    this.master = c.createGain(); this.master.gain.value = 0;
    this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -16; this.comp.ratio.value = 4; this.comp.attack.value = 0.01; this.comp.release.value = 0.3;
    this.master.connect(this.comp); this.comp.connect(c.destination);
    this.verb = c.createConvolver(); this.verb.buffer = this.makeIR(3.4, 2.4);
    this.verbOut = c.createGain(); this.verbOut.gain.value = 0.45; this.verb.connect(this.verbOut); this.verbOut.connect(this.master);
    this.noise = this.makeNoise(3);
    this.mkBus('amb', 0.06); this.mkBus('tanpura', 0.35); this.mkBus('fx', 0.22); this.mkBus('fxVerb', 0.7);
    this.buildAmbience();
    this.nextPluck = c.currentTime + 0.5; this.nextBeat = c.currentTime;
    this.on = true;
    this.master.gain.linearRampToValueAtTime(this.level, c.currentTime + 2.5);
  }
  mkBus(name, send) { const g = this.ctx.createGain(); g.connect(this.master); if (send > 0) { const s = this.ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(this.verb); } this.bus[name] = g; return g; }
  makeNoise(sec) { const c = this.ctx; const n = (sec * c.sampleRate) | 0; const b = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; } return b; }
  makeIR(sec, decay) { const c = this.ctx; const n = (sec * c.sampleRate) | 0; const b = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  noiseSrc() { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true; s.start(); return s; }
  layer(name, node) { const g = this.ctx.createGain(); g.gain.value = 0; node.connect(g); g.connect(this.bus.amb); this.layers[name] = g; return g; }
  set(name, v, t = 1.5) { const g = this.layers[name]; if (!g) return; const now = this.ctx.currentTime; g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(v, now + t); }
  setSmooth(name, v) { const g = this.layers[name]; if (!g) return; g.gain.setTargetAtTime(v, this.ctx.currentTime, 0.4); }
  setMuted(m) { this.muted = m; if (!this.on) return; const now = this.ctx.currentTime; this.master.gain.cancelScheduledValues(now); this.master.gain.setValueAtTime(this.master.gain.value, now); this.master.gain.linearRampToValueAtTime(m ? 0 : this.level, now + 0.6); }
  buildAmbience() {
    const c = this.ctx;
    const rn = this.noiseSrc(); const rf = c.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 1100; rf.Q.value = 0.5; const rf2 = c.createBiquadFilter(); rf2.type = 'highpass'; rf2.frequency.value = 320; rn.connect(rf); rf.connect(rf2); this.rainFilter = rf; this.layer('rain', rf2);
    const wn = this.noiseSrc(); const wf = c.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = 0.9; wn.connect(wf); const wl = c.createOscillator(); wl.frequency.value = 0.09; const wlg = c.createGain(); wlg.gain.value = 260; wl.connect(wlg); wlg.connect(wf.frequency); wl.start(); this.layer('wind', wf);
    const ln = this.noiseSrc(); const lf = c.createBiquadFilter(); lf.type = 'lowpass'; lf.frequency.value = 380; ln.connect(lf); const lg = c.createGain(); lg.gain.value = 0.55; lf.connect(lg); const ll = c.createOscillator(); ll.frequency.value = 0.23; const llg = c.createGain(); llg.gain.value = 0.4; ll.connect(llg); llg.connect(lg.gain); ll.start(); this.layer('water', lg);
    const cn = this.noiseSrc(); const cf = c.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 4300; cf.Q.value = 16; cn.connect(cf);
    const g1 = c.createGain(); g1.gain.value = 0.5; const l1 = c.createOscillator(); l1.type = 'square'; l1.frequency.value = 19; const l1g = c.createGain(); l1g.gain.value = 0.5; l1.connect(l1g); l1g.connect(g1.gain); l1.start();
    const g2 = c.createGain(); g2.gain.value = 0.55; const l2 = c.createOscillator(); l2.frequency.value = 0.62; const l2g = c.createGain(); l2g.gain.value = 0.45; l2.connect(l2g); l2g.connect(g2.gain); l2.start();
    cf.connect(g1); g1.connect(g2); this.layer('crickets', g2);
    const tg = c.createGain(); tg.gain.value = 0; tg.connect(this.bus.tanpura); this.layers.tanpura = tg;
  }
  pluck(freq, when) {
    const c = this.ctx; const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = rand(-4, 4);
    const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(freq * 9, when); f.frequency.exponentialRampToValueAtTime(freq * 1.6, when + 3.6);
    const g = c.createGain(); g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(0.5, when + 0.02); g.gain.exponentialRampToValueAtTime(0.001, when + 4.2);
    const g2 = c.createGain(); g2.gain.value = 0.22;
    o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(this.layers.tanpura);
    o.start(when); o2.start(when); o.stop(when + 4.3); o2.stop(when + 4.3);
  }
  beat(when) {
    const c = this.ctx; const mk = (t, f0, v) => { const o = c.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.22); const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(this.bus.fx); o.start(t); o.stop(t + 0.32); };
    mk(when, 72, 0.9); mk(when + 0.33, 62, 0.6);
  }
  thunder(delay = 0, power = 1) {
    const c = this.ctx, t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(380 * power + 90, t); f.frequency.exponentialRampToValueAtTime(42, t + 3.6);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.1 * power, t + 0.09); g.gain.exponentialRampToValueAtTime(0.4 * power, t + 0.9); g.gain.exponentialRampToValueAtTime(0.001, t + 4.6);
    s.connect(f); f.connect(g); g.connect(this.bus.fxVerb); s.start(t); s.stop(t + 4.7);
    const o = c.createOscillator(); o.frequency.setValueAtTime(56, t); o.frequency.exponentialRampToValueAtTime(27, t + 2.6); const og = c.createGain(); og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.85 * power, t + 0.12); og.gain.exponentialRampToValueAtTime(0.001, t + 2.9); o.connect(og); og.connect(this.bus.fx); o.start(t); o.stop(t + 3);
  }
  ping(t0, f, dur, vol, ratio = 1.41) {
    const c = this.ctx; const o = c.createOscillator(); o.frequency.value = f; const m = c.createOscillator(); m.frequency.value = f * ratio; const mg = c.createGain(); mg.gain.setValueAtTime(f * 2.2, t0); mg.gain.exponentialRampToValueAtTime(1, t0 + dur); m.connect(mg); mg.connect(o.frequency);
    const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur); o.connect(g); g.connect(this.bus.fxVerb);
    o.start(t0); m.start(t0); o.stop(t0 + dur + 0.05); m.stop(t0 + dur + 0.05);
  }
  chains() { const t = this.ctx.currentTime; this.ping(t, 520, 1.5, 0.8); this.ping(t + 0.02, 790, 1.0, 0.5, 1.7); for (let i = 0; i < 16; i++) this.ping(t + 0.15 + i * 0.075 + Math.random() * 0.05, 900 + Math.random() * 1900, 0.22 + Math.random() * 0.35, 0.16, 1.3 + Math.random()); }
  bell(t0, f = 880, vol = 0.6) {
    const c = this.ctx; const o = c.createOscillator(); o.frequency.value = f; const m = c.createOscillator(); m.frequency.value = f * 1.4; const mg = c.createGain(); mg.gain.setValueAtTime(f * 1.2, t0); mg.gain.exponentialRampToValueAtTime(f * 0.05, t0 + 3); m.connect(mg); mg.connect(o.frequency);
    const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t0 + 4.2); o.connect(g); g.connect(this.bus.fxVerb);
    o.start(t0); m.start(t0); o.stop(t0 + 4.3); m.stop(t0 + 4.3);
  }
  drone() {
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.34, t + 7); g.gain.setValueAtTime(0.34, t + 12); g.gain.linearRampToValueAtTime(0, t + 17.5);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(3600, t + 9);
    f.connect(g); g.connect(this.bus.fxVerb);
    [[146.83, 'sawtooth', -5], [146.83, 'sawtooth', 5], [220, 'triangle', 0], [293.66, 'sine', 3], [73.42, 'sine', 0], [440, 'sine', -3]].forEach(([fr, ty, de]) => { const o = c.createOscillator(); o.type = ty; o.frequency.value = fr; o.detune.value = de; const og = c.createGain(); og.gain.value = ty === 'sawtooth' ? 0.22 : 0.5; o.connect(og); og.connect(f); o.start(t); o.stop(t + 18); });
  }
  conch(t0) {
    const c = this.ctx; const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(238, t0); o.frequency.linearRampToValueAtTime(262, t0 + 0.7);
    const v = c.createOscillator(); v.frequency.value = 5.2; const vg = c.createGain(); vg.gain.value = 3; v.connect(vg); vg.connect(o.frequency);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4; f.frequency.setValueAtTime(480, t0); f.frequency.linearRampToValueAtTime(1500, t0 + 1.3); f.frequency.linearRampToValueAtTime(560, t0 + 4.2);
    const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.9); g.gain.setValueAtTime(0.5, t0 + 3.3); g.gain.linearRampToValueAtTime(0, t0 + 4.8);
    o.connect(f); f.connect(g); g.connect(this.bus.fxVerb); o.start(t0); v.start(t0); o.stop(t0 + 4.9); v.stop(t0 + 4.9);
  }
  flute(freq, t0, dur, vol = 0.5) {
    const c = this.ctx; const o = c.createOscillator(); o.frequency.value = freq; const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq; const g2 = c.createGain(); g2.gain.value = 0.22;
    const v = c.createOscillator(); v.frequency.value = 5.4; const vg = c.createGain(); vg.gain.setValueAtTime(0, t0); vg.gain.linearRampToValueAtTime(freq * 0.008, t0 + 0.35); v.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    const n = c.createBufferSource(); n.buffer = this.noise; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = freq * 2; nf.Q.value = 6; const ng = c.createGain(); ng.gain.setValueAtTime(0, t0); ng.gain.linearRampToValueAtTime(0.12, t0 + 0.03); ng.gain.exponentialRampToValueAtTime(0.01, t0 + 0.25); n.connect(nf); nf.connect(ng);
    const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.07); g.gain.setValueAtTime(vol, t0 + Math.max(0.08, dur - 0.12)); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.15);
    o.connect(g); o2.connect(g2); g2.connect(g); ng.connect(g); g.connect(this.bus.fxVerb);
    const e = t0 + dur + 0.2; o.start(t0); o2.start(t0); v.start(t0); n.start(t0); o.stop(e); o2.stop(e); v.stop(e); n.stop(e);
  }
  motif() { const S = 293.66; const notes = [[1, 0.45], [1.125, 0.45], [1.25, 0.7], [1.5, 0.45], [1.6667, 1.1], [1.5, 0.4], [1.25, 0.4], [1.125, 0.5], [1, 1.7]]; let t = this.ctx.currentTime + 0.1; for (const [r, d] of notes) { this.flute(S * r, t, d, 0.42); t += d + 0.06; } }
  dholHit(t0, type, vol = 1) {
    const c = this.ctx;
    if (type === 'dha') {
      const o = c.createOscillator(); o.frequency.setValueAtTime(96, t0); o.frequency.exponentialRampToValueAtTime(46, t0 + 0.18); const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.9 * vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.34); o.connect(g); g.connect(this.bus.fx); o.start(t0); o.stop(t0 + 0.36);
      const n = c.createBufferSource(); n.buffer = this.noise; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.2; const ng = c.createGain(); ng.gain.setValueAtTime(0.3 * vol, t0); ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08); n.connect(f); f.connect(ng); ng.connect(this.bus.fx); n.start(t0); n.stop(t0 + 0.1);
    } else {
      const n = c.createBufferSource(); n.buffer = this.noise; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 2.5; const ng = c.createGain(); ng.gain.setValueAtTime(0.28 * vol, t0); ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06); n.connect(f); f.connect(ng); ng.connect(this.bus.fx); n.start(t0); n.stop(t0 + 0.08);
      const o = c.createOscillator(); o.frequency.setValueAtTime(430, t0); o.frequency.exponentialRampToValueAtTime(300, t0 + 0.05); const g = c.createGain(); g.gain.setValueAtTime(0.22 * vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09); o.connect(g); g.connect(this.bus.fx); o.start(t0); o.stop(t0 + 0.1);
    }
  }
  crack() {
    const c = this.ctx, t = c.currentTime;
    const n = c.createBufferSource(); n.buffer = this.noise; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800; const g = c.createGain(); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); n.connect(f); f.connect(g); g.connect(this.bus.fxVerb); n.start(t); n.stop(t + 0.14);
    for (let i = 0; i < 6; i++) this.ping(t + 0.01 + i * 0.03 + Math.random() * 0.02, 1800 + Math.random() * 2600, 0.15 + Math.random() * 0.25, 0.2, 1.2 + Math.random() * 1.5);
    const s = c.createBufferSource(); s.buffer = this.noise; const sf = c.createBiquadFilter(); sf.type = 'lowpass'; sf.frequency.value = 500; const sg = c.createGain(); sg.gain.setValueAtTime(0, t + 0.05); sg.gain.linearRampToValueAtTime(0.5, t + 0.09); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.3); s.connect(sf); sf.connect(sg); sg.connect(this.bus.fx); s.start(t + 0.05); s.stop(t + 0.32);
  }
  bird() {
    const c = this.ctx, t = c.currentTime; const out = c.createGain(); out.gain.value = 0.07;
    if (c.createStereoPanner) { const pan = c.createStereoPanner(); pan.pan.value = rand(-0.8, 0.8); out.connect(pan); pan.connect(this.bus.fxVerb); } else out.connect(this.bus.fxVerb);
    const n = 2 + Math.floor(Math.random() * 3), f0 = rand(2300, 3400);
    for (let i = 0; i < n; i++) { const t0 = t + i * rand(0.09, 0.17); const o = c.createOscillator(); o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * rand(1.15, 1.5), t0 + 0.04); o.frequency.exponentialRampToValueAtTime(f0 * 0.9, t0 + 0.085); const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.1); }
  }
  update() {
    if (!this.on) return; const now = this.ctx.currentTime;
    if (this.birdsOn) { if (now > this.nextBird) { this.bird(); this.nextBird = now + rand(1.2, 5); } } else this.nextBird = now + 1;
    if (this.dholOn) { while (this.nextDhol < now + 0.25) { const ty = this.dholPattern[this.dholStep % 16]; if (ty) this.dholHit(Math.max(this.nextDhol, now), ty, this.dholVol); this.dholStep++; this.nextDhol += 0.27; } } else { this.nextDhol = now; this.dholStep = 0; }
    if (this.tanpuraOn) { while (this.nextPluck < now + 0.25) { this.pluck(this.strings[this.si++ % 4], Math.max(this.nextPluck, now)); this.nextPluck += 1.12; } } else this.nextPluck = now;
    if (this.heart) { while (this.nextBeat < now + 0.25) { this.beat(Math.max(this.nextBeat, now)); this.nextBeat += 1.04; } } else this.nextBeat = now;
  }
}
