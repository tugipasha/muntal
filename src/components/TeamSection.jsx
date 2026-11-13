import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TEAM_MEMBERS } from '../team.js';
import { computeTeamCardLayout, easeOutCubic, shortestStepDelta } from '../utils/carouselMath.js';

export default function TeamSection() {
  const total = TEAM_MEMBERS.length;
  const anglePerItem = 360 / total;

  const [currentStep, setCurrentStep] = useState(0);
  const [shouldLoadImages, setShouldLoadImages] = useState(false);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const cylinderState = useRef({ angle: 0 });
  const tweenRafRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isInteractingRef = useRef(false);
  const autoRotateTimerRef = useRef(null);

  const stopTween = useCallback(() => {
    if (tweenRafRef.current) {
      cancelAnimationFrame(tweenRafRef.current);
      tweenRafRef.current = null;
    }
  }, []);

  // Position cards on the 3D cylinder
  const renderCylinder = useCallback((angleDeg) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll('.team-cylinder-card');
    if (!cards.length) return;

    const width = window.innerWidth;

    cards.forEach((card, idx) => {
      const { x, z, rotateY, scale, opacity, zIndex, isCenter, isAdjacent } =
        computeTeamCardLayout(idx, angleDeg, anglePerItem, width);

      card.classList.toggle('is-active', isCenter);
      card.classList.toggle('is-adjacent', isAdjacent);
      card.setAttribute('aria-selected', isCenter ? 'true' : 'false');
      card.style.pointerEvents = isCenter || isAdjacent ? 'auto' : 'none';
      card.style.visibility = opacity === 0 ? 'hidden' : 'visible';
      card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });
  }, [anglePerItem]);

  // Smooth rotation animation to target step
  const rotateToStep = useCallback((step, animate = true) => {
    const targetAngle = -step * anglePerItem;
    setCurrentStep(step);
    stopTween();

    if (animate) {
      const startAngle = cylinderState.current.angle;
      const startTime = performance.now();
      const duration = 850;

      const stepFrame = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = easeOutCubic(t);
        cylinderState.current.angle = startAngle + (targetAngle - startAngle) * eased;
        renderCylinder(cylinderState.current.angle);

        if (t < 1) {
          tweenRafRef.current = requestAnimationFrame(stepFrame);
        } else {
          tweenRafRef.current = null;
          const safeStep = ((step % total) + total) % total;
          setCurrentStep(safeStep);
          cylinderState.current.angle = -safeStep * anglePerItem;
          renderCylinder(cylinderState.current.angle);
        }
      };

      tweenRafRef.current = requestAnimationFrame(stepFrame);
    } else {
      cylinderState.current.angle = targetAngle;
      renderCylinder(cylinderState.current.angle);
    }
  }, [anglePerItem, total, renderCylinder, stopTween]);

  const next = useCallback(() => {
    rotateToStep(currentStep + 1, true);
  }, [currentStep, rotateToStep]);

  const prev = useCallback(() => {
    rotateToStep(currentStep - 1, true);
  }, [currentStep, rotateToStep]);

  const goToIndex = useCallback((targetIndex) => {
    const normDiff = shortestStepDelta(currentStep, targetIndex, total);
    rotateToStep(currentStep + normDiff, true);
  }, [currentStep, total, rotateToStep]);

  // Initial layout and resize handler
  useEffect(() => {
    renderCylinder(cylinderState.current.angle);

    const handleResize = () => {
      renderCylinder(cylinderState.current.angle);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      stopTween();
    };
  }, [renderCylinder, stopTween]);

  // Defer loading 22 team images until user scrolls near #team
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || shouldLoadImages) return;

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadImages(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    preloadObserver.observe(el);
    return () => preloadObserver.disconnect();
  }, [shouldLoadImages]);

  // Auto-rotation interval: rotates continuously every 3.6s ONLY when visible on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let isVisible = false;

    const stopAutoRotate = () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }
    };

    const startAutoRotate = () => {
      stopAutoRotate();
      if (!isVisible) return;
      autoRotateTimerRef.current = setInterval(() => {
        if (!isInteractingRef.current && !isDraggingRef.current && isVisible) {
          next();
        }
      }, 3600);
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
      stopTween();
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
  }, [anglePerItem, next, prev, renderCylinder, rotateToStep, stopTween]);

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
        <div className="team__header">
          <div className="team__meta-row">
            <span className="team__label reveal-text">03 — SECRETARIAT & LEADERSHIP</span>
            <span className="team__hashtag reveal-text">#DiplomacyatIndustry</span>
          </div>
        </div>

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
                    <div className="team-poster__photo-wrapper">
                      {shouldLoadImages && (
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
                      )}
                    </div>
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
