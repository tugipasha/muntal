# Meridian — spatial design atelier

A dark editorial landing page centred on a full-screen 3D spiral image gallery hero, built with Vite, Three.js, Lenis and GSAP.

## Features

- Curved-tile 3D spiral hero (75 tiles, 5 revolutions) built from custom `BufferGeometry`, not flat planes
- Custom GLSL shader per tile: edge vignette + camera-distance depth fade, biased toward navy
- Lenis smooth scroll drives camera position and spiral spin velocity; GSAP ScrollTrigger reads from the same Lenis tick
- Mouse parallax tilt on desktop; disabled on mobile
- One-time `reveal-text` fade/slide reveal on all copy below the hero
- Strict navy / blue / white palette, no warm colour cast
- Deferred WebGL init (`requestIdleCallback`) so the hero headline is the LCP candidate

## Install

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Project structure

```
├── index.html
├── package.json
├── vite.config.js
├── public/images/img1.jpg … img10.jpg   (placeholder gradients — replace with real photography)
└── src/
    ├── script.js     — Three.js scene, Lenis, GSAP wiring
    ├── shaders.js     — vertex/fragment GLSL
    └── styles.css
```

## CONFIG explained (`src/script.js`)

| Key | Effect |
|---|---|
| `totalImages` | number of source textures cycled across tiles |
| `tilesPerRevolution` / `revolutions` | tile density and total spiral height |
| `startRadius` / `endRadius` | spiral tapers from wide (top) to narrow (bottom) |
| `tileHeightRatio` | tile height relative to its arc chord |
| `spiralGap` | vertical spacing between tiles |
| `cameraZ` | base camera distance |
| `cameraSmoothing` | lerp factor for camera/tilt easing (lower = smoother, slower) |
| `baseRotationSpeed` | idle auto-rotation speed |
| `scrollRotationMultiplier` / `scrollMultiplier` | how strongly scroll velocity spins the spiral |
| `rotationDecay` | how fast spin velocity settles back down |
| `cameraYMultiplier` | how far the camera travels vertically across the full scroll |
| `parallaxStrength` | mouse-tilt intensity on desktop |

## How it works

**a. Spiral geometry** — Each tile is a curved `BufferGeometry`: for each of `tileSegments + 1` slices across an arc, two vertices (top/bottom) are pushed at `x = sin(θ)·r`, `z = cos(θ)·r`, then triangulated between adjacent slices. Radius is lerped from `startRadius` to `endRadius` across all 75 tiles so the spiral cones inward toward the bottom.

**b. Scroll → camera** — Lenis reports scroll progress (0–1) on every frame; `state.targetCameraY` is set to `-scrollProgress * cameraYMultiplier * 10`, then eased toward with `cameraSmoothing` each tick, moving the camera down through the spiral as the user scrolls.

**c. Lenis velocity → rotation** — Each Lenis scroll event adds `velocity * scrollRotationMultiplier * scrollMultiplier` to `state.spinVelocity`, which is added to the spiral's Y rotation every frame and decays by `rotationDecay` (0.9) each tick — fast scrolling spins the spiral, which settles smoothly afterward.

**d. Mouse parallax** — On desktop, mouse position (normalized -1…1) sets `targetTiltX/Z`, eased toward with `cameraSmoothing` and applied as `spiral.rotation.x/z`, tilting the whole spiral subtly toward the cursor.

**e. Replacement images** — Drop real photography into `public/images/` as `img1.jpg` through `img10.jpg` (portrait orientation recommended, ~900×1400 or larger). Missing files fall back to a solid navy tile so the spiral never breaks.

**f. Tuning** — More density/height: raise `tilesPerRevolution`/`revolutions`. Tighter cone: widen the gap between `startRadius` and `endRadius`. Snappier spin: raise `scrollRotationMultiplier` or lower `rotationDecay`. Slower, heavier camera: lower `cameraSmoothing`.

---

**Note on the live preview:** this project was built and verified with `npm run build` (compiles cleanly) in a sandboxed tool environment where background processes do not persist between tool invocations, so a long-running `npm run dev` server could not be kept alive to hand you a clickable link. Run `npm install && npm run dev` locally to see it live — it will be at `http://localhost:5173/`.
