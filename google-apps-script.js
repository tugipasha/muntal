/*******************************************************
 * MUNTAL 2327 — GOOGLE SHEETS INTEGRATION
 * 4 ayrı başvuru sayfası:
 * Delegate, Delegation, Admin, Press
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

  delegation: {
    sheetName: "Delegation",
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

// Backwards compatibility alias
CONFIG.chairboard = CONFIG.delegation;

const SYSTEM_COLUMNS = ["Submitted At", "Application ID", "Status", "Assigned Committee", "Notes"];

/*******************************************************
 * 1. SHEETS SETUP
 * Bu fonksiyon bir kez çalıştırılmalıdır.
 *******************************************************/
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const primaryKeys = ["delegate", "delegation", "admin", "press"];
  primaryKeys.forEach(function(key) {
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

    // Başlıkları oluştur.
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Başlık tasarımı.
    styleHeader_(sheet, headers.length);

    // İlk satırı sabitle.
    sheet.setFrozenRows(1);

    // Önceki filtre varsa kaldır.
    const existingFilter = sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }

    // Filtre ekle.
    sheet.getRange(1, 1, 1, headers.length).createFilter();

    // Sütun genişlikleri ve soru açıklamaları.
    cfg.fields.forEach(function(field, index) {
      const note =
        "Field ID: " + field[0] +
        "\nType: " + field[2] +
        "\nRequired: " + (field[3] ? "Yes" : "No");

      sheet.getRange(1, index + 1).setNote(note);

      sheet.setColumnWidth(
        index + 1,
        Math.min(
          Math.max(field[1].length * 7 + 24, 150),
          350
        )
      );
    });

    sheet.setColumnWidth(headers.length - 4, 170); // Submitted At
    sheet.setColumnWidth(headers.length - 3, 160); // Application ID
    sheet.setColumnWidth(headers.length - 2, 130); // Status
    sheet.setColumnWidth(headers.length - 1, 160); // Assigned Committee
    sheet.setColumnWidth(headers.length, 200);     // Notes
  });

  return "MUNTAL Sheets successfully created!";
}

/*******************************************************
 * 2. WEBSITE POST REQUEST
 * Siteden gelen başvuruları kaydeder.
 *******************************************************/
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(20000);

    const data = readPayload_(e);
    const action = String(data.action || "").trim();

    // Portal action: Status update
    if (action === "updateStatus") {
      return handleUpdateStatus_(data);
    }

    // Portal action: Email dispatch
    if (action === "sendEmail") {
      return handleSendEmail_(data);
    }

    const applicationType = String(
      data.application_type || ""
    ).toLowerCase();

    const cfg = findConfig_(applicationType);

    if (!cfg) {
      return json_({
        success: false,
        message: "Unknown application type: " + applicationType
      });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(cfg.sheetName);

    // Sekme yoksa oluştur.
    if (!sheet) {
      sheet = ss.insertSheet(cfg.sheetName);
      const headers = cfg.fields.map(function(field) { return field[1]; });
      SYSTEM_COLUMNS.forEach(function(col) { headers.push(col); });
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      styleHeader_(sheet, headers.length);
      sheet.setFrozenRows(1);
    }

    // Form cevaplarını ilgili sütunlara yerleştir.
    const values = cfg.fields.map(function(field) {
      const value = data[field[0]];
      if (value === undefined || value === null) {
        return "";
      }
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value);
    });

    // Otomatik başvuru numarası (payload'da iletilmişse aynısını korur).
    const applicationId =
      data.application_id ||
      data.tracking_code ||
      ("MUNTAL-" + Utilities.getUuid().slice(0, 8).toUpperCase());

    // Tarih, ID ve sistem sütunları.
    values.push(new Date());
    values.push(applicationId);
    values.push("Pending");
    values.push(data.assigned_committee || "");
    values.push(data.notes || "");

    // Yeni başvuruyu kaydet.
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
    } catch (error) {}
  }
}

