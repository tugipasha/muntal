import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { COMMITTEES, getCommitteeSvgArtwork } from '../committees-data.js';

function LaurelEmblem() {
  return (
    <svg
      className="team-poster__emblem-svg"
      viewBox="0 0 100 100"
      width="34"
      height="34"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9" />
      <ellipse cx="50" cy="50" rx="10" ry="22" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
      <line x1="28" y1="50" x2="72" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx="50" cy="38" rx="18" ry="6" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
      <ellipse cx="50" cy="62" rx="18" ry="6" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />

      {/* Left Laurel */}
      <path
        d="M 22 75 C 14 62 14 38 28 22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 20 72 C 14 70 10 65 14 61 C 18 64 21 68 20 72 Z" fill="currentColor" opacity="0.9" />
      <path d="M 16 58 C 10 56 6 50 11 47 C 15 50 17 54 16 58 Z" fill="currentColor" opacity="0.9" />
      <path d="M 16 44 C 10 41 8 35 13 32 C 17 35 18 40 16 44 Z" fill="currentColor" opacity="0.9" />
      <path d="M 20 32 C 16 27 16 20 22 19 C 24 23 23 29 20 32 Z" fill="currentColor" opacity="0.9" />
      <path d="M 27 22 C 25 16 28 10 34 11 C 34 16 31 20 27 22 Z" fill="currentColor" opacity="0.9" />

      {/* Right Laurel */}
      <path
        d="M 78 75 C 86 62 86 38 72 22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 80 72 C 86 70 90 65 86 61 C 82 64 79 68 80 72 Z" fill="currentColor" opacity="0.9" />
      <path d="M 84 58 C 90 56 94 50 89 47 C 85 50 83 54 84 58 Z" fill="currentColor" opacity="0.9" />
      <path d="M 84 44 C 90 41 92 35 87 32 C 83 35 82 40 84 44 Z" fill="currentColor" opacity="0.9" />
      <path d="M 80 32 C 84 27 84 20 78 19 C 76 23 77 29 80 32 Z" fill="currentColor" opacity="0.9" />
      <path d="M 73 22 C 75 16 72 10 66 11 C 66 16 69 20 73 22 Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export default function CommitteesSection({ onOpenDossier }) {
  const total = COMMITTEES.length; // 5
  const anglePerItem = 360 / total; // 72 degrees

  const [activeIndex, setActiveIndex] = useState(2); // 03 UNSC centerpiece by default
  const [currentStep, setCurrentStep] = useState(2);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const cylinderState = useRef({ angle: -2 * 72 });
  const isDraggingRef = useRef(false);
  const isInteractingRef = useRef(false);
  const autoRotateTimerRef = useRef(null);

  // Position committee cards on the 3D revolving cylinder
  const renderCylinder = useCallback((angleDeg) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll('.committees-cylinder-card');
    if (!cards.length) return;

    const width = window.innerWidth;
    const isMobile = width < 768;
    const isSmall = width < 420;

    // Generous radius for a spacious, open cylindrical curve (ferah)
    const radius = isSmall ? 280 : isMobile ? 320 : 460;
    const depthRatio = isMobile ? 0.95 : 0.88;

    cards.forEach((card, idx) => {
      const baseAngle = idx * anglePerItem;
      const totalAngle = baseAngle + angleDeg;
      const norm = (((totalAngle % 360) + 540) % 360) - 180;
      const rad = (norm * Math.PI) / 180;

      const x = Math.sin(rad) * radius;
      const z = (Math.cos(rad) - 1) * radius * depthRatio;
      const rotateY = -norm * 0.72; // Outward angle following the ring curve
      const depthFactor = (Math.cos(rad) + 1) / 2; // 1 at front, 0 at back

      const scale = isMobile ? (0.72 + 0.28 * depthFactor) : (0.76 + 0.24 * depthFactor);
      const opacity = 0.2 + 0.8 * Math.pow(depthFactor, 1.4);
      const zIndex = Math.round(10 + depthFactor * 80);

      const isCenter = Math.abs(norm) < 28;
      const isAdjacent = Math.abs(norm) >= 28 && Math.abs(norm) <= 85;

      card.classList.toggle('is-active', isCenter);
      card.classList.toggle('is-adjacent', isAdjacent);
      card.setAttribute('aria-selected', isCenter ? 'true' : 'false');
      card.style.pointerEvents = isCenter || isAdjacent ? 'auto' : 'none';

      gsap.set(card, {
        x,
        z,
        rotationY: rotateY,
        scale,
        opacity,
        zIndex,
      });
    });
  }, [anglePerItem]);

  // Smooth rotation animation to target step
  const rotateToStep = useCallback((step, animate = true) => {
    const targetAngle = -step * anglePerItem;
    const normIndex = ((step % total) + total) % total;

    setCurrentStep(step);
    setActiveIndex(normIndex);

    gsap.killTweensOf(cylinderState.current);

    if (animate) {
      gsap.to(cylinderState.current, {
        angle: targetAngle,
        duration: 0.85,
        ease: 'power3.out',
        onUpdate: () => renderCylinder(cylinderState.current.angle),
        onComplete: () => {
          const safeStep = ((step % total) + total) % total;
          setCurrentStep(safeStep);
          cylinderState.current.angle = -safeStep * anglePerItem;
          renderCylinder(cylinderState.current.angle);
        },
      });
    } else {
      cylinderState.current.angle = targetAngle;
      renderCylinder(cylinderState.current.angle);
    }
  }, [anglePerItem, total, renderCylinder]);

  const next = useCallback(() => {
    rotateToStep(currentStep + 1, true);
  }, [currentStep, rotateToStep]);

  const prev = useCallback(() => {
    rotateToStep(currentStep - 1, true);
  }, [currentStep, rotateToStep]);

  // Initial layout and resize handler
  useEffect(() => {
    renderCylinder(cylinderState.current.angle);

    const handleResize = () => {
      renderCylinder(cylinderState.current.angle);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCylinder]);

  // Auto-rotation interval: rotates continuously every 3.8s ONLY when visible on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let isVisible = false;

    const startAutoRotate = () => {
      stopAutoRotate();
      if (!isVisible) return;
      autoRotateTimerRef.current = setInterval(() => {
        if (!isInteractingRef.current && !isDraggingRef.current && isVisible) {
          next();
        }
      }, 3800);
    };

    const stopAutoRotate = () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startAutoRotate();
        } else {
          stopAutoRotate();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stopAutoRotate();
    };
  }, [next]);

  // Touch and Mouse drag gesture to spin the cylinder freely
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let startX = 0;
    let startAngle = 0;
    let isPointerDown = false;
    let resumeTimeout = null;

    const handlePause = () => {
      isInteractingRef.current = true;
      if (resumeTimeout) clearTimeout(resumeTimeout);
    };

    const handleResume = () => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isInteractingRef.current = false;
      }, 3200);
    };

    const onDragStart = (clientX) => {
      handlePause();
      startX = clientX;
      startAngle = cylinderState.current.angle;
      isPointerDown = true;
      isDraggingRef.current = false;
      gsap.killTweensOf(cylinderState.current);
    };

    const onDragMove = (clientX) => {
      if (!isPointerDown) return;
      const diffX = clientX - startX;
      if (Math.abs(diffX) > 6) {
        isDraggingRef.current = true;
      }
      const dragSensitivity = window.innerWidth < 768 ? 220 : 340;
      const deltaAngle = (diffX / dragSensitivity) * anglePerItem;
      cylinderState.current.angle = startAngle + deltaAngle;
      renderCylinder(cylinderState.current.angle);
    };

    const onDragEnd = (clientX) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      const diffX = clientX - startX;

      setTimeout(() => {
        isDraggingRef.current = false;
      }, 80);

      if (Math.abs(diffX) > 30) {
        if (diffX < 0) {
          next();
        } else {
          prev();
        }
      } else {
        const nearestStep = Math.round(-cylinderState.current.angle / anglePerItem);
        rotateToStep(nearestStep, true);
      }

      handleResume();
    };

    const onTouchStart = (e) => onDragStart(e.touches[0].clientX);
    const onTouchMove = (e) => onDragMove(e.touches[0].clientX);
    const onTouchEnd = (e) => onDragEnd(e.changedTouches[0].clientX);
    const onMouseDown = (e) => onDragStart(e.clientX);
    const onMouseMove = (e) => {
      if (isPointerDown) onDragMove(e.clientX);
    };
    const onMouseUp = (e) => {
      if (isPointerDown) onDragEnd(e.clientX);
    };

    stage.addEventListener('mouseenter', handlePause);
    stage.addEventListener('mouseleave', handleResume);
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: true });
    stage.addEventListener('touchend', onTouchEnd, { passive: true });
    stage.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      stage.removeEventListener('mouseenter', handlePause);
      stage.removeEventListener('mouseleave', handleResume);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (resumeTimeout) clearTimeout(resumeTimeout);
    };
  }, [anglePerItem, next, prev, renderCylinder, rotateToStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next]);

  return (
    <section
      className="section committees-section"
      id="committees"
      ref={sectionRef}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* 3D Monolithic Architectural Backdrop Elements */}
      <div className="committees__backdrop" aria-hidden="true">
        <div className="backdrop-block backdrop-block--1"></div>
        <div className="backdrop-block backdrop-block--2"></div>
        <div className="backdrop-block backdrop-block--3"></div>
        <div className="backdrop-block backdrop-block--4"></div>
        <div className="backdrop-light-glow"></div>
      </div>

      <div className="committees__container">
        {/* Clean Editorial Section Header (Subtitle removed per selection) */}
        <div className="committees__header">
          <div className="committees__meta-row">
            <span className="committees__label reveal-text">02 — COMMITTEES</span>
            <span className="committees__hashtag reveal-text">#DiplomaticArchitecture</span>
          </div>
        </div>

        {/* 3D Cylindrical Ring Revolving Stage (matching Team design) */}
        <div className="committees-cylinder-stage-wrapper">
          <div className="committees-cylinder-stage" ref={stageRef}>
            <div className="committees-cylinder-track" ref={trackRef}>
              {COMMITTEES.map((comm, idx) => (
                <div
                  key={comm.id}
                  className="committees-cylinder-card"
                  data-index={idx}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${comm.code}, ${comm.name}`}
                  onClick={() => {
                    if (isDraggingRef.current) return;
                    const baseAngle = idx * anglePerItem;
                    const currentAngle = baseAngle + cylinderState.current.angle;
                    const norm = (((currentAngle % 360) + 540) % 360) - 180;

                    if (Math.abs(norm) < 24) {
                      onOpenDossier && onOpenDossier(idx);
                    } else if (norm > 0) {
                      next();
                    } else {
                      prev();
                    }
                  }}
                >
                  <div className="team-poster-frame">
                    
                    {/* Background Artwork & Photo Layer */}
                    <div className="team-poster__photo-wrapper">
                      <img
                        src={comm.image}
                        alt={comm.name}
                        className="team-poster__photo"
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="480"
                      />
                      {/* Integrated High-Tech Blueprint SVG Artwork Layer */}
                      <div
                        className="committee-poster__svg-overlay"
                        dangerouslySetInnerHTML={{ __html: getCommitteeSvgArtwork(comm.code) }}
                      />
                      <div className="team-poster__overlay-vignette"></div>
                      <div className="team-poster__overlay-grad"></div>
                    </div>

                    {/* Giant Architectural Typographic Role Backdrop */}
                    <div className="team-poster__giant-text" aria-hidden="true">
                      {comm.posterTitle.split('\n').map((line, lIdx) => (
                        <span key={lIdx} className="team-poster__giant-line">
                          {line}
                        </span>
                      ))}
                    </div>

                    {/* Top Bar with Tagline & Badge */}
                    <div className="team-poster__topbar">
                      <span className="team-poster__hashtag">{comm.tagline}</span>
                      <span className="team-poster__code-badge">{comm.num}</span>
                    </div>

                    {/* Bottom Editorial Content Card */}
                    <div className="team-poster__footer">
                      <div className="team-poster__title-group">
                        <h3 className="team-poster__name">{comm.code}</h3>
                        <p className="team-poster__role">{comm.name}</p>
                      </div>

                      <div className="team-poster__emblem">
                        <LaurelEmblem />
                      </div>
                    </div>

                    {/* Glassmorphic Rim Sheen */}
                    <div className="team-poster__sheen" aria-hidden="true"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
