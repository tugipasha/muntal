import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Letters from './components/Letters.jsx';
import CommitteesSection from './components/CommitteesSection.jsx';
import CommitteeDossierModal from './components/CommitteeDossierModal.jsx';
import TeamSection from './components/TeamSection.jsx';
import ApplySection from './components/ApplySection.jsx';
import ApplyModal from './components/ApplyModal.jsx';
import ScrollProgressBar from './components/ScrollProgressBar.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const lenisRef = useRef(null);
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

  // Setup Lenis smooth scroll & GSAP text reveal
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.4,
      infinite: false,
    });
    lenisRef.current = lenis;
    window.lenis = lenis;

    const onScroll = ({ scroll, limit, velocity }) => {
      scrollStateRef.current.scrollProgress = Math.min(scroll / Math.max(limit, 1), 1);
      const clampedVel = Math.max(-60, Math.min(60, velocity));
      scrollStateRef.current.scrollVelocity = clampedVel;
      scrollStateRef.current.spinVelocity += clampedVel * 0.0028;
      ScrollTrigger.update();
    };

    lenis.on('scroll', onScroll);

    // Sync Lenis with GSAP ticker for synchronized 60/120fps stutter-free scroll
    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // GSAP ScrollTrigger text reveals
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        gsap.set('.reveal-text', { opacity: 1, y: 0, clearProps: 'all' });
        return;
      }

      gsap.utils.toArray('.reveal-text').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });
    });

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      window.lenis = null;
      ctx.revert();
    };
  }, []);

  const handleOpenDossier = useCallback((index) => {
    setDossierState({ isOpen: true, activeIndex: index });
    if (lenisRef.current) lenisRef.current.stop();
  }, []);

  const handleCloseDossier = useCallback(() => {
    setDossierState((prev) => ({ ...prev, isOpen: false }));
    if (lenisRef.current) lenisRef.current.start();
  }, []);

  const handleOpenApply = useCallback((trackKey = 'delegate', committee = '') => {
    setApplyState({
      isOpen: true,
      trackKey,
      initialCommittee: committee,
    });
    if (lenisRef.current) lenisRef.current.stop();
  }, []);

  const handleCloseApply = useCallback(() => {
    setApplyState((prev) => ({ ...prev, isOpen: false }));
    if (lenisRef.current) lenisRef.current.start();
  }, []);

  const handleApplyForCommittee = useCallback((commCode) => {
    handleCloseDossier();
    handleOpenApply('delegate', commCode);
  }, [handleCloseDossier, handleOpenApply]);

  return (
    <>
      <ScrollProgressBar />
      <div className="grain" aria-hidden="true"></div>

      <Navbar lenisRef={lenisRef} onOpenApply={handleOpenApply} />

      <main className="sections-stack">
        <Hero scrollStateRef={scrollStateRef} />
        <Letters />
        <CommitteesSection onOpenDossier={handleOpenDossier} />
        <TeamSection />
        <ApplySection onOpenApply={handleOpenApply} />
      </main>

      <CommitteeDossierModal
        isOpen={dossierState.isOpen}
        activeIndex={dossierState.activeIndex}
        onClose={handleCloseDossier}
        onApplyForCommittee={handleApplyForCommittee}
      />

      <ApplyModal
        isOpen={applyState.isOpen}
        trackKey={applyState.trackKey}
        initialCommittee={applyState.initialCommittee}
        onClose={handleCloseApply}
      />
    </>
  );
}
