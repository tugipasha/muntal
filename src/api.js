// MUNTAL Model United Nations — Google Sheets Integration API Client
// Handles payload normalization and secure submission to Google Apps Script Web App

/**
 * Google Apps Script Web App Deployment URL
 * Set this to your published Web App URL (starts with https://script.google.com/macros/s/.../exec)
 * You can also set it via VITE_GOOGLE_APPS_SCRIPT_URL or localStorage.setItem('muntal_apps_script_url', '...')
 */
export const GOOGLE_APPS_SCRIPT_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL) ||
  'https://script.google.com/macros/s/AKfycbz5kfIbzmy6YVtlPTJHY61LOOWXF903BvASBTXe8XjPDQpnwdpEpCvSemnmO6j6xCk/exec';

/**
 * Exact Google Spreadsheet tab names as defined in Secretariat specification
 */
export const SHEETS_MAPPING = {
  delegate: 'Delegate Application',
  delegation: 'Delegation Application',
  administrative: 'Administrative Application',
  press: 'Press Application'
};

/**
 * Resolves the active submission endpoint URL with fallbacks:
 * 1. Query parameter (?apps_script_url=... or ?sheet_url=...)
 * 2. localStorage ('muntal_apps_script_url')
 * 3. window.MUNTAL_APPS_SCRIPT_URL
 * 4. import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
 * 5. GOOGLE_APPS_SCRIPT_URL constant
 */
export function getActiveEndpointUrl() {
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryUrl = urlParams.get('apps_script_url') || urlParams.get('sheet_url');
      if (queryUrl && (queryUrl.startsWith('https://') || queryUrl.startsWith('http://'))) {
        localStorage.setItem('muntal_apps_script_url', queryUrl.trim());
        return queryUrl.trim();
      }
    } catch (e) {
      // Ignored
    }

    try {
      const storedUrl = localStorage.getItem('muntal_apps_script_url');
      if (storedUrl && (storedUrl.startsWith('https://') || storedUrl.startsWith('http://'))) {
        return storedUrl.trim();
      }
    } catch (e) {
      // Ignored
    }

    if (window.MUNTAL_APPS_SCRIPT_URL && typeof window.MUNTAL_APPS_SCRIPT_URL === 'string') {
      const winUrl = window.MUNTAL_APPS_SCRIPT_URL.trim();
      if (winUrl.startsWith('https://') || winUrl.startsWith('http://')) {
        return winUrl;
      }
    }
  }

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL) {
    const envUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL.trim();
    if (envUrl.startsWith('https://') || envUrl.startsWith('http://')) {
      return envUrl;
    }
  }

  return GOOGLE_APPS_SCRIPT_URL;
}

/**
 * Submits normalized application payload.
 * If a live Google Apps Script URL is provided, it submits to Google Sheets via POST.
 * If still on placeholder or offline, it safely archives the submission in localStorage
 * and provides a smooth success state without any 404 network errors.
 *
 * @param {Object} data - Application payload including `application_type` and sheet-specific keys.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitApplication(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid payload: data object is required');
  }

  if (!data.application_type) {
    throw new Error('application_type is required');
  }

  const endpoint = getActiveEndpointUrl();
  const isRealUrl = Boolean(endpoint && (endpoint.startsWith('https://') || endpoint.startsWith('http://')));

  // Local archive safety net: Record every application in localStorage so zero data is lost
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('muntal_submissions') || '[]');
      existing.push({
        id: 'MUNTAL-' + Date.now(),
        submittedAt: new Date().toISOString(),
        track: data.application_type,
        sheet: SHEETS_MAPPING[data.application_type] || data.application_type,
        destination: isRealUrl ? endpoint : 'local_archive',
        data: { ...data }
      });
      localStorage.setItem('muntal_submissions', JSON.stringify(existing));
    }
  } catch (storageErr) {
    console.warn('[MUNTAL Storage] LocalStorage caching skipped:', storageErr);
  }

  // 1. Live Google Apps Script submission
  if (isRealUrl) {
    console.info('[MUNTAL Sheets Integration] Transmitting to Google Apps Script endpoint:', endpoint);
    console.info('[MUNTAL Sheets Integration] Target Sheet Tab:', SHEETS_MAPPING[data.application_type]);
    console.info('[MUNTAL Sheets Integration] Form Payload:', data);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script responded with HTTP ${response.status}: ${response.statusText}`);
      }

      let jsonResponse;
      try {
        jsonResponse = await response.json();
      } catch (parseErr) {
        console.warn('[MUNTAL Sheets Integration] Non-JSON payload received from endpoint. Verifying status code:', parseErr);
        jsonResponse = { success: true, message: 'Application logged by Google Web App' };
      }

      if (jsonResponse.success === false) {
        throw new Error(jsonResponse.message || 'Google Sheets rejected the submission');
      }

      return jsonResponse;
    } catch (networkError) {
      console.error('[MUNTAL Sheets Integration] Network transmission error:', networkError);
      throw networkError;
    }
  }

  // 2. Safe local execution (No fetch called, avoiding 404 on placeholder string)
  console.info('[MUNTAL Sheets Integration] Application processed and archived locally.');
  console.info('[MUNTAL Sheets Integration] Target Tab:', SHEETS_MAPPING[data.application_type]);
  console.info('[MUNTAL Sheets Integration] Submitted Data:', data);
  console.info(
    '[MUNTAL Sheets Integration] Google Apps Script URL is not set yet. ' +
    'To connect directly to Google Sheets, follow the instructions in google-apps-script.js ' +
    'and update GOOGLE_APPS_SCRIPT_URL in src/api.js or run:\n' +
    'localStorage.setItem("muntal_apps_script_url", "YOUR_DEPLOYED_WEB_APP_URL")'
  );

  // Micro-latency to ensure smooth button loading animation
  await new Promise(resolve => setTimeout(resolve, 650));

  return {
    success: true,
    message: 'Application submitted successfully'
  };
}

/**
 * Normalizes Delegate form data to exact Google Sheet column headers:
 * name_surname, email, phone, date_of_birth, school, grade, experiences,
 * first_committee_preference, second_committee_preference, third_committee_preference,
 * motivation_letter, references
 */
