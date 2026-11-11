import React, { useState } from 'react';

export default function Letters() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'sg' | 'dg'

  return (
    <section className="section letters-section" id="letters" data-alias="manifesto">
      {/* Anchor bridges for backward compatibility */}
      <span id="about" style={{ position: 'absolute', top: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />
      <span id="manifesto" style={{ position: 'absolute', top: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />

      <div className="section__inner letters__inner">
        {/* Minimal Editorial Header */}
        <div className="letters__header">
          <div className="letters__header-left">
            <span className="letters__label reveal-text">01 — LETTERS FROM LEADERSHIP</span>
            <span className="letters__sublabel reveal-text">Executive Addresses · MUNTAL</span>
          </div>

          {/* Minimalist Segmented Filter */}
          <div className="letters__tabs" role="tablist" aria-label="Select Letter">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`letters__tab-btn letters__tab-btn--desktop-only ${activeTab === 'all' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Both Letters
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'sg'}
              className={`letters__tab-btn ${activeTab === 'sg' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('sg')}
            >
              Secretary-General
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'dg'}
              className={`letters__tab-btn ${activeTab === 'dg' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('dg')}
            >
              Director-General
            </button>
          </div>
        </div>

        {/* Minimal Letter Boxes Grid */}
        <div className={`letters__grid ${activeTab !== 'all' ? 'letters__grid--single' : ''}`}>
          {/* Box 1: Secretary-General (Bora Sücüllü) */}
          {(activeTab === 'all' || activeTab === 'sg') && (
            <article className="letter-box" tabIndex={0} aria-label="Letter from the Secretary-General">
              <header className="letter-box__header">
                <div>
                  <span className="letter-box__role">Office of the Secretary-General</span>
                  <h3 className="letter-box__title">Diplomatic Address</h3>
                </div>
                <div className="letter-box__meta">
                  
                  <span className="letter-box__sep">·</span>
                  <span>Izmir</span>
                </div>
              </header>

              <div className="letter-box__content">
                <p className="letter-box__salutation">
                  Distinguished Delegates, Faculty Advisors &amp; Honored Guests,
                </p>
                <p className="letter-box__p">
                  It is my distinct honor to welcome you to the 2027 session of MUNTAL. In an increasingly volatile global landscape, multilateral diplomacy is neither political theatre nor the rehearsal of entrenched sovereign postures; it is the disciplined pursuit of defensible consensus.
                </p>
                <p className="letter-box__p">
                  Across every assembly, we invite you to challenge unexamined premises, negotiate with principled resolve, and author resolutions that withstand rigorous examination. May your deliberations be profound and transformative.
                </p>
              </div>

              <footer className="letter-box__footer">
                <div className="letter-box__valediction">With diplomatic regards,</div>
                <div className="letter-box__signatory">
                  <div className="letter-box__name">Bora Sücüllü</div>
                  <div className="letter-box__position">Secretary-General · MUNTAL</div>
                </div>
              </footer>
            </article>
          )}

          {/* Box 2: Director-General (Can Demir) */}
          {(activeTab === 'all' || activeTab === 'dg') && (
            <article className="letter-box" tabIndex={0} aria-label="Letter from the Director-General">
              <header className="letter-box__header">
                <div>
                  <span className="letter-box__role">Office of the Director-General</span>
                  <h3 className="letter-box__title">Institutional Address</h3>
                </div>
                <div className="letter-box__meta">
                  
                  <span className="letter-box__sep">·</span>
                  <span>Izmir</span>
                </div>
              </header>

              <div className="letter-box__content">
                <p className="letter-box__salutation">
                  Honored Participants &amp; Delegation Leaders,
                </p>
                <p className="letter-box__p">
                  On behalf of the academic board and executive team, I extend our warmest welcome to Izmir. MUNTAL was built upon the conviction that ambitious international debate requires equally meticulous institutional stewardship and academic integrity.
                </p>
                <p className="letter-box__p">
                  From specialized crisis cabinets to expansive multilateral chambers, every procedural directive has been calibrated to deliver an immersive and intellectually demanding experience. We look forward to welcoming you to Izmir.
                </p>
              </div>

              <footer className="letter-box__footer">
                <div className="letter-box__valediction">Cordially,</div>
                <div className="letter-box__signatory">
                  <div className="letter-box__name">Can Demir</div>
                  <div className="letter-box__position">Director-General · MUNTAL 2027</div>
                </div>
              </footer>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
