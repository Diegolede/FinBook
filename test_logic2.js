const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), '.config', 'finbook', 'finanzas.db');
const db = new sqlite3.Database(dbPath);

console.log("Date offset test", new Date('2026-04-01').getMonth());
