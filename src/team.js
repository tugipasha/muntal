import { gsap } from 'gsap';

export const TEAM_MEMBERS = [
  {
    id: 'mert-aydin',
    name: 'Mert Aydın',
    initials: 'MA',
    code: 'USG',
    role: 'UNDER-SECRETARY-GENERAL FOR COMMITTEES',
    quote: '“Writes the study guides you actually read.”',
  },
  {
    id: 'elif-yilmaz',
    name: 'Elif Yılmaz',
    initials: 'EY',
    code: 'SG',
    role: 'SECRETARY-GENERAL',
    quote: '“Diplomacy is not the absence of tension, but the mastery of it.”',
  },
  {
    id: 'can-demir',
    name: 'Can Demir',
    initials: 'CD',
    code: 'DG',
    role: 'DIRECTOR-GENERAL',
    quote: '“Flawless logistics turn ambitious debates into historic treaties.”',
  },
  {
    id: 'kaan-yildiz',
    name: 'Kaan Yıldız',
    initials: 'KY',
    code: 'CRISIS',
    role: 'UNDER-SECRETARY-GENERAL FOR CRISIS',
    quote: '“The real simulation starts when the midnight telegram arrives.”',
  },
  {
    id: 'selin-aksoy',
    name: 'Selin Aksoy',
    initials: 'SA',
    code: 'PRESS',
    role: 'HEAD OF PRESS CORPS',
    quote: '“Uncovering the whispered accords before the resolutions are printed.”',
  },
];

export function initTeam() {
  const teamSection = document.getElementById('team');
  if (!teamSection) return;

  const track = document.getElementById('team-avatars-track');
  const nameEl = document.getElementById('team-member-name');
  const roleEl = document.getElementById('team-member-role');
  const quoteEl = document.getElementById('team-member-quote');
  const infoEl = document.getElementById('team-info');
  const paginationEl = document.getElementById('team-pagination');
  const prevBtn = document.getElementById('team-btn-prev');
  const nextBtn = document.getElementById('team-btn-next');
  const stageEl = document.querySelector('.team-orbit-stage');

  if (!track || !nameEl || !roleEl || !quoteEl) return;

  let activeIndex = 0; // Default to Mert Aydın as in reference image!
  const total = TEAM_MEMBERS.length;
  let isAnimating = false;

  // Render 5 circular avatar elements without photos
  track.innerHTML = TEAM_MEMBERS.map((member, idx) => `
    <div class="team-avatar-item" data-index="${idx}" role="button" tabindex="0" aria-label="Select ${member.name}">
      <div class="team-avatar-ring"></div>
      <div class="team-avatar-seal">
        <div class="team-seal-glow"></div>
        <div class="team-seal-inner">
          <span class="team-seal-code">${member.code}</span>
          <span class="team-seal-initials">${member.initials}</span>
          <span class="team-seal-line"></span>
        </div>
      </div>
    </div>
  `).join('');

  // Render pagination dots
  if (paginationEl) {
    paginationEl.innerHTML = TEAM_MEMBERS.map((_, idx) => `
      <button type="button" class="team-dot ${idx === activeIndex ? 'is-active' : ''}" data-index="${idx}" aria-label="Go to member ${idx + 1}"></button>
    `).join('');

    paginationEl.querySelectorAll('.team-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        goToIndex(idx);
      });
    });
  }

  const avatarEls = track.querySelectorAll('.team-avatar-item');

  function updateAvatarPositions(animate = true) {
    const isMobile = window.innerWidth < 640;
    const isSmall = window.innerWidth < 400;

    // Radius / spacing along horizontal curved orbit arc
    const stepX = isSmall ? 82 : (isMobile ? 100 : 160);
    const dropY = isMobile ? 12 : 18;

    avatarEls.forEach((el, idx) => {
      let diff = idx - activeIndex;
      let norm = ((diff % total) + total) % total;
      if (norm > 2) norm -= total; // yields -2, -1, 0, 1, 2

      const isCenter = norm === 0;
      const isFlank = Math.abs(norm) === 1;

      const targetX = norm * stepX;
      // Parabolic arc curvature: center is highest, flanks curve down slightly
      const targetY = Math.pow(Math.abs(norm), 1.7) * dropY;

      const targetScale = isCenter ? 1.0 : (isFlank ? 0.68 : 0.44);
      const targetOpacity = isCenter ? 1.0 : (isFlank ? 0.48 : 0.20);
      const targetZIndex = isCenter ? 10 : (isFlank ? 5 : 2);

      el.classList.toggle('is-center', isCenter);
      el.classList.toggle('is-flank', isFlank);
      el.classList.toggle('is-outer', !isCenter && !isFlank);

      if (animate) {
        gsap.to(el, {
          x: targetX,
          y: targetY,
          scale: targetScale,
          opacity: targetOpacity,
          zIndex: targetZIndex,
          duration: 0.65,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } else {
        gsap.set(el, {
          x: targetX,
          y: targetY,
          scale: targetScale,
          opacity: targetOpacity,
          zIndex: targetZIndex,
        });
      }
    });

    // Update pagination active state
    if (paginationEl) {
      paginationEl.querySelectorAll('.team-dot').forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeIndex);
      });
    }
  }

  function updateText(animate = true) {
    const current = TEAM_MEMBERS[activeIndex];
    if (!current) return;

    if (animate && infoEl) {
      gsap.to(infoEl, {
        opacity: 0,
        y: -4,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          nameEl.textContent = current.name;
          roleEl.textContent = current.role;
          quoteEl.textContent = current.quote;
          gsap.fromTo(infoEl, 
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          );
        }
      });
    } else {
      nameEl.textContent = current.name;
      roleEl.textContent = current.role;
      quoteEl.textContent = current.quote;
    }
  }

  function goToIndex(idx) {
    if (isAnimating && idx === activeIndex) return;
    isAnimating = true;

    activeIndex = ((idx % total) + total) % total;
    updateAvatarPositions(true);
    updateText(true);

    setTimeout(() => {
      isAnimating = false;
    }, 450);
  }

  function next() {
    goToIndex(activeIndex + 1);
  }

  function prev() {
    goToIndex(activeIndex - 1);
  }

  // Click on any avatar
  avatarEls.forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-index'), 10);
      if (idx !== activeIndex) {
        goToIndex(idx);
      }
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = parseInt(el.getAttribute('data-index'), 10);
        goToIndex(idx);
      }
    });
  });

  // Buttons
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Keyboard navigation when hovering/focused within section
  teamSection.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prev();
    } else if (e.key === 'ArrowRight') {
      next();
    }
  });

  // Touch and drag support for mobile & desktop swipe
  if (stageEl) {
    let startX = 0;
    let startY = 0;
    let isDown = false;

    stageEl.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDown = true;
    }, { passive: true });

    stageEl.addEventListener('touchend', (e) => {
      if (!isDown) return;
      isDown = false;
      const diffX = e.changedTouches[0].clientX - startX;
      const diffY = e.changedTouches[0].clientY - startY;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          next();
        } else {
          prev();
        }
      }
    }, { passive: true });

    stageEl.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDown) return;
      isDown = false;
      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;

      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          next();
        } else {
          prev();
        }
      }
    });
  }

  // Initial render
  updateAvatarPositions(false);
  updateText(false);

  // Resize listener
  window.addEventListener('resize', () => {
    updateAvatarPositions(false);
  });
}
