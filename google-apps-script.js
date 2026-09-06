/**
 * ===================================================================
 * MUNTAL 2327 — Model United Nations Conference
 * Google Apps Script Web App Backend for Google Sheets Integration
 * ===================================================================
 * 
 * KURULUM TALİMATLARI (30 Saniye):
 * 1. Google E-Tablonuzu (Google Sheets) açın.
 * 2. Üst menüden: Uzantılar (Extensions) > Apps Script seçeneğine tıklayın.
 * 3. Açılan editördeki tüm kodları silin ve BU DOSYANIN TÜMÜNÜ yapıştırın.
 * 4. Sağ üstteki mavi "Dağıt" (Deploy) butonuna basın > "Yeni dağıtım" (New deployment).
 * 5. Sol taraftaki dişli ikonuna tıklayıp tür olarak "Web uygulaması" (Web app) seçin.
 * 6. Açıklama (Description): MUNTAL Application API
 * 7. Farklı yürüt (Execute as): "Ben" (Kendi e-posta adresiniz)
 * 8. Erişimi olan kullanıcılar (Who has access): "HERKES" (Anyone) -> **ÇOK ÖNEMLİ!**
 * 9. "Dağıt" butonuna basın ve istenirse izinleri onaylayın.
 * 10. Size verilen "Web uygulaması URL'si"ni (URL https://script.google.com/macros/s/.../exec ile başlar) kopyalayın.
 * 11. Kopyaladığınız bu URL'yi projedeki src/api.js dosyasındaki GOOGLE_APPS_SCRIPT_URL alanına yapıştırın veya .env dosyasına VITE_GOOGLE_APPS_SCRIPT_URL olarak ekleyin.
 */

// MUNTAL Sekreteryası tarafından tanımlanan 4 sekme ve tam sütun başlıkları
const SCHEMAS = {
  delegate: {
    sheetName: "Delegate Application",
    headers: [
      "name_surname",
      "email",
      "phone",
      "date_of_birth",
      "school",
      "grade",
      "experiences",
      "first_committee_preference",
      "second_committee_preference",
      "third_committee_preference",
      "motivation_letter",
      "references"
    ]
  },
  delegation: {
    sheetName: "Delegation Application",
    headers: [
      "head_delegate_full_name",
      "head_delegate_email",
      "head_delegate_phone",
      "head_delegate_date_of_birth",
      "first_committee_preference",
      "second_committee_preference",
      "third_committee_preference",
      "experiences",
      "additional_info",
      "references"
    ]
  },
  administrative: {
    sheetName: "Administrative Application",
    headers: [
      "full_name",
      "gender",
      "email",
      "phone",
      "date_of_birth",
      "school_name",
      "grade_level",
      "chair_or_delegate_problem_response",
      "can_stay_until_late_hours",
      "experiences",
      "motivation_letter",
      "additional_info"
    ]
  },
  press: {
    sheetName: "Press Application",
    headers: [
      "full_name",
      "gender",
      "email",
      "phone",
      "id_address",
      "birthday",
      "school_name",
      "grade",
      "lens_information",
      "camera_model",
      "past_experiences",
      "reference",
      "additional_info"
    ]
  }
};

/**
 * MUNTAL web sitesinden gelen POST başvurularını işler ve ilgili sekmeye ekler.
 */
function doPost(e) {
  try {
    let data;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      return createResponse(false, "application_type is required (no payload received)");
    }

    const applicationType = data.application_type;
    if (!applicationType) {
      return createResponse(false, "application_type is required");
    }

    const schema = SCHEMAS[applicationType];
    if (!schema) {
      return createResponse(false, "Invalid application_type: " + applicationType);
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(schema.sheetName);

    // Sekme henüz yoksa otomatik olarak oluştur
    if (!sheet) {
      sheet = spreadsheet.insertSheet(schema.sheetName);
      sheet.appendRow(schema.headers);
      formatHeaderRow(sheet, schema.headers.length);
    }

    // İlk satır boş ise başlıkları ekle
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schema.headers);
      formatHeaderRow(sheet, schema.headers.length);
    }

    // 1. satırdaki mevcut başlıkları al
    const lastCol = Math.max(sheet.getLastColumn(), schema.headers.length);
    const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const headers = (existingHeaders && existingHeaders.length > 0 && existingHeaders[0]) 
      ? existingHeaders 
      : schema.headers;

    // Gelen veriyi başlık sırasına göre satır dizisine eşleştir
    const row = headers.map(function(header) {
      const key = header ? String(header).trim() : "";
      return (data[key] !== undefined && data[key] !== null) ? String(data[key]) : "";
    });

    // Satırı ekle
    sheet.appendRow(row);

    return createResponse(true, "Application submitted successfully");

  } catch (error) {
    return createResponse(false, error.message || "Unknown server error");
  }
}

/**
 * Web App URL'sinin çalıştığını tarayıcıda doğrudan test etmek için GET isteği
 */
function doGet(e) {
  return createResponse(true, "MUNTAL Google Sheets API çalışıyor. Başvuruları kabul etmeye hazır.");
}

/**
 * Başlık satırını koyu ve dondurulmuş olarak biçimlendirir
 */
function formatHeaderRow(sheet, colCount) {
  try {
    const range = sheet.getRange(1, 1, 1, colCount);
    range.setFontWeight("bold");
    range.setBackground("#0b1220");
    range.setFontColor("#f1f5f9");
    sheet.setFrozenRows(1);
  } catch (err) {
    // Biçimlendirme başarısız olsa da veri yazımı devam eder
  }
}

/**
 * Standart CORS uyumlu JSON yanıtı oluşturur
 */
function createResponse(success, message) {
  return ContentService
    .createTextOutput(
      JSON.stringify({
        success: success,
        message: message,
        timestamp: new Date().toISOString()
      })
    )
    .setMimeType(ContentService.MimeType.JSON);
}
