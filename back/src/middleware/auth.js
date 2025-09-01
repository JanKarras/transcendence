const jwt = require('jsonwebtoken');
const logger = require('../logger/logger');
const JWT_SECRET = process.env.JWT_SECRET
const db = require("../db");

function updateLastSeen(userId) {
  db.prepare(`UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?`).run(userId);
}

async function authMiddleware(request, reply) {
  const token = request.cookies.auth_token;
  //logger.info(`Middleware: Checking token for user`);

  if (!token) {
    logger.warn(`Middleware: No token found for user`);
    return reply.redirect('/');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
    //logger.info(`Middleware: Token verified for user: ${decoded.id}`);

	updateLastSeen(decoded.id);

    const newToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '3h' });
    reply.setCookie('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 3 * 60 * 60
    });

  } catch (err) {
    logger.warn(`Middleware: Token verification failed: ${err.message}`);
    return reply.redirect('/');
  }
}

module.exports = authMiddleware;
