const db = require("../db");

async function createTournamenHistory(tournament) {
	const insertTournament = db.prepare(`
			INSERT INTO tournaments (name)
			VALUES (?);
		`);
	const result = insertTournament.run("Pong Trouble Tournament");
	const tournamentId = result.lastInsertRowid;
	return tournamentId;
}

async function getRecentMatches(playerId) {
	const getRecentMatches = db.prepare(`
		SELECT id, type, tournament_id, created_at
		FROM matches
		WHERE id IN (
			SELECT match_id FROM match_players WHERE user_id = ?
		)
		ORDER BY created_at DESC
		LIMIT 2;
	`);
	const recentMatches = getRecentMatches.all(playerId);
	return recentMatches
}

async function updateMatch(tournamentId, round, matchId) {
	const updateMatch = db.prepare(`
		UPDATE matches
		SET type = 'tournament',
			tournament_id = ?,
			round = ?
		WHERE id = ?;
	`);
	updateMatch.run(tournamentId, round, matchId);
}

module.exports = {
	createTournamenHistory,
	getRecentMatches,
	updateMatch
}
