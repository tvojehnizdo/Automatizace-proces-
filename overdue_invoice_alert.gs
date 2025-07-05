
function checkOverdueInvoices() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Faktura Archiv");
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const rows = data.slice(1);

  const now = new Date();
  const alerts = [];

  rows.forEach(row => {
    const invoiceNumber = row[0];
    const email = row[1];
    const castka = row[4];
    const stav = row[6];
    const datum = row[3]; // vystavení
    const match = datum && datum.match(/(\d{2})\.(\d{2})\.(\d{4})/);

    if (!stav || !stav.toLowerCase().includes("zaplaceno")) {
      if (match) {
        const vystaveni = new Date(+match[3], +match[2] - 1, +match[1]);
        const splatnost = new Date(vystaveni.getTime() + 7 * 86400000); // +7 dní
        if (now > splatnost) {
          alerts.push(`${invoiceNumber} – ${email} – ${castka} Kč – splatnost: ${splatnost.toLocaleDateString("cs-CZ")}`);
        }
      }
    }
  });

  if (alerts.length > 0) {
    const subject = "UPOZORNĚNÍ – Nezaplacené faktury po splatnosti";
    const message = "Následující faktury nejsou zaplaceny a jsou po splatnosti:\n\n" + alerts.join("\n") +
      "\n\nProsím prověřte stav plateb a případně kontaktujte klienty.";

    MailApp.sendEmail({
      to: "info@tvojehnizdo.cz",
      subject: subject,
      body: message
    });
  }
}
