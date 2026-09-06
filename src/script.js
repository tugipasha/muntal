import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vertexShader, fragmentShader } from './shaders.js';
import { initCommittees } from './committees.js';
import { initTeam } from './team.js';
import { initApply } from './apply.js';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// 🎛️ ARKADAKİ KARTLARIN BOYUTU (CARD SIZE SCALE)
// Bu tek değeri değiştirerek arkada dönen tüm kartların büyüklüğünü ayarlayabilirsiniz:
//   1.0   -> Orijinal / Standart boyut
//   1.15  -> Şu anki hafif büyütülmüş boyut
//   1.25  -> Orta-büyük boyut
//   1.40  -> Büyük boyut
//   0.85  -> Küçük boyut
// =========================================================================
export const CARD_SCALE = 1.15;

const CONFIG = {
  cardScale: CARD_SCALE, // <--- Tek değer kontrolü
  totalImages: 10,
  tilesPerRevolution: 15,
  revolutions: 5,
  baseStartRadius: 5.0,
  baseEndRadius: 3.5,
  tileHeightRatio: 1.16,
  tileSegments: 24,
  baseSpiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralOffsetY: -2.0,
  mobileTileScale: 0.8,
};

const state = {
  isMobile: window.innerWidth < 768,
  width: 0,
  height: 0,
  scrollProgress: 0,
  scrollVelocity: 0,
  spinVelocity: 0,
  targetCameraY: 0,
  currentCameraY: 0,
  mouseX: 0,
  mouseY: 0,
  targetTiltX: 0,
  targetTiltZ: 0,
  currentTiltX: 0,
  currentTiltZ: 0,
};

// ---------- Lenis smooth scroll ----------

const lenis = new Lenis({
  duration: 1.2,
  smoothWheel: true,
  smoothTouch: false,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
window.lenis = lenis;

lenis.on('scroll', ({ scroll, limit, velocity }) => {
  state.scrollProgress = Math.min(scroll / Math.max(limit, 1), 1);
  state.scrollVelocity = velocity;
  state.spinVelocity += velocity * CONFIG.scrollRotationMultiplier * CONFIG.scrollMultiplier;
  ScrollTrigger.update();
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ---------- GSAP scroll reveals ----------

const ctx = gsap.context(() => {
  gsap.utils.toArray('.reveal-text').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => ctx.revert());
}

window.addEventListener('load', () => ScrollTrigger.refresh());

// ---------- Curved tile geometry ----------

function createCurvedTileGeometry(radius, arcAngle, tileHeight, segments) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const theta = -arcAngle / 2 + t * arcAngle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    positions.push(x, tileHeight / 2, z);
    uvs.push(t, 1);
    positions.push(x, -tileHeight / 2, z);
    uvs.push(t, 0);
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// ---------- Texture loading ----------

function loadTextures(renderer) {
  const loader = new THREE.TextureLoader();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  const promises = [];
  for (let i = 1; i <= CONFIG.totalImages; i++) {
    const promise = new Promise((resolve) => {
      loader.load(
        `/images/img${i}.jpg`,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = anisotropy;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          resolve(texture);
        },
        undefined,
        () => {
          const data = new Uint8Array([6, 20, 38, 255]);
          const fallback = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
          fallback.colorSpace = THREE.SRGBColorSpace;
          fallback.needsUpdate = true;
          resolve(fallback);
        }
      );
    });
    promises.push(promise);
  }
  return Promise.all(promises);
}

// ---------- Main init ----------

function initHero() {
  const heroEl = document.querySelector('.hero');
  if (!heroEl) return;

  const scene = new THREE.Scene();

  const width = heroEl.clientWidth;
  const height = heroEl.clientHeight;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, CONFIG.cameraZ + (state.isMobile ? 3 : 0));

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  renderer.domElement.classList.add('hero__canvas');
  heroEl.appendChild(renderer.domElement);

  const spiral = new THREE.Group();
  spiral.position.y = CONFIG.spiralOffsetY;
  scene.add(spiral);

  loadTextures(renderer).then((textures) => {
    buildSpiral(spiral, textures, camera);
    renderer.domElement.style.opacity = 1;

    // Tarayıcı konsolundan anında test etmek için: setCardScale(1.3)
    window.setCardScale = (newScale) => {
      CONFIG.cardScale = Number(newScale) || 1.0;
      while (spiral.children.length > 0) {
        const obj = spiral.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        spiral.remove(obj);
      }
      buildSpiral(spiral, textures, camera);
      console.log(`[MUNTAL] Kart büyüklüğü güncellendi: ${CONFIG.cardScale}`);
    };
  });

  // Mouse parallax (desktop only)
  window.addEventListener('mousemove', (e) => {
    if (state.isMobile) return;
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    state.targetTiltX = state.mouseY * CONFIG.parallaxStrength;
    state.targetTiltZ = state.mouseX * CONFIG.parallaxStrength * -0.5;
  });

  // Resize
  function onResize() {
    state.isMobile = window.innerWidth < 768;
    const w = heroEl.clientWidth;
    const h = heroEl.clientHeight;
    camera.aspect = w / h;
    camera.position.z = CONFIG.cameraZ + (state.isMobile ? 3 : 0);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    if (state.isMobile) {
      state.targetTiltX = 0;
      state.targetTiltZ = 0;
    }
  }
  window.addEventListener('resize', onResize);

  // Render loop
  function tick() {
    spiral.rotation.y += CONFIG.baseRotationSpeed + state.spinVelocity;
    state.spinVelocity *= CONFIG.rotationDecay;

    if (!state.isMobile) {
      state.currentTiltX += (state.targetTiltX - state.currentTiltX) * CONFIG.cameraSmoothing;
      state.currentTiltZ += (state.targetTiltZ - state.currentTiltZ) * CONFIG.cameraSmoothing;
      spiral.rotation.x = state.currentTiltX;
      spiral.rotation.z = state.currentTiltZ;
    }

    state.targetCameraY = -state.scrollProgress * CONFIG.cameraYMultiplier * 10;
    state.currentCameraY += (state.targetCameraY - state.currentCameraY) * CONFIG.cameraSmoothing;
    camera.position.y = state.currentCameraY;
    camera.lookAt(0, state.currentCameraY * 0.4, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function buildSpiral(spiral, textures, camera) {
  const scale = CONFIG.cardScale || 1.0;
  const startRadius = CONFIG.baseStartRadius * scale;
  const endRadius = CONFIG.baseEndRadius * scale;
  const spiralGap = CONFIG.baseSpiralGap * scale;

  const totalTiles = CONFIG.tilesPerRevolution * CONFIG.revolutions;
  const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution;
  const arcAngle = angleStep + CONFIG.tileOverlap;
  const chord = 2 * startRadius * Math.sin(angleStep / 2);
  const tileHeight = chord * CONFIG.tileHeightRatio;

  const startY = (totalTiles * spiralGap) / 2;

  for (let i = 0; i < totalTiles; i++) {
    const t = i / (totalTiles - 1);
    const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);

    const geometry = createCurvedTileGeometry(radius, arcAngle, tileHeight, CONFIG.tileSegments);
    const texture = textures[i % CONFIG.totalImages];

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMap: { value: texture },
        uCameraPosition: { value: camera.position },
      },
      side: THREE.DoubleSide,
      transparent: true,
    });

    const tile = new THREE.Mesh(geometry, material);
    tile.position.y = startY - i * spiralGap;
    tile.rotation.y = i * angleStep;
    if (state.isMobile) tile.scale.setScalar(CONFIG.mobileTileScale);
    spiral.add(tile);
  }
}

// Defer WebGL setup so hero text remains the LCP candidate
function deferInit() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initHero, { timeout: 1500 });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(initHero));
  }
}

