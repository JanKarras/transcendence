db.prepare(
	`
		CREATE TABLE IF NOT EXISTS tournaments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL, -- z.B. "Sommer Cup 2025"
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`
).run()

db.prepare(
	`
		CREATE TABLE IF NOT EXISTS matches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			type TEXT NOT NULL CHECK (type IN ('1v1_local', '1v1_remote', 'tournament')),
			tournament_id INTEGER DEFAULT NULL,
			round INTEGER DEFAULT NULL CHECK (round BETWEEN 1 AND 4),
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
		);
	`
).run()


db.prepare(
	`
		CREATE TABLE IF NOT EXISTS match_players (
			match_id INTEGER NOT NULL,
			user_id INTEGER NULL,
			username TEXT NULL,
			score INTEGER DEFAULT 0,
			rank INTEGER DEFAULT NULL,
			FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			PRIMARY KEY (match_id, user_id)
		);
	`
).run()