/*******************************************************
 * 3. GET REQUEST
 * API kontrolü ve Sekretarya Paneli senkronizasyonu
 *******************************************************/
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : "";

  // Sekretarya paneli veri çekme
  if (action === "getApplications") {
    try {
      const apps = getAllApplications_();
      return json_({
        success: true,
        count: apps.length,
        applications: apps,
        tabs: ["Delegate", "Delegation", "Admin", "Press"],
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return json_({
        success: false,
        message: String(err.message || err),
        applications: []
      });
    }
  }

  if (action === "ping" || action === "test") {
    return json_({
      success: true,
      version: "2327",
      message: "MUNTAL Google Sheets API is running!"
    });
  }

  // Varsayılan kontrol yanıtı
  return json_({
    success: true,
    message: "MUNTAL Google Sheets API is running!",
    tabs: ["Delegate", "Delegation", "Admin", "Press"]
  });
}

/*******************************************************
 * 4. PAYLOAD READER
 *******************************************************/
function readPayload_(e) {
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  if (e && e.parameter) {
    return e.parameter;
  }
  throw new Error("No application payload received.");
}

/*******************************************************
 * 5. APPLICATION TYPE DETECTION
 *******************************************************/
function findConfig_(applicationType) {
  const keys = Object.keys(CONFIG);
  for (let i = 0; i < keys.length; i++) {
    const cfg = CONFIG[keys[i]];
    if (cfg.applicationTypes.indexOf(applicationType) !== -1) {
      return cfg;
    }
  }
  return null;
}

/*******************************************************
 * 6. HEADER DESIGN
 *******************************************************/
function styleHeader_(sheet, columnCount) {
  const range = sheet.getRange(1, 1, 1, columnCount);
  range
    .setBackground("#14243A")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setWrap(true)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 50);
}

/*******************************************************
 * 7. JSON RESPONSE
 *******************************************************/
function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/*******************************************************
 * 8. LIVE APPLICATIONS RETRIEVAL FOR SECRETARIAT PANEL
 *******************************************************/
function getAllApplications_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allApps = [];
  const primaryKeys = ["delegate", "delegation", "admin", "press"];

  primaryKeys.forEach(function(key) {
    const cfg = CONFIG[key];
    const sheet = ss.getSheetByName(cfg.sheetName);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) return;

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    const headerIndex = {};
    headers.forEach(function(h, idx) { headerIndex[h] = idx; });

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const app = {
        sheet_name: cfg.sheetName,
        category: cfg.sheetName.toLowerCase(),
        category_title: cfg.sheetName
      };

      cfg.fields.forEach(function(field) {
        const fieldKey = field[0];
        const fieldLabel = field[1].trim().toLowerCase();
        const idx = headerIndex[fieldLabel];
        app[fieldKey] = (idx !== undefined && row[idx] !== undefined) ? String(row[idx]) : "";
      });

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

  return allApps;
}

function handleUpdateStatus_(data) {
  const targetId = String(data.application_id || data.id || "").trim();
  const newStatus = String(data.status || "").trim();
  const newCommittee = data.assigned_committee !== undefined ? String(data.assigned_committee).trim() : null;
  const newNotes = data.notes !== undefined ? String(data.notes) : null;

  if (!targetId) return json_({ success: false, message: "application_id is required." });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let found = false;
  const primaryKeys = ["delegate", "delegation", "admin", "press"];

  primaryKeys.forEach(function(key) {
    if (found) return;
    const cfg = CONFIG[key];
    const sheet = ss.getSheetByName(cfg.sheetName);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) return;

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    let appIdCol = -1, statusCol = -1, assignedCommCol = -1, notesCol = -1;

    headers.forEach(function(h, idx) {
      const lower = String(h).trim().toLowerCase();
      if (lower === "application id") appIdCol = idx + 1;
      if (lower === "status") statusCol = idx + 1;
      if (lower === "assigned committee") assignedCommCol = idx + 1;
      if (lower === "notes") notesCol = idx + 1;
    });

    if (appIdCol === -1) return;

    const idValues = sheet.getRange(2, appIdCol, lastRow - 1, 1).getValues();
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim() === targetId) {
        const rowNum = i + 2;
        if (newStatus && statusCol !== -1) sheet.getRange(rowNum, statusCol).setValue(newStatus);
        if (newCommittee !== null && assignedCommCol !== -1) sheet.getRange(rowNum, assignedCommCol).setValue(newCommittee);
        if (newNotes !== null && notesCol !== -1) sheet.getRange(rowNum, notesCol).setValue(newNotes);
        found = true;
        break;
      }
    }
  });

  return json_({ success: found, message: found ? "Record updated." : "Application ID not found." });
}

function handleSendEmail_(data) {
  const recipient = String(data.to || data.recipient || "").trim();
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
      errorMessage = err2.message || String(err2);
    }
  }

  return json_({
    success: status === "Sent",
    email_sent: status === "Sent",
    message: status === "Sent" ? ("Email delivered to " + recipient) : ("Error: " + errorMessage)
  });
}

/*******************************************************
 * 9. CONNECTION TEST
 *******************************************************/
function testConnection() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const primaryKeys = ["delegate", "delegation", "admin", "press"];
  const result = primaryKeys.map(function(key) {
    const cfg = CONFIG[key];
    return {
      tab: cfg.sheetName,
      exists: ss.getSheetByName(cfg.sheetName) !== null,
      questionCount: cfg.fields.length
    };
  });
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
