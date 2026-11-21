// MUNTAL — Application payload builders
// Başvurular Google Apps Script üzerinden Google Sheets'e yazılır.

// Google Sheet sekme adları
export const SHEETS_MAPPING = {
  delegate: 'Delegate',
  delegation: 'Delegation',
  chairboard: 'Delegation',
  administrative: 'Admin',
  admin: 'Admin',
  press: 'Press'
};

// Google Apps Script Web App (/exec) adresi. .env içindeki VITE_SHEETS_URL ile değiştirilebilir.
const SHEETS_URL =
  (import.meta.env && import.meta.env.VITE_SHEETS_URL) ||
  'https://script.google.com/macros/s/AKfycbwZRc8qgrvuBJidofL5L5lb9mdt7ZPghWZm8rfSJKQxVaxde2Shh8-63krWCrAU0SRI/exec';

/**
 * Başvuruyu Google Sheets'e gönderir.
 * text/plain kullanılır: CORS preflight tetiklenmez, Apps Script doPost direkt çalışır.
 *
 * @param {Object} data - buildApplicationPayload çıktısı
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function submitApplication(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid payload: data object is required');
  }
  if (!data.application_type) {
    throw new Error('application_type is required');
  }

  let response;
  try {
    response = await fetch(SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  let result;
  try {
    result = await response.json();
  } catch (err) {
    throw new Error('Unexpected response from server. Please try again.');
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Submission could not be completed.');
  }
  return result;
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
