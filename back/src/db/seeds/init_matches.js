const existingMatches = db.prepare(`SELECT COUNT(*) as count FROM matches`).get();
const existingTournaments = db.prepare(`SELECT COUNT(*) as count FROM tournaments`).get();

if (existingMatches.count === 0 && existingTournaments.count === 0) {
    console.log("ℹ️ Keine Matches/Tournaments vorhanden, lege Beispielspiele an...");

    const jkarrasId = 1;

    const insertMatch = db.prepare(`INSERT INTO matches (type, tournament_id, round) VALUES (?, ?, ?)`);
    const insertMatchPlayer = db.prepare(`INSERT INTO match_players (match_id, user_id, score, rank) VALUES (?, ?, ?, ?)`);
    const insertTournament = db.prepare(`INSERT INTO tournaments (name) VALUES (?)`);

    const user1 = db.prepare(`SELECT id FROM users WHERE username = 'user1'`).get();
    const user2 = db.prepare(`SELECT id FROM users WHERE username = 'user2'`).get();
    const user3 = db.prepare(`SELECT id FROM users WHERE username = 'user3'`).get();

    let result = insertMatch.run('1v1_local', null, null);
    let matchId = result.lastInsertRowid;
    insertMatchPlayer.run(matchId, jkarrasId, 11, 1);
    insertMatchPlayer.run(matchId, user1.id, 7, 2);

    result = insertMatch.run('1v1_remote', null, null);
    matchId = result.lastInsertRowid;
    insertMatchPlayer.run(matchId, jkarrasId, 15, 1);
    insertMatchPlayer.run(matchId, user2.id, 13, 2);

    const tourResult = insertTournament.run("Startup Cup");
    const tournamentId = tourResult.lastInsertRowid;

    result = insertMatch.run('tournament', tournamentId, 1);
    matchId = result.lastInsertRowid;
    insertMatchPlayer.run(matchId, jkarrasId, 11, 1);
    insertMatchPlayer.run(matchId, user1.id, 7, 2);

    result = insertMatch.run('tournament', tournamentId, 1);
    matchId = result.lastInsertRowid;
    insertMatchPlayer.run(matchId, user2.id, 10, 2);
    insertMatchPlayer.run(matchId, user3.id, 12, 1);

    result = insertMatch.run('tournament', tournamentId, 2);
    matchId = result.lastInsertRowid;
    insertMatchPlayer.run(matchId, jkarrasId, 14, 1);
    insertMatchPlayer.run(matchId, user3.id, 13, 2);

    result = insertMatch.run('tournament', tournamentId, 2);
    matchId = result.lastInsertRowid;
    insertMatchPlayer.run(matchId, user1.id, 9, 3);
    insertMatchPlayer.run(matchId, user2.id, 8, 4);

    console.log("✅ Beispiel-Matches und Tournament erstellt: 1v1 Local, 1v1 Remote + Startup Cup");


} else {
    console.log("ℹ️ Matches/Tournaments existieren bereits, keine neuen erstellt.");
}
