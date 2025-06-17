const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '../../database/mydatabase.sqlite');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
  	id INTEGER PRIMARY KEY AUTOINCREMENT,
  	email TEXT NOT NULL UNIQUE,
  	username TEXT NOT NULL UNIQUE,
  	password TEXT NOT NULL,
  	validated BOOLEAN DEFAULT 0,
  	rights1 BOOLEAN DEFAULT 0,
  	rights2 BOOLEAN DEFAULT 0,
  	rights3 BOOLEAN DEFAULT 0,
  	rights4 BOOLEAN DEFAULT 0,
  	rights5 BOOLEAN DEFAULT 0
	);
`).run();

module.exports = db;
