const db = require("../db");

function updateUserStatus(userId, status) { 
	db.prepare(`
		INSERT INTO user_status (user_id, status)
		VALUES (?, ?)
		ON CONFLICT(user_id) DO UPDATE SET status = excluded.status
	`).run(userId, status);
}

function blockUser(senderId, friendId) {
	db.prepare(`INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)`).run(senderId, friendId);
}

function unblockUser(senderId, friendId) {
	db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`).run(senderId, friendId);
}

function getUsername(senderId) {
	const username = db.prepare('SELECT username FROM users WHERE id = ?').get(senderId).username;
	return username;
}

function markMessagesAsRead(friendId, userId) {
	db.prepare(`UPDATE messages SET is_read = 0 WHERE sender_id = ? AND receiver_id = ? AND is_read = 1`).run(friendId, userId);
}

function setMessageAsRead(messageId) {
	db.prepare(`UPDATE messages SET is_read = 1 WHERE id = ?`).run(messageId);
}

function addMessage(senderId, friendId, content) {
	const info = db.prepare(
		`INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
	).run(senderId, friendId, content);
	return info;
}

function addNewRequest(senderId, friendId) {
	db.prepare(`INSERT INTO requests (sender_id, receiver_id, type) VALUES (?, ?, ?)`).run(senderId, friendId, 'game');
}

function deleteRequest(senderId, friendId) {
	db.prepare(`DELETE FROM requests WHERE sender_id = ? AND receiver_id = ?`).run(senderId, friendId);
}

module.exports = {
	updateUserStatus,
	blockUser,
	unblockUser,
	getUsername,
	markMessagesAsRead,
	addMessage,
	setMessageAsRead,
	addNewRequest,
	deleteRequest
}