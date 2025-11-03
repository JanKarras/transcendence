const db = require("../db");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function getStatsByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getStatsByUserId: invalid userId", { userId });
		return {
			user_id: userId || null,
			wins: 0,
			loses: 0,
			tournamentWins: 0
		};
	}

	return safeDBExecute(() => {
		const row = db.prepare(`
			SELECT * FROM stats WHERE user_id = ?
		`).get(userId);

		return row || {
			user_id: userId,
			wins: 0,
			loses: 0,
			tournamentWins: 0
		};
	}, { userId }, {
		user_id: userId,
		wins: 0,
		loses: 0,
		tournamentWins: 0
	});
}

function addStats(userId, wins, loses, tournamentWins) {
	if (isInvalid(userId)) {
		console.error("❌ addStats: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			INSERT INTO stats (user_id, wins, loses, tournamentWins)
			VALUES (?, ?, ?, ?)
		`).run(userId, wins || 0, loses || 0, tournamentWins || 0);
	}, { userId, wins, loses, tournamentWins });
}

function incrementWins(userId) {
	if (isInvalid(userId)) {
		console.error("❌ incrementWins: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			UPDATE stats SET wins = wins + 1 WHERE user_id = ?
		`).run(userId);
	}, { userId });
}

function incrementTournamentWins(userId) {
	if (isInvalid(userId)) {
		console.error("❌ incrementTournamentWins: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			UPDATE stats SET tournamentWins = tournamentWins + 1 WHERE user_id = ?
		`).run(userId);
	}, { userId });
}

function incrementLoses(userId) {
	if (isInvalid(userId)) {
		console.error("❌ incrementLoses: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			UPDATE stats SET loses = loses + 1 WHERE user_id = ?
		`).run(userId);
	}, { userId });
}

module.exports = {
	getStatsByUserId,
	addStats,
	incrementWins,
	incrementLoses,
	incrementTournamentWins
}
