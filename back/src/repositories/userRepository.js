const db = require("../db");

function getUserById(userId) {
    return db.prepare(`
        SELECT id, username, first_name, last_name, age, path, last_seen, twofa_active, twofa_method
        FROM users
        WHERE id = ?
    `).get(userId);
}

function getFriendsInfoByUserId(userId) {
    return db.prepare(`
        SELECT DISTINCT
            u.id, u.username, u.first_name, u.last_name, u.age, u.path, u.last_seen, s.wins, s.loses, s.tournamentWins
        FROM users u
        JOIN (
            SELECT friend_id AS friend_id FROM friends WHERE user_id = ?
            UNION
            SELECT user_id AS friend_id FROM friends WHERE friend_id = ?
        ) f ON u.id = f.friend_id
        JOIN stats s ON u.id = s.user_id
    `).all(userId, userId);
}

function addFriend(userId, friendId) {
	console.log("Adding friend:", userId, friendId);
	const insertFriend = db.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)');
	insertFriend.run(userId, friendId);
	insertFriend.run(friendId, userId);
}

function isFriend(userId, id) {
    return db.prepare(`
        SELECT 1
        FROM friends
        WHERE (user_id = ? AND friend_id = ?)
           OR (user_id = ? AND friend_id = ?)
        LIMIT 1
    `).get(userId, id, id, userId);
}

function getFriends(userId) {
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
        JOIN users u
          ON u.id = f.friend_id
        LEFT JOIN blocks b
          ON b.blocker_id = f.user_id
          AND b.blocked_id = f.friend_id
        WHERE f.user_id = ?;
    `).all(userId);
}


function deleteFriends(userId, friendId) {
    return db.prepare(`
			DELETE FROM friends
			WHERE (user_id = ? AND friend_id = ?)
			OR (user_id = ? AND friend_id = ?)
		`).run(userId, friendId, friendId, userId);
}

function isUserBlockedByFriend(friendId, userId) {
    return db.prepare(`
          SELECT CASE
    WHEN EXISTS(
        SELECT 1 FROM blocks
        WHERE blocker_id = ? AND blocked_id = ?
    ) THEN 2
    WHEN EXISTS(
        SELECT 1 FROM blocks
        WHERE blocker_id = ? AND blocked_id = ?
    ) THEN 1
    ELSE 0
END AS blocked
    `).get(friendId, userId, userId, friendId);
}

function getAllUsers() {
    return db.prepare(`
        SELECT id, username, first_name, last_name, age, path, last_seen
        FROM users
        WHERE validated = 1
    `).all();
}

function addUser(cleanUsername, email, hashedPw) {
    return  db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
        .run(cleanUsername, email, hashedPw);
}

function getUserByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function getUserByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function getUserIdByUsername(username) {
    return db.prepare('SELECT id FROM users WHERE username = ?').get(username);
}

function updateUserAfterValidation(userId) {
    db.prepare('UPDATE users SET validated = 1 WHERE id = ?').run(userId);
}

function updateUserFirstName(firstName, userId) {
    db.prepare('UPDATE users SET first_name = ? WHERE id = ?').run(firstName, userId)
}

function updateUserLastName(lastName, userId) {
    db.prepare('UPDATE users SET last_name = ? WHERE id = ?').run(lastName, userId)
}

function updateUserAge(age, userId) {
    db.prepare('UPDATE users SET age = ? WHERE id = ?').run(age, userId)
}

function updateUserImageName(imageName, userId) {
    db.prepare('UPDATE users SET path = ? WHERE id = ?').run(imageName, userId)
}

function updateUserTwofaActive(twofa_active, userId) {
    db.prepare('UPDATE users SET twofa_active = ? WHERE id = ?').run(twofa_active, userId)
}

function updateUserTwoFaMethod(twofa_method, userId) {
    db.prepare('UPDATE users SET twofa_method = ? WHERE id = ?').run(twofa_method, userId)
}

function saveTwoFaSecret(userId, secret) {
	db.prepare('UPDATE users SET twofa_secret = ? WHERE id = ?').run(secret, userId)
}

function getTwoFaSecret(userId) {
    const row = db.prepare('SELECT twofa_secret FROM users WHERE id = ?').get(userId);
    return row ? row.twofa_secret : null;
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
	getTwoFaSecret
}

