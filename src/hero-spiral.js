import { easeInOutCubic, easeOutCubic } from './utils/carouselMath.js';

export const CARD_SCALE = 1.15;

// Exact palette sampled from /public/images/img1.jpg..img10.jpg
const TILE_PALETTE = [
  [0.066667, 0.168627, 0.305882],
  [0.113725, 0.290196, 0.513725],
  [0.043137, 0.113725, 0.207843],
  [0.788235, 0.839216, 0.905882],
  [0.180392, 0.360784, 0.603922],
  [0.058824, 0.141176, 0.254902],
  [0.866667, 0.898039, 0.941176],
  [0.207843, 0.407843, 0.662745],
  [0.086275, 0.203922, 0.345098],
  [0.725490, 0.788235, 0.878431],
];

const CONFIG = {
  cardScale: CARD_SCALE,
  totalImages: TILE_PALETTE.length,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  rotationDecay: 0.9,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralOffsetY: -2.0,
  baseStartRadius: 5.0,
  baseEndRadius: 3.5,
  tileHeightRatio: 1.16,
  baseSpiralGap: 0.35,
  tileOverlap: 0.005,
  mobileTileScale: 0.8,
};

const VERTEX_SHADER_SRC = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aUv;
  attribute vec4 aInstCol0;
  attribute vec4 aInstCol1;
  attribute vec4 aInstCol2;
  attribute vec4 aInstCol3;
  attribute vec3 aTileColor;

  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;

  varying vec2 vUv;
  varying vec3 vColor;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = aUv;
    vColor = aTileColor;

    mat4 instMat = mat4(aInstCol0, aInstCol1, aInstCol2, aInstCol3);
    vec4 localPos = instMat * vec4(aPosition, 1.0);
    vec4 worldPos = uModelMatrix * localPos;
    vWorldPosition = worldPos.xyz;

    mat3 worldUpper = mat3(uModelMatrix) * mat3(instMat);
    mat3 cofactorMat = mat3(
      cross(worldUpper[1], worldUpper[2]),
      cross(worldUpper[2], worldUpper[0]),
      cross(worldUpper[0], worldUpper[1])
    );
    vec3 worldNorm = normalize(cofactorMat * aNormal);
    vNormal = normalize(mat3(uViewMatrix) * worldNorm);

    vec4 mvPos = uViewMatrix * worldPos;
    vViewPosition = -mvPos.xyz;

    gl_Position = uProjectionMatrix * mvPos;
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;

  uniform vec3 uCameraPosition;

  varying vec2 vUv;
  varying vec3 vColor;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec2 centered = vUv - 0.5;
    float edge = 1.0 - smoothstep(0.38, 0.88, length(centered));
    edge = mix(0.82, 1.0, edge);

    float dist = distance(vWorldPosition, uCameraPosition);
    float depth = 1.0 - smoothstep(7.0, 24.0, dist);
    depth = mix(0.42, 1.0, depth);

    vec3 navyBias = vec3(0.04, 0.09, 0.17);
    vec3 color = mix(navyBias, vColor, depth);
    color *= edge;

    vec3 viewDir = normalize(vViewPosition);
    vec3 norm = normalize(vNormal);
    float f = 1.0 - max(0.0, dot(viewDir, norm));
    float fresnel = f * f * f;

    vec3 goldRim = vec3(0.87, 0.73, 0.42);
    color += goldRim * (fresnel * 0.35 * depth);

    vec2 borderCoord = abs(centered) * 2.0;
    float border = smoothstep(0.95, 0.985, max(borderCoord.x, borderCoord.y));
    color = mix(color, goldRim * 1.15, border * 0.4 * depth);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createCurvedTileGeometry(radius, arcAngle, tileHeight, segments) {
  const vertCount = (segments + 1) * 2;
  const positions = new Float32Array(vertCount * 3);
  const normals = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const indices = new Uint16Array(segments * 6);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const theta = -arcAngle / 2 + t * arcAngle;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const x = sinT * radius;
    const z = cosT * radius;

    const pIdx = i * 6;
    positions[pIdx] = x;
    positions[pIdx + 1] = tileHeight / 2;
    positions[pIdx + 2] = z;
    positions[pIdx + 3] = x;
    positions[pIdx + 4] = -tileHeight / 2;
    positions[pIdx + 5] = z;

    normals[pIdx] = sinT;
    normals[pIdx + 1] = 0;
    normals[pIdx + 2] = cosT;
    normals[pIdx + 3] = sinT;
    normals[pIdx + 4] = 0;
    normals[pIdx + 5] = cosT;

    const uvIdx = i * 4;
    uvs[uvIdx] = t;
    uvs[uvIdx + 1] = 1;
    uvs[uvIdx + 2] = t;
    uvs[uvIdx + 3] = 0;
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    const idx = i * 6;
    indices[idx] = a;
    indices[idx + 1] = b;
    indices[idx + 2] = c;
    indices[idx + 3] = b;
    indices[idx + 4] = d;
    indices[idx + 5] = c;
  }

  return { positions, normals, uvs, indices };
}

