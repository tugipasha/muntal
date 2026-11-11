# MUNTAL — Posel United Nations Conference

A dark, architectural React web application for MUNTAL (Model United Nations in Izmir, Türkiye), rewritten in React with Three.js, GSAP, and Lenis smooth scrolling.

## Features

- **3D Spiral Gallery Hero**: Curved-tile 3D spiral (75 tiles, 5 revolutions) built with custom `BufferGeometry` and custom GLSL vertex/fragment shaders with navy depth fading.
- **Lenis Smooth Scroll & Parallax**: Synchronized scroll progress, mouse tilt, and camera descent.
- **Chapter I — Manifesto**: Editorial statement with GSAP ScrollTrigger reveals.
- **Chapter II — Committees Architectural Experience**:
  - Desktop 3D floating monolithic cards (DISEC, WHO, UNSC, UNHRC, ECOFIN) with bespoke procedural SVG artworks and interactive depth perspectives.
  - Mobile 3D cylindrical ring carousel with touch & mouse drag rotation, step snapping, progress line fill, and active counter.
  - In-depth Committee Dossier Modal with chamber quotas, simulation styles, official session agendas, background guide download, and direct apply hand-off.
- **Chapter III — Secretariat & Team Orbit**:
  - 3D concentric orbit stage featuring interactive member avatar seals along a curved parabolic path with quote and role transitions.
  - Multi-directional touch swipe, navigation arrows, and keyboard support.
- **Chapter IV — Multi-Track Applications**:
  - 4 assembly tracks: Delegate, Delegation (Chairboard), Press, and Admin.
  - Multi-step application modal with progress meter, field validation, and confidential dossier formatting.
  - Dual-mode submission API connecting to Google Apps Script / Google Sheets with automatic offline local storage backup and luxury receipt tracking codes.
- **Chapter V — Contact & Footer**: Conference dates, venue, and Secretariat contact channels.

## Development & Build

```bash
# Install dependencies
npm install

# Run dev server (port 3000)
npm run dev

# Build for production
npm run build
```

## Architecture & Project Structure

```
├── index.html
├── package.json
├── vite.config.js
├── public/images/
└── src/
    ├── main.jsx                     — React root entry point
    ├── App.jsx                      — Top-level layout and state coordinator
    ├── components/
    │   ├── Navbar.jsx               — Header bar & mobile navigation drawer
    │   ├── Hero.jsx                 — Three.js 3D spiral canvas & render loop
    │   ├── Manifesto.jsx            — Chapter I editorial section
    │   ├── CommitteesSection.jsx    — 3D desktop stage & mobile cylinder carousel
    │   ├── CommitteeDossierModal.jsx— Detailed committee dossier modal
    │   ├── TeamSection.jsx          — 3D concentric orbit team showcase
    │   ├── ApplySection.jsx         — Track selection cards
    │   ├── ApplyModal.jsx           — Multi-step application form & confirmation
    │   └── ContactFooter.jsx        — Chapter V contact & footer
    ├── committees-data.js           — Committee records & SVG artworks
    ├── team.js                      — Secretariat members data
    ├── apply.js                     — Application track configurations & fields
    ├── api.js                       — Google Sheets payload normalization & client
    ├── shaders.js                   — WebGL vertex & fragment shaders
    └── styles.css                   — Core styling and chiaroscuro design system
```
