const db = require("../db");

function getUserById(userId) {
    return db.prepare(`
        SELECT username, first_name, last_name, age, path, last_seen
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

function getAllUsers() {
    return db.prepare(`
        SELECT id, username, first_name, last_name, age, path, last_seen 
        FROM users 
        WHERE validated = 1
    `).all();
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
    return  db.prepare(`
		SELECT
			u.id,
			u.username,
			u.last_seen,
			CASE
				WHEN b.blocked_id IS NOT NULL THEN 1
				ELSE 0
			END AS blocked
		FROM friends f
		JOIN users u
			ON u.id = f.friend_id
		LEFT JOIN blocks b
			ON b.blocker_id = f.user_id
		   AND b.blocked_id = f.friend_id
		WHERE f.user_id = ?
	`).all(userId)
}

module.exports = {
    getUserById,
    getFriendsInfoByUserId,
    getAllUsers,
    isFriend,
    getFriends,
}

