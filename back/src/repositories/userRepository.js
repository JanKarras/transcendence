const db = require("../db");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function getUserById(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getUserById: invalid userId", { userId });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT id, username, first_name, last_name, age, path, last_seen, twofa_active, twofa_method
			FROM users
			WHERE id = ?
		`).get(userId);
	}, { userId }, null);
}

function getFriendsInfoByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getFriendsInfoByUserId: invalid userId", { userId });
		return [];
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT DISTINCT
				u.id, u.username, u.first_name, u.last_name, u.age, u.path, u.last_seen,
				s.wins, s.loses, s.tournamentWins
			FROM users u
			JOIN (
				SELECT friend_id FROM friends WHERE user_id = ?
				UNION
				SELECT user_id FROM friends WHERE friend_id = ?
			) f ON u.id = f.friend_id
			JOIN stats s ON u.id = s.user_id
		`).all(userId, userId);
	}, { userId }, []);
}

function addFriend(userId, friendId) {
	if (isInvalid(userId, friendId)) {
		console.error("❌ addFriend: invalid params", { userId, friendId });
		return;
	}
	safeDBExecute(() => {
		console.log("Adding friend:", userId, friendId);
		const insertFriend = db.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)');
		insertFriend.run(userId, friendId);
		insertFriend.run(friendId, userId);
	}, { userId, friendId });
}

function isFriend(userId, id) {
	if (isInvalid(userId, id)) {
		console.error("❌ isFriend: invalid params", { userId, id });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT 1
			FROM friends
			WHERE (user_id = ? AND friend_id = ?)
			   OR (user_id = ? AND friend_id = ?)
			LIMIT 1
		`).get(userId, id, id, userId);
	}, { userId, id }, null);
}

function getFriends(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getFriends: invalid userId", { userId });
		return [];
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT
				u.id,
				u.username,
				u.last_seen,
				u.path,
				CASE WHEN b.blocked_id IS NOT NULL THEN 1 ELSE 0 END AS blocked,
				CASE
					WHEN EXISTS (
						SELECT 1
						FROM messages m
						WHERE m.sender_id = u.id
						  AND m.receiver_id = f.user_id
						  AND m.is_read = 1
						LIMIT 1
					) THEN 1
					ELSE 0
				END AS has_unread
			FROM friends f
			JOIN users u ON u.id = f.friend_id
			LEFT JOIN blocks b ON b.blocker_id = f.user_id AND b.blocked_id = f.friend_id
			WHERE f.user_id = ?;
		`).all(userId);
	}, { userId }, []);
}

function deleteFriends(userId, friendId) {
	if (isInvalid(userId, friendId)) {
		console.error("❌ deleteFriends: invalid params", { userId, friendId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			DELETE FROM friends
			WHERE (user_id = ? AND friend_id = ?)
			   OR (user_id = ? AND friend_id = ?)
		`).run(userId, friendId, friendId, userId);
	}, { userId, friendId });
}

function isUserBlockedByFriend(friendId, userId) {
	if (isInvalid(friendId, userId)) {
		console.error("❌ isUserBlockedByFriend: invalid params", { friendId, userId });
		return { blocked: 0 };
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT
			  (CASE WHEN EXISTS(
				 SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?
			   ) THEN 2 ELSE 0 END)
			  +
			  (CASE WHEN EXISTS(
				 SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?
			   ) THEN 1 ELSE 0 END)
			  AS blocked
		`).get(friendId, userId, userId, friendId);
	}, { friendId, userId }, { blocked: 0 });
}

