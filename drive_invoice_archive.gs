
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const base64 = data.pdfBase64;
    const email = data.email;
    const phase = data.phase;
    const fakturaCislo = data.invoiceNumber;

    const folderName = "Faktury TvojeHnizdo";
    const folder = getOrCreateFolder(folderName);

    const contentType = "application/pdf";
    const blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, fakturaCislo + ".pdf");

    folder.createFile(blob);

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Chyba: " + error).setMimeType(ContentService.MimeType.TEXT);
  }
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(name);
  }
}
