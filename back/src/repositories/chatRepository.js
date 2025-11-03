const db = require("../db");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function updateUserStatus(userId, status) {
	if (isInvalid(userId, status)) {
		console.error("❌ updateUserStatus: userId or status is undefined");
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			INSERT INTO user_status (user_id, status)
			VALUES (?, ?)
			ON CONFLICT(user_id) DO UPDATE SET status = excluded.status
		`).run(userId, status);
	}, { userId, status });
}

function blockUser(senderId, friendId) {
	if (isInvalid(senderId, friendId)) {
		console.error("❌ blockUser: senderId or friendId invalid", { senderId, friendId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)`)
			.run(senderId, friendId);
	}, { senderId, friendId });
}

function unblockUser(senderId, friendId) {
	if (isInvalid(senderId, friendId)) {
		console.error("❌ unblockUser: senderId or friendId invalid", { senderId, friendId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`)
			.run(senderId, friendId);
	}, { senderId, friendId });
}


function getUsername(senderId) {
	if (isInvalid(senderId)) {
		console.error("❌ getUsername: senderId invalid", { senderId });
		return null;
	}
	return safeDBExecute(() => {
		const row = db.prepare('SELECT username FROM users WHERE id = ?').get(senderId);
		return row ? row.username : null;
	}, { senderId }, null);
}

function markMessagesAsRead(friendId, userId) {
	if (isInvalid(friendId, userId)) {
		console.error("❌ markMessagesAsRead: friendId or userId invalid", { friendId, userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			UPDATE messages
			SET is_read = 0
			WHERE sender_id = ? AND receiver_id = ? AND is_read = 1
		`).run(friendId, userId);
	}, { friendId, userId });
}

function setMessageAsRead(messageId) {
	if (isInvalid(messageId)) {
		console.error("❌ setMessageAsRead: messageId invalid", { messageId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`UPDATE messages SET is_read = 1 WHERE id = ?`).run(messageId);
	}, { messageId });
}


function addMessage(senderId, friendId, content) {
	if (isInvalid(senderId, friendId, content)) {
		console.error("❌ addMessage: one or more arguments invalid", { senderId, friendId, content });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(
			`INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
		).run(senderId, friendId, content);
	}, { senderId, friendId, content }, null);
}

function addNewRequest(senderId, friendId) {
	if (isInvalid(senderId, friendId)) {
		console.error("❌ addNewRequest: senderId or friendId invalid", { senderId, friendId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`INSERT INTO requests (sender_id, receiver_id, type) VALUES (?, ?, ?)`)
			.run(senderId, friendId, 'game');
	}, { senderId, friendId });
}

function deleteRequest(senderId, friendId) {
	if (isInvalid(senderId, friendId)) {
		console.error("❌ deleteRequest: senderId or friendId invalid", { senderId, friendId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`DELETE FROM requests WHERE sender_id = ? AND receiver_id = ?`)
			.run(senderId, friendId);
	}, { senderId, friendId });
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
