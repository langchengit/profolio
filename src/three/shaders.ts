// GLSL shaders for the abstract background scene.

// Simplex 3D noise (Ian McEwan / Ashima Arts, MIT) used by the blob displacement.
const simplexNoise = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute( permute( permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const blobVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uEnergy;

varying vec3 vNormal;
varying vec3 vViewPos;
varying float vDisp;

${simplexNoise}

vec3 orthogonal(vec3 v){
  return normalize(abs(v.x) > abs(v.z)
    ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
}

float fbm(vec3 p){
  float sum = 0.0;
  float amp = 1.0;
  float freq = 1.0;
  for (int i = 0; i < 3; i++){
    sum += amp * snoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

float displace(vec3 p){
  float t = uTime * 0.32;
  float n = fbm(p * uFreq + vec3(0.0, t, 0.0));
  return n * (uAmp + uEnergy * 0.4);
}

void main(){
  float d = displace(position);
  vec3 displaced = position + normal * d;

  // Recompute the normal from the deformed surface for correct lighting.
  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 nA = position + tangent * 0.01;
  vec3 nB = position + bitangent * 0.01;
  vec3 dA = nA + normal * displace(nA);
  vec3 dB = nB + normal * displace(nB);
  vec3 objNormal = normalize(cross(dA - displaced, dB - displaced));
  if (dot(objNormal, normal) < 0.0) objNormal = -objNormal;

  vNormal = normalize(normalMatrix * objNormal);
  vDisp = d;

  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const blobFragment = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uRim;
uniform float uAmbient;
uniform float uOpacity;
uniform vec3 uBgColor;

varying vec3 vNormal;
varying vec3 vViewPos;
varying float vDisp;

void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vViewPos);
  vec3 L = normalize(vec3(0.55, 0.7, 0.65));

  float diff = max(dot(N, L), 0.0);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);

  float t = smoothstep(-0.18, 0.28, vDisp);
  vec3 base = mix(uColorA, uColorB, t);
  vec3 color = base * (uAmbient + diff * 0.85);
  color += uRim * fres * 1.4;

  // Fade toward the page background as the orb scrolls past the hero. Done as a
  // color mix (not material alpha) so it renders reliably through the bloom
  // post-processing pass, which does not preserve per-fragment transparency.
  vec3 faded = mix(uBgColor, color, clamp(uOpacity, 0.0, 1.0));
  gl_FragColor = vec4(faded, 1.0);
}
`;

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform vec2 uPointer;

attribute float aScale;
attribute vec3 aSeed;

varying float vFade;

void main(){
  vec3 p = position;
  float t = uTime * 0.06;
  p.x += sin(t + aSeed.x * 6.2831) * 0.35;
  p.y += cos(t * 0.9 + aSeed.y * 6.2831) * 0.35;
  p.z += sin(t * 1.1 + aSeed.z * 6.2831) * 0.35;

  // gentle parallax toward the pointer; nearer particles move more
  p.x += uPointer.x * (0.15 + aScale * 0.5);
  p.y += uPointer.y * (0.15 + aScale * 0.5);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / max(-mv.z, 0.1));
  vFade = aScale;
}
`;

export const particleFragment = /* glsl */ `
precision highp float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vFade;

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, soft * uOpacity * (0.35 + vFade * 0.65));
}
`;
