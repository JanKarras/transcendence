const db = require("../db");

function getStatsByUserId(userId) {
	return db.prepare(`
		SELECT * FROM stats WHERE user_id = ?
	`).get(userId) || {
		user_id: userId,
		wins: 0,
		loses: 0,
		tournamentWins: 0
	};
}

function addStats(userId, wins, loses, tournamentWins) {
	db.prepare('INSERT INTO stats (user_id, wins, loses, tournamentWins) VALUES (?, ?, ?, ?)')
		.run(userId, wins, loses, tournamentWins);
}

function addStats(userId, wins, loses, tournamentWins) {
	db.prepare('INSERT INTO stats (user_id, wins, loses, tournamentWins) VALUES (?, ?, ?, ?)')
		.run(userId, wins, loses, tournamentWins);
}

function incrementWins(userId) {
	if (!!userId) {
		db.prepare('UPDATE stats SET wins = wins + 1 WHERE user_id = ?;').run(userId);
	}
}

function incrementTournamentWins(userId) {
	if (!!userId) {
		db.prepare('UPDATE stats SET tournamentWins = tournamentWins + 1 WHERE user_id = ?;').run(userId);
	}
}

function incrementLoses(userId) {
	if (!!userId) {
		db.prepare('UPDATE stats SET loses = loses + 1 WHERE user_id = ?;').run(userId);
	}
}

module.exports = {
	getStatsByUserId,
	addStats,
	incrementWins,
	incrementLoses,
	incrementTournamentWins
}
