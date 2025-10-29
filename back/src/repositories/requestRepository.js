const db = require("../db");

function getSentRequestsByUserId(userId) {
    return db.prepare(`
		SELECT r.id, r.type, r.status, u.username AS receiver_username, u.path AS receiver_path, r.created_at
		FROM requests r
		JOIN users u ON r.receiver_id = u.id
		WHERE r.sender_id = ?
	`).all(userId);
}

function getReceivedRequestsByUserId(userId) {
    return db.prepare(`
        SELECT r.id, r.type, r.status, u.username AS sender_username, u.path AS sender_path, r.created_at
        FROM requests r
        JOIN users u ON r.sender_id = u.id
        WHERE r.receiver_id = ?
    `).all(userId);
}

function doesFriendRequestExist(senderId, receiverId) {
    return db.prepare(`
        SELECT * FROM requests
        WHERE sender_id = ? AND receiver_id = ? AND type = 'friend'
    `).get(senderId, receiverId)
}

function addFriendRequest(senderId, receiverId) {
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
}


function addTournamentRequest(senderId, receiverId) {
    return db.prepare(`
			INSERT INTO requests (sender_id, receiver_id, type)
			VALUES (?, ?, 'game')
		`).run(senderId, receiverId);
}

function getRequestById(id) {
    return db.prepare('SELECT sender_id, receiver_id, status FROM requests WHERE id = ?').get(id);
}

function updateRequestStatusById(status, id) {
	db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, id)
}

function deleteRequestBySenderIdAndReceiverId(senderId, receiverId) {
    db.prepare(`
			DELETE FROM requests
			WHERE (sender_id = ? AND receiver_id = ?)
			OR (sender_id = ? AND receiver_id = ?)
		`).run(senderId, receiverId, receiverId, senderId);
}

function deleteRequestById(requestId) {
	db.prepare(`
			DELETE FROM requests
			WHERE id = ?
		`).run(requestId);
}

function getSentRequestsByUserIdFriend(userId) {
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
}

function getReceivedRequestsByUserIdFriend(userId) {
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
}

function deleteAllFriendRequestsBetween(senderId, receiverId) {
    db.prepare(`
        DELETE FROM requests
        WHERE type = 'friend'
        AND (
            (sender_id = ? AND receiver_id = ?)
            OR (sender_id = ? AND receiver_id = ?)
        )
    `).run(senderId, receiverId, receiverId, senderId);
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
