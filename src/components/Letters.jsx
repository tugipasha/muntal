import React from 'react';

export default function Letters() {
  return (
    <section className="section letters-section" id="letters" data-alias="manifesto">
      {/* Anchor bridges for backward compatibility */}
      <span id="about" style={{ position: 'absolute', top: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />
      <span id="manifesto" style={{ position: 'absolute', top: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />

      <div className="section__inner letters__inner">
        <span className="letters__label reveal-text">01 — LETTER</span>

        <article className="letter-card" tabIndex={0} aria-label="Letter from the Secretary-General">
          <header className="letter-card__header">
            <div className="letter-card__avatar" aria-hidden="true">
              SG
            </div>
            <div className="letter-card__identity">
              <span className="letter-card__role">SECRETARY-GENERAL</span>
              <h3 className="letter-card__author">Bora Sücüllü</h3>
            </div>
          </header>

          <div className="letter-card__body">
            <p className="letter-card__salutation">Distinguished Participants,</p>
            <p className="letter-card__p">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="letter-card__p">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio.
            </p>
            <p className="letter-card__p">
              Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum praesent mauris fusce nec tellus sed augue semper porta.
            </p>
          </div>

          <footer className="letter-card__footer">
            <span className="letter-card__rule" aria-hidden="true" />
            <div className="letter-card__signatory-name">Bora Sücüllü</div>
            <div className="letter-card__signatory-role">Secretary-General of MUNTAL</div>
          </footer>
        </article>
      </div>
    </section>
  );
}
