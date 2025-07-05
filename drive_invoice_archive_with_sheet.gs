
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const base64 = data.pdfBase64;
    const email = data.email;
    const phase = data.phase;
    const invoiceNumber = data.invoiceNumber;

    const folderName = "Faktury TvojeHnizdo";
    const folder = getOrCreateFolder(folderName);

    const contentType = "application/pdf";
    const blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, invoiceNumber + ".pdf");

    folder.createFile(blob);

    const sheet = getOrCreateSheet("Faktura Archiv");
    const now = new Date();
    const row = [invoiceNumber, email, phase, Utilities.formatDate(now, Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm"), "", "", "NEZAPLACENO"];

    const existing = sheet.getDataRange().getValues();
    const exists = existing.some(r => r[0] === invoiceNumber);

    if (!exists) {
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Chyba: " + error).setMimeType(ContentService.MimeType.TEXT);
  }
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["Číslo faktury", "E-mail", "Fáze", "Datum", "Částka", "VS", "Stav"]);
  }
  return sheet;
}
