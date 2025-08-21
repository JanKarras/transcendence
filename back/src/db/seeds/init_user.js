const bcrypt = require('bcrypt');

const existingUsers = db.prepare(`SELECT COUNT(*) as count FROM users`).get();
if (existingUsers.count === 0) {
  const defaultUsers = [
    { username: "jkarras", email: "karras.jan@web.de" },
    { username: "rmatthes", email: "xxtrickz@web.de" },
    { username: "atoepper", email: "atoepper@student.42wolfsburg.de" },
  ];

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
  insertFriend.run(userIds[0], userIds[1]);
  insertFriend.run(userIds[1], userIds[0]);
  insertFriend.run(userIds[0], userIds[2]);
  insertFriend.run(userIds[2], userIds[0]);

  // Extra User
  for (const user of extraUsers) {
    const result = insertUser.run(user.username, user.email, hashedPassword);
    insertStats.run(result.lastInsertRowid);
  }

  // jkarras mit user1–user5 befreunden
  const jkarrasId = userIds[0];
  for (let i = 1; i <= 5; i++) {
    const friend = db.prepare(`SELECT id FROM users WHERE username = ?`).get(`user${i}`);
    if (friend) {
      insertFriend.run(jkarrasId, friend.id);
      insertFriend.run(friend.id, jkarrasId);
    }
  }

  console.log("✅ Default-User und 10 weitere User wurden erfolgreich erstellt.");
} else {
  console.log("ℹ️ Benutzer existieren bereits, keine neuen User hinzugefügt.");
}
