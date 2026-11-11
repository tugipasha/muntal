/*******************************************************
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

/*******************************************************
 * 1. SHEETS SETUP
 *******************************************************/
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(CONFIG).forEach(function(key) {
    const cfg = CONFIG[key];
    let sheet = ss.getSheetByName(cfg.sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(cfg.sheetName);
    }

    const headers = cfg.fields.map(function(field) {
      return field[1];
    });

    SYSTEM_COLUMNS.forEach(function(col) {
      headers.push(col);
    });

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeader_(sheet, headers.length);
    sheet.setFrozenRows(1);

    const existingFilter = sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }
    sheet.getRange(1, 1, 1, headers.length).createFilter();

    cfg.fields.forEach(function(field, index) {
      const note = "Field ID: " + field[0] + "\nType: " + field[2] + "\nRequired: " + (field[3] ? "Yes" : "No");
      sheet.getRange(1, index + 1).setNote(note);
      sheet.setColumnWidth(index + 1, Math.min(Math.max(field[1].length * 7 + 24, 150), 320));
    });

    sheet.setColumnWidth(headers.length - 4, 170); // Submitted At
    sheet.setColumnWidth(headers.length - 3, 170); // Application ID
    sheet.setColumnWidth(headers.length - 2, 130); // Status
    sheet.setColumnWidth(headers.length - 1, 170); // Assigned Committee
    sheet.setColumnWidth(headers.length, 250);     // Notes
  });

  let emailSheet = ss.getSheetByName("Email Logs");
  if (!emailSheet) {
    emailSheet = ss.insertSheet("Email Logs");
    const emailHeaders = ["Timestamp", "Recipient Email", "Recipient Name", "Subject", "Status", "Error / Details"];
    emailSheet.getRange(1, 1, 1, emailHeaders.length).setValues([emailHeaders]);
    styleHeader_(emailSheet, emailHeaders.length);
    emailSheet.setFrozenRows(1);
  }

  return "MUNTAL Sheets setup completed successfully!";
}

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

/*******************************************************
 * 2. GET REQUEST — Live Application Retrieval
 *******************************************************/
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : "getApplications";

    if (action === "ping" || action === "test") {
      return json_({
        success: true,
        version: "v2",
        email_ready: true,
        message: "MUNTAL Google Apps Script API v2 is running with Email Dispatch enabled!"
      });
    }

    if (action === "stats") {
      return json_(getSummaryStats_());
    }

    if (action === "getEmailLogs") {
      return json_(getEmailLogs_());
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
      message: "Applications successfully fetched.",
      count: apps.length,
      applications: apps,
      tabs: Object.keys(CONFIG).map(function(k) { return CONFIG[k].sheetName; }),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return json_({
      success: false,
      message: String(error.message || error),
      applications: []
    });
  }
}

