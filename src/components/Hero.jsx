import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { vertexShader, fragmentShader } from '../shaders.js';

export const CARD_SCALE = 1.15;

const CONFIG = {
  cardScale: CARD_SCALE,
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

// Immediate crisp textures so cards render scattered on frame 0 without waiting for network
function createImmediateTextures() {
  const textures = [];
  for (let i = 1; i <= CONFIG.totalImages; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 256, 300);
    grad.addColorStop(0, '#040f21');
    grad.addColorStop(0.5, '#071e3d');
    grad.addColorStop(1, '#020712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 300);

    ctx.strokeStyle = 'rgba(143, 195, 255, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 16, 224, 268);

    ctx.fillStyle = 'rgba(223, 185, 108, 0.65)';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('MUNTAL', 128, 138);

    ctx.fillStyle = 'rgba(156, 196, 255, 0.55)';
    ctx.font = '500 13px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(`CHAMBER 0${i}`, 128, 172);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
  }
  return textures;
}

function loadRealTextures(renderer, onTextureLoaded) {
  const loader = new THREE.TextureLoader();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  for (let i = 1; i <= CONFIG.totalImages; i++) {
    loader.load(
      `/images/img${i}.jpg`,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = anisotropy;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        onTextureLoaded(i - 1, texture);
      },
      undefined,
      () => {
        // Fallback already in place
      }
    );
  }
}

function buildSpiral(spiral, textures, camera, isMobile) {
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
  const tiles = [];

  for (let i = 0; i < totalTiles; i++) {
    const t = i / (totalTiles - 1);
    const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);

    const geometry = createCurvedTileGeometry(radius, arcAngle, tileHeight, CONFIG.tileSegments);
    const texture = textures[i % textures.length];

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMap: { value: texture },
        uCameraPosition: { value: camera.position },
        uOpacity: { value: 1.0 }, // Fully visible from frame 0
      },
      side: THREE.DoubleSide,
      transparent: true,
    });

    const tile = new THREE.Mesh(geometry, material);

    // Target resting values in the spiral
    const targetY = startY - i * spiralGap;
    const targetRotY = i * angleStep;
    const targetScale = isMobile ? CONFIG.mobileTileScale : 1.0;

    // Dramatic 3D scattered constellation:
    // Placed broadly in front of the camera (camera is at z=12 or 15)
    const seed = i * 1.618;
    const angle = (i / totalTiles) * Math.PI * 4.2 + (i % 3) * 0.8;
    const distFromCenter = isMobile ? (7.0 + (i % 5) * 1.4) : (10.0 + (i % 7) * 1.8);

    const dispersedX = Math.cos(angle) * distFromCenter + Math.sin(seed * 2.3) * (isMobile ? 3 : 5);
    const dispersedY = (startY - i * spiralGap) * 0.35 + Math.sin(seed * 1.7) * (isMobile ? 6 : 9);
    const dispersedZ = (Math.sin(angle) * (isMobile ? 4.5 : 6.5)) - (i % 4) * 2.0;

    const dispersedRotX = (Math.sin(seed * 0.9) - 0.2) * 1.1;
    const dispersedRotY = angle + Math.PI * 0.55;
    const dispersedRotZ = Math.cos(seed * 1.4) * 0.75;
    const dispersedScale = targetScale * (0.62 + (i % 5) * 0.1);

    tile.userData = {
      target: {
        x: 0,
        y: targetY,
        z: 0,
        rotX: 0,
        rotY: targetRotY,
        rotZ: 0,
        scale: targetScale,
      },
      dispersed: {
        x: dispersedX,
        y: dispersedY,
        z: dispersedZ,
        rotX: dispersedRotX,
        rotY: dispersedRotY,
        rotZ: dispersedRotZ,
        scale: dispersedScale,
      },
    };

    // Set initial dispersed state immediately
    tile.position.set(dispersedX, dispersedY, dispersedZ);
    tile.rotation.set(dispersedRotX, dispersedRotY, dispersedRotZ);
    tile.scale.setScalar(dispersedScale);

    spiral.add(tile);
    tiles.push(tile);
  }

  return tiles;
}

let isHeroRevealed = false;

