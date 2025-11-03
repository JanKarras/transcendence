const db = require("../db");
const { isInvalid } = require("../services/isValidService");

function getMessagesByUserIdAndFriendId(userId, friendId) {
	return db.prepare(
			`
			SELECT m.*, u.username AS from_username,
			CAST(
				EXISTS (
					SELECT 1
					FROM requests r
					WHERE ((r.sender_id = ? AND r.receiver_id = ?)
					OR
					(r.sender_id = ? AND r.receiver_id = ?))
					AND r.status = 'nothandled'
				) AS INTEGER
			) AS is_invite
			FROM messages m
			JOIN users u ON u.id = m.sender_id
			WHERE (
			(m.sender_id = ? AND m.receiver_id = ?)
			OR
			(m.sender_id = ? AND m.receiver_id = ?)
			)
			ORDER BY m.created_at ASC
			`
		)
		.all(userId, friendId, friendId, userId, userId, friendId, friendId, userId);
}

function getUnreadDB(userId, friendId) {
	const row = db
		.prepare(
			`
		SELECT count(*) AS count
		FROM messages
		WHERE sender_id = ? AND receiver_id = ? AND is_read = 1
	`
		)
		.get(friendId, userId);
	return row.count > 0;
}

module.exports = {
	getMessagesByUserIdAndFriendId,
	getUnreadDB
}
