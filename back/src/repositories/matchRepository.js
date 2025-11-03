const db = require("../db");
const matchPlayerRepository = require("../repositories/matchPlayerRepository");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function getMatchesByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getMatchesByUserId: userId invalid", { userId });
		return [];
	}

	return safeDBExecute(() => {
		return db.prepare(`
			SELECT
				m.id AS match_id,
				m.type AS match_type,
				m.tournament_id,
				m.round,
				m.created_at AS match_date,
				t.name AS tournament_name
			FROM matches m
				LEFT JOIN tournaments t ON m.tournament_id = t.id
				JOIN match_players mp ON mp.match_id = m.id
			WHERE mp.user_id = ?
			ORDER BY m.created_at ASC
		`).all(userId);
	}, { userId }, []);
}

function addMatchAndMatchPlayers(match) {
	if (isInvalid(match)) {
		console.error("❌ addMatchAndMatchPlayers: match invalid", { match });
		return;
	}

	safeDBExecute(() => {
		const insertMatch = db.prepare(`
			INSERT INTO matches (type, tournament_id, round)
			VALUES (?, ?, ?)
		`);

		const insertMatchAndPlayersTransaction = db.transaction((match) => {
			const type = match.mode || "unknown";
			const tournamentId = match.tournamentId || null;
			const round = match.round || null;

			const result = insertMatch.run(type, tournamentId, round);
			const matchId = result.lastInsertRowid;

			matchPlayerRepository.insertMatchPlayers(match, matchId);
		});

		insertMatchAndPlayersTransaction(match);
	}, { match });
}

module.exports = {
	getMatchesByUserId,
	addMatchAndMatchPlayers,
}
