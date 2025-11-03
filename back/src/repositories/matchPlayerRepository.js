const db = require("../db");
const statsRepository = require("../repositories/statsRepository");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function getPlayersByMatchId(matchId) {
	if (isInvalid(matchId)) {
		console.error("❌ getPlayersByMatchId: matchId invalid", { matchId });
		return [];
	}

	return safeDBExecute(() => {
		return db.prepare(`
			SELECT
				mp.user_id,
				COALESCE(u.username, mp.username) AS username,
				mp.score,
				mp.rank
			FROM match_players mp
			LEFT JOIN users u ON mp.user_id = u.id
			WHERE mp.match_id = ?;
		`).all(matchId);
	}, { matchId }, []);
}

function insertMatchPlayers(match, matchId) {
	if (isInvalid(match, matchId)) {
		console.error("❌ insertMatchPlayers: match or matchId invalid", { match, matchId });
		return;
	}

	safeDBExecute(() => {
		const insertMatchPlayer = db.prepare(`
			INSERT INTO match_players (match_id, user_id, username, score, rank)
			VALUES (?, ?, ?, ?, ?)
		`);

		const playerRight = match.gameInfo?.playerRight;
		const playerLeft = match.gameInfo?.playerLeft;

		if (isInvalid(playerLeft, playerRight)) {
			console.error("❌ insertMatchPlayers: player data missing", { playerLeft, playerRight });
			return;
		}

		const playerLeftRank = playerLeft.score > playerRight.score ? 1 : 2;
		const playerRightRank = playerLeftRank === 2 ? 1 : 2;

		if (!!playerLeft.userId) {
			insertMatchPlayer.run(matchId, playerLeft.userId, null, playerLeft.score, playerLeftRank);
		} else {
			insertMatchPlayer.run(matchId, null, playerLeft.name, playerLeft.score, playerLeftRank);
		}

		if (!!playerRight.userId) {
			insertMatchPlayer.run(matchId, playerRight.userId, null, playerRight.score, playerRightRank);
		} else {
			insertMatchPlayer.run(matchId, null, playerRight.name, playerRight.score, playerRightRank);
		}

		const winnerId = playerLeftRank < playerRightRank ? playerLeft.userId : playerRight.userId;
		const loserId = playerLeftRank < playerRightRank ? playerRight.userId : playerLeft.userId;

		if (!isInvalid(winnerId)) statsRepository.incrementWins(winnerId);
		if (!isInvalid(loserId)) statsRepository.incrementLoses(loserId);

	}, { matchId, match });
}

module.exports = {
	getPlayersByMatchId,
	insertMatchPlayers,
}
