import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import Lenis from 'lenis';

import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ScrollProgressBar from './components/ScrollProgressBar.jsx';
import { HERO_SCROLL_VH_PER_TURN } from './hero-config.js';

const Letters = lazy(() => import('./components/Letters.jsx'));
const CommitteesSection = lazy(() => import('./components/CommitteesSection.jsx'));
const TeamSection = lazy(() => import('./components/TeamSection.jsx'));
const ApplySection = lazy(() => import('./components/ApplySection.jsx'));
const CommitteeDossierModal = lazy(() => import('./components/CommitteeDossierModal.jsx'));
const ApplyModal = lazy(() => import('./components/ApplyModal.jsx'));

function DeferredSection({ id, minHeight = '90vh', children }) {
  const [mounted, setMounted] = useState(false);
  const holderRef = useRef(null);

  useEffect(() => {
    if (mounted) return;
    const el = holderRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setMounted(true);
      return;
    }

    const mountNow = () => setMounted(true);
    const isLetters = id === 'letters';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          mountNow();
        }
      },
      { rootMargin: isLetters ? '0px 0px' : '900px 0px', threshold: isLetters ? 0.01 : 0 }
    );
    observer.observe(el);

    const onEarlyScroll = () => {
      if (window.scrollY > 2) {
        observer.disconnect();
        mountNow();
      }
    };
    if (isLetters) {
      window.addEventListener('scroll', onEarlyScroll, { passive: true, once: true });
    }

    const handleReveal = (e) => {
      if (!e?.detail || e.detail === id) {
        observer.disconnect();
        mountNow();
      }
    };
    const handleHashJump = () => {
      if (window.location.hash === `#${id}`) {
        observer.disconnect();
        mountNow();
      }
    };
    window.addEventListener('muntal:reveal', handleReveal);
    window.addEventListener('hashchange', handleHashJump);

    return () => {
      observer.disconnect();
      if (isLetters) window.removeEventListener('scroll', onEarlyScroll);
      window.removeEventListener('muntal:reveal', handleReveal);
      window.removeEventListener('hashchange', handleHashJump);
    };
  }, [id, mounted]);

  if (mounted) {
    return (
      <Suspense fallback={<section className="section" id={id} style={{ minHeight }} aria-hidden="true" />}>
        {children}
      </Suspense>
    );
  }

  return <section className="section" id={id} ref={holderRef} style={{ minHeight }} aria-hidden="true" />;
}

