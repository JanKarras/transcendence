db.prepare(`
  CREATE TABLE IF NOT EXISTS verification_codes (
  	id INTEGER PRIMARY KEY AUTOINCREMENT,
  	user_id INTEGER NOT NULL,
  	code TEXT NOT NULL UNIQUE,
  	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  	FOREIGN KEY (user_id) REFERENCES users(id)
);
`).run();
