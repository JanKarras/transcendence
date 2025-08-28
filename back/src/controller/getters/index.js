const db = require("../../db");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../../logger/logger');
const fs = require('fs');
const path = require('path');

function getUserIdFromRequest(req) {
	try {
		const token = req.cookies?.auth_token;

		if (!token) {
			return null;
		}

		const payload = jwt.verify(token, JWT_SECRET);

		if (payload && typeof payload.id === 'number') {
			return payload.id;
		}

		return null;
	} catch(err) {
		return null;
	}
}

exports.is_logged_in = async (req, reply) => {
	reply.code(200).send({ loggedIn: true });
};

exports.getUser = async (req, reply) => {
	const userId = getUserIdFromRequest(req);

	const user = db.prepare(`
		SELECT username, first_name, last_name, age, path
		FROM users
		WHERE id = ?
	`).get(userId);

	if (!user) {
		return reply.code(401).send({ error: 'Unknown user is logged in' });
	}

	const stmt = db.prepare(`
	SELECT DISTINCT
	u.id,
	u.username,
	u.first_name,
	u.last_name,
	u.age,
	u.path,
	u.last_seen,
	s.wins,
	s.loses,
	s.tournamentWins
	FROM users u
	JOIN (
		SELECT DISTINCT
			CASE
				WHEN user_id = ? THEN friend_id
				ELSE user_id
			END AS friend_id
		FROM friends
		WHERE user_id = ? OR friend_id = ?
	) f ON u.id = f.friend_id
	JOIN stats s ON u.id = s.user_id

`);


	const friends = stmt.all(userId, userId, userId) || [];

	const stats = db.prepare(`
		SELECT * FROM stats WHERE user_id = ?
	`).get(userId) || {
		user_id: userId,
		wins: 0,
		loses: 0,
		tournamentWins: 0
	};

	const sentRequests = db.prepare(`
		SELECT r.id, r.type, r.status, u.username AS receiver_username, r.created_at
		FROM requests r
		JOIN users u ON r.receiver_id = u.id
		WHERE r.sender_id = ?
	`).all(userId);

	const receivedRequests = db.prepare(`
		SELECT r.id, r.type, r.status, u.username AS sender_username, r.created_at
		FROM requests r
		JOIN users u ON r.sender_id = u.id
		WHERE r.receiver_id = ?
	`).all(userId);

  	const response = {
		user,
		friends,
		stats,
		requests: {
		  sent: sentRequests,
		  received: receivedRequests
		}
  	};

	return reply.code(200).send(response);
};

exports.getAllUser = async (req, reply) => {
	try {
		const stmt = db.prepare('SELECT id, username, first_name, last_name, age, path, last_seen FROM users WHERE validated = 1');
		const users = stmt.all();

		reply.send(users);
	} catch (err) {
		console.error("DB error:", err);
		reply.status(500).send({ error: "DB Error" });
	}
}

exports.getImage = async (req, reply) => {
	const { filename } = req.query;

	if (!filename) {
		return reply.status(400).send('Kein Dateiname angegeben.');
	}

	const uploadsDir = path.join(__dirname, '../../../profile_images');
	const imagePath = path.join(uploadsDir, path.basename(filename));

	const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
	const ext = path.extname(filename).toLowerCase();
	if (!allowedExtensions.includes(ext)) {
		return reply.code(400).send('Nur Bilddateien sind erlaubt.');
	}

	try {
		await fs.promises.access(imagePath, fs.constants.F_OK);

		const mimeTypes = {
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.png': 'image/png',
			'.gif': 'image/gif',
		};
		const contentType = mimeTypes[ext] || 'application/octet-stream';

		reply.header('Content-Type', contentType);
		reply.header('Content-Disposition', `inline; filename="${filename}"`);
		return fs.createReadStream(imagePath);

	} catch (err) {
		console.error('Bild nicht gefunden:', imagePath);
		return reply.code(404).send('Bild nicht gefunden.');
	}
};


exports.getUserForProfile = async (req, reply) => {
	try {
		const { id } = req.query;
		const userId = getUserIdFromRequest(req);

		if (!id || !userId) {
			return reply.status(400).send({ error: "Missing id parameter" });
		}

		const friendCheckStmt = db.prepare(`
			SELECT 1
			FROM friends
			WHERE (user_id = ? AND friend_id = ?)
			   OR (user_id = ? AND friend_id = ?)
			LIMIT 1
		`);

		const isFriend = friendCheckStmt.get(userId, id, id, userId);

		if (!isFriend) {
			return reply.status(403).send({ error: "You are not friends with this user" });
		}

		const stmt = db.prepare(`
			SELECT username, first_name, last_name, age, path, last_seen
			FROM users
			WHERE id = ?
			LIMIT 1
		`);

		const user = stmt.get(id);

		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		reply.send(user);

	} catch (err) {
		console.error("DB error:", err);
		reply.status(500).send({ error: "DB Error" });
	}
};


