import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { TEAM_MEMBERS } from '../team.js';

export default function TeamSection() {
  const total = TEAM_MEMBERS.length;
  const anglePerItem = 360 / total;

  const [activeIndex, setActiveIndex] = useState(0); // Tolga Aydın (Head of IT)
  const [currentStep, setCurrentStep] = useState(0);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const cylinderState = useRef({ angle: 0 });
  const isDraggingRef = useRef(false);
  const isInteractingRef = useRef(false);
  const autoRotateTimerRef = useRef(null);

  // Position cards on the 3D cylinder
  const renderCylinder = useCallback((angleDeg) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll('.team-cylinder-card');
    if (!cards.length) return;

    const width = window.innerWidth;
    const isMobile = width < 768;
    const isSmall = width < 420;

    // Card width + gap on screen; radius is derived so neighbours sit side by side
    const cardW = isSmall ? 255 : isMobile ? 290 : Math.min(340, Math.max(270, width * 0.24));
    const spacing = cardW * (isMobile ? 0.8 : 0.92);
    const radius = spacing / Math.sin((anglePerItem * Math.PI) / 180) ;
    const depthRatio = 0.6;

    cards.forEach((card, idx) => {
      const baseAngle = idx * anglePerItem;
      const totalAngle = baseAngle + angleDeg;
      const norm = (((totalAngle % 360) + 540) % 360) - 180;
      const rad = (norm * Math.PI) / 180;

      const x = Math.sin(rad) * radius;
      const z = (Math.cos(rad) - 1) * radius * depthRatio;
      const rotateY = -norm * 0.9;
      const dist = Math.abs(norm) / anglePerItem; // distance from centre in card steps

      const scale = Math.max(0.55, 1 - dist * 0.07);
      const opacity = dist > 4.5 ? 0 : Math.max(0.15, 1 - dist * 0.22);
      const zIndex = Math.round(100 - dist * 4);

      const isCenter = dist < 0.5;
      const isAdjacent = dist >= 0.5 && dist <= 3;

      card.classList.toggle('is-active', isCenter);
      card.classList.toggle('is-adjacent', isAdjacent);
      card.setAttribute('aria-selected', isCenter ? 'true' : 'false');
      card.style.pointerEvents = isCenter || isAdjacent ? 'auto' : 'none';
      card.style.visibility = opacity === 0 ? 'hidden' : 'visible';

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
          // Normalize to avoid huge step numbers
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

  const goToIndex = useCallback((targetIndex) => {
    let diff = targetIndex - (currentStep % total);
    let normDiff = ((diff % total) + total) % total;
    if (normDiff > total / 2) normDiff -= total;
    rotateToStep(currentStep + normDiff, true);
  }, [currentStep, total, rotateToStep]);

  // Initial layout and resize handler
  useEffect(() => {
    renderCylinder(cylinderState.current.angle);

    const handleResize = () => {
      renderCylinder(cylinderState.current.angle);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCylinder]);

  // Auto-rotation interval: rotates continuously every 3.6s ONLY when visible on screen
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
      }, 3600);
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
      // Convert pixel distance to cylinder rotation angle
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
        // Snap to closest card
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

  return (
    <section
      className="section team-section"
      id="team"
      ref={sectionRef}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
      }}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <div className="team-editorial-backdrop" aria-hidden="true">
        <div className="team-backdrop-glow"></div>
        <div className="team-backdrop-grid"></div>
      </div>

      <div className="team__container">
        
        {/* Editorial Section Header */}
        <div className="team__header">
          <div className="team__meta-row">
            <span className="team__label reveal-text">03 — SECRETARIAT & LEADERSHIP</span>
            <span className="team__hashtag reveal-text">#DiplomacyatIndustry</span>
          </div>
        </div>

        {/* 3D Cylindrical Ring Revolving Stage */}
        <div className="team-cylinder-stage-wrapper">
          <div className="team-cylinder-stage" ref={stageRef}>
            <div className="team-cylinder-track" ref={trackRef}>
              {TEAM_MEMBERS.map((member, idx) => (
                <div
                  key={member.id}
                  className="team-cylinder-card"
                  data-index={idx}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${member.name}, ${member.role}`}
                  onClick={() => {
                    if (isDraggingRef.current) return;
                    goToIndex(idx);
                  }}
                >
                  <div className="team-poster-frame">
                    
                    {/* Poster image (name & role are part of the artwork) */}
                    <div className="team-poster__photo-wrapper">
                      <img
                        src={member.image}
                        alt={`${member.name} — ${member.shortRole}`}
                        className="team-poster__photo"
                        loading="lazy"
                        decoding="async"
                        width="300"
                        height="400"
                        draggable="false"
                      />
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
