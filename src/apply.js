// MUNTAL Model United Nations — Multi-Step Application Module with Google Sheets Integration
import { gsap } from 'gsap';
import { submitApplication, buildApplicationPayload, SHEETS_MAPPING } from './api.js';

export const COMMITTEE_OPTIONS = [
  { value: '', label: 'Select a committee...' },
  { value: 'DISEC', label: '01 DISEC — Disarmament & International Security' },
  { value: 'WHO', label: '02 WHO — World Health Organization' },
  { value: 'UNSC', label: '03 UNSC — United Nations Security Council' },
  { value: 'NATO-NAC', label: '04 NATO-NAC — North Atlantic Council' },
  { value: 'JCC', label: '05 JCC — Joint Crisis Cabinet: 1962 Cuban Missile' }
];

export const GRADE_OPTIONS = [
  { value: '', label: 'Select your grade level...' },
  { value: 'Preparation', label: 'Preparation Year (Hazırlık)' },
  { value: 'Freshman', label: 'Freshman (9th Grade / Lise 1)' },
  { value: 'Sophomore', label: 'Sophomore (10th Grade / Lise 2)' },
  { value: 'Junior', label: 'Junior (11th Grade / Lise 3)' },
  { value: 'Senior', label: 'Senior (12th Grade / Lise 4)' }
];