function setPerspectiveMatrix(out, fovDeg, aspect, near, far) {
  const f = 1.0 / Math.tan((fovDeg * Math.PI) / 360);
  const nf = 1.0 / (near - far);
  out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
  out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
}

function setLookAtMatrix(out, eyeY, eyeZ, centerY) {
  let zx = 0;
  let zy = eyeY - centerY;
  let zz = eyeZ;
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len; zy /= len; zz /= len;

  // up = (0, 1, 0), x = normalize(cross(up, z))
  let xx = zz;
  let xy = 0;
  let xz = -zx;
  len = Math.hypot(xx, xy, xz) || 1;
  xx /= len; xz /= len;

  // y = cross(z, x)
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
  out[12] = -(xx * 0 + xy * eyeY + xz * eyeZ);
  out[13] = -(yx * 0 + yy * eyeY + yz * eyeZ);
  out[14] = -(zx * 0 + zy * eyeY + zz * eyeZ);
  out[15] = 1;
}

// Column-major T(x, y, z) * Rx(rx) * Ry(ry) * Rz(rz) * S(sx, sy, sz)
function composeMatrixInto(arr, offset, x, y, z, rx, ry, rz, sx, sy, sz) {
  const cx = Math.cos(rx), sx_ = Math.sin(rx);
  const cy = Math.cos(ry), sy_ = Math.sin(ry);
  const cz = Math.cos(rz), sz_ = Math.sin(rz);

  arr[offset + 0] = (cy * cz) * sx;
  arr[offset + 1] = (cx * sz_ + sx_ * sy_ * cz) * sx;
  arr[offset + 2] = (sx_ * sz_ - cx * sy_ * cz) * sx;
  arr[offset + 3] = 0;

  arr[offset + 4] = (-cy * sz_) * sy;
  arr[offset + 5] = (cx * cz - sx_ * sy_ * sz_) * sy;
  arr[offset + 6] = (sx_ * cz + cx * sy_ * sz_) * sy;
  arr[offset + 7] = 0;

  arr[offset + 8] = sy_ * sz;
  arr[offset + 9] = (-sx_ * cy) * sz;
  arr[offset + 10] = (cx * cy) * sz;
  arr[offset + 11] = 0;

  arr[offset + 12] = x;
  arr[offset + 13] = y;
  arr[offset + 14] = z;
  arr[offset + 15] = 1;
}