/*******************************************************
 * 3. POST REQUEST — Save Submissions, Update Status & Send Emails
 *******************************************************/
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(25000);

    const data = readPayload_(e);
    const action = String(data.action || "").trim();

    // A. Update Status & Assigned Committee
    if (action === "updateStatus") {
      return handleUpdateStatus_(data);
    }

    // B. Direct Email Dispatch
    if (action === "sendEmail") {
      return handleSendEmail_(data);
    }

    // C. Save New Application from Website
    const applicationType = String(data.application_type || "").toLowerCase();
    const cfg = findConfig_(applicationType);

    if (!cfg) {
      return json_({
        success: false,
        message: "Unknown application type: " + applicationType
      });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(cfg.sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(cfg.sheetName);
      const headers = cfg.fields.map(function(f) { return f[1]; });
      SYSTEM_COLUMNS.forEach(function(c) { headers.push(c); });
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      styleHeader_(sheet, headers.length);
      sheet.setFrozenRows(1);
    }

    const values = cfg.fields.map(function(field) {
      const val = data[field[0]];
      if (val === undefined || val === null) return "";
      if (Array.isArray(val)) return val.join(", ");
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationId = data.application_id || data.tracking_code ||
      ("MUNTAL-" + cfg.sheetName.substring(0, 3).toUpperCase() + "-" + randomSuffix);

    values.push(new Date());                            // Submitted At
    values.push(applicationId);                         // Application ID
    values.push(data.status || "Pending");              // Status
    values.push(data.assigned_committee || data.first_committee_preference || ""); // Assigned Committee
    values.push(data.notes || "");                      // Notes

    sheet.appendRow(values);

    return json_({
      success: true,
      message: "Application successfully saved!",
      application_id: applicationId
    });

  } catch (error) {
    return json_({
      success: false,
      message: String(error.message || error)
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {}
  }
}

/*******************************************************
 * 4. HELPER DATA FUNCTIONS
 *******************************************************/

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

    const headerIndex = {};
    headers.forEach(function(h, idx) {
      headerIndex[String(h).trim().toLowerCase()] = idx;
    });

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const hasContent = row.some(function(cell) { return cell !== "" && cell !== null && cell !== undefined; });
      if (!hasContent) continue;

      const app = {
        row_index: r + 1,
        sheet_name: cfg.sheetName,
        category: cfg.sheetName.toLowerCase(),
        category_title: cfg.sheetName
      };

      // Read configured fields
      cfg.fields.forEach(function(field) {
        const fieldKey = field[0];
        const fieldLabel = field[1].trim().toLowerCase();
        const idx = headerIndex[fieldLabel];
        app[fieldKey] = (idx !== undefined && row[idx] !== undefined) ? String(row[idx]) : "";
      });

      // System Columns
      const submittedAtIdx = headerIndex["submitted at"];
      const appIdIdx = headerIndex["application id"];
      const statusIdx = headerIndex["status"];
      const assignedCommIdx = headerIndex["assigned committee"];
      const notesIdx = headerIndex["notes"];

      app.submitted_at = (submittedAtIdx !== undefined && row[submittedAtIdx]) ? row[submittedAtIdx] : "";
      app.application_id = (appIdIdx !== undefined && row[appIdIdx]) ? String(row[appIdIdx]) : ("MUNTAL-" + r);
      app.status = (statusIdx !== undefined && row[statusIdx]) ? String(row[statusIdx]).trim() : "Pending";
      app.assigned_committee = (assignedCommIdx !== undefined && row[assignedCommIdx]) ? String(row[assignedCommIdx]).trim() : "";
      app.notes = (notesIdx !== undefined && row[notesIdx]) ? String(row[notesIdx]) : "";

      // Standard aliases
      app.name = app.name_surname || app.head_delegate_full_name || app.full_name || "Applicant";
      app.email = app.email || app.head_delegate_email || "";
      app.phone = app.phone || app.head_delegate_phone || "";
      app.school = app.school || app.school_name || "—";
      
      // All 3 committee preferences
      app.first_committee_preference = app.first_committee_preference || "";
      app.second_committee_preference = app.second_committee_preference || "";
      app.third_committee_preference = app.third_committee_preference || "";
      app.committee_pref = app.assigned_committee || app.first_committee_preference || "—";

      allApps.push(app);
    }
  });

  allApps.sort(function(a, b) {
    const da = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const db = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return db - da;
  });

  return allApps;
}