export const GENDER_OPTIONS = [
  { value: '', label: 'Select gender...' },
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

export const LATE_HOURS_OPTIONS = [
  { value: '', label: 'Select availability...' },
  { value: 'Yes', label: 'Yes — Fully available for late crisis sessions' },
  { value: 'Conditional (with prior arrangement)', label: 'Yes, with prior transportation arrangement' },
  { value: 'No', label: 'No, restricted to regular conference hours' }
];

export const TRACK_CONFIGS = {
  delegate: {
    id: 'delegate',
    application_type: 'delegate',
    title: 'Delegate Application',
    tag: '01 — GENERAL ASSEMBLY & CRISIS',
    sheetName: SHEETS_MAPPING.delegate,
    totalSteps: 3,
    steps: [
      {
        title: 'Personal Credentials',
        subtitle: 'Basic contact and delegate identity information.',
        fields: [
          { id: 'name_surname', label: 'Name Surname', type: 'text', placeholder: 'e.g. Canan Dağdeviren', required: true },
          { id: 'email', label: 'Email Address', type: 'email', placeholder: 'delegate@example.com', required: true },
          { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+90 (5XX) XXX XX XX', required: true },
          { id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true }
        ]
      },
      {
        title: 'Academic & Committee Preferences',
        subtitle: 'School affiliation and ranked committee choices.',
        fields: [
          { id: 'school', label: 'School', type: 'text', placeholder: 'e.g. Bornova Anatolian High School', required: true },
          { id: 'grade', label: 'Grade', type: 'select', options: GRADE_OPTIONS, required: true },
          { 
            id: 'first_committee_preference', 
            label: 'First Committee Preference', 
            type: 'select', 
            options: COMMITTEE_OPTIONS, 
            required: true,
            hint: 'Your primary choice where you feel most confident defending foreign policy.'
          },
          { 
            id: 'second_committee_preference', 
            label: 'Second Committee Preference', 
            type: 'select', 
            options: COMMITTEE_OPTIONS, 
            required: true 
          },
          { 
            id: 'third_committee_preference', 
            label: 'Third Committee Preference', 
            type: 'select', 
            options: COMMITTEE_OPTIONS, 
            required: true 
          }
        ]
      },
      {
        title: 'Experience & Motivation',
        subtitle: 'Past conferences, position motivation, and academic references.',
        fields: [
          { 
            id: 'experiences', 
            label: 'Experiences', 
            type: 'textarea', 
            placeholder: 'List previous conferences attended, awards received, or simulated committees...', 
            required: true 
          },
          { 
            id: 'motivation_letter', 
            label: 'Motivation Letter', 
            type: 'textarea', 
            placeholder: 'Why do you wish to participate in MUNTAL 2327? What perspectives do you bring to debate?', 
            required: true 
          },
          { 
            id: 'references', 
            label: 'References', 
            type: 'textarea', 
            placeholder: 'Name and contact info of MUN advisor, chair, or academic referee (optional but recommended)...', 
            required: false 
          }
        ]
      }
    ]
  },

  chairboard: {
    id: 'chairboard',
    application_type: 'delegation',
    title: 'Delegation Application',
    tag: '02 — ACADEMIC & DELEGATIONS',
    sheetName: SHEETS_MAPPING.delegation,
    totalSteps: 3,
    steps: [
      {
        title: 'Head Delegate Credentials',
        subtitle: 'Leadership contact and representative delegation details.',
        fields: [
          { id: 'head_delegate_full_name', label: 'Head Delegate’s Full Name', type: 'text', placeholder: 'e.g. Arda Güler', required: true },
          { id: 'head_delegate_email', label: 'Head Delegate’s Email Address', type: 'email', placeholder: 'headdelegate@institution.edu', required: true },
          { id: 'head_delegate_phone', label: 'Head Delegate’s Phone Number', type: 'tel', placeholder: '+90 (5XX) XXX XX XX', required: true },
          { id: 'head_delegate_date_of_birth', label: 'Head Delegate’s Date of Birth', type: 'date', required: true }
        ]
      },
      {
        title: 'Committee Preferences',
        subtitle: 'Ranked committee choices for your delegation assignment.',
        fields: [
          { 
            id: 'first_committee_preference', 
            label: 'First Committee Preference', 
            type: 'select', 
            options: COMMITTEE_OPTIONS, 
            required: true 
          },
          { 
            id: 'second_committee_preference', 
            label: 'Second Committee Preference', 
            type: 'select', 
            options: COMMITTEE_OPTIONS, 
            required: true 
          },
          { 
            id: 'third_committee_preference', 
            label: 'Third Committee Preference', 
            type: 'select', 
            options: COMMITTEE_OPTIONS, 
            required: true 
          }
        ]
      },
      {
        title: 'Experience & Delegation Dossier',
        subtitle: 'Head delegate track record, extra information, and references.',
        fields: [
          { 
            id: 'experiences', 
            label: 'Experiences (Head Delegate / Chairing)', 
            type: 'textarea', 
            placeholder: 'Summarize past head delegate duties, chairing roles, or crisis simulations led...', 
            required: true 
          },
          { 
            id: 'additional_info', 
            label: 'Additional Info (Optional)', 
            type: 'textarea', 
            placeholder: 'Special delegation notes, size, or institutional requests...', 
            required: false 
          },
          { 
            id: 'references', 
            label: 'References', 
            type: 'textarea', 
            placeholder: 'Academic advisor, school club sponsor, or past secretariat references...', 
            required: false 
          }
        ]
      }
    ]
  },

  admin: {
    id: 'admin',
    application_type: 'administrative',
    title: 'Administrative Application',
    tag: '04 — OPERATIONS & LOGISTICS',
    sheetName: SHEETS_MAPPING.administrative,
    totalSteps: 3,
    steps: [
      {
        title: 'Candidate Profile',
        subtitle: 'Personal credentials and contact availability.',
        fields: [
          { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'e.g. Ece Sezgin', required: true },
          { id: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS, required: true },
          { id: 'email', label: 'Email Address', type: 'email', placeholder: 'admin@example.com', required: true },
          { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+90 (5XX) XXX XX XX', required: true },
          { id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true }
        ]
      },
      {
        title: 'Academic & Availability',
        subtitle: 'School details, grade level, and venue commitment.',
        fields: [
          { id: 'school_name', label: 'School Name', type: 'text', placeholder: 'e.g. Izmir Science High School', required: true },
          { id: 'grade_level', label: 'Grade Level', type: 'select', options: GRADE_OPTIONS, required: true },
          { 
            id: 'can_stay_until_late_hours', 
            label: 'Can you stay in the conference venue until late hours?', 
            type: 'select', 
            options: LATE_HOURS_OPTIONS, 
            required: true,
            hint: 'Crisis committees may require staff coordination until late evening.'
          }
        ]
      },
      {
        title: 'Operational Scenarios & Motivation',
        subtitle: 'Conflict resolution scenario, past track record, and motivation.',
        fields: [
          { 
            id: 'chair_or_delegate_problem_response', 
            label: 'What would you do if you had a problem with a chair or delegate in your committee?', 
            type: 'textarea', 
            placeholder: 'Describe your escalation procedure, composure, and problem-solving mindset...', 
            required: true 
          },
          { 
            id: 'experiences', 
            label: 'Experiences', 
            type: 'textarea', 
            placeholder: 'Previous admin staff roles, event management, or logistics experiences...', 
            required: true 
          },
          { 
            id: 'motivation_letter', 
            label: 'Motivation Letter', 
            type: 'textarea', 
            placeholder: 'Why do you want to join the MUNTAL Administrative Staff team?', 
            required: true 
          },
          { 
            id: 'additional_info', 
            label: 'Anything else you would like to add? (References etc.)', 
            type: 'textarea', 
            placeholder: 'Additional remarks, emergency contact notes, or referee details...', 
            required: false 
          }
        ]
      }
    ]
  },

  press: {
    id: 'press',
    application_type: 'press',
    title: 'Press Application',
    tag: '03 — JOURNALISM & MEDIA',
    sheetName: SHEETS_MAPPING.press,
    totalSteps: 3,
    steps: [
      {
        title: 'Journalist Profile',
        subtitle: 'Personal identity and press credential data.',
        fields: [
          { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'e.g. Deniz Yılmaz', required: true },
          { id: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS, required: true },
          { id: 'email', label: 'Email Address', type: 'email', placeholder: 'press@example.com', required: true },
          { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+90 (5XX) XXX XX XX', required: true },
          { id: 'id_address', label: 'ID Address (National ID / Student ID Number)', type: 'text', placeholder: 'Required for press venue badge accreditation', required: true },
          { id: 'birthday', label: 'Birthday', type: 'date', required: true }
        ]
      },
      {
        title: 'Equipment & Gear',
        subtitle: 'Camera body, optical lenses, and media specialization.',
        fields: [
          { id: 'school_name', label: 'School Name', type: 'text', placeholder: 'e.g. Saint-Joseph High School', required: true },
          { id: 'grade', label: 'Grade', type: 'select', options: GRADE_OPTIONS, required: true },
          { 
            id: 'camera_model', 
            label: 'What is the model of your camera?', 
            type: 'text', 
            placeholder: 'e.g. Sony A7 IV, Canon EOS R6, Nikon Z6 II...', 
            required: true 
          },
          { 
            id: 'lens_information', 
            label: 'Give information about your lens or lenses (if more than one)', 
            type: 'textarea', 
            placeholder: 'e.g. 24-70mm f/2.8, 50mm f/1.8, 70-200mm f/4...', 
            required: true 
          }
        ]
      },
      {
        title: 'Portfolio & References',
        subtitle: 'Past journalistic assignments, press references, and extra notes.',
        fields: [
          { 
            id: 'past_experiences', 
            label: 'Past Experiences (Photo, Video, Writing)', 
            type: 'textarea', 
            placeholder: 'Previous conferences covered, newspaper articles written, or portfolio links (Instagram/Behance/Drive)...', 
            required: true 
          },
          { 
            id: 'reference', 
            label: 'Reference', 
            type: 'textarea', 
            placeholder: 'Press team lead, advisor, or photography mentor...', 
            required: false 
          },
          { 
            id: 'additional_info', 
            label: 'Anything You Want to Add', 
            type: 'textarea', 
            placeholder: 'Software skills (Lightroom, Premiere, InDesign) or special notes...', 
            required: false 
          }
        ]
      }
    ]
  }
};

export function initApply() {
  const modal = document.getElementById('apply-modal');
  if (!modal) return;

  const modalBackdrop = modal.querySelector('.apply-modal__backdrop');
  const modalCloseBtn = modal.querySelector('#apply-modal-close');
  const modalTag = modal.querySelector('#apply-modal-tag');
  const modalTitle = modal.querySelector('#apply-modal-title');
  const modalTrackId = modal.querySelector('#apply-modal-track-id');
  const progressBar = modal.querySelector('#apply-progress-bar');
  const stepIndicator = modal.querySelector('#apply-step-indicator');
  const stepTitle = modal.querySelector('#apply-step-title');
  const stepSubtitle = modal.querySelector('#apply-step-subtitle');
  const formBody = modal.querySelector('#apply-form-body');
  const prevBtn = modal.querySelector('#apply-btn-prev');
  const nextBtn = modal.querySelector('#apply-btn-next');
  const submitBtn = modal.querySelector('#apply-btn-submit');
  const errorAlert = modal.querySelector('#apply-error-alert');
  const successView = modal.querySelector('#apply-success-view');
  const formView = modal.querySelector('#apply-form-view');
  const receiptCode = modal.querySelector('#apply-receipt-code');
  const receiptTrack = modal.querySelector('#apply-receipt-track');
  const receiptSheet = modal.querySelector('#apply-receipt-sheet');
  const successCloseBtn = modal.querySelector('#apply-success-close');

  let currentTrackKey = 'delegate';
  let currentStepIndex = 0;
  let isSubmitting = false;
  const formData = {};

  // Open modal for a given track
  function openApplyModal(trackKey) {
    if (!TRACK_CONFIGS[trackKey]) trackKey = 'delegate';
    currentTrackKey = trackKey;
    currentStepIndex = 0;

    const config = TRACK_CONFIGS[currentTrackKey];
    modalTag.textContent = config.tag;
    modalTitle.textContent = config.title;
    if (modalTrackId) modalTrackId.textContent = config.id.toUpperCase();

    // Reset view states
    if (formView) formView.style.display = 'block';
    if (successView) successView.style.display = 'none';
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.textContent = '';
    }

    renderCurrentStep();

    // Close mobile nav drawer if open
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      mobileDrawer.classList.remove('is-open');
      const burger = document.getElementById('nav-burger');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    }

    modal.classList.add('is-open');
    document.body.classList.add('apply-modal-open');
    document.body.style.overflow = 'hidden';

    // Pause Lenis smooth scroll while modal is active
    if (window.lenis) {
      window.lenis.stop();
    }

    // Attach passive wheel/touch isolation so modal scroll operates natively
    const scrollContainer = modal.querySelector('.apply-modal__scrollable');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      if (!scrollContainer.dataset.scrollBound) {
        scrollContainer.dataset.scrollBound = 'true';
        scrollContainer.addEventListener('wheel', (e) => {
          e.stopPropagation();
        }, { passive: true });
        scrollContainer.addEventListener('touchmove', (e) => {
          e.stopPropagation();
        }, { passive: true });
      }
    }

    // Animate modal entry
    const container = modal.querySelector('.apply-modal__container');
    gsap.fromTo(container, 
      { y: 25, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
    );
  }

  function closeApplyModal() {
    if (isSubmitting) return; // Prevent closing while network request is in flight
    const container = modal.querySelector('.apply-modal__container');
    gsap.to(container, {
      y: 20,
      opacity: 0,
      scale: 0.98,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('is-open');
        document.body.classList.remove('apply-modal-open');
        document.body.style.overflow = '';
        // Resume Lenis smooth scroll
        if (window.lenis) {
          window.lenis.start();
        }
      }
    });
  }

  function renderCurrentStep() {
    const config = TRACK_CONFIGS[currentTrackKey];
    const totalSteps = config.steps.length;
    const step = config.steps[currentStepIndex];

    // Progress bar
    const pct = ((currentStepIndex + 1) / totalSteps) * 100;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (stepIndicator) stepIndicator.textContent = `Step ${currentStepIndex + 1} of ${totalSteps}`;
    if (stepTitle) stepTitle.textContent = step.title;
    if (stepSubtitle) stepSubtitle.textContent = step.subtitle;

    // Render Fields
    if (!formBody) return;
    formBody.innerHTML = step.fields.map(field => {
      const val = formData[field.id] || '';
      let controlHtml = '';

      if (field.type === 'select') {
        const optionsHtml = field.options.map(opt => `
          <option value="${opt.value}" ${val === opt.value ? 'selected' : ''}>${opt.label}</option>
        `).join('');
        controlHtml = `
          <div class="apply-select-wrapper">
            <select class="apply-control apply-control--select" id="field-${field.id}" data-id="${field.id}" ${field.required ? 'required' : ''}>
              ${optionsHtml}
            </select>
            <div class="apply-select-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        `;
      } else if (field.type === 'textarea') {
        controlHtml = `
          <textarea class="apply-control apply-control--textarea" id="field-${field.id}" data-id="${field.id}" rows="4" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${val}</textarea>
        `;
      } else {
        controlHtml = `
          <input type="${field.type}" class="apply-control apply-control--input" id="field-${field.id}" data-id="${field.id}" value="${val}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} />
        `;
      }

      return `
        <div class="apply-field-group">
          <div class="apply-field-header">
            <label for="field-${field.id}" class="apply-label">
              ${field.label}
              ${field.required ? '<span class="apply-required">*</span>' : '<span class="apply-optional">(Optional)</span>'}
            </label>
          </div>
          ${controlHtml}
          ${field.hint ? `<p class="apply-hint">${field.hint}</p>` : ''}
        </div>
      `;
    }).join('');

    // Attach real-time input listeners
    formBody.querySelectorAll('.apply-control').forEach(ctrl => {
      ctrl.addEventListener('input', (e) => {
        const id = e.target.getAttribute('data-id');
        formData[id] = e.target.value;
        if (errorAlert) errorAlert.style.display = 'none';
      });
      ctrl.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        formData[id] = e.target.value;
        if (errorAlert) errorAlert.style.display = 'none';
      });
    });

    // Update navigation buttons
    if (prevBtn) {
      prevBtn.style.visibility = currentStepIndex > 0 ? 'visible' : 'hidden';
      prevBtn.disabled = isSubmitting;
    }

    if (currentStepIndex === totalSteps - 1) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) {
        submitBtn.style.display = 'inline-flex';
        submitBtn.disabled = isSubmitting;
      }
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      if (submitBtn) submitBtn.style.display = 'none';
    }

    // Scroll form container to top
    const scrollContainer = modal.querySelector('.apply-modal__scrollable');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }

  function validateCurrentStep() {
    const config = TRACK_CONFIGS[currentTrackKey];
    const step = config.steps[currentStepIndex];

    for (const field of step.fields) {
      const val = (formData[field.id] || '').trim();

      // Required field presence check
      if (field.required) {
        if (!val) {
          showError(`Please complete the required field: "${field.label}"`, field.id);
          return false;
        }
      }

      // Email format validation
      if (field.type === 'email' && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          showError(`Please enter a valid email address for "${field.label}"`, field.id);
          return false;
        }
      }

      // Date validation
      if (field.type === 'date' && val) {
        const dateObj = new Date(val);
        if (isNaN(dateObj.getTime())) {
          showError(`Please select a valid date for "${field.label}"`, field.id);
          return false;
        }
      }
    }

    if (errorAlert) errorAlert.style.display = 'none';
    return true;
  }

  function showError(message, fieldId) {
    if (errorAlert) {
      errorAlert.textContent = message;
      errorAlert.style.display = 'block';
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (fieldId) {
      const el = document.getElementById(`field-${fieldId}`);
      if (el) {
        el.focus();
        el.classList.add('is-invalid');
        setTimeout(() => el.classList.remove('is-invalid'), 3000);
      }
    }
  }

  function handleNext() {
    if (isSubmitting) return;
    if (!validateCurrentStep()) return;
    const config = TRACK_CONFIGS[currentTrackKey];
    if (currentStepIndex < config.steps.length - 1) {
      currentStepIndex++;
      renderCurrentStep();
    }
  }

  function handlePrev() {
    if (isSubmitting) return;
    if (currentStepIndex > 0) {
      currentStepIndex--;
      if (errorAlert) errorAlert.style.display = 'none';
      renderCurrentStep();
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions
    if (!validateCurrentStep()) return;

    isSubmitting = true;

    // Visual loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      submitBtn.innerHTML = `
        <span class="apply-btn__spinner" aria-hidden="true"></span>
        Submitting Application...
      `;
    }
    if (prevBtn) {
      prevBtn.disabled = true;
      prevBtn.style.pointerEvents = 'none';
    }
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.textContent = '';
    }

    try {
      const config = TRACK_CONFIGS[currentTrackKey];
      // Build normalized payload strictly according to Google Sheets column structure
      const payload = buildApplicationPayload(currentTrackKey, formData);

      const result = await submitApplication(payload);

      if (!result || result.success === false) {
        throw new Error(result?.message || 'Submission was rejected by Google Sheets backend');
      }

      // Success State
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const trackingCode = `MUNTAL-2327-${(config.application_type || config.id).substring(0, 3).toUpperCase()}-${randomCode}`;

      if (receiptCode) receiptCode.textContent = trackingCode;
      if (receiptTrack) receiptTrack.textContent = config.title;
      if (receiptSheet) receiptSheet.textContent = config.sheetName;

      // Clear all form data upon successful submission
      for (const key in formData) {
        delete formData[key];
      }

      // Reset DOM controls
      if (formBody) {
        formBody.querySelectorAll('.apply-control').forEach(ctrl => {
          ctrl.value = '';
        });
      }

      // Display luxury success view
      if (formView) formView.style.display = 'none';
      if (successView) {
        successView.style.display = 'block';
        gsap.fromTo(successView, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    } catch (err) {
      console.error('[MUNTAL Submission Error]:', err);

      // On failure: Keep all entered form data intact & inform applicant
      if (errorAlert) {
        errorAlert.textContent = 'Something went wrong while submitting your application. Please try again.';
        errorAlert.style.display = 'block';
        errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } finally {
      isSubmitting = false;

      // Restore submit button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        submitBtn.innerHTML = `
          Submit Application
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        `;
      }
      if (prevBtn) {
        prevBtn.disabled = false;
        prevBtn.style.pointerEvents = '';
      }
    }
  }

  // Attach card trigger click listeners
  document.querySelectorAll('.apply-card-trigger').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const track = card.getAttribute('data-track') || 'delegate';
      openApplyModal(track);
    });
  });

  // Modal event listeners
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeApplyModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeApplyModal);
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeApplyModal);

  if (nextBtn) nextBtn.addEventListener('click', handleNext);
  if (prevBtn) prevBtn.addEventListener('click', handlePrev);
  if (submitBtn) submitBtn.addEventListener('click', handleSubmit);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeApplyModal();
    }
  });
}