deferInit();

// ---------- Mobile Navigation Drawer ----------
function initMobileNav() {
  const burger = document.getElementById('nav-burger');
  const drawer = document.getElementById('mobile-nav-drawer');
  const closeBtn = document.getElementById('mobile-nav-close');
  const backdrop = drawer ? drawer.querySelector('.mobile-nav__backdrop') : null;
  const links = drawer ? drawer.querySelectorAll('.mobile-nav__link, .mobile-nav__cta') : [];

  if (!burger || !drawer) return;

  function openNav() {
    drawer.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (backdrop) backdrop.addEventListener('click', closeNav);

  links.forEach((l) => {
    l.addEventListener('click', () => {
      closeNav();
    });
  });
}

// ---------- Header Navigation & ScrollSpy ----------
function initNavLinks() {
  const desktopLinks = document.querySelectorAll('.nav__links a');
  const allNavAnchors = document.querySelectorAll('.nav__links a, .mobile-nav__link');

  allNavAnchors.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -30, duration: 1.2 });
          desktopLinks.forEach((l) => l.classList.remove('nav__link--active'));
          const matchingDesktop = document.querySelector(`.nav__links a[href="${href}"]`);
          if (matchingDesktop) matchingDesktop.classList.add('nav__link--active');
        }
      }
    });
  });

  const sections = [
    { id: 'hero', link: document.querySelector('.nav__links a[href="#hero"]') },
    { id: 'committees', link: document.querySelector('.nav__links a[href="#committees"]') },
    { id: 'team', link: document.querySelector('.nav__links a[href="#team"]') },
    { id: 'apply', link: document.querySelector('.nav__links a[href="#apply"]') },
  ];

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    let activeId = 'hero';

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) {
        activeId = id;
      }
    });

    sections.forEach(({ id, link }) => {
      if (link) {
        link.classList.toggle('nav__link--active', id === activeId);
      }
    });
  }, { passive: true });
}

// ---------- Initialize Committees Experience & Navigation ----------
let isAppInitialized = false;
function initApp() {
  if (isAppInitialized) return;
  isAppInitialized = true;
  initCommittees();
  initTeam();
  initApply();
  initMobileNav();
  initNavLinks();
}

document.addEventListener('DOMContentLoaded', initApp);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
}