// Chat

exports.getToken = async (req, reply) => {
	try {
		const token =
			req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

		if (!token) {
			return reply.code(401).send({ error: 'No token provided' });
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET);

		return { token };
	} catch (err) {
		req.log.error(err);
		return reply.code(401).send({ error: 'Invalid or expired token' });
	}
};

exports.getFriends = async (req, reply) => {
	const userId = req.user.id;
	const friends = db
		.prepare(
			`
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
	`
		)
		.all(userId);

	reply.send(friends);
};

exports.getMessages = async (req, reply) => {
	const userId = req.user.id;
	const { friendId } = req.params;

	const messages = db
		.prepare(
			`
		SELECT m.*, u.username as from_username
		FROM messages m
		JOIN users u ON u.id = m.sender_id
		WHERE (m.sender_id = ? AND m.receiver_id = ?)
		   OR (m.sender_id = ? AND m.receiver_id = ?)
		ORDER BY m.created_at ASC
	`
		)
		.all(userId, friendId, friendId, userId);

	reply.send(messages);
};

const stmtBlockedByFriend = db.prepare(`
  SELECT EXISTS(
	SELECT 1 FROM blocks
	WHERE blocker_id = ? AND blocked_id = ?
  ) AS blocked
`);

exports.getBlocked = async (req, reply) => {
	const userId = req.user?.id;
	if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

	const { friendId: friendIdRaw } = req.params;
	const friendId = Number(friendIdRaw);

	if (!Number.isInteger(friendId) || friendId <= 0) {
		return reply
			.code(400)
			.send({ error: 'friendId must be a positive integer' });
	}

	const row = stmtBlockedByFriend.get(friendId, userId);
	return reply.send({ blocked: !!row.blocked });
};

const stmtStatusByFriend = db.prepare(`
  SELECT COALESCE(
	(SELECT status FROM user_status WHERE user_id = ? LIMIT 1),
	0
  ) AS status
`);

exports.getStatus = async (req, reply) => {
	const userId = req.user?.id;
	if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

	const { friendId: friendIdRaw } = req.params;
	const friendId = Number(friendIdRaw);

	if (!Number.isInteger(friendId) || friendId <= 0) {
		return reply
			.code(400)
			.send({ error: 'friendId must be a positive integer' });
	}

	const row = stmtStatusByFriend.get(friendId);
	const statusNum = Number(row?.status) ? 1 : 0;

	return reply.send({ status: statusNum });
};

exports.getMatchHistory = async (req, reply) => {
	try {
		const { userId } = req.query;

		if (!userId || typeof userId !== 'string') {
			return reply.code(400).send({ error: 'Missing userId parameter' });
		}

		const userIdNum = Number(userId);
		if (!Number.isInteger(userIdNum)) {
			return reply.code(400).send({ error: "Invalid userId" });
		}

		const userMatches = db.prepare(`
			SELECT
				m.id AS match_id,
				m.type AS match_type,
				m.tournament_id,
				m.round,
				m.created_at AS match_date,
				t.name AS tournament_name
			FROM matches m
			LEFT JOIN tournaments t ON m.tournament_id = t.id
			JOIN match_players mp ON mp.match_id = m.id
			WHERE mp.user_id = ?
			ORDER BY m.created_at ASC
		`).all(userIdNum);

		const matchesWithPlayers = userMatches.map(match => {
			const players = db.prepare(`
				SELECT
					mp.user_id,
					u.username,
					mp.score,
					mp.rank
				FROM match_players mp
				JOIN users u ON mp.user_id = u.id
				WHERE mp.match_id = ?
			`).all(match.match_id);

			return {
				...match,
				players
			};
		});

		console.log(`📊 Match-History für userId ${userIdNum}:`, matchesWithPlayers);

		reply.code(200).send({ matchHistory: matchesWithPlayers });
	} catch (err) {
		console.error('Error fetching match history:', err);
		reply.code(500).send({ error: 'DB Error' });
	}
};

