import React from 'react';

export default function Footer() {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-footer__container">
        
        {/* Minimal Navigation Bar */}
        <nav className="site-footer__nav" aria-label="Footer navigation">
          <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')}>Home</a>
          <span className="site-footer__nav-dot" aria-hidden="true">·</span>
          <a href="#letters" onClick={(e) => scrollToSection(e, '#letters')}>Letters</a>
          <span className="site-footer__nav-dot" aria-hidden="true">·</span>
          <a href="#committees" onClick={(e) => scrollToSection(e, '#committees')}>Committees</a>
          <span className="site-footer__nav-dot" aria-hidden="true">·</span>
          <a href="#team" onClick={(e) => scrollToSection(e, '#team')}>Secretariat</a>
          <span className="site-footer__nav-dot" aria-hidden="true">·</span>
          <a href="#apply" onClick={(e) => scrollToSection(e, '#apply')}>Apply</a>
          <span className="site-footer__nav-dot" aria-hidden="true">·</span>
          <a
            href="/panel/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__portal-link"
          >
            Secretariat Portal ↗
          </a>
        </nav>

        {/* Centerpiece in exact layout of 1st photo */}
        <div className="site-footer__credit-block">
          <h3 className="site-footer__creator-name">Tolga Aydın</h3>
          <p className="site-footer__creator-title">Head Of IT</p>
          <div className="site-footer__emblem-wrap" aria-hidden="true">
            {/* High-fidelity vector recreation of the circular conference emblem from the photo */}
            <svg
              className="site-footer__emblem-svg"
              viewBox="0 0 100 100"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Laurel Wreath Left */}
              <path d="M48 88C43 86 38 82 34 77C30 71 27 63 26 55C25 47 26 39 30 32C32 28 35 24 38 21C38.5 20.5 37.8 19.8 37.2 20.2C33.5 23.5 30 28 28 33C24 43 23 53 25 63C27 72 32 80 39 86C42 88.5 45.5 90.5 49 91.5C49.8 91.7 50.2 90.7 49.5 90.2C49 89.5 48.5 88.8 48 88Z" opacity="0.9" />
              {/* Laurel Leaves Left */}
              <path d="M25 43C22 41 19 36 21 32C22 30 25 31 27 33C30 36 30 40 28 43C27 44 26 44 25 43Z" />
              <path d="M23 53C19 52 17 47 18 43C19 41 22 42 24 44C27 47 27 51 25 54C24 54 23 54 23 53Z" />
              <path d="M24 64C20 64 17 60 18 56C19 54 22 54 24 57C27 60 27 64 25 65C24.5 65 24 64.5 24 64Z" />
              <path d="M28 74C24 75 20 72 20 68C21 66 24 66 26 68C29 71 30 75 28 76C28 76 28 75 28 74Z" />
              <path d="M35 83C31 85 27 83 26 79C26 77 29 76 32 78C35 80 37 84 35 85C35 85 35 84 35 83Z" />

              {/* Outer Laurel Wreath Right */}
              <path d="M52 88C57 86 62 82 66 77C70 71 73 63 74 55C75 47 74 39 70 32C68 28 65 24 62 21C61.5 20.5 62.2 19.8 62.8 20.2C66.5 23.5 70 28 72 33C76 43 77 53 75 63C73 72 68 80 61 86C58 88.5 54.5 90.5 51 91.5C50.2 91.7 49.8 90.7 50.5 90.2C51 89.5 51.5 88.8 52 88Z" opacity="0.9" />
              {/* Laurel Leaves Right */}
              <path d="M75 43C78 41 81 36 79 32C78 30 75 31 73 33C70 36 70 40 72 43C73 44 74 44 75 43Z" />
              <path d="M77 53C81 52 83 47 82 43C81 41 78 42 76 44C73 47 73 51 75 54C76 54 77 54 77 53Z" />
              <path d="M76 64C80 64 83 60 82 56C81 54 78 54 76 57C73 60 73 64 75 65C75.5 65 76 64.5 76 64Z" />
              <path d="M72 74C76 75 80 72 80 68C79 66 76 66 74 68C71 71 70 75 72 76C72 76 72 75 72 74Z" />
              <path d="M65 83C69 85 73 83 74 79C74 77 71 76 68 78C65 80 63 84 65 85C65 85 65 84 65 83Z" />

              {/* Central Sphere with diagonal dotted matrix & crescent */}
              <circle cx="50" cy="52" r="18" fill="none" stroke="currentColor" strokeWidth="2.4" />
              {/* Crescent accent */}
              <path d="M50 34C60 34 68 42 68 52C68 62 60 70 50 70C43 70 37 66 34 60C38 65 44 68 50 68C59 68 66 61 66 52C66 43 59 36 50 36C47 36 44 37 41 39C44 36 47 34 50 34Z" fill="currentColor" opacity="0.6" />
              {/* Dotted Grid inside Sphere (Microphone / Meridian texture) */}
              <circle cx="44" cy="45" r="1.2" />
              <circle cx="48" cy="43" r="1.2" />
              <circle cx="52" cy="42" r="1.2" />
              <circle cx="42" cy="49" r="1.2" />
              <circle cx="46" cy="48" r="1.3" />
              <circle cx="50" cy="47" r="1.3" />
              <circle cx="54" cy="46" r="1.2" />
              <circle cx="41" cy="54" r="1.2" />
              <circle cx="45" cy="53" r="1.3" />
              <circle cx="49" cy="52" r="1.4" />
              <circle cx="53" cy="51" r="1.3" />
              <circle cx="57" cy="50" r="1.2" />
              <circle cx="43" cy="59" r="1.2" />
              <circle cx="47" cy="58" r="1.3" />
              <circle cx="51" cy="57" r="1.3" />
              <circle cx="55" cy="56" r="1.2" />
              <circle cx="46" cy="63" r="1.2" />
              <circle cx="50" cy="62" r="1.2" />
              <circle cx="54" cy="61" r="1.2" />
            </svg>
          </div>
        </div>

        {/* Quiet Legal Row */}
        <div className="site-footer__legal-row">
          <p className="site-footer__copyright">
            © 2027 MUNTAL · Izmir, Türkiye · All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
