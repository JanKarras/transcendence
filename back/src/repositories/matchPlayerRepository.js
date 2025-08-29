const db = require("../db");

function getPlayersByMatchId(matchId) {
    return db.prepare(`
        SELECT
            mp.user_id,
            u.username,
            mp.score,
            mp.rank
        FROM match_players mp
        JOIN users u ON mp.user_id = u.id
        WHERE mp.match_id = ?
        `).all(matchId);
}

module.exports = {
    getPlayersByMatchId
}