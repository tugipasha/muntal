import React, { useState, useEffect } from 'react';
import { COMMITTEES } from '../committees-data.js';

export default function CommitteeDossierModal({ activeIndex, isOpen, onClose, onApplyForCommittee }) {
  const [downloadQueued, setDownloadQueued] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('apply-modal-open');
    } else {
      document.body.classList.remove('apply-modal-open');
    }
    return () => document.body.classList.remove('apply-modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const comm = COMMITTEES[activeIndex] || COMMITTEES[2];

  const handleDownload = () => {
    setDownloadQueued(true);
    setTimeout(() => {
      setDownloadQueued(false);
    }, 2200);
  };

  return (
    <div
      className={`committee-modal is-open`}
      id="committee-dossier-modal"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent="true"
      onClick={(e) => {
        if (e.target.classList.contains('committee-modal') || e.target.classList.contains('committee-modal__overlay')) {
          onClose();
        }
      }}
    >
      <div className="committee-modal__overlay"></div>
      <div className="committee-modal__card" data-lenis-prevent="true">
        <button
          type="button"
          className="committee-modal__close"
          id="committee-dossier-close"
          aria-label="Close dossier"
          onClick={onClose}
        >
          ✕
        </button>
        <div id="committee-dossier-content" className="committee-modal__inner" data-lenis-prevent="true">
          <div className="dossier">
            <div className="dossier__header">
              <div className="dossier__meta">
                <span className="dossier__code-badge">{comm.num} — {comm.code}</span>
                <span className="dossier__cat">{comm.category}</span>
              </div>
              <h2 className="dossier__title">{comm.name}</h2>
              <p className="dossier__mandate">“{comm.quote}”</p>
            </div>

            <div className="dossier__specs">
              <div className="dossier__spec-item">
                <span className="dossier__spec-label">Chamber Room</span>
                <span className="dossier__spec-val">{comm.room}</span>
              </div>
              <div className="dossier__spec-item">
                <span className="dossier__spec-label">Delegation Quota</span>
                <span className="dossier__spec-val">{comm.delegates}</span>
              </div>
              <div className="dossier__spec-item">
                <span className="dossier__spec-label">Experience Tier</span>
                <span className="dossier__spec-val">{comm.level}</span>
              </div>
              <div className="dossier__spec-item">
                <span className="dossier__spec-label">Simulation Style</span>
                <span className="dossier__spec-val">{comm.crisis}</span>
              </div>
            </div>

            <div className="dossier__topics">
              <h3 className="dossier__section-subtitle">Official Agenda Topics — Annual Session</h3>

              {comm.topics?.map((topic, tIdx) => (
                <div className="dossier__topic-card" key={tIdx}>
                  <div className="dossier__topic-letter">Topic {topic.letter}</div>
                  <div className="dossier__topic-body">
                    <h4 className="dossier__topic-title">{topic.title}</h4>
                    <p className="dossier__topic-desc">{topic.summary}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="dossier__actions">
              <a
                href="#apply"
                className="dossier__btn dossier__btn--primary"
                id="dossier-apply-btn"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  if (onApplyForCommittee) {
                    onApplyForCommittee(comm.code);
                  }
                }}
              >
                Apply For {comm.code} →
              </a>
              <button
                type="button"
                className="dossier__btn dossier__btn--ghost"
                id="dossier-guide-btn"
                onClick={handleDownload}
              >
                {downloadQueued ? '✓ Guide Download Queued' : 'Download Background Guide (PDF)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
