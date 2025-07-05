
function checkOverdueInvoices() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Faktura Archiv");
  const logSheet = getOrCreateSheet("Log Upozornění");
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);

  const folder = getOrCreateFolder("Faktury TvojeHnizdo");
  const now = new Date();
  const adminSummary = [];

  rows.forEach(row => {
    const invoiceNumber = row[0];
    const email = row[1];
    const phase = row[2];
    const datum = row[3];
    const castka = row[4];
    const vs = row[5];
    const stav = row[6];
    const match = datum && datum.match(/(\d{2})\.(\d{2})\.(\d{4})/);

    if (!stav || !stav.toLowerCase().includes("zaplaceno")) {
      if (match) {
        const vystaveni = new Date(+match[3], +match[2] - 1, +match[1]);
        const splatnost = new Date(vystaveni.getTime() + 7 * 86400000);
        if (now > splatnost) {
          const files = folder.getFilesByName(invoiceNumber + ".pdf");
          if (files.hasNext()) {
            const file = files.next();
            const subject = `Připomínka k platbě – Faktura ${invoiceNumber}`;
            const body = `
Dobrý den,

připomínáme splatnost faktury ${invoiceNumber}, která byla vystavena dne ${datum}.
Splatnost uplynula dne ${splatnost.toLocaleDateString("cs-CZ")} a faktura zatím není uhrazena.

Částka: ${castka} Kč
Účet: 123456789/0100
Variabilní symbol: ${vs}

V příloze naleznete kopii faktury.
V případě, že jste již zaplatili, děkujeme a e-mail prosím ignorujte.

Tým TvojeHnizdo.cz
`;

            MailApp.sendEmail({
              to: email,
              subject: subject,
              body: body,
              attachments: [file.getAs(MimeType.PDF)]
            });

            logSheet.appendRow([
              new Date(), invoiceNumber, email, phase, castka, splatnost.toLocaleDateString("cs-CZ"), "ODESLÁNO"
            ]);

            adminSummary.push(`${invoiceNumber} – ${email} – ${castka} Kč – splatnost: ${splatnost.toLocaleDateString("cs-CZ")}`);
          }
        }
      }
    }
  });

  if (adminSummary.length > 0) {
    const adminMsg = "Upozornění klientům s PDF fakturami odeslána k těmto záznamům:\n\n" +
      adminSummary.join("\n") +
      "\n\nZkontrolujte platby.";

    MailApp.sendEmail({
      to: "info@tvojehnizdo.cz",
      subject: "Připomínky klientům – LOGOVÁNO",
      body: adminMsg
    });
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
    sheet.appendRow(["Čas", "Faktura", "E-mail", "Fáze", "Částka", "Splatnost", "Stav"]);
  }
  return sheet;
}
