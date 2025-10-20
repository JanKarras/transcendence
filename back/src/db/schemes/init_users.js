const bcrypt = require('bcrypt');

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
	rights5 BOOLEAN DEFAULT 0,
	first_name TEXT DEFAULT NULL,
	last_name TEXT DEFAULT NULL,
	age INTEGER DEFAULT NULL,
	path TEXT DEFAULT NULL,
	last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
	twofa_active BOOLEAN DEFAULT 0,
	twofa_method TEXT DEFAULT "email",
	twofa_secret TEXT DEFAULT NULL
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS friends (
	user_id INTEGER NOT NULL,
	friend_id INTEGER NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id, friend_id),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS stats (
	user_id INTEGER NOT NULL PRIMARY KEY,
	wins INTEGER DEFAULT 0,
	loses INTEGER DEFAULT 0,
	tournamentWins INTEGER DEFAULT 0,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`).run();
