const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), '.config', 'finbook', 'finanzas.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM transactions WHERE creditCardId IS NOT NULL', [], (err, rows) => {
  if (err) throw err;
  rows.forEach(r => {
    if (r.totalInstallments > 1) {
       console.log('ID:', r.id, 'Amount:', r.amount, 'Paid:', r.paidInstallments, 'Total:', r.totalInstallments);
    }
  });
});
