const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

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
    rights5 BOOLEAN DEFAULT 0,
    first_name TEXT DEFAULT NULL,
    last_name TEXT DEFAULT NULL,
    age INTEGER DEFAULT NULL,
    path TEXT DEFAULT NULL,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS validation_codes (
  	id INTEGER PRIMARY KEY AUTOINCREMENT,
  	user_id INTEGER NOT NULL,
  	code TEXT NOT NULL UNIQUE,
  	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  	FOREIGN KEY (user_id) REFERENCES users(id)
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

const existingUsers = db.prepare(`SELECT COUNT(*) as count FROM users`).get();
if (existingUsers.count === 0) {
  const defaultUsers = [
    { username: "jkarras", email: "karras.jan@web.de" },
    { username: "rmatthes", email: "xxtrickz@web.de" },
    { username: "atoepper", email: "atoepper@student.42wolfsburg.de" },
  ];

  // user1 bis user10 ohne Freunde, aber mit Stats
  const extraUsers = [];
  for (let i = 1; i <= 10; i++) {
    extraUsers.push({
      username: `user${i}`,
      email: `user${i}@example.com`
    });
  }

  const hashedPassword = bcrypt.hashSync("password123", 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, validated, path)
    VALUES (?, ?, ?, 1, '1752223449371.png')
  `);

  const insertStats = db.prepare(`
    INSERT INTO stats (user_id, wins, loses, tournamentWins)
    VALUES (?, 0, 0, 0)
  `);

  const insertFriend = db.prepare(`
    INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)
  `);

  const userIds = [];

  // Default-User einfügen
  for (const user of defaultUsers) {
    const result = insertUser.run(user.username, user.email, hashedPassword);
    userIds.push(result.lastInsertRowid);
    insertStats.run(result.lastInsertRowid);
  }

  // Freundschaften nur unter Default-Usern
  insertFriend.run(userIds[0], userIds[1]); // jkarras → rmatthes
  insertFriend.run(userIds[1], userIds[0]); // rmatthes → jkarras

  insertFriend.run(userIds[0], userIds[2]); // jkarras → atoepper
  insertFriend.run(userIds[2], userIds[0]); // atoepper → jkarras

  // Extra User einfügen (user1 bis user10) ohne Freunde, aber mit Stats
  for (const user of extraUsers) {
    const result = insertUser.run(user.username, user.email, hashedPassword);
    insertStats.run(result.lastInsertRowid);
    // Keine Freunde setzen!
  }

  console.log("✅ Default-User und 10 weitere User wurden erfolgreich erstellt.");
} else {
  console.log("ℹ️ Benutzer existieren bereits, keine neuen User hinzugefügt.");
}



module.exports = db;
