import React, { useEffect, useRef } from 'react';

export default function ScrollProgressBar() {
  const barRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      if (!barRef.current) return;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        barRef.current.style.width = '0%';
        return;
      }
      const currentScroll = window.scrollY;
      const pct = Math.min(Math.max((currentScroll / totalScroll) * 100, 0), 100);
      barRef.current.style.width = `${pct}%`;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="scroll-progress-container" aria-hidden="true">
      <div
        className="scroll-progress-bar"
        ref={barRef}
        style={{ width: '0%' }}
      >
        <span className="scroll-progress-glow"></span>
      </div>
    </div>
  );
}
