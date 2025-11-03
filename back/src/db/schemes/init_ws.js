db.prepare(`
	CREATE TABLE IF NOT EXISTS messages (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		sender_id INTEGER NOT NULL,
		receiver_id INTEGER NOT NULL,
		content TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		is_read INTEGER DEFAULT 0,
		FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
	);
`).run();

db.prepare(`
	CREATE TABLE IF NOT EXISTS blocks (
		blocker_id INTEGER NOT NULL,
		blocked_id INTEGER NOT NULL,
		PRIMARY KEY (blocker_id, blocked_id)
	);
`).run();

db.prepare(`
	CREATE TABLE IF NOT EXISTS user_status (
		user_id INTEGER PRIMARY KEY,
		status  INTEGER DEFAULT 0,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);
`).run();
