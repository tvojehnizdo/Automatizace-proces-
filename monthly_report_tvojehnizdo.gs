
function sendMonthlyReport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Faktura Archiv");
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const rows = data.slice(1);

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = prevMonth.getFullYear();
  const month = ("0" + (prevMonth.getMonth() + 1)).slice(-2); // 01–12

  let total = 0;
  let paid = 0;
  let count = 0;

  rows.forEach(row => {
    const datum = row[3]; // sloupec "Datum"
    const castka = parseInt((row[4] || "").toString().replace(/\D/g, ""));
    const stav = row[6] || "";

    if (datum && datum.includes(`${month}.${year}`) || datum.includes(`${month}.${year}`.replace(/^0/, ""))) {
      count++;
      total += castka;
      if (stav.toLowerCase().includes("zaplaceno")) {
        paid += castka;
      }
    }
  });

  const unpaid = total - paid;
  const subject = `Měsíční report – TvojeHnizdo.cz (${year}-${month})`;
  const message = `
Měsíční přehled faktur – TvojeHnizdo.cz (${month}/${year})

Počet vystavených faktur: ${count}
Celková fakturovaná částka: ${total.toLocaleString()} Kč
Z toho zaplaceno: ${paid.toLocaleString()} Kč
Nezaplaceno: ${unpaid.toLocaleString()} Kč

Detailní přehled je k dispozici v tabulce "Faktura Archiv".
  `;

  MailApp.sendEmail({
    to: "info@tvojehnizdo.cz", // zde nastavte cílový e-mail
    subject: subject,
    body: message
  });
}
