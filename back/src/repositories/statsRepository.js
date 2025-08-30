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

module.exports = {
    getStatsByUserId,
    addStats,
}