export default function App() {
  const scrollStateRef = useRef({
    scrollProgress: 0,
    heroTurnProgress: 0,
    heroTurnCount: 0,
    postHeroProgress: 0,
    scrollVelocity: 0,
    spinVelocity: 0,
    rotationDecay: 0.9,
  });

  const lenisRef = useRef(null);
  const externalScrollLockRef = useRef(false);

  const [dossierState, setDossierState] = useState({
    isOpen: false,
    activeIndex: 2,
  });

  const [applyState, setApplyState] = useState({
    isOpen: false,
    trackKey: 'delegate',
    initialCommittee: '',
  });

  // Smooth inertial scrolling (Lenis) + passive scroll state synced to hero spiral
  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let cachedRunwayDistance = 0;
    let cachedHeroHeight = window.innerHeight || 800;
    let cachedLimit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);

    const measureLayout = () => {
      const runwayEl = document.getElementById('hero');
      const heroEl = runwayEl?.querySelector('.hero');
      cachedHeroHeight = heroEl?.offsetHeight || window.innerHeight || 800;
      cachedRunwayDistance = runwayEl && heroEl
        ? Math.max(0, runwayEl.offsetHeight - heroEl.offsetHeight)
        : 0;
      cachedLimit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    };

    const updateScrollState = (overrideY, overrideVelocity) => {
      const now = performance.now();
      const y = Math.max(0, typeof overrideY === 'number' ? overrideY : window.scrollY);
      const dt = Math.max(now - lastTime, 16);
      const rawVelocity = typeof overrideVelocity === 'number'
        ? overrideVelocity
        : ((y - lastY) / dt) * 16;
      const clampedVel = Math.max(-60, Math.min(60, rawVelocity));

      const pxPerTurn = Math.max(cachedHeroHeight * (HERO_SCROLL_VH_PER_TURN / 100), 1);
      const heroTurnProgress = cachedRunwayDistance > 0
        ? Math.min(Math.max(y / cachedRunwayDistance, 0), 1)
        : 0;
      const heroTurnCount = y / pxPerTurn;
      const postHeroSpan = Math.max(cachedLimit - cachedRunwayDistance, 1);
      const postHeroProgress = Math.min(Math.max((y - cachedRunwayDistance) / postHeroSpan, 0), 1);

      scrollStateRef.current.scrollProgress = Math.min(Math.max(y / cachedLimit, 0), 1);
      scrollStateRef.current.heroTurnProgress = heroTurnProgress;
      scrollStateRef.current.heroTurnCount = heroTurnCount;
      scrollStateRef.current.postHeroProgress = postHeroProgress;
      scrollStateRef.current.scrollVelocity = clampedVel;
      scrollStateRef.current.spinVelocity += clampedVel * 0.0028;

      lastY = y;
      lastTime = now;
    };

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis = null;
    if (!prefersReducedMotion) {
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.15,
      });
      lenisRef.current = lenis;
      lenis.on('scroll', ({ scroll, velocity }) => {
        updateScrollState(scroll, velocity);
      });
    }

    const handleNativeScroll = () => {
      updateScrollState();
    };

    const handleResize = () => {
      measureLayout();
      lenis?.resize();
      updateScrollState();
    };

    const handleScrollTo = (e) => {
      const targetId = e?.detail?.targetId;
      const immediate = Boolean(e?.detail?.immediate);
      if (!targetId) return;

      window.dispatchEvent(new CustomEvent('muntal:reveal'));

      requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        if (!el) return;
        measureLayout();
        lenis?.resize();

        if (lenis) {
          lenis.scrollTo(el, {
            duration: immediate ? 0 : 1.15,
            immediate,
          });
        } else {
          el.scrollIntoView({ behavior: immediate || prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    };

    const handleScrollLock = (e) => {
      const locked = Boolean(e?.detail?.locked);
      externalScrollLockRef.current = locked;
      if (!lenis) return;
      if (locked) lenis.stop();
      else lenis.start();
    };

    let resizeObserver = null;
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(() => {
        measureLayout();
        lenis?.resize();
      });
      resizeObserver.observe(document.documentElement);
    }

    measureLayout();
    updateScrollState();
    window.addEventListener('scroll', handleNativeScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('muntal:scrollTo', handleScrollTo);
    window.addEventListener('muntal:scrollLock', handleScrollLock);

    return () => {
      window.removeEventListener('scroll', handleNativeScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('muntal:scrollTo', handleScrollTo);
      window.removeEventListener('muntal:scrollLock', handleScrollLock);
      resizeObserver?.disconnect();
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis while modals are open so background never drifts
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (dossierState.isOpen || applyState.isOpen || externalScrollLockRef.current) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [dossierState.isOpen, applyState.isOpen]);

  const handleOpenDossier = useCallback((index) => {
    setDossierState({ isOpen: true, activeIndex: index });
  }, []);

  const handleCloseDossier = useCallback(() => {
    setDossierState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleOpenApply = useCallback((trackKey = 'delegate', committee = '') => {
    setApplyState({
      isOpen: true,
      trackKey,
      initialCommittee: committee,
    });
  }, []);

  const handleCloseApply = useCallback(() => {
    setApplyState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleApplyForCommittee = useCallback((commCode) => {
    handleCloseDossier();
    handleOpenApply('delegate', commCode);
  }, [handleCloseDossier, handleOpenApply]);

  return (
    <>
      <ScrollProgressBar />
      <div className="grain" aria-hidden="true"></div>

      <Navbar onOpenApply={handleOpenApply} />

      <main className="sections-stack">
        <Hero scrollStateRef={scrollStateRef} />
        <DeferredSection id="letters" minHeight="85vh">
          <Letters />
        </DeferredSection>
        <DeferredSection id="committees" minHeight="100vh">
          <CommitteesSection onOpenDossier={handleOpenDossier} />
        </DeferredSection>
        <DeferredSection id="team" minHeight="100vh">
          <TeamSection />
        </DeferredSection>
        <DeferredSection id="apply" minHeight="90vh">
          <ApplySection onOpenApply={handleOpenApply} />
        </DeferredSection>
      </main>

      <Suspense fallback={null}>
        {dossierState.isOpen && (
          <CommitteeDossierModal
            isOpen={dossierState.isOpen}
            activeIndex={dossierState.activeIndex}
            onClose={handleCloseDossier}
            onApplyForCommittee={handleApplyForCommittee}
          />
        )}

        {applyState.isOpen && (
          <ApplyModal
            isOpen={applyState.isOpen}
            trackKey={applyState.trackKey}
            initialCommittee={applyState.initialCommittee}
            onClose={handleCloseApply}
          />
        )}
      </Suspense>
    </>
  );
}
