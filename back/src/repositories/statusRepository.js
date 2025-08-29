const db = require("../db");

function getStatusByUserId(userId) {
    return db.prepare(`
        SELECT COALESCE(
            (SELECT status FROM user_status WHERE user_id = ? LIMIT 1),
            0
        ) AS status
    `).get(userId);
}

module.exports = {
    getStatusByUserId
}