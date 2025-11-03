const db = require("../db");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function getSentRequestsByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getSentRequestsByUserId: invalid userId", { userId });
		return [];
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT r.id, r.type, r.status, u.username AS receiver_username, u.path AS receiver_path, r.created_at
			FROM requests r
			JOIN users u ON r.receiver_id = u.id
			WHERE r.sender_id = ?
		`).all(userId);
	}, { userId }, []);
}

function getReceivedRequestsByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getReceivedRequestsByUserId: invalid userId", { userId });
		return [];
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT r.id, r.type, r.status, u.username AS sender_username, u.path AS sender_path, r.created_at
			FROM requests r
			JOIN users u ON r.sender_id = u.id
			WHERE r.receiver_id = ?
		`).all(userId);
	}, { userId }, []);
}

function doesFriendRequestExist(senderId, receiverId) {
	if (isInvalid(senderId, receiverId)) {
		console.error("❌ doesFriendRequestExist: invalid params", { senderId, receiverId });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT * FROM requests
			WHERE sender_id = ? AND receiver_id = ? AND type = 'friend'
		`).get(senderId, receiverId);
	}, { senderId, receiverId }, null);
}

function addFriendRequest(senderId, receiverId) {
	if (isInvalid(senderId, receiverId)) {
		console.error("❌ addFriendRequest: invalid params", { senderId, receiverId });
		return null;
	}
	return safeDBExecute(() => {
		db.prepare(`
			DELETE FROM requests
			WHERE type = 'friend'
			AND (
				(sender_id = ? AND receiver_id = ?)
				OR (sender_id = ? AND receiver_id = ?)
			)
		`).run(senderId, receiverId, receiverId, senderId);

		return db.prepare(`
			INSERT INTO requests (sender_id, receiver_id, type)
			VALUES (?, ?, 'friend')
		`).run(senderId, receiverId);
	}, { senderId, receiverId }, null);
}

function addTournamentRequest(senderId, receiverId) {
	if (isInvalid(senderId, receiverId)) {
		console.error("❌ addTournamentRequest: invalid params", { senderId, receiverId });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			INSERT INTO requests (sender_id, receiver_id, type)
			VALUES (?, ?, 'game')
		`).run(senderId, receiverId);
	}, { senderId, receiverId }, null);
}

function getRequestById(id) {
	if (isInvalid(id)) {
		console.error("❌ getRequestById: invalid id", { id });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT sender_id, receiver_id, status FROM requests WHERE id = ?
		`).get(id);
	}, { id }, null);
}

function updateRequestStatusById(status, id) {
	if (isInvalid(status, id)) {
		console.error("❌ updateRequestStatusById: invalid params", { status, id });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			UPDATE requests SET status = ? WHERE id = ?
		`).run(status, id);
	}, { status, id });
}

function deleteRequestBySenderIdAndReceiverId(senderId, receiverId) {
	if (isInvalid(senderId, receiverId)) {
		console.error("❌ deleteRequestBySenderIdAndReceiverId: invalid params", { senderId, receiverId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			DELETE FROM requests
			WHERE (sender_id = ? AND receiver_id = ?)
			OR (sender_id = ? AND receiver_id = ?)
		`).run(senderId, receiverId, receiverId, senderId);
	}, { senderId, receiverId });
}

function deleteRequestById(requestId) {
	if (isInvalid(requestId)) {
		console.error("❌ deleteRequestById: invalid id", { requestId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			DELETE FROM requests
			WHERE id = ?
		`).run(requestId);
	}, { requestId });
}

function getSentRequestsByUserIdFriend(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getSentRequestsByUserIdFriend: invalid userId", { userId });
		return [];
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT
				r.id,
				r.type,
				r.status,
				u.username AS receiver_username,
				u.path AS receiver_path,
				r.created_at
			FROM requests r
			INNER JOIN users u ON r.receiver_id = u.id
			WHERE r.sender_id = ?
			AND r.type = 'friend'
			ORDER BY r.created_at DESC
		`).all(userId);
	}, { userId }, []);
}

function getReceivedRequestsByUserIdFriend(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getReceivedRequestsByUserIdFriend: invalid userId", { userId });
		return [];
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT
				r.id,
				r.type,
				r.status,
				u.username AS sender_username,
				u.path AS sender_path,
				r.created_at
			FROM requests r
			INNER JOIN users u ON r.sender_id = u.id
			WHERE r.receiver_id = ?
			AND r.type = 'friend'
			ORDER BY r.created_at DESC
		`).all(userId);
	}, { userId }, []);
}

function deleteAllFriendRequestsBetween(senderId, receiverId) {
	if (isInvalid(senderId, receiverId)) {
		console.error("❌ deleteAllFriendRequestsBetween: invalid params", { senderId, receiverId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			DELETE FROM requests
			WHERE type = 'friend'
			AND (
				(sender_id = ? AND receiver_id = ?)
				OR (sender_id = ? AND receiver_id = ?)
			)
		`).run(senderId, receiverId, receiverId, senderId);
	}, { senderId, receiverId });
}

module.exports = {
	getSentRequestsByUserId,
	getReceivedRequestsByUserId,
	doesFriendRequestExist,
	addFriendRequest,
	getRequestById,
	updateRequestStatusById,
	deleteRequestBySenderIdAndReceiverId,
	addTournamentRequest,
	getSentRequestsByUserIdFriend,
	getReceivedRequestsByUserIdFriend,
	deleteRequestById,
	deleteAllFriendRequestsBetween
}
