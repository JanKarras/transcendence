const db = require("../db");

function getMatchesByUserId(userId) {
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
    `).all(userId)
}

module.exports = {
    getMatchesByUserId
}