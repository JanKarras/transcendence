const existingMatches = db.prepare(`SELECT COUNT(*) as count FROM matches`).get();
const existingTournaments = db.prepare(`SELECT COUNT(*) as count FROM tournaments`).get();

if (existingMatches.count === 0 && existingTournaments.count === 0) {
console.log("ℹ️ Keine Matches/Tournaments vorhanden, lege Beispielspiele an...");
	const jkarrasId = 1;
  // Statements vorbereiten
  const insertMatch = db.prepare(`
    INSERT INTO matches (type, tournament_id, round) VALUES (?, ?, ?)
  `);
  const insertMatchPlayer = db.prepare(`
    INSERT INTO match_players (match_id, user_id, score, rank) VALUES (?, ?, ?, ?)
  `);
  const insertTournament = db.prepare(`
    INSERT INTO tournaments (name) VALUES (?)
  `);

  // Beispiel 1: 1v1 Local (jkarras vs user1)
  let result = insertMatch.run('1v1_local', null, null);
  let matchId = result.lastInsertRowid;
  const user1 = db.prepare(`SELECT id FROM users WHERE username = 'user1'`).get();
  insertMatchPlayer.run(matchId, jkarrasId, 11, 1);
  insertMatchPlayer.run(matchId, user1.id, 7, 2);

  // Beispiel 2: 1v1 Remote (jkarras vs user2)
  result = insertMatch.run('1v1_remote', null, null);
  matchId = result.lastInsertRowid;
  const user2 = db.prepare(`SELECT id FROM users WHERE username = 'user2'`).get();
  insertMatchPlayer.run(matchId, jkarrasId, 15, 1);
  insertMatchPlayer.run(matchId, user2.id, 13, 2);

  // Beispiel 3: Tournament (jkarras, user1, user2, user3)
  const tourResult = insertTournament.run("Startup Cup");
  const tournamentId = tourResult.lastInsertRowid;

  // Halbfinale 1: jkarras vs user1
  result = insertMatch.run('tournament', tournamentId, 3);
  matchId = result.lastInsertRowid;
  insertMatchPlayer.run(matchId, jkarrasId, 11, 1);
  insertMatchPlayer.run(matchId, user1.id, 9, 2);

  // Halbfinale 2: user2 vs user3
  result = insertMatch.run('tournament', tournamentId, 3);
  matchId = result.lastInsertRowid;
  const user3 = db.prepare(`SELECT id FROM users WHERE username = 'user3'`).get();
  insertMatchPlayer.run(matchId, user2.id, 10, 2);
  insertMatchPlayer.run(matchId, user3.id, 12, 1);

  // Finale: jkarras vs user3
  result = insertMatch.run('tournament', tournamentId, 4);
  matchId = result.lastInsertRowid;
  insertMatchPlayer.run(matchId, jkarrasId, 14, 2);
  insertMatchPlayer.run(matchId, user3.id, 16, 1);

  console.log("✅ Beispiel-Matches und Tournament angelegt.");
} else {
	console.log("ℹ️ Matches/Tournaments existieren bereits, keine neuen erstellt.");
}


