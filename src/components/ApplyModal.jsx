import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TRACK_CONFIGS } from '../apply.js';
import { submitApplication, buildApplicationPayload } from '../api.js';

export default function ApplyModal({ isOpen, trackKey = 'delegate', initialCommittee = '', onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState({ code: '', trackTitle: '', sheetName: '' });

  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const activeTrackKey = TRACK_CONFIGS[trackKey] ? trackKey : 'delegate';
  const config = TRACK_CONFIGS[activeTrackKey];
  const totalSteps = config.steps.length;
  const currentStep = config.steps[currentStepIndex];

  // Reset or initialize state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsSubmitted(false);
      setErrorMessage('');
      const initialData = {};
      if (initialCommittee) {
        initialData.first_committee_preference = initialCommittee;
      }
      setFormData(initialData);

      // Add modal open class to body to hide nav header as in original CSS
      document.body.classList.add('apply-modal-open');
      document.body.style.overflow = 'hidden';

      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { y: 25, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
        );
      }
    } else {
      document.body.classList.remove('apply-modal-open');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.classList.remove('apply-modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen, trackKey, initialCommittee]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handleInputChange = (fieldId, val) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
    if (errorMessage) setErrorMessage('');
  };

  const validateCurrentStep = () => {
    for (const field of currentStep.fields) {
      const val = (formData[field.id] || '').trim();

      if (field.required && !val) {
        setErrorMessage(`Please complete the required field: "${field.label}"`);
        const el = document.getElementById(`field-${field.id}`);
        if (el) {
          el.focus();
          el.classList.add('is-invalid');
          setTimeout(() => el.classList.remove('is-invalid'), 3000);
        }
        return false;
      }

      if (field.type === 'email' && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          setErrorMessage(`Please enter a valid email address for "${field.label}"`);
          const el = document.getElementById(`field-${field.id}`);
          if (el) el.focus();
          return false;
        }
      }

      if (field.type === 'date' && val) {
        const dateObj = new Date(val);
        if (isNaN(dateObj.getTime())) {
          setErrorMessage(`Please select a valid date for "${field.label}"`);
          const el = document.getElementById(`field-${field.id}`);
          if (el) el.focus();
          return false;
        }
      }
    }

    setErrorMessage('');
    return true;
  };

  const handleNext = () => {
    if (isSubmitting) return;
    if (!validateCurrentStep()) return;
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handlePrev = () => {
    if (isSubmitting) return;
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setErrorMessage('');
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = buildApplicationPayload(activeTrackKey, formData);
      const result = await submitApplication(payload);

      if (!result || result.success === false) {
        throw new Error(result?.message || 'Submission was rejected by Google Sheets backend');
      }

      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const trackingCode = `MUNTAL-${(config.application_type || config.id).substring(0, 3).toUpperCase()}-${randomCode}`;

      setReceiptInfo({
        code: trackingCode,
        trackTitle: config.title,
        sheetName: config.sheetName,
      });

      try {
        const stored = JSON.parse(localStorage.getItem('muntal_submissions') || '[]');
        stored.unshift({
          id: trackingCode,
          track: activeTrackKey,
          sheet: config.sheetName,
          submittedAt: new Date().toISOString(),
          data: payload
        });
        localStorage.setItem('muntal_submissions', JSON.stringify(stored));
      } catch (storageErr) {
        console.warn('Could not archive to localStorage:', storageErr);
      }

      setFormData({});
      setIsSubmitted(true);
    } catch (err) {
      console.error('[MUNTAL Submission Error]:', err);
      setErrorMessage('Something went wrong while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const pct = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div
      className="apply-modal is-open"
      id="apply-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
      data-lenis-prevent="true"
    >
      <div
        className="apply-modal__backdrop"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      ></div>

      <div
        className="apply-modal__container"
        ref={containerRef}
        data-lenis-prevent="true"
      >
        {/* Modal Header */}
        <div className="apply-modal__header">
          <div className="apply-modal__meta">
            <span className="apply-modal__tag" id="apply-modal-tag">{config.tag}</span>
            <h2 className="apply-modal__title" id="apply-modal-title">{config.title}</h2>
          </div>
          <button
            type="button"
            className="apply-modal__close-btn"
            id="apply-modal-close"
            aria-label="Close application modal"
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Progress Meter */}
        <div className="apply-progress-meter">
          <div className="apply-progress-track">
            <div className="apply-progress-fill" id="apply-progress-bar" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="apply-progress-labels">
            <span className="apply-progress-step" id="apply-step-indicator">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="apply-progress-badge">CONFIDENTIAL DOSSIER</span>
          </div>
        </div>

        {/* Form Content Body */}
        <div className="apply-modal__scrollable" ref={scrollContainerRef} data-lenis-prevent="true">
          {!isSubmitted ? (
            <div className="apply-form-view" id="apply-form-view">
              <div className="apply-step-heading">
                <h3 className="apply-step-title" id="apply-step-title">{currentStep.title}</h3>
                <p className="apply-step-subtitle" id="apply-step-subtitle">{currentStep.subtitle}</p>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="apply-error-alert" id="apply-error-alert" role="alert" style={{ display: 'block' }}>
                  {errorMessage}
                </div>
              )}

              {/* Dynamic Form Controls */}
              <div className="apply-form-body" id="apply-form-body">
                {currentStep.fields.map((field) => {
                  const val = formData[field.id] || '';

                  return (
                    <div className="apply-field-group" key={field.id}>
                      <div className="apply-field-header">
                        <label htmlFor={`field-${field.id}`} className="apply-label">
                          {field.label}
                          {field.required ? (
                            <span className="apply-required">*</span>
                          ) : (
                            <span className="apply-optional">(Optional)</span>
                          )}
                        </label>
                      </div>

                      {field.type === 'select' ? (
                        <div className="apply-select-wrapper">
                          <select
                            className="apply-control apply-control--select"
                            id={`field-${field.id}`}
                            value={val}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            required={field.required}
                          >
                            {field.options?.map((opt, oIdx) => (
                              <option key={oIdx} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className="apply-select-arrow" aria-hidden="true">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="apply-control apply-control--textarea"
                          id={`field-${field.id}`}
                          rows={4}
                          placeholder={field.placeholder || ''}
                          value={val}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                        />
                      ) : (
                        <input
                          type={field.type}
                          className="apply-control apply-control--input"
                          id={`field-${field.id}`}
                          placeholder={field.placeholder || ''}
                          value={val}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                        />
                      )}

                      {field.hint && <p className="apply-hint">{field.hint}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Form Navigation Controls */}
              <div className="apply-nav-controls">
                <button
                  type="button"
                  className="apply-btn apply-btn--prev"
                  id="apply-btn-prev"
                  style={{ visibility: currentStepIndex > 0 ? 'visible' : 'hidden' }}
                  disabled={isSubmitting}
                  onClick={handlePrev}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Previous Step
                </button>

                <div className="apply-nav-controls__right">
                  {currentStepIndex < totalSteps - 1 ? (
                    <button
                      type="button"
                      className="apply-btn apply-btn--next"
                      id="apply-btn-next"
                      disabled={isSubmitting}
                      onClick={handleNext}
                    >
                      Next Step
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`apply-btn apply-btn--submit ${isSubmitting ? 'is-loading' : ''}`}
                      id="apply-btn-submit"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="apply-btn__spinner" aria-hidden="true"></span>
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Success Receipt View */
            <div className="apply-success-view" id="apply-success-view" style={{ display: 'block' }}>
              <div className="apply-success-seal" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dfb96c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <span className="apply-success-tag">DOSSIER REGISTERED</span>
              <h3 className="apply-success-title">Application Submitted</h3>
              <p className="apply-success-desc" id="apply-success-desc">
                Application submitted successfully. Thank you for applying to MUNTAL. Your credentials have been securely logged in the Secretariat archives.
              </p>

              <div className="apply-receipt-card">
                <div className="apply-receipt-row">
                  <span className="apply-receipt-label">Tracking Code</span>
                  <span className="apply-receipt-val apply-receipt-val--code" id="apply-receipt-code">
                    {receiptInfo.code}
                  </span>
                </div>
                <div className="apply-receipt-row">
                  <span className="apply-receipt-label">Application Track</span>
                  <span className="apply-receipt-val" id="apply-receipt-track">
                    {receiptInfo.trackTitle}
                  </span>
                </div>
                <div className="apply-receipt-row">
                  <span className="apply-receipt-label">Destination Sheet</span>
                  <span className="apply-receipt-val" id="apply-receipt-sheet" style={{ color: '#dfb96c' }}>
                    {receiptInfo.sheetName}
                  </span>
                </div>
                <div className="apply-receipt-row">
                  <span className="apply-receipt-label">Review Status</span>
                  <span className="apply-receipt-val" style={{ color: '#4ade80' }}>
                    Under Rolling Review
                  </span>
                </div>
              </div>

              <div className="apply-success-actions">
                <button
                  type="button"
                  className="apply-btn apply-btn--done"
                  id="apply-success-close"
                  onClick={onClose}
                >
                  Return to Conference Site
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
