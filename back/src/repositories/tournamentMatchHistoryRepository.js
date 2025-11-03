const db = require("../db");
const { isInvalid } = require("../services/isValidService");

function createTournamentHistory(tournament) {
	if (isInvalid(tournament)) {
		console.error("❌ createTournamentHistory: invalid tournament", { tournament });
		return null;
	}

	return safeDBExecute(() => {
		const insertTournament = db.prepare(`
			INSERT INTO tournaments (name)
			VALUES (?);
		`);

		const result = insertTournament.run(tournament.name || "Pong Trouble Tournament");
		return result?.lastInsertRowid || null;
	}, { tournament }, null);
}

function getRecentMatches(playerId) {
	if (isInvalid(playerId)) {
		console.error("❌ getRecentMatches: invalid playerId", { playerId });
		return [];
	}

	return safeDBExecute(() => {
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
		return recentMatches || [];
	}, { playerId }, []);
}

function updateMatchRep(tournamentId, round, matchId) {
	if (isInvalid(tournamentId, round, matchId)) {
		console.error("❌ updateMatchRep: invalid params", { tournamentId, round, matchId });
		return;
	}

	safeDBExecute(() => {
		db.prepare(`
			UPDATE matches
			SET type = 'tournament',
				tournament_id = ?,
				round = ?
			WHERE id = ?;
		`).run(tournamentId, round, matchId);
	}, { tournamentId, round, matchId });
}

module.exports = {
	createTournamentHistory,
	getRecentMatches,
	updateMatchRep
}