function createCompiledShader(gl, type, src) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mulMat4(out, a, b) {
  for (let col = 0; col < 4; col++) {
    const b0 = b[col * 4], b1 = b[col * 4 + 1], b2 = b[col * 4 + 2], b3 = b[col * 4 + 3];
    out[col * 4 + 0] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[col * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[col * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[col * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
}

function initCanvas2DSpiral({ heroEl, scrollStateRef, onReplayTypography }) {
  let disposed = false;
  let isMobile = window.innerWidth < 768;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__canvas';
  canvas.style.opacity = '1';
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  heroEl.appendChild(canvas);

  const tilesPerRevolution = 12;
  const revolutions = 4;
  const totalTiles = tilesPerRevolution * revolutions;
  const segments = 2;

  const scale = CONFIG.cardScale || 1.0;
  const startRadius = CONFIG.baseStartRadius * scale;
  const endRadius = CONFIG.baseEndRadius * scale;
  const spiralGap = CONFIG.baseSpiralGap * scale;
  const angleStep = (Math.PI * 2) / tilesPerRevolution;
  const arcAngle = angleStep + CONFIG.tileOverlap;
  const chord = 2 * startRadius * Math.sin(angleStep / 2);
  const tileHeight = chord * CONFIG.tileHeightRatio;
  const startY = (totalTiles * spiralGap) / 2;

  const localCols = [];
  for (let s = 0; s <= segments; s++) {
    const theta = -arcAngle / 2 + (s / segments) * arcAngle;
    localCols.push({
      x: Math.sin(theta) * startRadius,
      yTop: tileHeight / 2,
      yBot: -tileHeight / 2,
      z: Math.cos(theta) * startRadius,
    });
  }

  // Quantize depth into 16 CSS color buckets per palette tile to avoid per-frame string GC
  const DEPTH_BUCKETS = 16;
  const fillLookup = TILE_PALETTE.map((rgb) => {
    const arr = new Array(DEPTH_BUCKETS);
    for (let b = 0; b < DEPTH_BUCKETS; b++) {
      const d = 0.42 + 0.58 * (b / (DEPTH_BUCKETS - 1));
      const r = Math.round((0.04 * (1 - d) + rgb[0] * d) * 238);
      const g = Math.round((0.09 * (1 - d) + rgb[1] * d) * 238);
      const bl = Math.round((0.17 * (1 - d) + rgb[2] * d) * 238);
      arr[b] = `rgb(${r},${g},${bl})`;
    }
    return arr;
  });
  const strokeLookup = Array.from({ length: DEPTH_BUCKETS }, (_, b) => {
    const d = 0.42 + 0.58 * (b / (DEPTH_BUCKETS - 1));
    return `rgba(223,185,108,${(0.42 * d).toFixed(2)})`;
  });

  const tileData = [];
  const instanceMatrices = new Float32Array(totalTiles * 16);
  for (let i = 0; i < totalTiles; i++) {
    const t = i / (totalTiles - 1);
    const radius = startRadius + (endRadius - startRadius) * t;
    const radialRatio = radius / startRadius;
    const targetY = startY - i * spiralGap;
    const targetRotY = i * angleStep;
    const targetScale = CONFIG.mobileTileScale;

    const seed = i * 1.618;
    const angle = (i / totalTiles) * Math.PI * 4.2 + (i % 3) * 0.8;
    const distFromCenter = 7.0 + (i % 5) * 1.4;
    const waveDelayMs = ((Math.abs(i - totalTiles / 2) / (totalTiles / 2)) * 0.42 + (i % 6) * 0.035) * 1000;

    tileData.push({
      paletteIdx: i % CONFIG.totalImages,
      radialRatio,
      waveDelayMs,
      target: { x: 0, y: targetY, z: 0, rotX: 0, rotY: targetRotY, rotZ: 0, scale: targetScale },
      dispersed: {
        x: Math.cos(angle) * distFromCenter + Math.sin(seed * 2.3) * 3,
        y: (startY - i * spiralGap) * 0.35 + Math.sin(seed * 1.7) * 6,
        z: Math.sin(angle) * 4.5 - (i % 4) * 2.0,
        rotX: (Math.sin(seed * 0.9) - 0.2) * 1.1,
        rotY: angle + Math.PI * 0.55,
        rotZ: Math.cos(seed * 1.4) * 0.75,
        scale: targetScale * (0.62 + (i % 5) * 0.1),
      },
    });
  }

  const projMat = new Float32Array(16);
  const viewMat = new Float32Array(16);
  const modelMat = new Float32Array(16);
  const vmMat = new Float32Array(16);
  const fullMat = new Float32Array(16);
  const worldTileMat = new Float32Array(16);

  let width = 390;
  let height = 844;
  let cameraZ = CONFIG.cameraZ + 3;

  const resizeCanvas = () => {
    isMobile = window.innerWidth < 768;
    cameraZ = CONFIG.cameraZ + (isMobile ? 3 : 0);
    width = heroEl.clientWidth || window.innerWidth;
    height = heroEl.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    setPerspectiveMatrix(projMat, 45, width / Math.max(1, height), 0.1, 100);
  };
  resizeCanvas();

  const CONVERGENCE_DURATION = 1600;
  let convergenceStart = performance.now();
  let convergenceActive = true;

  const updateTileMatrices = (now, forceConverged = false) => {
    const elapsed = now - convergenceStart;
    let allDone = true;
    for (let i = 0; i < totalTiles; i++) {
      const td = tileData[i];
      let p = 1;
      let sp = 1;
      if (!forceConverged) {
        const localElapsed = elapsed - td.waveDelayMs;
        if (localElapsed >= CONVERGENCE_DURATION) {
          p = 1;
        } else if (localElapsed > 0) {
          p = easeInOutCubic(localElapsed / CONVERGENCE_DURATION);
          allDone = false;
        } else {
          p = 0;
          allDone = false;
        }
        sp = localElapsed > 0 ? easeOutCubic(Math.min(1, localElapsed / 1450)) : 0;
      }

      const { dispersed, target, radialRatio } = td;
      const sc = dispersed.scale + (target.scale - dispersed.scale) * sp;
      composeMatrixInto(
        instanceMatrices,
        i * 16,
        dispersed.x + (target.x - dispersed.x) * p,
        dispersed.y + (target.y - dispersed.y) * p,
        dispersed.z + (target.z - dispersed.z) * p,
        dispersed.rotX + (target.rotX - dispersed.rotX) * p,
        dispersed.rotY + (target.rotY - dispersed.rotY) * p,
        dispersed.rotZ + (target.rotZ - dispersed.rotZ) * p,
        sc * radialRatio,
        sc,
        sc * radialRatio
      );
    }
    if (allDone || forceConverged) convergenceActive = false;
  };

  let spiralRotY = 0;
  let targetCameraY = 0;
  let currentCameraY = 0;
  let isHeroVisible = true;
  let animationFrameId = null;

  const drawItems = Array.from({ length: totalTiles }, (_, i) => ({
    index: i,
    vz: 0,
    bucket: 15,
    ptsX: new Float32Array((segments + 1) * 2),
    ptsY: new Float32Array((segments + 1) * 2),
  }));
  const activeOrder = new Int16Array(totalTiles);

  const drawScene = () => {
    ctx.clearRect(0, 0, width, height);

    setLookAtMatrix(viewMat, currentCameraY, cameraZ, currentCameraY * 0.4);
    composeMatrixInto(modelMat, 0, 0, CONFIG.spiralOffsetY, 0, 0, spiralRotY, 0, 1, 1, 1);
    mulMat4(vmMat, viewMat, modelMat);

    let activeCount = 0;
    const ptsCount = (segments + 1) * 2;
    for (let i = 0; i < totalTiles; i++) {
      const off = i * 16;
      const cx = instanceMatrices[off + 12];
      const cy = instanceMatrices[off + 13];
      const cz = instanceMatrices[off + 14];
      const vz = vmMat[2] * cx + vmMat[6] * cy + vmMat[10] * cz + vmMat[14];
      if (vz > -0.5) continue;

      const wx = modelMat[0] * cx + modelMat[4] * cy + modelMat[8] * cz + modelMat[12];
      const wy = modelMat[1] * cx + modelMat[5] * cy + modelMat[9] * cz + modelMat[13];
      const wz = modelMat[2] * cx + modelMat[6] * cy + modelMat[10] * cz + modelMat[14];
      const dist = Math.hypot(wx, wy - currentCameraY, wz - cameraZ);
      const normDepth = 1 - smoothstep(7.0, 24.0, dist);
      const bucket = Math.max(0, Math.min(DEPTH_BUCKETS - 1, Math.round(normDepth * (DEPTH_BUCKETS - 1))));

      const item = drawItems[i];
      item.vz = vz;
      item.bucket = bucket;

      const instSlice = instanceMatrices.subarray(off, off + 16);
      mulMat4(worldTileMat, vmMat, instSlice);
      mulMat4(fullMat, projMat, worldTileMat);

      let valid = true;
      for (let s = 0; s <= segments; s++) {
        const c = localCols[s];
        const wTop = fullMat[3] * c.x + fullMat[7] * c.yTop + fullMat[11] * c.z + fullMat[15];
        const wBot = fullMat[3] * c.x + fullMat[7] * c.yBot + fullMat[11] * c.z + fullMat[15];
        if (wTop <= 0.05 || wBot <= 0.05) {
          valid = false;
          break;
        }
        const xTop = fullMat[0] * c.x + fullMat[4] * c.yTop + fullMat[8] * c.z + fullMat[12];
        const yTop = fullMat[1] * c.x + fullMat[5] * c.yTop + fullMat[9] * c.z + fullMat[13];
        const xBot = fullMat[0] * c.x + fullMat[4] * c.yBot + fullMat[8] * c.z + fullMat[12];
        const yBot = fullMat[1] * c.x + fullMat[5] * c.yBot + fullMat[9] * c.z + fullMat[13];

        item.ptsX[s] = (xTop / wTop * 0.5 + 0.5) * width;
        item.ptsY[s] = (0.5 - yTop / wTop * 0.5) * height;
        const botIdx = ptsCount - 1 - s;
        item.ptsX[botIdx] = (xBot / wBot * 0.5 + 0.5) * width;
        item.ptsY[botIdx] = (0.5 - yBot / wBot * 0.5) * height;
      }
      if (valid) {
        activeOrder[activeCount++] = i;
      }
    }

    // Insertion sort on preallocated index array (N <= 48, zero GC)
    for (let k = 1; k < activeCount; k++) {
      const idx = activeOrder[k];
      const keyVz = drawItems[idx].vz;
      let j = k - 1;
      while (j >= 0 && drawItems[activeOrder[j]].vz > keyVz) {
        activeOrder[j + 1] = activeOrder[j];
        j--;
      }
      activeOrder[j + 1] = idx;
    }

    ctx.lineWidth = 1;
    for (let k = 0; k < activeCount; k++) {
      const i = activeOrder[k];
      const it = drawItems[i];
      const td = tileData[i];

      ctx.beginPath();
      ctx.moveTo(it.ptsX[0], it.ptsY[0]);
      for (let p = 1; p < ptsCount; p++) {
        ctx.lineTo(it.ptsX[p], it.ptsY[p]);
      }
      ctx.closePath();
      ctx.fillStyle = fillLookup[td.paletteIdx][it.bucket];
      ctx.fill();
      ctx.strokeStyle = strokeLookup[it.bucket];
      ctx.stroke();
    }
  };

  let slowFrames = 0;
  let stopIdle = false;
  const tick = () => {
    animationFrameId = null;
    if (disposed || !isHeroVisible) return;
    const t0 = performance.now();
    if (convergenceActive) updateTileMatrices(t0, false);

    const scrollProgress = scrollStateRef?.current?.scrollProgress || 0;
    const spinVel = scrollStateRef?.current?.spinVelocity || 0;
    spiralRotY += CONFIG.baseRotationSpeed + spinVel;
    if (scrollStateRef?.current) {
      scrollStateRef.current.spinVelocity *= CONFIG.rotationDecay;
    }

    targetCameraY = -scrollProgress * CONFIG.cameraYMultiplier * 10;
    currentCameraY += (targetCameraY - currentCameraY) * CONFIG.cameraSmoothing;

    drawScene();

    const frameCost = performance.now() - t0;
    if (frameCost > 14) {
      slowFrames++;
      if (slowFrames >= 1) {
        stopIdle = true;
        if (convergenceActive) {
          convergenceActive = false;
          animationFrameId = requestAnimationFrame(() => {
            animationFrameId = null;
            if (disposed || !isHeroVisible) return;
            updateTileMatrices(performance.now(), true);
            drawScene();
          });
        }
        return;
      }
    }
    if (!stopIdle || convergenceActive) {
      animationFrameId = requestAnimationFrame(tick);
    }
  };

  const kick = () => {
    if (disposed || !isHeroVisible) return;
    if (!animationFrameId) animationFrameId = requestAnimationFrame(tick);
  };

  const onScroll = () => {
    if (window.scrollY < window.innerHeight * 1.1) isHeroVisible = true;
    if (stopIdle && isHeroVisible) kick();
  };
  const onResize = () => {
    resizeCanvas();
    if (window.scrollY < window.innerHeight * 1.1) isHeroVisible = true;
    kick();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  window.replayHeroIntro = () => {
    convergenceStart = performance.now();
    convergenceActive = true;
    stopIdle = false;
    slowFrames = 0;
    if (onReplayTypography) onReplayTypography();
    kick();
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'r' || e.key === 'R') && !e.target.matches('input, textarea')) {
      window.replayHeroIntro();
    }
  };
  window.addEventListener('keydown', handleKeyDown);

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      const wasVisible = isHeroVisible;
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible && !wasVisible) kick();
      else if (!isHeroVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
    { threshold: 0.05 }
  );
  visibilityObserver.observe(heroEl);

  // Draw clean converged first frame immediately on constrained CPU or start live wave
  updateTileMatrices(performance.now(), false);
  animationFrameId = requestAnimationFrame(tick);

  return () => {
    disposed = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    visibilityObserver.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', handleKeyDown);
    if (canvas && heroEl.contains(canvas)) heroEl.removeChild(canvas);
  };
}

export function initHeroSpiral({ heroEl, scrollStateRef, onReplayTypography }) {
  let disposed = false;
  let isMobile = window.innerWidth < 768;

  if (isMobile) {
    return initCanvas2DSpiral({ heroEl, scrollStateRef, onReplayTypography });
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__canvas';
  canvas.style.opacity = '1';

  const contextOpts = {
    alpha: true,
    antialias: !isMobile,
    depth: true,
    powerPreference: 'high-performance',
  };

  let isWebGL2 = true;
  let gl = canvas.getContext('webgl2', contextOpts);
  let instExt = null;
  if (!gl) {
    isWebGL2 = false;
    gl = canvas.getContext('webgl', contextOpts) || canvas.getContext('experimental-webgl', contextOpts);
    if (gl) {
      instExt = gl.getExtension('ANGLE_instanced_arrays');
    }
  }

  if (!gl || (!isWebGL2 && !instExt)) {
    return initCanvas2DSpiral({ heroEl, scrollStateRef, onReplayTypography });
  }

  let isSoftwareGl = false;
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : String(gl.getParameter(gl.RENDERER) || '');
    isSoftwareGl = /swiftshader|llvmpipe|software|mesa/i.test(rendererStr);
  } catch {
    isSoftwareGl = false;
  }

  heroEl.appendChild(canvas);

  const tilesPerRevolution = isMobile ? 12 : 15;
  const revolutions = isMobile ? 4 : 5;
  const totalTiles = tilesPerRevolution * revolutions;
  const segments = isSoftwareGl ? 4 : isMobile ? 6 : 8;

  const scale = CONFIG.cardScale || 1.0;
  const startRadius = CONFIG.baseStartRadius * scale;
  const endRadius = CONFIG.baseEndRadius * scale;
  const spiralGap = CONFIG.baseSpiralGap * scale;
  const angleStep = (Math.PI * 2) / tilesPerRevolution;
  const arcAngle = angleStep + CONFIG.tileOverlap;
  const chord = 2 * startRadius * Math.sin(angleStep / 2);
  const tileHeight = chord * CONFIG.tileHeightRatio;
  const startY = (totalTiles * spiralGap) / 2;

  const geo = createCurvedTileGeometry(startRadius, arcAngle, tileHeight, segments);
  const instanceMatrices = new Float32Array(totalTiles * 16);
  const colorArray = new Float32Array(totalTiles * 3);
  const tileData = [];

  for (let i = 0; i < totalTiles; i++) {
    const t = i / (totalTiles - 1);
    const radius = startRadius + (endRadius - startRadius) * t;
    const radialRatio = radius / startRadius;

    const targetY = startY - i * spiralGap;
    const targetRotY = i * angleStep;
    const targetScale = isMobile ? CONFIG.mobileTileScale : 1.0;

    const seed = i * 1.618;
    const angle = (i / totalTiles) * Math.PI * 4.2 + (i % 3) * 0.8;
    const distFromCenter = isMobile ? 7.0 + (i % 5) * 1.4 : 10.0 + (i % 7) * 1.8;

    const dispersedX = Math.cos(angle) * distFromCenter + Math.sin(seed * 2.3) * (isMobile ? 3 : 5);
    const dispersedY = (startY - i * spiralGap) * 0.35 + Math.sin(seed * 1.7) * (isMobile ? 6 : 9);
    const dispersedZ = Math.sin(angle) * (isMobile ? 4.5 : 6.5) - (i % 4) * 2.0;

    const dispersedRotX = (Math.sin(seed * 0.9) - 0.2) * 1.1;
    const dispersedRotY = angle + Math.PI * 0.55;
    const dispersedRotZ = Math.cos(seed * 1.4) * 0.75;
    const dispersedScale = targetScale * (0.62 + (i % 5) * 0.1);

    const waveDelayMs = ((Math.abs(i - totalTiles / 2) / (totalTiles / 2)) * 0.42 + (i % 6) * 0.035) * 1000;

    const rgb = TILE_PALETTE[i % CONFIG.totalImages];
    colorArray[i * 3] = rgb[0];
    colorArray[i * 3 + 1] = rgb[1];
    colorArray[i * 3 + 2] = rgb[2];

    tileData.push({
      radialRatio,
      waveDelayMs,
      target: { x: 0, y: targetY, z: 0, rotX: 0, rotY: targetRotY, rotZ: 0, scale: targetScale },
      dispersed: {
        x: dispersedX,
        y: dispersedY,
        z: dispersedZ,
        rotX: dispersedRotX,
        rotY: dispersedRotY,
        rotZ: dispersedRotZ,
        scale: dispersedScale,
      },
    });
  }

  let program = null;
  let posBuf = null;
  let normBuf = null;
  let uvBuf = null;
  let idxBuf = null;
  let instMatBuf = null;
  let colorBuf = null;
  let uProjLoc = null;
  let uViewLoc = null;
  let uModelLoc = null;
  let uCamPosLoc = null;

  const projectionMatrix = new Float32Array(16);
  const viewMatrix = new Float32Array(16);
  const modelMatrix = new Float32Array(16);

  const maxDpr = isSoftwareGl ? 0.5 : isMobile ? 1.25 : 1.5;
  let cameraZ = CONFIG.cameraZ + (isMobile ? 3 : 0);

  const resizeCanvas = () => {
    isMobile = window.innerWidth < 768;
    cameraZ = CONFIG.cameraZ + (isMobile ? 3 : 0);
    const w = heroEl.clientWidth || window.innerWidth;
    const h = heroEl.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    setPerspectiveMatrix(projectionMatrix, 45, w / Math.max(1, h), 0.1, 100);
  };
  resizeCanvas();

  let glReady = false;
  let glLinked = false;
  let vShaderRef = null;
  let fShaderRef = null;
  const parallelCompileExt = gl.getExtension('KHR_parallel_shader_compile');

  const startGLProgramLink = () => {
    if (disposed || glLinked) return true;
    vShaderRef = createCompiledShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    fShaderRef = createCompiledShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vShaderRef || !fShaderRef) return false;

    program = gl.createProgram();
    gl.attachShader(program, vShaderRef);
    gl.attachShader(program, fShaderRef);

    // Deterministic attribute slots avoid getAttribLocation sync stalls after link
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.bindAttribLocation(program, 1, 'aNormal');
    gl.bindAttribLocation(program, 2, 'aUv');
    gl.bindAttribLocation(program, 3, 'aTileColor');
    gl.bindAttribLocation(program, 4, 'aInstCol0');
    gl.bindAttribLocation(program, 5, 'aInstCol1');
    gl.bindAttribLocation(program, 6, 'aInstCol2');
    gl.bindAttribLocation(program, 7, 'aInstCol3');

    gl.linkProgram(program);
    glLinked = true;
    return true;
  };

  const isProgramLinkComplete = () => {
    if (!glLinked || !program) return false;
    if (parallelCompileExt) {
      return Boolean(gl.getProgramParameter(program, parallelCompileExt.COMPLETION_STATUS_KHR));
    }
    return true;
  };

  let buffersUploaded = false;
  const uploadGLBuffers = () => {
    if (disposed || buffersUploaded) return;
    buffersUploaded = true;

    const setDivisor = (loc, div) => {
      if (isWebGL2) gl.vertexAttribDivisor(loc, div);
      else instExt.vertexAttribDivisorANGLE(loc, div);
    };

    posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.uvs, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

    colorBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);
    setDivisor(3, 1);

    instMatBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instMatBuf);
    gl.bufferData(gl.ARRAY_BUFFER, instanceMatrices.byteLength, gl.DYNAMIC_DRAW);
    for (let c = 0; c < 4; c++) {
      const loc = 4 + c;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, c * 16);
      setDivisor(loc, 1);
    }

    idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);
  };

  const finishGLSetup = () => {
    if (disposed || glReady) return true;
    if (!program) return false;
    uploadGLBuffers();

    if (vShaderRef) { gl.deleteShader(vShaderRef); vShaderRef = null; }
    if (fShaderRef) { gl.deleteShader(fShaderRef); fShaderRef = null; }

    gl.useProgram(program);
    uProjLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
    uViewLoc = gl.getUniformLocation(program, 'uViewMatrix');
    uModelLoc = gl.getUniformLocation(program, 'uModelMatrix');
    uCamPosLoc = gl.getUniformLocation(program, 'uCameraPosition');

    glReady = true;
    return true;
  };

  let matricesDirty = true;
  const CONVERGENCE_DURATION = 2000;
  let convergenceStart = performance.now() + 250;
  let convergenceActive = !isSoftwareGl;

  const updateTileMatrices = (now, forceConverged = false) => {
    const elapsed = now - convergenceStart;
    let allDone = true;

    for (let i = 0; i < tileData.length; i++) {
      const td = tileData[i];
      let p = 1;
      let sp = 1;

      if (!forceConverged) {
        const localElapsed = elapsed - td.waveDelayMs;
        if (localElapsed >= CONVERGENCE_DURATION) {
          p = 1;
        } else if (localElapsed > 0) {
          p = easeInOutCubic(localElapsed / CONVERGENCE_DURATION);
          allDone = false;
        } else {
          p = 0;
          allDone = false;
        }
        sp = localElapsed > 0 ? easeOutCubic(Math.min(1, localElapsed / 1850)) : 0;
      }

      const { dispersed, target, radialRatio } = td;
      const x = dispersed.x + (target.x - dispersed.x) * p;
      const y = dispersed.y + (target.y - dispersed.y) * p;
      const z = dispersed.z + (target.z - dispersed.z) * p;
      const rx = dispersed.rotX + (target.rotX - dispersed.rotX) * p;
      const ry = dispersed.rotY + (target.rotY - dispersed.rotY) * p;
      const rz = dispersed.rotZ + (target.rotZ - dispersed.rotZ) * p;
      const sc = dispersed.scale + (target.scale - dispersed.scale) * sp;

      composeMatrixInto(instanceMatrices, i * 16, x, y, z, rx, ry, rz, sc * radialRatio, sc, sc * radialRatio);
    }

    matricesDirty = true;
    if (allDone || forceConverged) {
      convergenceActive = false;
    }
  };

  const heroLocalState = {
    spiralRotY: 0,
    targetTiltX: 0,
    targetTiltZ: 0,
    currentTiltX: 0,
    currentTiltZ: 0,
    targetCameraY: 0,
    currentCameraY: 0,
  };

  const drawScene = () => {
    if (disposed || !glReady) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (matricesDirty) {
      gl.bindBuffer(gl.ARRAY_BUFFER, instMatBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceMatrices);
      matricesDirty = false;
    }

    setLookAtMatrix(viewMatrix, heroLocalState.currentCameraY, cameraZ, heroLocalState.currentCameraY * 0.4);
    composeMatrixInto(
      modelMatrix,
      0,
      0,
      CONFIG.spiralOffsetY,
      0,
      heroLocalState.currentTiltX,
      heroLocalState.spiralRotY,
      heroLocalState.currentTiltZ,
      1,
      1,
      1
    );

    gl.uniformMatrix4fv(uProjLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);
    gl.uniformMatrix4fv(uModelLoc, false, modelMatrix);
    gl.uniform3f(uCamPosLoc, 0, heroLocalState.currentCameraY, cameraZ);

    if (isWebGL2) {
      gl.drawElementsInstanced(gl.TRIANGLES, geo.indices.length, gl.UNSIGNED_SHORT, 0, totalTiles);
    } else {
      instExt.drawElementsInstancedANGLE(gl.TRIANGLES, geo.indices.length, gl.UNSIGNED_SHORT, 0, totalTiles);
    }
  };

  updateTileMatrices(performance.now(), isSoftwareGl);

  let isHeroVisible = true;
  let animationFrameId = null;
  let throttledTimerId = null;
  let lastRenderAt = 0;
  let slowFrameCount = 0;
  let useThrottledLoop = isSoftwareGl;

  const scheduleNextFrame = () => {
    if (disposed || !isHeroVisible) return;
    if (isSoftwareGl && !convergenceActive) return;

    if (useThrottledLoop) {
      throttledTimerId = setTimeout(() => {
        throttledTimerId = null;
        if (!disposed && isHeroVisible) {
          animationFrameId = requestAnimationFrame(tick);
        }
      }, isSoftwareGl ? 65 : 32);
    } else {
      animationFrameId = requestAnimationFrame(tick);
    }
  };

  const tick = (now) => {
    animationFrameId = null;
    if (disposed || !isHeroVisible) return;

    if (!glReady) {
      if (!startGLProgramLink() || !isProgramLinkComplete() || !finishGLSetup()) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
    }

    const minDelta = useThrottledLoop ? 30 : 0;
    if (minDelta && now - lastRenderAt < minDelta) {
      scheduleNextFrame();
      return;
    }
    lastRenderAt = now;

    const frameStart = performance.now();

    if (convergenceActive) {
      updateTileMatrices(frameStart, false);
    }

    const scrollProgress = scrollStateRef?.current?.scrollProgress || 0;
    const spinVel = scrollStateRef?.current?.spinVelocity || 0;

    heroLocalState.spiralRotY += CONFIG.baseRotationSpeed + spinVel;
    if (scrollStateRef?.current) {
      scrollStateRef.current.spinVelocity *= CONFIG.rotationDecay;
    }

    if (!isMobile) {
      heroLocalState.currentTiltX += (heroLocalState.targetTiltX - heroLocalState.currentTiltX) * CONFIG.cameraSmoothing;
      heroLocalState.currentTiltZ += (heroLocalState.targetTiltZ - heroLocalState.currentTiltZ) * CONFIG.cameraSmoothing;
    } else {
      heroLocalState.currentTiltX = 0;
      heroLocalState.currentTiltZ = 0;
    }

    heroLocalState.targetCameraY = -scrollProgress * CONFIG.cameraYMultiplier * 10;
    heroLocalState.currentCameraY += (heroLocalState.targetCameraY - heroLocalState.currentCameraY) * CONFIG.cameraSmoothing;

    drawScene();

    const frameCost = performance.now() - frameStart;
    if (frameCost > 22) {
      slowFrameCount++;
      if (slowFrameCount >= 3) {
        useThrottledLoop = true;
      }
    }

    scheduleNextFrame();
  };

  const kickOnDemandRender = () => {
    if (disposed || !isHeroVisible) return;
    if (!animationFrameId && !throttledTimerId) {
      animationFrameId = requestAnimationFrame(tick);
    }
  };

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const mx = (e.clientX / window.innerWidth) * 2 - 1;
    const my = (e.clientY / window.innerHeight) * 2 - 1;
    heroLocalState.targetTiltX = my * CONFIG.parallaxStrength;
    heroLocalState.targetTiltZ = mx * CONFIG.parallaxStrength * -0.5;
    if (isSoftwareGl && !convergenceActive) {
      kickOnDemandRender();
    }
  };
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  const handleScrollRender = () => {
    if (window.scrollY < window.innerHeight * 1.1) {
      isHeroVisible = true;
    }
    if (isSoftwareGl && isHeroVisible && !convergenceActive) {
      kickOnDemandRender();
    }
  };
  window.addEventListener('scroll', handleScrollRender, { passive: true });

  const onResize = () => {
    resizeCanvas();
    if (isMobile) {
      heroLocalState.targetTiltX = 0;
      heroLocalState.targetTiltZ = 0;
    }
    if (window.scrollY < window.innerHeight * 1.1) {
      isHeroVisible = true;
    }
    kickOnDemandRender();
  };
  window.addEventListener('resize', onResize, { passive: true });

  window.replayHeroIntro = () => {
    convergenceStart = performance.now() + 250;
    convergenceActive = true;
    if (onReplayTypography) onReplayTypography();
    kickOnDemandRender();
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'r' || e.key === 'R') && !e.target.matches('input, textarea')) {
      window.replayHeroIntro();
    }
  };
  window.addEventListener('keydown', handleKeyDown);

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      const wasVisible = isHeroVisible;
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible && !wasVisible) {
        kickOnDemandRender();
      } else if (!isHeroVisible) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        if (throttledTimerId) {
          clearTimeout(throttledTimerId);
          throttledTimerId = null;
        }
      }
    },
    { threshold: 0.05 }
  );
  visibilityObserver.observe(heroEl);

  // Step 1: start asynchronous GLSL compilation, Step 2: upload VBOs, Step 3: draw
  let initRenderTimer = requestAnimationFrame(() => {
    if (disposed || !startGLProgramLink()) return;
    initRenderTimer = requestAnimationFrame(() => {
      if (disposed) return;
      uploadGLBuffers();
      const waitAndRender = () => {
        if (disposed) return;
        if (!isProgramLinkComplete()) {
          initRenderTimer = requestAnimationFrame(waitAndRender);
          return;
        }
        if (!finishGLSetup()) return;
        if (isSoftwareGl) {
          animationFrameId = requestAnimationFrame(() => {
            animationFrameId = null;
            if (!disposed) drawScene();
          });
        } else {
          animationFrameId = requestAnimationFrame(tick);
        }
      };
      initRenderTimer = requestAnimationFrame(waitAndRender);
    });
  });

  return () => {
    disposed = true;
    cancelAnimationFrame(initRenderTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (throttledTimerId) clearTimeout(throttledTimerId);
    visibilityObserver.disconnect();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('scroll', handleScrollRender);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', handleKeyDown);
    if (canvas && heroEl.contains(canvas)) {
      heroEl.removeChild(canvas);
    }
    if (glReady) {
      if (posBuf) gl.deleteBuffer(posBuf);
      if (normBuf) gl.deleteBuffer(normBuf);
      if (uvBuf) gl.deleteBuffer(uvBuf);
      if (idxBuf) gl.deleteBuffer(idxBuf);
      if (instMatBuf) gl.deleteBuffer(instMatBuf);
      if (colorBuf) gl.deleteBuffer(colorBuf);
      if (program) gl.deleteProgram(program);
    }
  };
}
