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
	console.log(`🔍 Fetching recent matches for player ID ${playerId}...`);
	const stmt = db.prepare(`
		SELECT id, type, tournament_id, created_at
		FROM matches
		WHERE id IN (
			SELECT match_id FROM match_players WHERE user_id = ?
		)
		ORDER BY created_at DESC
		LIMIT 2;
	`);
	const recentMatches = stmt.all(playerId);
	console.log(`📋 Recent matches for player ID ${playerId}:`, recentMatches);
	return recentMatches;
}


async function updateMatchRep(tournamentId, round, matchId) {
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
	updateMatchRep
}
