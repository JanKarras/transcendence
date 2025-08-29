const db = require("../db");

function getMessagesByUserIdAndFriendId(userId, friendId) {
    return db.prepare(`
		SELECT m.*, u.username as from_username
		FROM messages m
		JOIN users u ON u.id = m.sender_id
		WHERE (m.sender_id = ? AND m.receiver_id = ?)
		   OR (m.sender_id = ? AND m.receiver_id = ?)
		ORDER BY m.created_at ASC
	`).all(userId, friendId, friendId, userId)
}

module.exports = {
    getMessagesByUserIdAndFriendId
}