function handleUpdateStatus_(data) {
  const targetId = String(data.application_id || data.id || "").trim();
  const newStatus = String(data.status || "").trim();
  const newCommittee = data.assigned_committee !== undefined ? String(data.assigned_committee).trim() : null;
  const newNotes = data.notes !== undefined ? String(data.notes) : null;

  if (!targetId) {
    return json_({ success: false, message: "application_id is required." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let found = false;

  Object.keys(CONFIG).forEach(function(key) {
    if (found) return;
    const cfg = CONFIG[key];
    const sheet = ss.getSheetByName(cfg.sheetName);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) return;

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    let appIdCol = -1;
    let statusCol = -1;
    let assignedCommCol = -1;
    let notesCol = -1;

    headers.forEach(function(h, idx) {
      const lower = String(h).trim().toLowerCase();
      if (lower === "application id") appIdCol = idx + 1;
      if (lower === "status") statusCol = idx + 1;
      if (lower === "assigned committee") assignedCommCol = idx + 1;
      if (lower === "notes") notesCol = idx + 1;
    });

    if (appIdCol === -1) return;

    let colCounter = lastCol;
    if (statusCol === -1) {
      colCounter++;
      statusCol = colCounter;
      sheet.getRange(1, statusCol).setValue("Status");
      styleHeader_(sheet, statusCol);
    }
    if (assignedCommCol === -1) {
      colCounter++;
      assignedCommCol = colCounter;
      sheet.getRange(1, assignedCommCol).setValue("Assigned Committee");
      styleHeader_(sheet, assignedCommCol);
    }
    if (notesCol === -1) {
      colCounter++;
      notesCol = colCounter;
      sheet.getRange(1, notesCol).setValue("Notes");
      styleHeader_(sheet, notesCol);
    }

    const idRangeValues = sheet.getRange(2, appIdCol, lastRow - 1, 1).getValues();
    for (let i = 0; i < idRangeValues.length; i++) {
      if (String(idRangeValues[i][0]).trim() === targetId) {
        const rowNumber = i + 2;
        if (newStatus) {
          sheet.getRange(rowNumber, statusCol).setValue(newStatus);
        }
        if (newCommittee !== null) {
          sheet.getRange(rowNumber, assignedCommCol).setValue(newCommittee);
        }
        if (newNotes !== null) {
          sheet.getRange(rowNumber, notesCol).setValue(newNotes);
        }
        found = true;
        break;
      }
    }
  });

  return json_({
    success: found,
    message: found ? ("Updated application " + targetId) : "Application ID not found"
  });
}

function handleSendEmail_(data) {
  const recipient = String(data.to || data.recipient || "").trim();
  const recipientName = String(data.name || "").trim();
  const subject = String(data.subject || "MUNTAL Conference Notification").trim();
  const bodyText = String(data.body || "").trim();
  const bodyHtml = String(data.html || "").trim() || bodyText.replace(/\n/g, "<br>");

  if (!recipient || (!bodyText && !bodyHtml)) {
    return json_({ success: false, email_sent: false, message: "Recipient 'to' and body are required." });
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
      styleHeader_(emailSheet, 6);
      emailSheet.setFrozenRows(1);
    }
    emailSheet.appendRow([new Date(), recipient, recipientName, subject, status, errorMessage]);
  } catch (e) {}

  return json_({
    success: status === "Sent",
    email_sent: status === "Sent",
    message: status === "Sent" ? ("Email delivered to " + recipient) : ("Error: " + errorMessage)
  });
}

function getEmailLogs_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const emailSheet = ss.getSheetByName("Email Logs");
  if (!emailSheet || emailSheet.getLastRow() < 2) {
    return { success: true, logs: [] };
  }

  const values = emailSheet.getRange(2, 1, emailSheet.getLastRow() - 1, 6).getValues();
  const logs = values.map(function(r) {
    return {
      timestamp: r[0],
      recipient_email: r[1],
      recipient_name: r[2],
      subject: r[3],
      status: r[4],
      details: r[5]
    };
  });

  return { success: true, logs: logs.reverse() };
}

function getSummaryStats_() {
  const apps = getAllApplications_();
  const today = new Date().toDateString();

  let todayCount = 0;
  let pendingCount = 0;
  let acceptedCount = 0;
  let rejectedCount = 0;

  apps.forEach(function(a) {
    if (a.submitted_at && new Date(a.submitted_at).toDateString() === today) {
      todayCount++;
    }
    const st = (a.status || "").toLowerCase();
    if (st.includes("kabul") || st.includes("accept")) acceptedCount++;
    else if (st.includes("ret") || st.includes("reject")) rejectedCount++;
    else pendingCount++;
  });

  return {
    success: true,
    total: apps.length,
    today: todayCount,
    pending: pendingCount,
    accepted: acceptedCount,
    rejected: rejectedCount
  };
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

function styleHeader_(sheet, columnCount) {
  const range = sheet.getRange(1, 1, 1, columnCount);
  range
    .setBackground("#0f172a")
    .setFontColor("#f8fafc")
    .setFontWeight("bold")
    .setWrap(true)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
