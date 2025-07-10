const db = require("../../db");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../../logger/logger');

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
	SELECT
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
		SELECT
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

		//console.log(res)

	const friends = stmt.all(userId, userId, userId) || [];

	const stats = db.prepare(`
		SELECT * FROM stats WHERE user_id = ?
	`).get(userId) || {
		user_id: userId,
		wins: 0,
		loses: 0,
		tournamentWins: 0
	};

	const response = {
		user,
		friends,
		stats
	};

	//console.log(response)

	return reply.code(200).send(response);
};
