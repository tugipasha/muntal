// MUNTAL Model United Nations — Committees Experience Controller
import { gsap } from 'gsap';
import { COMMITTEES, getCommitteeSvgArtwork } from './committees-data.js';

export function initCommittees() {
  const container = document.getElementById('committees');
  if (!container) return;

  let activeIndex = 2; // Default to 03 UNSC as the dominant centerpiece, exactly as in reference!
  const total = COMMITTEES.length;
  let isMobile = window.innerWidth < 840;

  // Mobile 3D Circular Ring Carousel State (5 cards distributed at 72° steps)
  let mobileStep = 2; // corresponds to activeIndex = 2 (03 UNSC centerpiece)
  const mobileCarouselState = {
    angle: -2 * 72 // -144 degrees to place UNSC squarely in front
  };
  let isSwipingOrDragging = false;

  // DOM Elements
  const stage = container.querySelector('.committees-stage');
  const desktopTrack = container.querySelector('.committees-desktop-cards');
  
  // Mobile 3D Cylindrical Elements
  const mobileStage = container.querySelector('.mobile-carousel-stage');
  const mobileTrack = container.querySelector('.mobile-carousel-track');
  const mobilePrevBtn = container.querySelector('#mobile-prev-btn');
  const mobileNextBtn = container.querySelector('#mobile-next-btn');
  const mobileCounterCurrent = container.querySelector('#mobile-counter-current');
  const mobileLineFill = container.querySelector('#mobile-line-fill');
  const mobileDetailTag = container.querySelector('#mobile-detail-tag');
  const mobileDetailTitle = container.querySelector('#mobile-detail-title');
  const mobileDetailDesc = container.querySelector('#mobile-detail-desc');
  const mobileDetailCta = container.querySelector('#mobile-detail-cta');
  const mobileDetailSegs = container.querySelectorAll('.mobile-detail-seg');

  const counterCurrent = container.querySelectorAll('.committees-counter-current');
  const progressSegments = container.querySelectorAll('.committees-segment');
  const prevBtns = container.querySelectorAll('.committees-btn--prev');
  const nextBtns = container.querySelectorAll('.committees-btn--next');
  const exploreBtns = container.querySelectorAll('.committees-explore-trigger');

  // Dossier Modal
  const dossierModal = document.getElementById('committee-dossier-modal');
  const dossierContent = document.getElementById('committee-dossier-content');
  const dossierClose = document.getElementById('committee-dossier-close');

  // Build Desktop Cards HTML
  function renderDesktopCards() {
    if (!desktopTrack) return;
    desktopTrack.innerHTML = COMMITTEES.map((comm, idx) => {
      const svg = getCommitteeSvgArtwork(comm.code);
      return `
        <div class="committee-card committee-card--desktop" data-index="${idx}" id="desktop-card-${comm.code.toLowerCase()}">
          <div class="committee-card__slab">
            <!-- 3D Beveled Thickness Rim -->
            <div class="committee-card__bevel-top"></div>
            <div class="committee-card__bevel-side"></div>
            
            <!-- Volumetric Rim Glow for active state -->
            <div class="committee-card__glow"></div>

            <div class="committee-card__content">
              <div class="committee-card__header">
                <span class="committee-card__number">${comm.num}</span>
                <h3 class="committee-card__code">${comm.code}</h3>
                <p class="committee-card__name">${comm.name}</p>
              </div>

              <div class="committee-card__art-frame">
                ${svg}
                <div class="committee-card__art-vignette"></div>
              </div>

              <div class="committee-card__footer">
                <span class="committee-card__mandate">${comm.category}</span>
                <span class="committee-card__expand-icon">↗</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Build Mobile 3D Carousel Cards HTML (All 5 cards on complete cylindrical circle)
  function renderMobileCards() {
    if (!mobileTrack) return;
    mobileTrack.innerHTML = COMMITTEES.map((comm, idx) => {
      const svg = getCommitteeSvgArtwork(comm.code);
      return `
        <div class="mobile-carousel-card" data-index="${idx}" id="mobile-card-${comm.code.toLowerCase()}" role="tab" aria-label="Committee ${comm.num} ${comm.code}">
          <div class="mobile-carousel-card__slab">
            <div class="mobile-carousel-card__bevel-top"></div>
            <div class="mobile-carousel-card__glow"></div>

            <div class="mobile-carousel-card__content">
              <div class="mobile-carousel-card__header">
                <span class="mobile-carousel-card__number">${comm.num}</span>
                <h3 class="mobile-carousel-card__code">${comm.code}</h3>
                <p class="mobile-carousel-card__name">${comm.shortName || comm.name}</p>
              </div>

              <div class="mobile-carousel-card__art-frame">
                ${svg}
                <div class="mobile-carousel-card__art-vignette"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener for each mobile card (tap center to open dossier, tap flank to rotate)
    mobileTrack.querySelectorAll('.mobile-carousel-card').forEach(card => {
      card.addEventListener('click', () => {
        if (isSwipingOrDragging) return;
        const idx = parseInt(card.getAttribute('data-index'), 10);
        const baseAngle = idx * 72;
        const currentAngle = baseAngle + mobileCarouselState.angle;
        const norm = ((((currentAngle % 360) + 540) % 360) - 180);

        if (Math.abs(norm) < 32) {
          openDossier(idx);
        } else if (norm > 0) {
          next();
        } else {
          prev();
        }
      });
    });
  }

  // Render cards along a true 360-degree cylinder in 3D space
  function renderMobileCircle(angleDeg) {
    if (!mobileTrack) return;
    const cards = mobileTrack.querySelectorAll('.mobile-carousel-card');
    if (!cards.length) return;

    const isSmallScreen = window.innerWidth < 370;
    const radius = isSmallScreen ? 220 : 255;

    cards.forEach((card, idx) => {
      // Base angle for this card on the 5-point circle (0°, 72°, 144°, 216°, 288°)
      const baseAngle = idx * 72;
      const totalAngle = baseAngle + angleDeg;
      // Normalize angle to [-180°, 180°] relative to the front viewing axis
      const norm = ((((totalAngle % 360) + 540) % 360) - 180);
      const rad = (norm * Math.PI) / 180;

      // True 3D circle coordinates on the horizontal cylinder plane:
      // x: horizontal position along the circular arc
      const x = Math.sin(rad) * radius;
      // z: depth into screen (front at 0, curving back to -2*radius)
      const z = (Math.cos(rad) - 1) * radius;

      // Optical tangent rotation around Y axis (inward facing curve)
      const rotateY = -norm * 0.52;

      // Cosine depth factor from 0.0 (rear of circle) to 1.0 (front of circle)
      const depthFactor = (Math.cos(rad) + 1) / 2;

      // Visual perspective scaling and lighting:
      const scale = 0.68 + 0.32 * depthFactor;
      // Front is 1.0, flanks are 0.75, rear cards are softly visible at ~0.16
      const opacity = 0.16 + 0.84 * Math.pow(depthFactor, 1.4);
      // Front card always occludes rear cards
      const zIndex = Math.round(10 + depthFactor * 60);

      const isCenter = Math.abs(norm) < 32;
      const isAdjacent = Math.abs(norm) >= 32 && Math.abs(norm) <= 104;

      card.classList.toggle('is-active', isCenter);
      card.classList.toggle('is-adjacent', isAdjacent);
      card.setAttribute('aria-selected', isCenter ? 'true' : 'false');
      card.style.pointerEvents = (isCenter || isAdjacent) ? 'auto' : 'none';

      gsap.set(card, {
        x: x,
        z: z,
        rotationY: rotateY,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex
      });
    });
  }

  // Rotate mobile carousel along the circular cylinder to target step
  function rotateMobileToStep(newStep, animate = true) {
    mobileStep = newStep;
    const targetAngle = -mobileStep * 72;
    const normalizedIndex = ((mobileStep % total) + total) % total;
    activeIndex = normalizedIndex;

    if (animate) {
      gsap.to(mobileCarouselState, {
        angle: targetAngle,
        duration: 0.72,
        ease: 'power3.out',
        onUpdate: () => renderMobileCircle(mobileCarouselState.angle),
        onComplete: () => {
          // Normalize step and angle smoothly to prevent number growth
          const safeStep = ((mobileStep % total) + total) % total;
          mobileStep = safeStep;
          mobileCarouselState.angle = -mobileStep * 72;
          renderMobileCircle(mobileCarouselState.angle);
        }
      });
    } else {
      mobileCarouselState.angle = targetAngle;
      renderMobileCircle(mobileCarouselState.angle);
    }

    updateMobileEditorialDetail();
  }

  // Update Mobile Editorial Detail Panel
  function updateMobileEditorialDetail() {
    const comm = COMMITTEES[activeIndex];
    if (comm) {
      if (mobileDetailTag) mobileDetailTag.textContent = `${comm.num} — ${comm.code}`;
      if (mobileDetailTitle) mobileDetailTitle.textContent = comm.name;
      if (mobileDetailDesc) mobileDetailDesc.textContent = comm.description || comm.mandate;
      if (mobileCounterCurrent) mobileCounterCurrent.textContent = comm.num;

      // Progress line fill
      if (mobileLineFill) {
        const fillPercent = ((activeIndex + 1) / total) * 100;
        gsap.to(mobileLineFill, {
          width: `${fillPercent}%`,
          duration: 0.45,
          ease: 'power2.out'
        });
      }

      // 5-Segment indicators below detail
      mobileDetailSegs.forEach((seg, sIdx) => {
        seg.classList.toggle('is-active', sIdx === activeIndex);
        seg.classList.toggle('is-passed', sIdx < activeIndex);
      });
    }
  }

  // Update Desktop 3D Card Transforms based on activeIndex
  function updateDesktopPositions(animate = true) {
    const cards = container.querySelectorAll('.committee-card--desktop');
    if (!cards.length) return;

    const isLargeDesktop = window.innerWidth >= 1300;
    const cardSpacing = isLargeDesktop ? 270 : 210;

    cards.forEach((card, idx) => {
      const offset = idx - activeIndex;
      const isCenter = offset === 0;
      
      // Calculate 3D transformation values
      let translateX = offset * cardSpacing;
      let translateZ = isCenter ? 70 : -Math.abs(offset) * 65;
      let rotateY = offset * -14;
      let scale = isCenter ? 1.06 : Math.max(0.78, 1 - Math.abs(offset) * 0.1);
      let opacity = Math.abs(offset) > 2 ? 0.35 : (isCenter ? 1 : 0.72);
      let zIndex = 20 - Math.abs(offset) * 4;

      card.classList.toggle('is-active', isCenter);
      card.classList.toggle('is-adjacent', Math.abs(offset) === 1);
      card.setAttribute('aria-selected', isCenter ? 'true' : 'false');

      const targetTransform = `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;

      if (animate) {
        gsap.to(card, {
          x: translateX,
          z: translateZ,
          rotationY: rotateY,
          scale: scale,
          opacity: opacity,
          zIndex: zIndex,
          duration: 0.85,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      } else {
        gsap.set(card, {
          x: translateX,
          z: translateZ,
          rotationY: rotateY,
          scale: scale,
          opacity: opacity,
          zIndex: zIndex
        });
      }
    });
  }

  // Update UI indicators (Pagination, Segment bars, Counter)
  function updateIndicators() {
    const formatted = String(activeIndex + 1).padStart(2, '0');
    counterCurrent.forEach(el => {
      el.textContent = formatted;
    });

    // Segment progress bars (Desktop bottom bar)
    progressSegments.forEach((seg, idx) => {
      seg.classList.toggle('is-active', idx === activeIndex);
      seg.classList.toggle('is-passed', idx < activeIndex);
    });
  }

  // Main Transition functions
  function goToIndex(idx) {
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    if (idx === activeIndex) return;

    // Calculate shortest step difference around circular cylinder
    let diff = idx - (mobileStep % total);
    let normDiff = ((diff % total) + total) % total;
    if (normDiff > 2) normDiff -= total;

    rotateMobileToStep(mobileStep + normDiff, true);
    updateDesktopPositions(true);
    updateIndicators();
  }

  function next() {
    rotateMobileToStep(mobileStep + 1, true);
    updateDesktopPositions(true);
    updateIndicators();
  }

  function prev() {
    rotateMobileToStep(mobileStep - 1, true);
    updateDesktopPositions(true);
    updateIndicators();
  }

  // Open Committee Dossier Modal
  function openDossier(idx) {
    const comm = COMMITTEES[idx];
    if (!comm || !dossierModal || !dossierContent) return;

    dossierContent.innerHTML = `
      <div class="dossier">
        <div class="dossier__header">
          <div class="dossier__meta">
            <span class="dossier__code-badge">${comm.num} — ${comm.code}</span>
            <span class="dossier__cat">${comm.category}</span>
          </div>
          <h2 class="dossier__title">${comm.name}</h2>
          <p class="dossier__mandate">“${comm.quote}”</p>
        </div>

        <div class="dossier__specs">
          <div class="dossier__spec-item">
            <span class="dossier__spec-label">Chamber Room</span>
            <span class="dossier__spec-val">${comm.room}</span>
          </div>
          <div class="dossier__spec-item">
            <span class="dossier__spec-label">Delegation Quota</span>
            <span class="dossier__spec-val">${comm.delegates}</span>
          </div>
          <div class="dossier__spec-item">
            <span class="dossier__spec-label">Experience Tier</span>
            <span class="dossier__spec-val">${comm.level}</span>
          </div>
          <div class="dossier__spec-item">
            <span class="dossier__spec-label">Simulation Style</span>
            <span class="dossier__spec-val">${comm.crisis}</span>
          </div>
        </div>

        <div class="dossier__topics">
          <h3 class="dossier__section-subtitle">Official Agenda Topics — 2327 Session</h3>
          
          <div class="dossier__topic-card">
            <div class="dossier__topic-letter">Topic ${comm.topics[0].letter}</div>
            <div class="dossier__topic-body">
              <h4 class="dossier__topic-title">${comm.topics[0].title}</h4>
              <p class="dossier__topic-desc">${comm.topics[0].summary}</p>
            </div>
          </div>

          <div class="dossier__topic-card">
            <div class="dossier__topic-letter">Topic ${comm.topics[1].letter}</div>
            <div class="dossier__topic-body">
              <h4 class="dossier__topic-title">${comm.topics[1].title}</h4>
              <p class="dossier__topic-desc">${comm.topics[1].summary}</p>
            </div>
          </div>
        </div>

        <div class="dossier__actions">
          <a href="#apply" class="dossier__btn dossier__btn--primary" id="dossier-apply-btn">
            Apply For ${comm.code} →
          </a>
          <button type="button" class="dossier__btn dossier__btn--ghost" id="dossier-guide-btn">
            Download Background Guide (PDF)
          </button>
        </div>
      </div>
    `;

    // Hook internal apply link
    const applyBtn = dossierContent.querySelector('#dossier-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        closeDossier();
      });
    }

    const guideBtn = dossierContent.querySelector('#dossier-guide-btn');
    if (guideBtn) {
      guideBtn.addEventListener('click', () => {
        const origText = guideBtn.textContent;
        guideBtn.textContent = '✓ Guide Download Queued';
        setTimeout(() => {
          guideBtn.textContent = origText;
        }, 2200);
      });
    }

    dossierModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  }

  function closeDossier() {
    if (!dossierModal) return;
    dossierModal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  }

  // Setup Initial Render
  renderDesktopCards();
  renderMobileCards();
  updateDesktopPositions(false);
  rotateMobileToStep(mobileStep, false);
  updateIndicators();

  // Desktop Card Click Handling
  if (desktopTrack) {
    desktopTrack.addEventListener('click', (e) => {
      const card = e.target.closest('.committee-card--desktop');
      if (!card) return;
      const idx = parseInt(card.getAttribute('data-index'), 10);
      if (idx === activeIndex) {
        // If already centered, open dossier
        openDossier(idx);
      } else {
        // Center this card
        goToIndex(idx);
      }
    });
  }

  // Mobile Carousel Prev / Next Controls
  if (mobilePrevBtn) mobilePrevBtn.addEventListener('click', prev);
  if (mobileNextBtn) mobileNextBtn.addEventListener('click', next);
  if (mobileDetailCta) {
    mobileDetailCta.addEventListener('click', () => openDossier(activeIndex));
  }

  // Prev / Next Controls (Desktop bottom bar)
  prevBtns.forEach(btn => btn.addEventListener('click', prev));
  nextBtns.forEach(btn => btn.addEventListener('click', next));

  // Explore Buttons
  exploreBtns.forEach(btn => {
    btn.addEventListener('click', () => openDossier(activeIndex));
  });

  // Modal Close
  if (dossierClose) dossierClose.addEventListener('click', closeDossier);
  if (dossierModal) {
    dossierModal.addEventListener('click', (e) => {
      if (e.target === dossierModal) closeDossier();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (dossierModal && dossierModal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeDossier();
      return;
    }
    // Only intercept arrow keys when committees section is in view
    const rect = container.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'ArrowRight') {
        next();
      }
    }
  });

  // 3D Parallax Tilt on Desktop Stage
  if (stage) {
    stage.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 840) return;
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(stage, {
        rotationY: x * 7,
        rotationX: -y * 5,
        duration: 0.6,
        ease: 'power2.out',
        transformPerspective: 1200,
        overwrite: 'auto'
      });
    });

    stage.addEventListener('mouseleave', () => {
      gsap.to(stage, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }

  // Mobile 3D Cylindrical Ring Touch & Pointer Drag Gestures
  if (mobileStage) {
    let startX = 0;
    let startAngle = 0;
    let isPointerDown = false;
    let moved = 0;

    const onDragStart = (clientX) => {
      startX = clientX;
      startAngle = mobileCarouselState.angle;
      isPointerDown = true;
      moved = 0;
      gsap.killTweensOf(mobileCarouselState);
    };

    const onDragMove = (clientX) => {
      if (!isPointerDown) return;
      const diffX = clientX - startX;
      moved = Math.abs(diffX);
      if (moved > 8) {
        isSwipingOrDragging = true;
      }
      // Map drag pixels directly to cylinder degrees (240px drag rotates 72° around circle)
      const deltaAngle = (diffX / 240) * 72;
      mobileCarouselState.angle = startAngle + deltaAngle;
      renderMobileCircle(mobileCarouselState.angle);
    };

    const onDragEnd = (clientX) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      const diffX = clientX - startX;

      setTimeout(() => {
        isSwipingOrDragging = false;
      }, 80);

      // Snap to next/prev card step or back to current
      if (Math.abs(diffX) > 35) {
        if (diffX < 0) {
          next();
        } else {
          prev();
        }
      } else {
        rotateMobileToStep(mobileStep, true);
      }
    };

    // Touch events
    mobileStage.addEventListener('touchstart', (e) => {
      onDragStart(e.touches[0].clientX);
    }, { passive: true });

    mobileStage.addEventListener('touchmove', (e) => {
      onDragMove(e.touches[0].clientX);
    }, { passive: true });

    mobileStage.addEventListener('touchend', (e) => {
      onDragEnd(e.changedTouches[0].clientX);
    }, { passive: true });

    // Pointer / Mouse drag for testing mobile carousel on any screen
    mobileStage.addEventListener('mousedown', (e) => {
      onDragStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isPointerDown) onDragMove(e.clientX);
    });

    window.addEventListener('mouseup', (e) => {
      if (isPointerDown) onDragEnd(e.clientX);
    });
  }

  // Responsive Resize Listener
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newIsMobile = window.innerWidth < 840;
      if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
      }
      updateDesktopPositions(false);
      renderMobileCircle(mobileCarouselState.angle);
    }, 150);
  });
}
