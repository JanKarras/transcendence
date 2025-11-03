const db = require("../db");
const statsRepository = require("../repositories/statsRepository");
const { isInvalid } = require("../services/isValidService");

function getPlayersByMatchId(matchId) {
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
}

function insertMatchPlayers(match, matchId) {
	const insertMatchPlayer =
		db.prepare(`INSERT INTO match_players (match_id, user_id, username, score, rank) VALUES (?, ?, ?, ?, ?)`);

	const playerRight = match.gameInfo.playerRight;
	const playerLeft = match.gameInfo.playerLeft;
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
	statsRepository.incrementWins(winnerId);
	statsRepository.incrementLoses(loserId);
}

module.exports = {
	getPlayersByMatchId,
	insertMatchPlayers,
}
