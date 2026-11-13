import React, { useEffect, useRef } from 'react';

export const CARD_SCALE = 1.15;

export function revealHeroTypography() {
  document.body.classList.remove('hero-replaying');
  document.body.classList.add('hero-revealed');
}

export function hideHeroTypography() {
  document.body.classList.remove('hero-revealed');
  document.body.classList.add('hero-replaying');
}

export default function Hero({ scrollStateRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const heroEl = containerRef.current;
    if (!heroEl) return;

    let cancelled = false;
    let cleanupSpiral = null;
    let replayTimer = null;

    const triggerReplayTypography = () => {
      hideHeroTypography();
      if (replayTimer) clearTimeout(replayTimer);
      replayTimer = setTimeout(() => {
        revealHeroTypography();
      }, 2050);
    };

    const startSpiral = () => {
      if (cancelled) return;
      import('../hero-spiral.js')
        .then(({ initHeroSpiral }) => {
          if (cancelled || !containerRef.current) return;
          cleanupSpiral = initHeroSpiral({
            heroEl: containerRef.current,
            scrollStateRef,
            onReplayTypography: triggerReplayTypography,
          });
        })
        .catch(() => {
          // Graceful fallback: hero typography remains visible even if WebGL is unavailable
        });
    };

    // Defer WebGL bundle + scene initialization until after first paint
    let timerId = null;
    const rafId = requestAnimationFrame(() => {
      timerId = setTimeout(startSpiral, 60);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
      if (replayTimer) clearTimeout(replayTimer);
      if (cleanupSpiral) cleanupSpiral();
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