// Deterministic GSAP fade-in engine for hero texts (0.85s duration)
export function revealHeroTypography(force = false) {
  if (isHeroRevealed && !force) return;
  isHeroRevealed = true;

  document.body.classList.add('hero-revealed');
  const elements = [
    document.querySelector('.hero__core'),
    document.getElementById('main-nav'),
    document.querySelector('.hero__bottom'),
    document.querySelector('.hero__topbar'),
  ].filter(Boolean);

  if (!elements.length) return;

  // Restore interactivity
  elements.forEach((el) => {
    el.style.pointerEvents = 'auto';
  });

  // Direct GSAP 0.85s fade-in with smooth power2.out interpolation
  gsap.killTweensOf(elements);
  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: (index) => (index === 1 ? -12 : 14),
      scale: (index) => (index === 0 ? 0.96 : 1),
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.85,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'transform',
    }
  );
}

export function hideHeroTypography() {
  isHeroRevealed = false;
  document.body.classList.remove('hero-revealed');
  const elements = [
    document.querySelector('.hero__core'),
    document.getElementById('main-nav'),
    document.querySelector('.hero__bottom'),
    document.querySelector('.hero__topbar'),
  ].filter(Boolean);

  elements.forEach((el) => {
    el.style.pointerEvents = 'none';
  });

  gsap.killTweensOf(elements);
  gsap.set(elements, {
    opacity: 0,
    y: (index) => (index === 1 ? -12 : 14),
  });
}

function animateConvergence(tiles, onCompleteCallback) {
  // Ensure header and texts start cleanly hidden
  hideHeroTypography();

  const tl = gsap.timeline({
    delay: 0.35, // Initial pause so the user clearly registers the floating scattered cards
    onComplete: () => {
      if (!isHeroRevealed) {
        revealHeroTypography();
      }
      if (onCompleteCallback) onCompleteCallback();
    },
  });

  // Launch the exact 0.85s fade-in as cards lock into the double-curved spiral
  tl.call(() => {
    revealHeroTypography();
  }, null, 2.05);

  const totalTiles = tiles.length;

  tiles.forEach((tile, i) => {
    const { target } = tile.userData;
    // Radiant wave stagger from center outwards
    const waveDelay = (Math.abs(i - totalTiles / 2) / (totalTiles / 2)) * 0.42 + (i % 6) * 0.035;

    tl.to(
      tile.position,
      {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 2.15,
        ease: 'power3.inOut',
      },
      waveDelay
    );

    tl.to(
      tile.rotation,
      {
        x: target.rotX,
        y: target.rotY,
        z: target.rotZ,
        duration: 2.15,
        ease: 'power3.inOut',
      },
      waveDelay
    );

    tl.to(
      tile.scale,
      {
        x: target.scale,
        y: target.scale,
        z: target.scale,
        duration: 2.0,
        ease: 'power2.out',
      },
      waveDelay
    );
  });

  return tl;
}

