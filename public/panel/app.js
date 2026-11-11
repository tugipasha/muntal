/**
 * MUNTAL — SECRETARIAT APPLICATION MANAGEMENT PORTAL (app.js)
 * Minimalist, Flat, Live Google Sheets Integration & Multi-Channel Communications
 */

(function () {
  'use strict';

  const DEFAULT_APPS_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbwtCol5X4oJS0gDsj1u187S-a2Dotx4sipqZ5hY1gOx8V_rTJ-h85JrcsqvjnnlXJzcIA/exec';

  const STORAGE_KEYS = {
    URL: 'muntal_apps_script_url',
    APPS: 'muntal_panel_applications',
    LOGS: 'muntal_panel_email_logs'
  };

  const STANDARD_COMMITTEES = [
    '01 DISEC (Disarmament & International Security)',
    '02 WHO (World Health Organization)',
    '03 UNSC (United Nations Security Council)',
    '04 UNHRC (Human Rights Council)',
    '05 ECOFIN (Economic & Financial Affairs)',
    '06 NATO-NAC (North Atlantic Council)',
    '07 JCC (Joint Crisis Committee)'
  ];

  // Pre-built English Email Templates
  const TEMPLATES = {
    acceptance: {
      subject: 'MUNTAL — Official Letter of Accreditation & Committee Allocation',
      body: `Dear {{name}},

On behalf of the MUNTAL Secretariat and Academic Directorate, we are pleased to inform you that your application for the {{category}} track has been formally ACCEPTED.

Application ID: {{application_id}}
Assigned Committee: {{assigned_committee}}
Institution: {{school}}

Your official Committee Study Guide and conference procedural directives will be dispatched to your registered email address shortly. Please keep in contact with our secretariat regarding conference preparation and logistical details.

Sincerely,
Secretariat of MUNTAL
Izmir, Türkiye`
    },

    rejection: {
      subject: 'MUNTAL — Application Status Notice',
      body: `Dear {{name}},

Thank you for your interest in MUNTAL and for taking the time to complete the {{category}} application dossier.

Due to strict delegate quotas across our simulated assemblies this session, we regret to inform you that we are unable to offer you an allocation for this term. We received an exceptionally high volume of applications from across institutions.

We commend your academic diligence and wish you every success in your ongoing academic and diplomatic pursuits. We hope to welcome you to future MUNTAL conferences.

Sincerely,
Secretariat of MUNTAL`
    },

    under_review: {
      subject: 'MUNTAL — Application Preliminary Review Notice',
      body: `Dear {{name}},

Your {{category}} application (ID: {{application_id}}) has been received by the MUNTAL Secretariat and is currently undergoing committee academic review.

First Preference: {{first_preference}}
Second Preference: {{second_preference}}
Third Preference: {{third_preference}}

You will receive an official notification once our academic board finalizes allocations.

Sincerely,
Secretariat of MUNTAL`
    },

    interview: {
      subject: 'MUNTAL — Academic Interview Invitation',
      body: `Dear {{name}},

Following our preliminary review of your {{category}} dossier, the MUNTAL Academic Board cordially invites you to a brief 15-minute online interview.

Please reply directly to this email with your availability over the upcoming week.

Best regards,
Executive Board of MUNTAL`
    },

    logistics: {
      subject: 'MUNTAL — Conference Preparation & Logistics Guide',
      body: `Dear {{name}},

As the annual sessions of MUNTAL approach, the official Delegate Handbook, Rules of Procedure, and committee logistics guides have been published.

Assigned Committee: {{assigned_committee}}
Accreditation Status: {{status}}

Please review the required position paper deadlines and code of conduct before arrival.

Warm regards,
Secretariat of MUNTAL`
    },

    custom: {
      subject: 'MUNTAL — Official Communication',
      body: `Dear {{name}},

We are writing regarding your {{category}} application (ID: {{application_id}}).

Assigned Committee: {{assigned_committee}}

Sincerely,
Secretariat of MUNTAL`
    }
  };

  // State
  const state = {
    appsScriptUrl: localStorage.getItem(STORAGE_KEYS.URL) || DEFAULT_APPS_SCRIPT_URL,
    applications: [],
    selectedIds: new Set(),
    activeTab: 'dashboard',
    emailMode: 'single', // 'single' | 'bulk'
    activeDossierApp: null,
    filters: {
      category: 'all',
      search: '',
      status: '',
      committee: '',
      allocation: '',
      sort: 'date-desc'
    },
    emailLogs: []
  };

  // Full Updated Apps Script Code string for 1-click copying
  const GOOGLE_APPS_SCRIPT_CODE = `/*******************************************************
 * MUNTAL — GOOGLE SHEETS INTEGRATION & API
 * 4 Application Tracks: Delegate, Chairboard, Admin, Press
 *******************************************************/

const CONFIG = {
  delegate: {
    sheetName: "Delegate",
    applicationTypes: ["delegate"],
    fields: [
      ["name_surname", "Name Surname", "text", true],
      ["email", "Email Address", "email", true],
      ["phone", "Phone Number", "tel", true],
      ["date_of_birth", "Date of Birth", "date", true],
      ["school", "School", "text", true],
      ["grade", "Grade", "select", true],
      ["first_committee_preference", "First Committee Preference", "select", true],
      ["second_committee_preference", "Second Committee Preference", "select", true],
      ["third_committee_preference", "Third Committee Preference", "select", true],
      ["experiences", "Experiences", "textarea", true],
      ["motivation_letter", "Motivation Letter", "textarea", true],
      ["references", "References", "textarea", false]
    ]
  },
  chairboard: {
    sheetName: "Chairboard",
    applicationTypes: ["delegation", "chairboard"],
    fields: [
      ["head_delegate_full_name", "Head Delegate’s Full Name", "text", true],
      ["head_delegate_email", "Head Delegate’s Email Address", "email", true],
      ["head_delegate_phone", "Head Delegate’s Phone Number", "tel", true],
      ["head_delegate_date_of_birth", "Head Delegate’s Date of Birth", "date", true],
      ["first_committee_preference", "First Committee Preference", "select", true],
      ["second_committee_preference", "Second Committee Preference", "select", true],
      ["third_committee_preference", "Third Committee Preference", "select", true],
      ["experiences", "Experiences (Head Delegate / Chairing)", "textarea", true],
      ["additional_info", "Additional Info (Optional)", "textarea", false],
      ["references", "References", "textarea", false]
    ]
  },
  admin: {
    sheetName: "Admin",
    applicationTypes: ["administrative", "admin"],
    fields: [
      ["full_name", "Full Name", "text", true],
      ["gender", "Gender", "select", true],
      ["email", "Email Address", "email", true],
      ["phone", "Phone Number", "tel", true],
      ["date_of_birth", "Date of Birth", "date", true],
      ["school_name", "School Name", "text", true],
      ["grade_level", "Grade Level", "select", true],
      ["can_stay_until_late_hours", "Can you stay in the conference venue until late hours?", "select", true],
      ["chair_or_delegate_problem_response", "What would you do if you had a problem with a chair or delegate in your committee?", "textarea", true],
      ["experiences", "Experiences", "textarea", true],
      ["motivation_letter", "Motivation Letter", "textarea", true],
      ["additional_info", "Anything else you would like to add? (References etc.)", "textarea", false]
    ]
  },
  press: {
    sheetName: "Press",
    applicationTypes: ["press"],
    fields: [
      ["full_name", "Full Name", "text", true],
      ["gender", "Gender", "select", true],
      ["email", "Email Address", "email", true],
      ["phone", "Phone Number", "tel", true],
      ["id_address", "ID Address (National ID / Student ID Number)", "text", true],
      ["birthday", "Birthday", "date", true],
      ["school_name", "School Name", "text", true],
      ["grade", "Grade", "select", true],
      ["camera_model", "What is the model of your camera?", "text", true],
      ["lens_information", "Give information about your lens or lenses (if more than one)", "textarea", true],
      ["past_experiences", "Past Experiences (Photo, Video, Writing)", "textarea", true],
      ["reference", "Reference", "textarea", false],
      ["additional_info", "Anything You Want to Add", "textarea", false]
    ]
  }
};

const SYSTEM_COLUMNS = ["Submitted At", "Application ID", "Status", "Assigned Committee", "Notes"];

/**
 * Run this function once in Apps Script editor to authorize email permissions:
 */
function authorizeEmailAccess() {
  const email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  if (email) {
    MailApp.sendEmail(email, "MUNTAL Email Authorization Test", "Google Apps Script email dispatch has been successfully authorized!");
    Logger.log("Authorization test email sent to: " + email);
  }
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : "getApplications";
    if (action === "ping" || action === "test") {
      return json_({ success: true, version: "v2", email_ready: true, message: "MUNTAL Google Apps Script API v2 is running with Email Dispatch enabled!" });
    }
    if (action === "sendEmail") {
      return handleSendEmail_(e.parameter || {});
    }
    if (action === "updateStatus") {
      return handleUpdateStatus_(e.parameter || {});
    }
    const apps = getAllApplications_();
    return json_({
      success: true,
      applications: apps,
      count: apps.length,
      tabs: Object.keys(CONFIG).map(function(k) { return CONFIG[k].sheetName; })
    });
  } catch (error) {
    return json_({ success: false, message: String(error), applications: [] });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    const data = readPayload_(e);
    const action = String(data.action || "").trim();

    if (action === "updateStatus") {
      return handleUpdateStatus_(data);
    }
    if (action === "sendEmail") {
      return handleSendEmail_(data);
    }

    const applicationType = String(data.application_type || "").toLowerCase();
    const cfg = findConfig_(applicationType);
    if (!cfg) return json_({ success: false, message: "Unknown application type" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(cfg.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.sheetName);
      const headers = cfg.fields.map(function(f) { return f[1]; });
      SYSTEM_COLUMNS.forEach(function(c) { headers.push(c); });
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const values = cfg.fields.map(function(field) {
      const val = data[field[0]];
      if (val === undefined || val === null) return "";
      if (Array.isArray(val)) return val.join(", ");
      return String(val);
    });

    const rnd = Math.floor(1000 + Math.random() * 9000);
    const appId = data.application_id || ("MUNTAL-" + cfg.sheetName.substring(0, 3).toUpperCase() + "-" + rnd);

    values.push(new Date());
    values.push(appId);
    values.push(data.status || "Pending");
    values.push(data.assigned_committee || data.first_committee_preference || "");
    values.push(data.notes || "");

    sheet.appendRow(values);
    return json_({ success: true, application_id: appId });
  } catch (err) {
    return json_({ success: false, message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch(e){}
  }
}

function getAllApplications_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allApps = [];

  Object.keys(CONFIG).forEach(function(key) {
    const cfg = CONFIG[key];
    const sheet = ss.getSheetByName(cfg.sheetName);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return;

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0];
    const hIdx = {};
    headers.forEach(function(h, i) { hIdx[String(h).trim().toLowerCase()] = i; });

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row.some(function(c) { return c !== "" && c !== null && c !== undefined; })) continue;

      const app = {
        sheet_name: cfg.sheetName,
        category: cfg.sheetName.toLowerCase()
      };

      cfg.fields.forEach(function(f) {
        const idx = hIdx[f[1].trim().toLowerCase()];
        app[f[0]] = (idx !== undefined && row[idx] !== undefined) ? String(row[idx]) : "";
      });

      app.submitted_at = hIdx["submitted at"] !== undefined ? row[hIdx["submitted at"]] : "";
      app.application_id = hIdx["application id"] !== undefined ? String(row[hIdx["application id"]]) : ("MUNTAL-" + r);
      app.status = hIdx["status"] !== undefined && row[hIdx["status"]] ? String(row[hIdx["status"]]).trim() : "Pending";
      app.assigned_committee = hIdx["assigned committee"] !== undefined && row[hIdx["assigned committee"]] ? String(row[hIdx["assigned committee"]]).trim() : "";
      app.notes = hIdx["notes"] !== undefined ? String(row[hIdx["notes"]]) : "";

      app.name = app.name_surname || app.head_delegate_full_name || app.full_name || "Applicant";
      app.email = app.email || app.head_delegate_email || "";
      app.phone = app.phone || app.head_delegate_phone || "";
      app.school = app.school || app.school_name || "—";
      
      app.first_committee_preference = app.first_committee_preference || "";
      app.second_committee_preference = app.second_committee_preference || "";
      app.third_committee_preference = app.third_committee_preference || "";

      allApps.push(app);
    }
  });

  return allApps.sort(function(a, b) {
    return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
  });
}

function handleUpdateStatus_(data) {
  const targetId = String(data.application_id || "").trim();
  const newStatus = String(data.status || "").trim();
  const newCommittee = data.assigned_committee !== undefined ? String(data.assigned_committee).trim() : null;
  const newNotes = data.notes !== undefined ? String(data.notes) : null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let found = false;

  Object.keys(CONFIG).forEach(function(key) {
    if (found) return;
    const sheet = ss.getSheetByName(CONFIG[key].sheetName);
    if (!sheet || sheet.getLastRow() < 2) return;

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    let appIdCol = -1, statusCol = -1, commCol = -1, notesCol = -1;

    headers.forEach(function(h, i) {
      const low = String(h).trim().toLowerCase();
      if (low === "application id") appIdCol = i + 1;
      if (low === "status") statusCol = i + 1;
      if (low === "assigned committee") commCol = i + 1;
      if (low === "notes") notesCol = i + 1;
    });

    if (appIdCol === -1) return;
    let colCounter = lastCol;
    if (statusCol === -1) { colCounter++; statusCol = colCounter; sheet.getRange(1, statusCol).setValue("Status"); }
    if (commCol === -1) { colCounter++; commCol = colCounter; sheet.getRange(1, commCol).setValue("Assigned Committee"); }
    if (notesCol === -1) { colCounter++; notesCol = colCounter; sheet.getRange(1, notesCol).setValue("Notes"); }

    const ids = sheet.getRange(2, appIdCol, sheet.getLastRow() - 1, 1).getValues();
    for (let r = 0; r < ids.length; r++) {
      if (String(ids[r][0]).trim() === targetId) {
        if (newStatus) sheet.getRange(r + 2, statusCol).setValue(newStatus);
        if (newCommittee !== null) sheet.getRange(r + 2, commCol).setValue(newCommittee);
        if (newNotes !== null) sheet.getRange(r + 2, notesCol).setValue(newNotes);
        found = true;
        break;
      }
    }
  });

  return json_({ success: found, application_id: targetId });
}

function handleSendEmail_(data) {
  const recipient = String(data.to || "").trim();
  const recipientName = String(data.name || "").trim();
  const subject = String(data.subject || "MUNTAL Notification").trim();
  const bodyText = String(data.body || "").trim();
  const bodyHtml = String(data.html || "").trim() || bodyText.replace(/\n/g, "<br>");

  if (!recipient || (!bodyText && !bodyHtml)) {
    return json_({ success: false, email_sent: false, message: "Recipient and body are required." });
  }

  let status = "Sent";
  let errorMessage = "";

  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: bodyText,
      htmlBody: bodyHtml
    });
  } catch (err1) {
    try {
      GmailApp.sendEmail(recipient, subject, bodyText, {
        htmlBody: bodyHtml,
        name: "MUNTAL Secretariat"
      });
    } catch (err2) {
      status = "Failed";
      errorMessage = String(err2.message || err2 || err1);
    }
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let emailSheet = ss.getSheetByName("Email Logs");
    if (!emailSheet) {
      emailSheet = ss.insertSheet("Email Logs");
      emailSheet.getRange(1, 1, 1, 6).setValues([["Timestamp", "Recipient Email", "Recipient Name", "Subject", "Status", "Error / Details"]]);
    }
    emailSheet.appendRow([new Date(), recipient, recipientName, subject, status, errorMessage]);
  } catch (e) {}

  return json_({
    success: status === "Sent",
    email_sent: status === "Sent",
    message: status === "Sent" ? ("Email delivered to " + recipient) : ("Error: " + errorMessage)
  });
}

function readPayload_(e) {
  if (e && e.postData && e.postData.contents) return JSON.parse(e.postData.contents);
  if (e && e.parameter) return e.parameter;
  throw new Error("No payload");
}

function findConfig_(type) {
  for (let k in CONFIG) {
    if (CONFIG[k].applicationTypes.indexOf(type) !== -1) return CONFIG[k];
  }
  return null;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    init();
    bindEvents();
    fetchLiveFromSheets();
  });

  function init() {
    // Load local email logs
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (storedLogs) state.emailLogs = JSON.parse(storedLogs);
    } catch (e) {
      state.emailLogs = [];
    }

    // Load any cached applications before network fetch resolves
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.APPS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.applications = parsed;
        }
      }
    } catch (e) {}

    // Merge any locally archived submissions
    const locals = getLocalArchivedApplications();
    const existingIds = new Set(state.applications.map(a => a.application_id));
    locals.forEach(l => {
      if (!existingIds.has(l.application_id)) {
        state.applications.unshift(l);
      }
    });

    loadTemplate('acceptance');
    renderAll();
  }

  function getLocalArchivedApplications() {
    try {
      const localSubs = localStorage.getItem('muntal_submissions');
      if (localSubs) {
        const parsed = JSON.parse(localSubs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(s => {
            const d = s.data || {};
            return {
              application_id: s.id,
              submitted_at: s.submittedAt || new Date().toISOString(),
              category: (s.track || 'delegate').toLowerCase(),
              sheet_name: s.sheet || 'Delegate',
              name: d.name_surname || d.head_delegate_full_name || d.full_name || 'Applicant',
              email: d.email || d.head_delegate_email || '',
              phone: d.phone || d.head_delegate_phone || '',
              school: d.school || d.school_name || '—',
              grade: d.grade || d.grade_level || '—',
              first_committee_preference: d.first_committee_preference || '',
              second_committee_preference: d.second_committee_preference || '',
              third_committee_preference: d.third_committee_preference || '',
              assigned_committee: d.assigned_committee || '',
              status: normalizeStatus(d.status),
              notes: d.notes || '',
              motivation_letter: d.motivation_letter || '',
              experiences: d.experiences || d.past_experiences || '',
              references: d.references || d.reference || ''
            };
          });
        }
      }
    } catch (e) {}
    return [];
  }

  // --------------------------------------------------------------------------
  // EVENT BINDINGS
  // --------------------------------------------------------------------------
  function bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('btn-dash-to-apps').addEventListener('click', () => switchTab('applications'));

    // Sync button
    document.getElementById('btn-sync').addEventListener('click', () => fetchLiveFromSheets(false));

    // Settings Modal
    document.getElementById('btn-open-settings').addEventListener('click', openSettings);
    document.getElementById('btn-close-settings').addEventListener('click', closeSettings);
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-reset-default-url').addEventListener('click', () => {
      document.getElementById('setting-url').value = DEFAULT_APPS_SCRIPT_URL;
    });
    document.getElementById('btn-test-url').addEventListener('click', testUrl);

    // Copy script code button
    document.getElementById('btn-copy-script-code').addEventListener('click', copyScriptCode);

    // Application Category Filter Pills
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.filters.category = btn.dataset.cat;
        renderApplicationsTable();
      });
    });

    // Search and Dropdown Filters
    document.getElementById('input-search').addEventListener('input', e => {
      state.filters.search = e.target.value.trim().toLowerCase();
      renderApplicationsTable();
    });

    document.getElementById('select-status-filter').addEventListener('change', e => {
      state.filters.status = e.target.value;
      renderApplicationsTable();
    });

    document.getElementById('select-committee-filter').addEventListener('change', e => {
      state.filters.committee = e.target.value;
      renderApplicationsTable();
    });

    document.getElementById('select-allocation-filter').addEventListener('change', e => {
      state.filters.allocation = e.target.value;
      renderApplicationsTable();
    });

    document.getElementById('select-sort').addEventListener('change', e => {
      state.filters.sort = e.target.value;
      renderApplicationsTable();
    });

    // Checkbox Master
    document.getElementById('check-all').addEventListener('change', e => {
      const list = getFilteredApplications();
      if (e.target.checked) {
        list.forEach(a => state.selectedIds.add(a.application_id));
      } else {
        state.selectedIds.clear();
      }
      renderApplicationsTable();
    });

    // Bulk Actions
    document.getElementById('btn-bulk-clear').addEventListener('click', () => {
      state.selectedIds.clear();
      renderApplicationsTable();
    });

    document.getElementById('btn-bulk-accept').addEventListener('click', () => updateBulkStatus('Accepted'));
    document.getElementById('btn-bulk-reject').addEventListener('click', () => updateBulkStatus('Rejected'));
    document.getElementById('btn-bulk-email').addEventListener('click', () => {
      switchTab('emails');
      setEmailMode('bulk');
    });

    // CSV Export
    document.getElementById('btn-export-csv').addEventListener('click', exportCsv);

    // Dossier Modal
    document.getElementById('btn-close-dossier').addEventListener('click', closeDossier);
    document.getElementById('btn-save-dossier-status').addEventListener('click', saveDossierStatus);
    document.getElementById('btn-dossier-email').addEventListener('click', () => {
      const target = state.activeDossierApp;
      if (target) {
        closeDossier();
        switchTab('emails');
        setEmailMode('single');
        document.getElementById('email-to-select').value = target.application_id;
        updatePreview();
      }
    });

    // Email Mode Pills
    document.getElementById('btn-mode-single').addEventListener('click', () => setEmailMode('single'));
    document.getElementById('btn-mode-bulk').addEventListener('click', () => setEmailMode('bulk'));

    document.getElementById('template-select').addEventListener('change', e => loadTemplate(e.target.value));
    document.getElementById('email-to-select').addEventListener('change', updatePreview);
    document.getElementById('email-subject').addEventListener('input', updatePreview);
    document.getElementById('email-body').addEventListener('input', updatePreview);
    document.getElementById('bulk-scope-select').addEventListener('change', updatePreview);

    document.querySelectorAll('.var-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        insertVar(tag.dataset.var);
        updatePreview();
      });
    });

    // Email dispatch actions
    document.getElementById('email-form').addEventListener('submit', handleSendEmailAppsScript);
    document.getElementById('btn-open-gmail-web').addEventListener('click', handleOpenGmailWeb);
    document.getElementById('btn-mail-client').addEventListener('click', handleOpenMailClient);
    document.getElementById('btn-copy-email-body').addEventListener('click', handleCopyEmailText);

    document.getElementById('btn-clear-logs').addEventListener('click', () => {
      state.emailLogs = [];
      localStorage.setItem(STORAGE_KEYS.LOGS, '[]');
      renderLogs();
      showToast('Dispatch logs cleared.');
    });

    // Guide Modal
    const closeGuide = () => {
      const g = document.getElementById('guide-modal');
      if (g) g.style.display = 'none';
    };
    document.getElementById('btn-close-guide')?.addEventListener('click', closeGuide);
    document.getElementById('btn-close-guide-footer')?.addEventListener('click', closeGuide);
    document.getElementById('btn-guide-copy-code')?.addEventListener('click', copyScriptCode);
    document.getElementById('btn-guide-send-gmail')?.addEventListener('click', () => {
      closeGuide();
      handleOpenGmailWeb();
    });
  }

  // --------------------------------------------------------------------------
  // LIVE FETCH FROM GOOGLE SHEETS
  // --------------------------------------------------------------------------
  async function fetchLiveFromSheets(silent = true) {
    const dot = document.getElementById('sync-dot');
    const text = document.getElementById('sync-status-text');

    dot.className = 'sync-dot is-syncing';
    text.textContent = 'Syncing with Sheets...';

    try {
      const url = `${state.appsScriptUrl}?action=getApplications&t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data && Array.isArray(data.applications)) {
        // Normalize statuses and preferences
        const liveApps = data.applications.map(app => ({
          ...app,
          status: normalizeStatus(app.status),
          first_committee_preference: app.first_committee_preference || '',
          second_committee_preference: app.second_committee_preference || '',
          third_committee_preference: app.third_committee_preference || '',
          assigned_committee: app.assigned_committee || ''
        }));

        const liveIds = new Set(liveApps.map(a => a.application_id));
        const locals = getLocalArchivedApplications().filter(l => !liveIds.has(l.application_id));
        state.applications = [...locals, ...liveApps];

        try {
          localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(state.applications));
        } catch (e) {}

        dot.className = 'sync-dot';
        text.textContent = `Connected (${state.applications.length} Records)`;
        if (!silent) showToast(`Successfully synchronized ${state.applications.length} applications from Sheets.`, 'success');
      } else {
        dot.className = 'sync-dot';
        text.textContent = 'Connected (0 Records)';
      }
    } catch (err) {
      console.warn('[MUNTAL Sync]:', err);
      dot.className = 'sync-dot is-error';
      text.textContent = 'Connection Error (Click Sync)';
      if (!silent) showToast('Failed to reach Google Sheets. Please check your Web App URL in settings.', 'error');
    } finally {
      renderAll();
    }
  }

  // --------------------------------------------------------------------------
  // TAB NAVIGATION
  // --------------------------------------------------------------------------
  function switchTab(tabKey) {
    state.activeTab = tabKey;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.tab === tabKey);
    });

    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.toggle('is-active', view.id === `view-${tabKey}`);
    });

    if (tabKey === 'dashboard') renderDashboard();
    if (tabKey === 'applications') renderApplicationsTable();
    if (tabKey === 'emails') {
      populateRecipientsDropdown();
      updatePreview();
      renderLogs();
    }
  }

  function setEmailMode(mode) {
    state.emailMode = mode;
    document.getElementById('btn-mode-single').classList.toggle('is-active', mode === 'single');
    document.getElementById('btn-mode-bulk').classList.toggle('is-active', mode === 'bulk');

    document.getElementById('item-target-single').style.display = mode === 'single' ? 'block' : 'none';
    document.getElementById('item-target-bulk').style.display = mode === 'bulk' ? 'block' : 'none';
    updatePreview();
  }

  // --------------------------------------------------------------------------
  // RENDERING
  // --------------------------------------------------------------------------
  function renderAll() {
    renderDashboard();
    renderApplicationsTable();
    populateRecipientsDropdown();
    renderLogs();
    document.getElementById('header-app-count').textContent = state.applications.length;
  }

  // 01 Dashboard
  function renderDashboard() {
    const apps = state.applications;
    const total = apps.length;

    const todayStr = new Date().toDateString();
    let todayCount = 0;
    let pendingCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;

    const catCounts = { delegate: 0, chairboard: 0, press: 0, admin: 0 };
    const commAssignedCounts = { '01 DISEC': 0, '02 WHO': 0, '03 UNSC': 0, '04 NATO-NAC': 0, '05 JCC': 0, 'Unassigned': 0 };

    apps.forEach(a => {
      if (a.submitted_at && new Date(a.submitted_at).toDateString() === todayStr) todayCount++;

      const st = (a.status || '').toLowerCase();
      if (st.includes('accept') || st.includes('kabul')) acceptedCount++;
      else if (st.includes('reject') || st.includes('ret')) rejectedCount++;
      else pendingCount++;

      const cat = (a.category || '').toLowerCase();
      if (cat.includes('chair') || cat.includes('delegation')) catCounts.chairboard++;
      else if (cat.includes('press')) catCounts.press++;
      else if (cat.includes('admin')) catCounts.admin++;
      else catCounts.delegate++;

      // Track committee assignment & 1st preference
      const targetComm = a.assigned_committee || a.first_committee_preference || '';
      if (!a.assigned_committee) {
        commAssignedCounts['Unassigned']++;
      }

      if (targetComm.includes('DISEC') || targetComm.includes('01')) commAssignedCounts['01 DISEC']++;
      else if (targetComm.includes('WHO') || targetComm.includes('02')) commAssignedCounts['02 WHO']++;
      else if (targetComm.includes('UNSC') || targetComm.includes('03')) commAssignedCounts['03 UNSC']++;
      else if (targetComm.includes('NATO') || targetComm.includes('04')) commAssignedCounts['04 NATO-NAC']++;
      else if (targetComm.includes('JCC') || targetComm.includes('05')) commAssignedCounts['05 JCC']++;
    });

    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-today').textContent = todayCount;
    document.getElementById('kpi-pending').textContent = pendingCount;
    document.getElementById('kpi-accepted').textContent = acceptedCount;
    document.getElementById('kpi-rejected').textContent = rejectedCount;

    document.getElementById('cat-val-delegate').textContent = catCounts.delegate;
    document.getElementById('cat-val-chairboard').textContent = catCounts.chairboard;
    document.getElementById('cat-val-press').textContent = catCounts.press;
    document.getElementById('cat-val-admin').textContent = catCounts.admin;

    document.getElementById('pill-count-all').textContent = total;
    document.getElementById('pill-count-delegate').textContent = catCounts.delegate;
    document.getElementById('pill-count-chairboard').textContent = catCounts.chairboard;
    document.getElementById('pill-count-press').textContent = catCounts.press;
    document.getElementById('pill-count-admin').textContent = catCounts.admin;

    const assignedCount = apps.filter(a => !!a.assigned_committee).length;
    document.getElementById('dash-allocated-meta').textContent = `${assignedCount} assigned · ${total - assignedCount} unassigned`;

    // Committee allocation breakdown
    const commList = document.getElementById('dash-committee-list');
    commList.innerHTML = Object.entries(commAssignedCounts)
      .filter(([name]) => name !== 'Unassigned')
      .map(([name, num]) => `
        <div class="comm-cell">
          <span class="comm-cell-title">${name}</span>
          <span class="comm-cell-val">${num}</span>
        </div>
      `).join('');

    // Recent table
    const tbody = document.getElementById('dash-recent-tbody');
    const sorted = [...apps].slice(0, 6);
    document.getElementById('dash-recent-meta').textContent = `${sorted.length} of ${total} records`;

    if (sorted.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="empty-box">
            No application records found yet. Live submissions will appear here instantly.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = sorted.map(app => `
      <tr>
        <td style="font-family: monospace; color: var(--text-muted);">${escapeHtml(app.application_id)}</td>
        <td style="font-weight: 600;">${escapeHtml(app.name)}</td>
        <td class="cell-muted">${escapeHtml(app.email)}</td>
        <td>${escapeHtml(getCatTitle(app.category))}</td>
        <td>${renderPreferencesCell(app)}</td>
        <td>${renderAssignedCell(app)}</td>
        <td class="cell-muted">${escapeHtml(app.school || '—')}</td>
        <td class="cell-muted">${formatDate(app.submitted_at)}</td>
        <td><span class="badge ${getBadgeClass(app.status)}">${escapeHtml(app.status || 'Pending')}</span></td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-default btn-sm" onclick="window.MUNTAL_VIEW_DOSSIER('${escapeHtml(app.application_id)}')">Review</button>
        </td>
      </tr>
    `).join('');
  }

  // 02 Applications Table Filter
  function getFilteredApplications() {
    let list = [...state.applications];

    if (state.filters.category !== 'all') {
      list = list.filter(a => {
        const c = (a.category || '').toLowerCase();
        if (state.filters.category === 'delegate') return c.includes('delegate') && !c.includes('chair');
        if (state.filters.category === 'chairboard') return c.includes('chair') || c.includes('delegation');
        if (state.filters.category === 'press') return c.includes('press');
        if (state.filters.category === 'admin') return c.includes('admin');
        return true;
      });
    }

    if (state.filters.status) {
      list = list.filter(a => (a.status || '').toLowerCase() === state.filters.status.toLowerCase());
    }

    if (state.filters.committee) {
      const q = state.filters.committee.toUpperCase();
      list = list.filter(a => {
        const c1 = (a.first_committee_preference || '').toUpperCase();
        const c2 = (a.second_committee_preference || '').toUpperCase();
        const c3 = (a.third_committee_preference || '').toUpperCase();
        const asg = (a.assigned_committee || '').toUpperCase();
        return c1.includes(q) || c2.includes(q) || c3.includes(q) || asg.includes(q);
      });
    }

    if (state.filters.allocation) {
      if (state.filters.allocation === 'assigned') {
        list = list.filter(a => !!a.assigned_committee);
      } else if (state.filters.allocation === 'unassigned') {
        list = list.filter(a => !a.assigned_committee);
      }
    }

    if (state.filters.search) {
      const q = state.filters.search;
      list = list.filter(a =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.application_id || '').toLowerCase().includes(q) ||
        (a.school || '').toLowerCase().includes(q) ||
        (a.first_committee_preference || '').toLowerCase().includes(q) ||
        (a.assigned_committee || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (state.filters.sort === 'date-desc') return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
      if (state.filters.sort === 'date-asc') return new Date(a.submitted_at || 0) - new Date(b.submitted_at || 0);
      if (state.filters.sort === 'name-asc') return (a.name || '').localeCompare(b.name || '', 'en');
      return 0;
    });

    return list;
  }

  function renderPreferencesCell(app) {
    const p1 = app.first_committee_preference;
    const p2 = app.second_committee_preference;
    const p3 = app.third_committee_preference;

    if (!p1 && !p2 && !p3) {
      return `<span class="cell-muted">—</span>`;
    }

    return `
      <div class="comm-pref-cell">
        ${p1 ? `<span class="comm-pref-chip"><span class="comm-pref-num comm-pref-num--1">1</span> ${escapeHtml(p1)}</span>` : ''}
        ${p2 ? `<span class="comm-pref-chip"><span class="comm-pref-num comm-pref-num--2">2</span> ${escapeHtml(p2)}</span>` : ''}
        ${p3 ? `<span class="comm-pref-chip"><span class="comm-pref-num comm-pref-num--3">3</span> ${escapeHtml(p3)}</span>` : ''}
      </div>
    `;
  }

  function renderAssignedCell(app) {
    if (app.assigned_committee) {
      return `<span class="assigned-badge">✓ ${escapeHtml(app.assigned_committee)}</span>`;
    }
    return `<span class="unassigned-badge">Unassigned</span>`;
  }

  function renderApplicationsTable() {
    const list = getFilteredApplications();
    const tbody = document.getElementById('table-body');
    const meta = document.getElementById('table-results-meta');

    meta.textContent = `${list.length} of ${state.applications.length} applications`;

    const bulkBar = document.getElementById('bulk-bar');
    if (state.selectedIds.size > 0) {
      bulkBar.style.display = 'flex';
      document.getElementById('bulk-text').textContent = `${state.selectedIds.size} applications selected`;
    } else {
      bulkBar.style.display = 'none';
    }

    const checkAll = document.getElementById('check-all');
    checkAll.checked = list.length > 0 && list.every(a => state.selectedIds.has(a.application_id));

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" class="empty-box">
            No applications match your search or filter parameters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(app => {
      const isSelected = state.selectedIds.has(app.application_id);
      return `
        <tr class="${isSelected ? 'is-selected' : ''}">
          <td style="text-align: center;">
            <input type="checkbox" class="row-cb" data-id="${escapeHtml(app.application_id)}" ${isSelected ? 'checked' : ''}>
          </td>
          <td style="font-family: monospace; color: var(--text-muted);">${escapeHtml(app.application_id)}</td>
          <td style="font-weight: 600;">${escapeHtml(app.name)}</td>
          <td class="cell-muted">${escapeHtml(app.email)}<br><span style="font-size: 11px;">${escapeHtml(app.phone || '')}</span></td>
          <td>${escapeHtml(getCatTitle(app.category))}</td>
          <td>${renderPreferencesCell(app)}</td>
          <td>${renderAssignedCell(app)}</td>
          <td class="cell-muted">${escapeHtml(app.school || '—')}<br><span style="font-size: 11px;">Grade: ${escapeHtml(app.grade || app.grade_level || '—')}</span></td>
          <td class="cell-muted">${formatDate(app.submitted_at)}</td>
          <td><span class="badge ${getBadgeClass(app.status)}">${escapeHtml(app.status || 'Pending')}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <button type="button" class="btn btn-default btn-sm" onclick="window.MUNTAL_VIEW_DOSSIER('${escapeHtml(app.application_id)}')">Dossier</button>
            <button type="button" class="btn btn-default btn-sm" onclick="window.MUNTAL_QUICK_EMAIL('${escapeHtml(app.application_id)}')">✉</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.row-cb').forEach(cb => {
      cb.addEventListener('change', e => {
        const id = e.target.dataset.id;
        if (e.target.checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
        renderApplicationsTable();
      });
    });
  }

  // Expose global helpers for inline button clicks
  window.MUNTAL_VIEW_DOSSIER = function(id) {
    const app = state.applications.find(a => a.application_id === id);
    if (app) openDossier(app);
  };

  window.MUNTAL_QUICK_EMAIL = function(id) {
    switchTab('emails');
    setEmailMode('single');
    document.getElementById('email-to-select').value = id;
    updatePreview();
  };

  // --------------------------------------------------------------------------
  // DOSSIER (DETAIL & ASSIGNMENT MODAL)
  // --------------------------------------------------------------------------
  function openDossier(app) {
    state.activeDossierApp = app;

    document.getElementById('dossier-cat').textContent = getCatTitle(app.category).toUpperCase();
    document.getElementById('dossier-title').textContent = app.name;
    document.getElementById('dossier-id').textContent = app.application_id;
    document.getElementById('dossier-status-select').value = app.status || 'Pending';

    const p1 = app.first_committee_preference || '';
    const p2 = app.second_committee_preference || '';
    const p3 = app.third_committee_preference || '';
    const currentAssigned = app.assigned_committee || '';

    const content = document.getElementById('dossier-content');
    content.innerHTML = `
      <!-- Contact Information -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
        <div style="background: #0d131f; padding: 10px 12px; border-radius: 4px; border: 1px solid var(--border);">
          <div class="detail-row"><span class="detail-label">Full Name:</span><span class="detail-val">${escapeHtml(app.name)}</span></div>
          <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-val"><a href="mailto:${escapeHtml(app.email)}">${escapeHtml(app.email)}</a></span></div>
          <div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-val">${escapeHtml(app.phone || '—')}</span></div>
          <div class="detail-row"><span class="detail-label">Date of Birth:</span><span class="detail-val">${escapeHtml(app.date_of_birth || app.birthday || app.head_delegate_date_of_birth || '—')}</span></div>
        </div>

        <div style="background: #0d131f; padding: 10px 12px; border-radius: 4px; border: 1px solid var(--border);">
          <div class="detail-row"><span class="detail-label">School / Institution:</span><span class="detail-val">${escapeHtml(app.school || '—')}</span></div>
          <div class="detail-row"><span class="detail-label">Grade / Year:</span><span class="detail-val">${escapeHtml(app.grade || app.grade_level || '—')}</span></div>
          <div class="detail-row"><span class="detail-label">Submission Date:</span><span class="detail-val">${formatDate(app.submitted_at)}</span></div>
          <div class="detail-row"><span class="detail-label">Track Sheet:</span><span class="detail-val">${escapeHtml(app.sheet_name || app.category)}</span></div>
        </div>
      </div>

      <!-- Committee Allocation Box -->
      <div class="assign-box">
        <div class="assign-box__title">
          <span>Committee Preferences & Allocation</span>
          <span style="font-weight: 500; font-size: 11px; color: var(--text-muted);">
            Current: ${currentAssigned ? `<strong style="color: #34d399;">${escapeHtml(currentAssigned)}</strong>` : '<em style="color: var(--text-dim);">Unassigned</em>'}
          </span>
        </div>

        <!-- 3 Preferences Rows with 1-click assign buttons -->
        <div style="margin-bottom: 10px;">
          <div class="pref-row-item">
            <div>
              <span class="comm-pref-num comm-pref-num--1" style="margin-right: 6px;">1</span>
              <strong style="color: #93c5fd;">1st Choice:</strong>
              <span style="margin-left: 6px; color: var(--text);">${escapeHtml(p1 || 'None specified')}</span>
            </div>
            ${p1 ? `<button type="button" class="btn-xs" onclick="window.MUNTAL_SET_ASSIGNMENT('${escapeHtml(p1).replace(/'/g, "\\'")}')">Assign 1st Choice</button>` : ''}
          </div>

          <div class="pref-row-item">
            <div>
              <span class="comm-pref-num comm-pref-num--2" style="margin-right: 6px;">2</span>
              <strong style="color: #cbd5e1;">2nd Choice:</strong>
              <span style="margin-left: 6px; color: var(--text);">${escapeHtml(p2 || 'None specified')}</span>
            </div>
            ${p2 ? `<button type="button" class="btn-xs" onclick="window.MUNTAL_SET_ASSIGNMENT('${escapeHtml(p2).replace(/'/g, "\\'")}')">Assign 2nd Choice</button>` : ''}
          </div>

          <div class="pref-row-item">
            <div>
              <span class="comm-pref-num comm-pref-num--3" style="margin-right: 6px;">3</span>
              <strong style="color: #94a3b8;">3rd Choice:</strong>
              <span style="margin-left: 6px; color: var(--text);">${escapeHtml(p3 || 'None specified')}</span>
            </div>
            ${p3 ? `<button type="button" class="btn-xs" onclick="window.MUNTAL_SET_ASSIGNMENT('${escapeHtml(p3).replace(/'/g, "\\'")}')">Assign 3rd Choice</button>` : ''}
          </div>
        </div>

        <!-- Assigned Committee Picker / Input -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
          <div>
            <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Assign from Standard Committees:</label>
            <select class="form-select" id="dossier-select-assign" onchange="window.MUNTAL_ON_SELECT_ASSIGNMENT(this.value)">
              <option value="">-- Choose Standard Committee --</option>
              ${STANDARD_COMMITTEES.map(c => `<option value="${c}" ${currentAssigned === c || currentAssigned.includes(c.split(' ')[1]) ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Or Custom Assigned Committee:</label>
            <input type="text" class="form-input" id="dossier-custom-assign" value="${escapeHtml(currentAssigned)}" placeholder="e.g. 01 DISEC, Security Council, etc.">
          </div>
        </div>
      </div>

      <!-- Applicant Essays and Background -->
      ${app.experiences || app.past_experiences ? `
        <div style="margin-bottom: 12px;">
          <span class="detail-label" style="font-weight: 600; display: block; margin-bottom: 4px;">Prior MUN & Leadership Experiences:</span>
          <div class="detail-text">${escapeHtml(app.experiences || app.past_experiences)}</div>
        </div>
      ` : ''}

      ${app.motivation_letter ? `
        <div style="margin-bottom: 12px;">
          <span class="detail-label" style="font-weight: 600; display: block; margin-bottom: 4px;">Motivation Letter & Statement of Purpose:</span>
          <div class="detail-text">${escapeHtml(app.motivation_letter)}</div>
        </div>
      ` : ''}

      ${app.references || app.reference ? `
        <div style="margin-bottom: 12px;">
          <span class="detail-label" style="font-weight: 600; display: block; margin-bottom: 4px;">Academic References & Endorsements:</span>
          <div class="detail-text">${escapeHtml(app.references || app.reference)}</div>
        </div>
      ` : ''}

      ${app.category === 'press' ? `
        <div style="margin-bottom: 12px; background: #0d131f; padding: 10px; border: 1px solid var(--border); border-radius: 4px;">
          <span class="detail-label" style="font-weight: 600; color: #93c5fd; display: block; margin-bottom: 4px;">Press Equipment & Technical Details:</span>
          <div style="font-size: 12.5px; color: var(--text);">
            Camera: <strong>${escapeHtml(app.camera_model || '—')}</strong><br>
            Lenses: <strong>${escapeHtml(app.lens_information || '—')}</strong>
          </div>
        </div>
      ` : ''}

      ${app.category === 'admin' ? `
        <div style="margin-bottom: 12px; background: #0d131f; padding: 10px; border: 1px solid var(--border); border-radius: 4px;">
          <span class="detail-label" style="font-weight: 600; color: #93c5fd; display: block; margin-bottom: 4px;">Logistics & Problem-Solving Assessment:</span>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Late Venue Hours: <strong style="color: #fff;">${escapeHtml(app.can_stay_until_late_hours || '—')}</strong></div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Chair / Delegate Conflict Response:</div>
          <div class="detail-text">${escapeHtml(app.chair_or_delegate_problem_response || '—')}</div>
        </div>
      ` : ''}

      <div style="margin-top: 12px;">
        <label class="detail-label" style="font-weight: 600; display: block; margin-bottom: 4px;">Secretariat Internal Notes:</label>
        <textarea class="form-textarea" id="dossier-notes" rows="2" placeholder="Internal committee notes, interview scores, or remarks...">${escapeHtml(app.notes || '')}</textarea>
      </div>
    `;

    document.getElementById('dossier-modal').style.display = 'flex';
  }

  // Helpers for assignment from dossier
  window.MUNTAL_SET_ASSIGNMENT = function(commName) {
    const input = document.getElementById('dossier-custom-assign');
    if (input) input.value = commName;
    const select = document.getElementById('dossier-select-assign');
    if (select) {
      let matched = false;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === commName || select.options[i].text.includes(commName)) {
          select.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) select.value = '';
    }
    showToast(`Allocated to: ${commName}`);
  };

  window.MUNTAL_ON_SELECT_ASSIGNMENT = function(val) {
    const input = document.getElementById('dossier-custom-assign');
    if (input && val) input.value = val;
  };

  function closeDossier() {
    document.getElementById('dossier-modal').style.display = 'none';
    state.activeDossierApp = null;
  }

  async function saveDossierStatus() {
    if (!state.activeDossierApp) return;

    const newStatus = document.getElementById('dossier-status-select').value;
    const newAssigned = (document.getElementById('dossier-custom-assign')?.value || '').trim();
    const newNotes = (document.getElementById('dossier-notes')?.value || '').trim();
    const appId = state.activeDossierApp.application_id;

    // Local update
    state.activeDossierApp.status = newStatus;
    state.activeDossierApp.assigned_committee = newAssigned;
    state.activeDossierApp.notes = newNotes;

    // Cache to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(state.applications));
    } catch (e) {}

    renderAll();
    closeDossier();
    showToast(`Updated ${appId}: Status "${newStatus}"${newAssigned ? `, Committee "${newAssigned}"` : ''}.`, 'success');

    // Post update to live Google Sheets
    try {
      await fetch(state.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateStatus',
          application_id: appId,
          status: newStatus,
          assigned_committee: newAssigned,
          notes: newNotes
        })
      });
    } catch (e) {
      // Even if fetch threw CORS opaque or redirect, the POST reaches Google Apps Script
      console.log('[MUNTAL Sync Update Dispatched]:', appId);
    }
  }

  async function updateBulkStatus(newStatus) {
    if (state.selectedIds.size === 0) return;
    const count = state.selectedIds.size;

    state.selectedIds.forEach(id => {
      const app = state.applications.find(a => a.application_id === id);
      if (app) {
        app.status = newStatus;
        fetch(state.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateStatus',
            application_id: id,
            status: newStatus,
            assigned_committee: app.assigned_committee || '',
            notes: app.notes || ''
          })
        }).catch(() => {});
      }
    });

    try {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(state.applications));
    } catch (e) {}

    state.selectedIds.clear();
    renderAll();
    showToast(`${count} applications marked as "${newStatus}".`, 'success');
  }

  // --------------------------------------------------------------------------
  // CSV EXPORT (STANDARD EXCEL UTF-8 BOM)
  // --------------------------------------------------------------------------
  function exportCsv() {
    const list = getFilteredApplications();
    if (list.length === 0) {
      showToast('No applications found to export.', 'error');
      return;
    }

    const headers = [
      'Application ID',
      'Full Name',
      'Email',
      'Phone',
      'Track',
      '1st Committee Preference',
      '2nd Committee Preference',
      '3rd Committee Preference',
      'Assigned Committee',
      'Institution',
      'Grade',
      'Status',
      'Submission Date',
      'Notes'
    ];

    const rows = list.map(a => [
      a.application_id || '',
      a.name || '',
      a.email || '',
      a.phone || '',
      getCatTitle(a.category),
      a.first_committee_preference || '',
      a.second_committee_preference || '',
      a.third_committee_preference || '',
      a.assigned_committee || '',
      a.school || '',
      a.grade || a.grade_level || '',
      a.status || 'Pending',
      a.submitted_at || '',
      a.notes || ''
    ]);

    const csvStr = '\uFEFF' + [headers.map(cleanCsv).join(';'), ...rows.map(r => r.map(cleanCsv).join(';'))].join('\r\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MUNTAL-Applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast(`Exported ${list.length} applications to CSV.`, 'success');
  }

  function cleanCsv(val) {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  }

  // --------------------------------------------------------------------------
  // 03 EMAIL DISPATCH & MULTI-CHANNEL INTEGRATION
  // --------------------------------------------------------------------------
  function populateRecipientsDropdown() {
    const sel = document.getElementById('email-to-select');
    const current = sel.value;

    sel.innerHTML = '<option value="">Select an applicant...</option>' +
      state.applications.map(a => `
        <option value="${escapeHtml(a.application_id)}">
          ${escapeHtml(a.name)} (${escapeHtml(a.email)}) — [${escapeHtml(a.status || 'Pending')}] ${a.assigned_committee ? `[${escapeHtml(a.assigned_committee)}]` : ''}
        </option>
      `).join('');

    if (current) sel.value = current;
  }

  function loadTemplate(key) {
    const tpl = TEMPLATES[key];
    if (tpl) {
      document.getElementById('email-subject').value = tpl.subject;
      document.getElementById('email-body').value = tpl.body;
      updatePreview();
    }
  }

  function getActiveEmailTarget() {
    const selId = document.getElementById('email-to-select').value;
    return state.applications.find(a => a.application_id === selId) || state.applications[0] || {
      name: 'Sample Applicant',
      email: 'applicant@example.com',
      category: 'delegate',
      first_committee_preference: '01 DISEC',
      second_committee_preference: '02 WHO',
      third_committee_preference: '03 UNSC',
      assigned_committee: '01 DISEC (Disarmament & International Security)',
      school: 'Example High School',
      application_id: 'MUNTAL-DEL-1001',
      status: 'Accepted'
    };
  }

  function updatePreview() {
    const target = getActiveEmailTarget();
    const rawSub = document.getElementById('email-subject').value;
    const rawBody = document.getElementById('email-body').value;

    const renderedSub = replaceVars(rawSub, target);
    const renderedBody = replaceVars(rawBody, target);

    document.getElementById('preview-target-name').textContent = `${target.name} <${target.email}>`;
    document.getElementById('preview-subject-line').textContent = `Subject: ${renderedSub}`;
    document.getElementById('preview-content').textContent = renderedBody;

    // Keep direct 1-click Gmail Web compose link ready
    const gmailLink = document.getElementById('btn-open-gmail-web');
    if (gmailLink) {
      if (target && target.email) {
        gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(target.email)}&su=${encodeURIComponent(renderedSub)}&body=${encodeURIComponent(renderedBody)}`;
        gmailLink.style.pointerEvents = 'auto';
        gmailLink.style.opacity = '1';
      } else {
        gmailLink.href = 'https://mail.google.com/mail/';
      }
    }
  }

  function replaceVars(text, app) {
    if (!text) return '';
    const assigned = app.assigned_committee || app.first_committee_preference || 'Assigned Assembly';
    return text
      // English variables
      .replace(/{{name}}/g, app.name || 'Applicant')
      .replace(/{{assigned_committee}}/g, assigned)
      .replace(/{{first_preference}}/g, app.first_committee_preference || '—')
      .replace(/{{second_preference}}/g, app.second_committee_preference || '—')
      .replace(/{{third_preference}}/g, app.third_committee_preference || '—')
      .replace(/{{category}}/g, getCatTitle(app.category))
      .replace(/{{school}}/g, app.school || 'Institution')
      .replace(/{{application_id}}/g, app.application_id || '')
      .replace(/{{status}}/g, app.status || 'Pending')
      // Backwards compatible aliases
      .replace(/{{ad_soyad}}/g, app.name || 'Applicant')
      .replace(/{{komite}}/g, assigned)
      .replace(/{{kategori}}/g, getCatTitle(app.category))
      .replace(/{{okul}}/g, app.school || 'Institution')
      .replace(/{{basvuru_no}}/g, app.application_id || '')
      .replace(/{{durum}}/g, app.status || 'Pending');
  }

  function insertVar(varStr) {
    const el = document.getElementById('email-body');
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    el.value = el.value.substring(0, start) + varStr + el.value.substring(end);
    el.focus();
    el.selectionStart = el.selectionEnd = start + varStr.length;
  }

  function getRecipientsForDispatch() {
    if (state.emailMode === 'single') {
      const selId = document.getElementById('email-to-select').value;
      const target = state.applications.find(a => a.application_id === selId);
      if (!target || !target.email) {
        showToast('Please select an applicant with a valid email address.', 'error');
        return null;
      }
      return [target];
    } else {
      const scope = document.getElementById('bulk-scope-select').value;
      let recipients = [];
      if (scope === 'filtered') recipients = getFilteredApplications();
      else if (scope === 'accepted') recipients = state.applications.filter(a => (a.status || '').toLowerCase().includes('accept'));
      else if (scope === 'pending') recipients = state.applications.filter(a => (a.status || '').toLowerCase().includes('pend'));
      else recipients = state.applications;

      recipients = recipients.filter(a => a && a.email);
      if (recipients.length === 0) {
        showToast('No matching applicants with email found in selected scope.', 'error');
        return null;
      }
      return recipients;
    }
  }

  // Mode 1: Send via Google Apps Script (Background)
  async function handleSendEmailAppsScript(e) {
    if (e) e.preventDefault();

    const rawSub = document.getElementById('email-subject').value.trim();
    const rawBody = document.getElementById('email-body').value.trim();

    if (!rawSub || !rawBody) {
      showToast('Please provide both subject line and email body.', 'error');
      return;
    }

    const recipients = getRecipientsForDispatch();
    if (!recipients) return;

    const btn = document.getElementById('btn-submit-email');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    let deliveredCount = 0;
    let needsDeploymentUpdate = false;
    let lastErrorMsg = '';

    for (const applicant of recipients) {
      const sub = replaceVars(rawSub, applicant);
      const msg = replaceVars(rawBody, applicant);

      let result = null;

      // Method A: Direct POST to Google Apps Script (plain text to bypass preflight)
      try {
        const postRes = await fetch(state.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'sendEmail',
            to: applicant.email,
            name: applicant.name,
            subject: sub,
            body: msg
          })
        });

        if (postRes.ok) {
          try {
            result = await postRes.json();
          } catch (pe) {
            const txt = await postRes.text();
            if (txt.includes('Unknown application type')) {
              result = { success: false, message: 'Unknown application type' };
            }
          }
        }
      } catch (postErr) {
        console.warn('Apps Script POST failed, trying GET fallback...', postErr);
      }

      // Method B: GET query param fallback (works with Google Apps Script doGet and survives redirects)
      if (!result || result.email_sent !== true) {
        try {
          const getUrl = `${state.appsScriptUrl}?action=sendEmail&to=${encodeURIComponent(applicant.email)}&name=${encodeURIComponent(applicant.name)}&subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(msg)}&t=${Date.now()}`;
          const getRes = await fetch(getUrl);
          if (getRes.ok) {
            try {
              const gj = await getRes.json();
              if (gj.message && gj.message.includes('MUNTAL Google Sheets API is running')) {
                // Outdated script!
                result = { success: false, email_sent: false, message: 'Outdated script version detected (API is running message)' };
              } else {
                result = gj;
              }
            } catch (ge) {}
          }
        } catch (getErr) {
          console.warn('Apps Script GET fallback failed:', getErr);
        }
      }

      // Determine true delivery status
      const isActuallyDelivered =
        Boolean(result) &&
        result.success === true &&
        (result.email_sent === true ||
          (result.message && result.message.toLowerCase().includes('email delivered')) ||
          (result.status && result.status.toLowerCase() === 'sent'));

      if (isActuallyDelivered) {
        deliveredCount++;
        logEmail(applicant.email, applicant.name, sub, 'Sent (Apps Script)');
      } else {
        lastErrorMsg = (result && result.message) ? result.message : 'No valid response from Apps Script';
        if (
          lastErrorMsg.includes('Unknown application type') ||
          lastErrorMsg.includes('MUNTAL Google Sheets API is running') ||
          lastErrorMsg.includes('Outdated script')
        ) {
          needsDeploymentUpdate = true;
        }
        logEmail(applicant.email, applicant.name, sub, 'Failed (Apps Script Outdated)');
      }
    }

    btn.disabled = false;
    btn.textContent = 'Send via Apps Script';
    renderLogs();

    if (deliveredCount === recipients.length && deliveredCount > 0) {
      showToast(`✓ All ${deliveredCount} email(s) successfully delivered via Google Apps Script!`, 'success');
    } else if (needsDeploymentUpdate) {
      showToast('⚠️ Apps Script is running outdated code (no email sent). Opening Activation Guide...', 'error');
      openDeploymentGuideModal(recipients[0]);
    } else if (deliveredCount > 0) {
      showToast(`Delivered to ${deliveredCount} of ${recipients.length} recipients.`, 'info');
    } else {
      showToast('Apps Script endpoint could not deliver. Opening Activation Guide & Gmail...', 'error');
      openDeploymentGuideModal(recipients[0]);
    }
  }

  function openDeploymentGuideModal(target) {
    const modal = document.getElementById('guide-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  // Mode 2: 1-Click Direct Web Gmail Compose
  function handleOpenGmailWeb() {
    const rawSub = document.getElementById('email-subject').value.trim();
    const rawBody = document.getElementById('email-body').value.trim();

    const recipients = getRecipientsForDispatch();
    if (!recipients || recipients.length === 0) return;

    const target = recipients[0];
    const sub = replaceVars(rawSub, target);
    const msg = replaceVars(rawBody, target);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(target.email)}&su=${encodeURIComponent(sub)}&body=${encodeURIComponent(msg)}`;
    window.open(gmailUrl, '_blank');

    logEmail(target.email, target.name, sub, 'Opened in Gmail Web');
    showToast(`Opened Gmail compose tab for ${target.name}.`, 'success');

    if (recipients.length > 1) {
      showToast(`Note: Opened Gmail for the 1st recipient (${target.name}). For bulk batches, use 'Send via Apps Script'.`);
    }
  }

  // Mode 3: Desktop Mail Client (mailto:)
  function handleOpenMailClient() {
    const rawSub = document.getElementById('email-subject').value.trim();
    const rawBody = document.getElementById('email-body').value.trim();

    const recipients = getRecipientsForDispatch();
    if (!recipients || recipients.length === 0) return;

    const target = recipients[0];
    const sub = replaceVars(rawSub, target);
    const msg = replaceVars(rawBody, target);

    const mailto = `mailto:${encodeURIComponent(target.email)}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(msg)}`;
    window.open(mailto, '_blank');

    logEmail(target.email, target.name, sub, 'Desktop Mail Client');
    showToast(`Launched mail client for ${target.name}.`, 'success');
  }

  // Mode 4: Copy Rendered Text
  function handleCopyEmailText() {
    const target = getActiveEmailTarget();
    const rawSub = document.getElementById('email-subject').value.trim();
    const rawBody = document.getElementById('email-body').value.trim();

    const fullText = `Subject: ${replaceVars(rawSub, target)}\n\n${replaceVars(rawBody, target)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText).then(() => {
        showToast(`Copied rendered email for ${target.name} to clipboard.`, 'success');
      }).catch(() => {
        fallbackCopy(fullText, target.name);
      });
    } else {
      fallbackCopy(fullText, target.name);
    }
  }

  function fallbackCopy(text, targetName) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast(`Copied rendered email for ${targetName} to clipboard.`, 'success');
    } catch (e) {
      showToast('Could not copy to clipboard.', 'error');
    }
    ta.remove();
  }

  function logEmail(email, name, subject, status) {
    state.emailLogs.unshift({
      timestamp: new Date().toISOString(),
      recipient: `${name} <${email}>`,
      subject: subject,
      status: status
    });
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.emailLogs.slice(0, 40)));
    renderLogs();
  }

  function renderLogs() {
    const list = document.getElementById('email-logs-list');
    if (state.emailLogs.length === 0) {
      list.innerHTML = `<div class="empty-box" style="padding: 18px; font-size: 12px;">No email dispatches recorded in this session.</div>`;
      return;
    }

    list.innerHTML = state.emailLogs.slice(0, 10).map(log => `
      <div class="log-item">
        <div>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(log.recipient)}</div>
          <div class="cell-muted">${escapeHtml(log.subject)}</div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge--accepted">${escapeHtml(log.status)}</span>
          <div class="cell-muted" style="margin-top: 2px;">${formatDate(log.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // SETTINGS & CODE COPY
  // --------------------------------------------------------------------------
  function openSettings() {
    document.getElementById('setting-url').value = state.appsScriptUrl;
    document.getElementById('test-feedback').textContent = '';
    document.getElementById('settings-modal').style.display = 'flex';
  }

  function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
  }

  function saveSettings() {
    const val = document.getElementById('setting-url').value.trim();
    if (val && val.startsWith('https://')) {
      state.appsScriptUrl = val;
      localStorage.setItem(STORAGE_KEYS.URL, val);
      closeSettings();
      showToast('Google Apps Script URL saved.', 'success');
      fetchLiveFromSheets(false);
    } else {
      showToast('Please enter a valid https:// Web App URL.', 'error');
    }
  }

  async function testUrl() {
    const feedback = document.getElementById('test-feedback');
    feedback.textContent = 'Testing connection...';
    feedback.style.color = 'var(--text-muted)';

    const inputUrl = document.getElementById('setting-url').value.trim();
    if (!inputUrl || !inputUrl.startsWith('https://script.google.com/macros/s/')) {
      feedback.textContent = '⚠️ Invalid URL. Must start with https://script.google.com/macros/s/... and end in /exec';
      feedback.style.color = 'var(--status-rejected)';
      return;
    }

    try {
      const res = await fetch(`${inputUrl}?action=getApplications&t=${Date.now()}`);
      if (res.ok) {
        feedback.textContent = '✓ Google Apps Script endpoint is online and responsive!';
        feedback.style.color = 'var(--status-accepted)';
      } else if (res.status === 404) {
        feedback.textContent = '❌ Endpoint returned 404 (Not Found). Deployment was deleted or URL is mistyped.';
        feedback.style.color = 'var(--status-rejected)';
      } else if (res.status === 403) {
        feedback.textContent = '❌ Endpoint returned 403 (Forbidden). In Apps Script, set "Who has access" to "Anyone".';
        feedback.style.color = 'var(--status-rejected)';
      } else {
        feedback.textContent = `Endpoint returned status HTTP ${res.status}`;
        feedback.style.color = 'var(--status-rejected)';
      }
    } catch (e) {
      feedback.textContent = '⚠️ Connection blocked by CORS or 404. Verify in Apps Script: Execute as "Me", Who has access: "Anyone".';
      feedback.style.color = 'var(--status-pending)';
    }
  }

  function copyScriptCode() {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(() => {
      showToast('Latest Google Apps Script code copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Could not copy automatically. You can read google-apps-script.js in the repository.', 'error');
    });
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------
  function normalizeStatus(st) {
    if (!st) return 'Pending';
    const s = String(st).toLowerCase();
    if (s.includes('kabul') || s.includes('accept')) return 'Accepted';
    if (s.includes('ret') || s.includes('reject')) return 'Rejected';
    if (s.includes('incele') || s.includes('review')) return 'Under Review';
    if (s.includes('yedek') || s.includes('wait')) return 'Waitlisted';
    return 'Pending';
  }

  function getCatTitle(cat) {
    const c = (cat || '').toLowerCase();
    if (c.includes('chair') || c.includes('delegation')) return 'Chairboard';
    if (c.includes('press')) return 'Press';
    if (c.includes('admin')) return 'Admin Staff';
    return 'Delegate';
  }

  function getBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('accept')) return 'badge--accepted';
    if (s.includes('reject')) return 'badge--rejected';
    if (s.includes('review')) return 'badge--review';
    if (s.includes('wait') || s.includes('backup')) return 'badge--backup';
    return 'badge--pending';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(iso);
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showToast(msg, type = 'info') {
    const wrap = document.getElementById('toast-wrap');
    const t = document.createElement('div');
    t.className = `toast ${type === 'success' ? 'is-success' : type === 'error' ? 'is-error' : ''}`;
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.2s';
      setTimeout(() => t.remove(), 250);
    }, 3500);
  }
})();