function getAllUsers() {
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT id, username, first_name, last_name, age, path, last_seen
			FROM users
			WHERE validated = 1
		`).all();
	}, {}, []);
}

function addUser(cleanUsername, email, hashedPw) {
	if (isInvalid(cleanUsername, email, hashedPw)) {
		console.error("❌ addUser: invalid params", { cleanUsername, email });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
			.run(cleanUsername, email, hashedPw);
	}, { cleanUsername, email }, null);
}

function getUserByEmail(email) {
	if (isInvalid(email)) {
		console.error("❌ getUserByEmail: invalid email", { email });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
	}, { email }, null);
}

function getUserByUsername(username) {
	if (isInvalid(username)) {
		console.error("❌ getUserByUsername: invalid username", { username });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
	}, { username }, null);
}

function getUserIdByUsername(username) {
	if (isInvalid(username)) {
		console.error("❌ getUserIdByUsername: invalid username", { username });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare('SELECT id FROM users WHERE username = ?').get(username);
	}, { username }, null);
}

function updateUserAfterValidation(userId) {
	if (isInvalid(userId)) {
		console.error("❌ updateUserAfterValidation: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET validated = 1 WHERE id = ?').run(userId);
	}, { userId });
}

function updateUserFirstName(firstName, userId) {
	if (isInvalid(firstName, userId)) {
		console.error("❌ updateUserFirstName: invalid params", { firstName, userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET first_name = ? WHERE id = ?').run(firstName, userId);
	}, { firstName, userId });
}

function updateUserLastName(lastName, userId) {
	if (isInvalid(lastName, userId)) {
		console.error("❌ updateUserLastName: invalid params", { lastName, userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET last_name = ? WHERE id = ?').run(lastName, userId);
	}, { lastName, userId });
}

function updateUserAge(age, userId) {
	if (isInvalid(age, userId)) {
		console.error("❌ updateUserAge: invalid params", { age, userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET age = ? WHERE id = ?').run(age, userId);
	}, { age, userId });
}

function updateUserImageName(imageName, userId) {
	if (isInvalid(imageName, userId)) {
		console.error("❌ updateUserImageName: invalid params", { imageName, userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET path = ? WHERE id = ?').run(imageName, userId);
	}, { imageName, userId });
}

function updateUserTwofaActive(twofa_active, userId) {
	if (isInvalid(twofa_active, userId)) {
		console.error("❌ updateUserTwofaActive: invalid params", { twofa_active, userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET twofa_active = ? WHERE id = ?').run(twofa_active, userId);
	}, { twofa_active, userId });
}

function updateUserTwoFaMethod(twofa_method, userId) {
	if (isInvalid(twofa_method, userId)) {
		console.error("❌ updateUserTwoFaMethod: invalid params", { twofa_method, userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET twofa_method = ? WHERE id = ?').run(twofa_method, userId);
	}, { twofa_method, userId });
}

function saveTwoFaSecret(userId, secret) {
	if (isInvalid(userId, secret)) {
		console.error("❌ saveTwoFaSecret: invalid params", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare('UPDATE users SET twofa_secret = ? WHERE id = ?').run(secret, userId);
	}, { userId });
}

function getTwoFaSecret(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getTwoFaSecret: invalid userId", { userId });
		return null;
	}
	return safeDBExecute(() => {
		const row = db.prepare('SELECT twofa_secret FROM users WHERE id = ?').get(userId);
		return row ? row.twofa_secret : null;
	}, { userId }, null);
}

function logoutUser(userId) {
	if (isInvalid(userId)) {
		console.error("❌ logoutUser: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`UPDATE users SET last_seen = DATETIME('now', '-5 minutes') WHERE id = ?;`).run(userId);
	}, { userId });
}

function updateLastSeen(userId) {
	if (isInvalid(userId)) {
		console.error("❌ updateLastSeen: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?`).run(userId);
	}, { userId });
}

module.exports = {
	getUserById,
	getFriendsInfoByUserId,
	addFriend,
	isFriend,
	getFriends,
	deleteFriends,
	getAllUsers,
	isUserBlockedByFriend,
	addUser,
	getUserByEmail,
	getUserByUsername,
	updateUserAfterValidation,
	updateUserAge,
	updateUserImageName,
	updateUserFirstName,
	updateUserLastName,
	getUserIdByUsername,
	updateUserTwofaActive,
	updateUserTwoFaMethod,
	saveTwoFaSecret,
	getTwoFaSecret,
	logoutUser,
	updateLastSeen
}

