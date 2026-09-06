// MUNTAL Model United Nations — Google Sheets Integration API Client
// Handles payload normalization and secure submission to Google Apps Script Web App

/**
 * Google Apps Script Web App Deployment URL
 * Can be overridden via VITE_GOOGLE_APPS_SCRIPT_URL environment variable.
 */
export const GOOGLE_APPS_SCRIPT_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL) ||
  'GOOGLE_APPS_SCRIPT_URL_HERE';

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
 * Submits normalized application payload to Google Apps Script Web App.
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

  const endpoint = GOOGLE_APPS_SCRIPT_URL;

  // Real submission when live Google Apps Script URL is configured
  if (endpoint && endpoint !== 'GOOGLE_APPS_SCRIPT_URL_HERE') {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Submission failed with HTTP ${response.status}: ${response.statusText}`);
      }

      let jsonResponse;
      try {
        jsonResponse = await response.json();
      } catch (parseErr) {
        console.error('[MUNTAL Sheets Integration] Invalid JSON returned from Google Apps Script:', parseErr);
        throw new Error('Invalid JSON response received from application endpoint');
      }

      if (jsonResponse.success === false) {
        throw new Error(jsonResponse.message || 'Google Sheets rejected the submission');
      }

      return jsonResponse;
    } catch (networkError) {
      console.error('[MUNTAL Sheets Integration] Submission network error:', networkError);
      throw networkError;
    }
  }

  // Fallback for development / preview when placeholder URL is present
  console.info('[MUNTAL Sheets Integration] Submitting to endpoint:', endpoint);
  console.info('[MUNTAL Sheets Integration] Target Sheet:', SHEETS_MAPPING[data.application_type]);
  console.info('[MUNTAL Sheets Integration] Normalized Payload:', data);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (err) {
    // If endpoint is literally "GOOGLE_APPS_SCRIPT_URL_HERE", browser cannot resolve the domain.
    // Check if intentional test error was requested (e.g. email containing "error" or "fail")
    const isTestError = 
      (data.email && (data.email.includes('error') || data.email.includes('fail'))) ||
      (data.head_delegate_email && (data.head_delegate_email.includes('error') || data.head_delegate_email.includes('fail')));

    if (isTestError) {
      console.warn('[MUNTAL Sheets Integration] Simulated submission failure for testing error state.');
      await new Promise(resolve => setTimeout(resolve, 600));
      throw new Error('Simulated backend error for test verification');
    }

    console.warn(
      '[MUNTAL Sheets Integration] Placeholder endpoint "GOOGLE_APPS_SCRIPT_URL_HERE" detected. ' +
      'Simulating successful response for frontend preview. ' +
      'Deploy your Google Apps Script as a Web App and set VITE_GOOGLE_APPS_SCRIPT_URL in .env or src/api.js.'
    );

    // Provide a brief realistic network latency for the UI loading state
    await new Promise(resolve => setTimeout(resolve, 750));

    return {
      success: true,
      message: 'Application submitted successfully'
    };
  }
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
