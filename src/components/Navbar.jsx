import React, { useState, useEffect } from 'react';

export default function Navbar({ lenisRef, onOpenApply }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const scrollTo = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      if (lenisRef?.current) {
        lenisRef.current.scrollTo(el, {
          offset: -10,
          duration: 1.35,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      setActiveSection(targetId);
      setIsMobileOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const sections = ['hero', 'committees', 'letters', 'team', 'apply'];
      let current = 'hero';

      sections.forEach((id) => {
        const el = document.getElementById(id) || (id === 'letters' ? (document.getElementById('about') || document.getElementById('manifesto')) : null);
        if (el && el.offsetTop <= scrollPos) {
          current = id;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen]);

  return (
    <>
      <header className="nav" id="main-nav">
        {/* Left: Brand + Subtitle (matching image 1 layout) */}
        <div className="nav__brand-group">
          <a
            href="#hero"
            className="nav__mark"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('hero');
            }}
          >
            MUNTAL
          </a>
          
        </div>

        {/* Right: NAVIGATE label + Clean links */}
        <div className="nav__nav-group">
          <nav className="nav__links">
            <a
              href="#hero"
              className={activeSection === 'hero' ? 'nav__link--active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('hero');
              }}
            >
              Home
            </a>
            <a
              href="#committees"
              className={activeSection === 'committees' ? 'nav__link--active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('committees');
              }}
            >
              Committees
            </a>
            <a
              href="#letters"
              className={activeSection === 'letters' ? 'nav__link--active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('letters');
              }}
            >
              Letters
            </a>
            <a
              href="#team"
              className={activeSection === 'team' ? 'nav__link--active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('team');
              }}
            >
              Team
            </a>
            <a
              href="#apply"
              className={activeSection === 'apply' ? 'nav__link--active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('apply');
              }}
            >
              Apply
            </a>
          </nav>
        </div>

        {/* Mobile Burger Toggle */}
        <div className="nav__actions">
          <button
            className="nav__burger"
            id="nav-burger"
            type="button"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <span className="nav__burger-bar"></span>
            <span className="nav__burger-bar"></span>
            <span className="nav__burger-bar"></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer (layout faithful to Image 1) */}
      <div
        className={`mobile-nav ${isMobileOpen ? 'is-open' : ''}`}
        id="mobile-nav-drawer"
        aria-hidden={!isMobileOpen}
      >
        <div
          className="mobile-nav__backdrop"
          onClick={() => setIsMobileOpen(false)}
        ></div>
        <div className="mobile-nav__panel">
          <div className="mobile-nav__header">
            <div className="mobile-nav__brand-group">
              <span className="mobile-nav__mark">MUNTAL</span>
              <span className="mobile-nav__tagline">Where Tomorrow's Leaders Shape Today's World</span>
            </div>
            <button
              type="button"
              className="mobile-nav__close"
              id="mobile-nav-close"
              aria-label="Close menu"
              onClick={() => setIsMobileOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="mobile-nav__body">
            <span className="mobile-nav__kicker">NAVIGATE</span>
            <nav className="mobile-nav__links">
              <a
                href="#hero"
                className={`mobile-nav__link ${activeSection === 'hero' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('hero');
                }}
              >
                Home
              </a>
              <a
                href="#committees"
                className={`mobile-nav__link ${activeSection === 'committees' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('committees');
                }}
              >
                Committees
              </a>
              <a
                href="#letters"
                className={`mobile-nav__link ${activeSection === 'letters' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('letters');
                }}
              >
                Letters
              </a>
              <a
                href="#team"
                className={`mobile-nav__link ${activeSection === 'team' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('team');
                }}
              >
                Team
              </a>
              <a
                href="#apply"
                className={`mobile-nav__link ${activeSection === 'apply' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('apply');
                }}
              >
                Apply
              </a>
            </nav>
          </div>

          <div className="mobile-nav__footer">
            <p className="mobile-nav__copyright">© 2027 MUNTAL. All rights reserved.</p>
            <p className="mobile-nav__author">
              Designed &amp; developed by <strong>Tolga Aydın</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
