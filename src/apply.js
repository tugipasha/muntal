// MUNTAL Model United Nations — Application Track Configurations & Field Schemas
import { SHEETS_MAPPING } from './api.js';

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
            placeholder: 'Why do you wish to participate in MUNTAL? What perspectives do you bring to debate?', 
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
