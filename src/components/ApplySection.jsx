import React from 'react';
import Footer from './Footer.jsx';

export default function ApplySection({ onOpenApply }) {
  const tracks = [
    {
      id: 'delegate',
      badge: '01 — DIPLOMATIC CORPS',
      title: 'Delegate',
      desc: 'Represent a sovereign member state, negotiate strategic resolutions, and defend foreign policy across General Assembly and Crisis cabinets.',
      specs: ['GA & Crisis', '3-Stage Form', 'Preferences Ranked'],
      cardClass: 'apply-card--delegate',
    },
    {
      id: 'delegation',
      badge: '02 — ACADEMIC & DELEGATIONS',
      title: 'Delegation',
      desc: 'Direct committee parliamentary debate as a Committee Chair, or submit a unified institutional Delegation under Head Delegate leadership.',
      specs: ['Bureau & Delegations', 'Head Delegate Dossier', 'Study Guide Review'],
      cardClass: 'apply-card--delegation',
    },
    {
      id: 'press',
      badge: '03 — JOURNALISM & MEDIA',
      title: 'Press',
      desc: 'Uncover corridor negotiations and capture historic conference visuals through photojournalism, live dispatches, and video broadcasts.',
      specs: ['Photo & Video', 'Camera Gear Spec', 'Daily Gazette'],
      cardClass: 'apply-card--press',
    },
    {
      id: 'admin',
      badge: '04 — OPERATIONS & LOGISTICS',
      title: 'Admin',
      desc: 'Coordinate committee floor operations, resolution distribution, crisis delivery channels, and assembly conference venue logistics.',
      specs: ['Floor Operations', 'Crisis Delivery', 'Session Coordination'],
      cardClass: 'apply-card--admin',
    },
  ];

  return (
    <section className="section apply-section" id="apply">
      <span id="approach" aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}></span>
      <div className="section__inner">
        <p className="section__label reveal-text">Applications — Chapter IV</p>
        <h2 className="section__heading reveal-text">Choose your assembly track.</h2>
        <p className="apply-section__lead reveal-text">
          Applications for MUNTAL are processed under rigorous academic review. Select your designated role below to complete the multi-stage accreditation dossier.
        </p>

        <div className="apply-cards-grid" id="apply-cards-grid">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`apply-card ${track.cardClass} apply-card-trigger reveal-text`}
              data-track={track.id}
              role="button"
              tabIndex={0}
              id={`card-${track.id}`}
              onClick={() => onOpenApply(track.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenApply(track.id);
                }
              }}
            >
              <div className="apply-card__bevel"></div>
              <div className="apply-card__badge">{track.badge}</div>
              <h3 className="apply-card__title">{track.title}</h3>
              <p className="apply-card__desc">{track.desc}</p>
              <div className="apply-card__specs">
                {track.specs.map((spec, sIdx) => (
                  <span key={sIdx} className="apply-spec-tag">{spec}</span>
                ))}
              </div>
              <div className="apply-card__cta">
                <span>Start Application</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer onOpenApply={onOpenApply} />
    </section>
  );
}