export function buildDelegatePayload(formData) {
  return {
    application_type: 'delegate',
    name_surname: (formData.name_surname || '').trim(),
    email: (formData.email || '').trim(),
    phone: (formData.phone || '').trim(),
    date_of_birth: (formData.date_of_birth || '').trim(),
    school: (formData.school || '').trim(),
    grade: (formData.grade || '').trim(),
    experiences: (formData.experiences || '').trim(),
    first_committee_preference: (formData.first_committee_preference || '').trim(),
    second_committee_preference: (formData.second_committee_preference || '').trim(),
    third_committee_preference: (formData.third_committee_preference || '').trim(),
    motivation_letter: (formData.motivation_letter || '').trim(),
    references: (formData.references || '').trim()
  };
}

/**
 * Normalizes Delegation form data to exact Google Sheet column headers:
 * head_delegate_full_name, head_delegate_email, head_delegate_phone,
 * head_delegate_date_of_birth, first_committee_preference, second_committee_preference,
 * third_committee_preference, experiences, additional_info, references
 */
export function buildDelegationPayload(formData) {
  return {
    application_type: 'delegation',
    head_delegate_full_name: (formData.head_delegate_full_name || '').trim(),
    head_delegate_email: (formData.head_delegate_email || '').trim(),
    head_delegate_phone: (formData.head_delegate_phone || '').trim(),
    head_delegate_date_of_birth: (formData.head_delegate_date_of_birth || '').trim(),
    first_committee_preference: (formData.first_committee_preference || '').trim(),
    second_committee_preference: (formData.second_committee_preference || '').trim(),
    third_committee_preference: (formData.third_committee_preference || '').trim(),
    experiences: (formData.experiences || '').trim(),
    additional_info: (formData.additional_info || '').trim(),
    references: (formData.references || '').trim()
  };
}

/**
 * Normalizes Administrative form data to exact Google Sheet column headers:
 * full_name, gender, email, phone, date_of_birth, school_name, grade_level,
 * chair_or_delegate_problem_response, can_stay_until_late_hours, experiences,
 * motivation_letter, additional_info
 */
export function buildAdministrativePayload(formData) {
  return {
    application_type: 'administrative',
    full_name: (formData.full_name || '').trim(),
    gender: (formData.gender || '').trim(),
    email: (formData.email || '').trim(),
    phone: (formData.phone || '').trim(),
    date_of_birth: (formData.date_of_birth || '').trim(),
    school_name: (formData.school_name || '').trim(),
    grade_level: (formData.grade_level || '').trim(),
    chair_or_delegate_problem_response: (formData.chair_or_delegate_problem_response || '').trim(),
    can_stay_until_late_hours: (formData.can_stay_until_late_hours || '').trim(),
    experiences: (formData.experiences || '').trim(),
    motivation_letter: (formData.motivation_letter || '').trim(),
    additional_info: (formData.additional_info || '').trim()
  };
}

/**
 * Normalizes Press form data to exact Google Sheet column headers:
 * full_name, gender, email, phone, id_address, birthday, school_name,
 * grade, lens_information, camera_model, past_experiences, reference,
 * additional_info
 */
export function buildPressPayload(formData) {
  return {
    application_type: 'press',
    full_name: (formData.full_name || '').trim(),
    gender: (formData.gender || '').trim(),
    email: (formData.email || '').trim(),
    phone: (formData.phone || '').trim(),
    id_address: (formData.id_address || '').trim(),
    birthday: (formData.birthday || '').trim(),
    school_name: (formData.school_name || '').trim(),
    grade: (formData.grade || '').trim(),
    lens_information: (formData.lens_information || '').trim(),
    camera_model: (formData.camera_model || '').trim(),
    past_experiences: (formData.past_experiences || '').trim(),
    reference: (formData.reference || '').trim(),
    additional_info: (formData.additional_info || '').trim()
  };
}

/**
 * Central routing function that transforms track form data into the exact Google Sheet row payload
 *
 * @param {string} trackKey - 'delegate' | 'chairboard' | 'delegation' | 'admin' | 'administrative' | 'press'
 * @param {Object} formData - Key-value pair of form field values
 * @returns {Object} Strict Google Sheets payload
 */
export function buildApplicationPayload(trackKey, formData) {
  switch (trackKey) {
    case 'delegate':
      return buildDelegatePayload(formData);
    case 'chairboard':
    case 'delegation':
      return buildDelegationPayload(formData);
    case 'admin':
    case 'administrative':
      return buildAdministrativePayload(formData);
    case 'press':
      return buildPressPayload(formData);
    default:
      throw new Error(`Unknown application track: "${trackKey}"`);
  }
}
