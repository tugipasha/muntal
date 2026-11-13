import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';

import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ScrollProgressBar from './components/ScrollProgressBar.jsx';

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
      { rootMargin: isLetters ? '0px 0px' : '150px 0px', threshold: isLetters ? 0.01 : 0 }
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
    scrollVelocity: 0,
    spinVelocity: 0,
    rotationDecay: 0.9,
  });

  const [dossierState, setDossierState] = useState({
    isOpen: false,
    activeIndex: 2,
  });

  const [applyState, setApplyState] = useState({
    isOpen: false,
    trackKey: 'delegate',
    initialCommittee: '',
  });

  // Lightweight passive scroll state + IntersectionObserver text reveal (zero MutationObserver)
  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let rafPending = false;

    const handleScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const now = performance.now();
        const y = window.scrollY;
        const limit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const dt = Math.max(now - lastTime, 16);
        const velocity = ((y - lastY) / dt) * 16;
        const clampedVel = Math.max(-60, Math.min(60, velocity));

        scrollStateRef.current.scrollProgress = Math.min(Math.max(y / limit, 0), 1);
        scrollStateRef.current.scrollVelocity = clampedVel;
        scrollStateRef.current.spinVelocity += clampedVel * 0.0028;

        lastY = y;
        lastTime = now;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