export default function Hero({ scrollStateRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const heroEl = containerRef.current;
    if (!heroEl) return;

    // Reset body reveal state & hide text elements immediately on mount
    hideHeroTypography();

    let isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();

    const width = heroEl.clientWidth || window.innerWidth;
    const height = heroEl.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, CONFIG.cameraZ + (isMobile ? 3 : 0));

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

    // 1. Create immediate placeholder textures so cards are 100% visible from frame 0
    const immediateTextures = createImmediateTextures();
    const tiles = buildSpiral(spiral, immediateTextures, camera, isMobile);
    renderer.domElement.style.opacity = '1';

    // 2. Launch the majestic convergence animation immediately
    let convergenceTimeline = animateConvergence(tiles);

    // 3. Load real photographic images in background and update materials smoothly
    const realTextures = [];
    loadRealTextures(renderer, (index, texture) => {
      realTextures[index] = texture;
      tiles.forEach((tile, tileIdx) => {
        if (tileIdx % CONFIG.totalImages === index) {
          tile.material.uniforms.uMap.value = texture;
        }
      });
    });

    // Function to replay intro anytime
    window.replayHeroIntro = () => {
      if (convergenceTimeline) convergenceTimeline.kill();
      hideHeroTypography();
      window.removeEventListener('scroll', handleScrollReveal);
      window.addEventListener('scroll', handleScrollReveal, { passive: true });
      tiles.forEach((tile) => {
        const { dispersed } = tile.userData;
        tile.position.set(dispersed.x, dispersed.y, dispersed.z);
        tile.rotation.set(dispersed.rotX, dispersed.rotY, dispersed.rotZ);
        tile.scale.setScalar(dispersed.scale);
      });
      convergenceTimeline = animateConvergence(tiles);
    };

    // If user scrolls early before animation finishes, reveal immediately and unhook listener
    const handleScrollReveal = () => {
      if (!isHeroRevealed && window.scrollY > 30) {
        revealHeroTypography();
        window.removeEventListener('scroll', handleScrollReveal);
      }
    };
    window.addEventListener('scroll', handleScrollReveal, { passive: true });

    // Keyboard 'R' shortcut to easily replay the intro
    const handleKeyDown = (e) => {
      if ((e.key === 'r' || e.key === 'R') && !e.target.matches('input, textarea')) {
        window.replayHeroIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    window.setCardScale = (newScale) => {
      CONFIG.cardScale = Number(newScale) || 1.0;
      while (spiral.children.length > 0) {
        const obj = spiral.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        spiral.remove(obj);
      }
      const updatedTiles = buildSpiral(spiral, realTextures.length ? realTextures : immediateTextures, camera, isMobile);
      updatedTiles.forEach((tile) => {
        const { target } = tile.userData;
        tile.position.set(target.x, target.y, target.z);
        tile.rotation.set(target.rotX, target.rotY, target.rotZ);
        tile.scale.setScalar(target.scale);
      });
    };

    const heroLocalState = {
      mouseX: 0,
      mouseY: 0,
      targetTiltX: 0,
      targetTiltZ: 0,
      currentTiltX: 0,
      currentTiltZ: 0,
      targetCameraY: 0,
      currentCameraY: 0,
    };

    const handleMouseMove = (e) => {
      if (isMobile) return;
      heroLocalState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      heroLocalState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      heroLocalState.targetTiltX = heroLocalState.mouseY * CONFIG.parallaxStrength;
      heroLocalState.targetTiltZ = heroLocalState.mouseX * CONFIG.parallaxStrength * -0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const onResize = () => {
      isMobile = window.innerWidth < 768;
      const w = heroEl.clientWidth || window.innerWidth;
      const h = heroEl.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.position.z = CONFIG.cameraZ + (isMobile ? 3 : 0);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      if (isMobile) {
        heroLocalState.targetTiltX = 0;
        heroLocalState.targetTiltZ = 0;
      }
    };

    window.addEventListener('resize', onResize);

    let animationFrameId;

    const tick = () => {
      const scrollProgress = scrollStateRef?.current?.scrollProgress || 0;
      const spinVel = scrollStateRef?.current?.spinVelocity || 0;

      spiral.rotation.y += CONFIG.baseRotationSpeed + spinVel;
      if (scrollStateRef?.current) {
        scrollStateRef.current.spinVelocity *= CONFIG.rotationDecay;
      }

      if (!isMobile) {
        heroLocalState.currentTiltX += (heroLocalState.targetTiltX - heroLocalState.currentTiltX) * CONFIG.cameraSmoothing;
        heroLocalState.currentTiltZ += (heroLocalState.targetTiltZ - heroLocalState.currentTiltZ) * CONFIG.cameraSmoothing;
        spiral.rotation.x = heroLocalState.currentTiltX;
        spiral.rotation.z = heroLocalState.currentTiltZ;
      }

      heroLocalState.targetCameraY = -scrollProgress * CONFIG.cameraYMultiplier * 10;
      heroLocalState.currentCameraY += (heroLocalState.targetCameraY - heroLocalState.currentCameraY) * CONFIG.cameraSmoothing;
      camera.position.y = heroLocalState.currentCameraY;
      camera.lookAt(0, heroLocalState.currentCameraY * 0.4, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (convergenceTimeline) convergenceTimeline.kill();
      window.removeEventListener('scroll', handleScrollReveal);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && heroEl.contains(renderer.domElement)) {
        heroEl.removeChild(renderer.domElement);
      }
      renderer.dispose();
      while (spiral.children.length > 0) {
        const obj = spiral.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        spiral.remove(obj);
      }
    };
  }, [scrollStateRef]);

  return (
    <section className="hero" id="hero" ref={containerRef}>
      <div className="hero__topbar">
        <span className="hero__topbar-spacer"></span>
        <span className="hero__topbar-center"></span>
        <span className="hero__topbar-spacer"></span>
      </div>
      <div className="hero__core">
        <h1 className="hero__title hero__title--brand" id="hero-title">
          MUNTAL
        </h1>
      </div>
      <div className="hero__bottom">
        <span className="hero__bottom-spacer"></span>
        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-line"></span>
        </div>
      </div>
    </section>
  );
}
