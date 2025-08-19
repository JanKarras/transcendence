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

	const tmp = db.prepare(`SELECT * FROM friends`);

	const res = tmp.all();

	console.log(res)

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

	console.log(response)

	return reply.code(200).send(response);
};

exports.getAllUser = async (req, reply) => {
	try {
		const stmt = db.prepare('SELECT id, username, first_name, last_name, age, path, last_seen FROM users WHERE validated = 1');
		const users = stmt.all();

		console.log(users);
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
	const imagePath = path.join(uploadsDir, filename);

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


