const db = require("../db");

function getSentRequestsByUserId(userId) {
    return db.prepare(`
		SELECT r.id, r.type, r.status, u.username AS receiver_username, r.created_at
		FROM requests r
		JOIN users u ON r.receiver_id = u.id
		WHERE r.sender_id = ?
	`).all(userId);
}

function getReceivedRequestsByUserId(userId) {
    return db.prepare(`
        SELECT r.id, r.type, r.status, u.username AS sender_username, r.created_at
        FROM requests r
        JOIN users u ON r.sender_id = u.id
        WHERE r.receiver_id = ?
    `).all(userId);
}

module.exports = {
    getSentRequestsByUserId,
    getReceivedRequestsByUserId,
}