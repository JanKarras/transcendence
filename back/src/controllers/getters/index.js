require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../../logger/logger');

exports.is_logged_in = async (req, reply) => {
	reply.code(200).send({ loggedIn: true });
};

exports.getToken = async (req, reply) => {
	try {
		const token =
			req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

		if (!token) {
			return reply.code(401).send({ error: 'No token provided' });
		}

		const payload = jwt.verify(token, JWT_SECRET);

		return { token };
	} catch (err) {
		req.log.error(err);
		return reply.code(401).send({ error: 'Invalid or expired token' });
	}
};
