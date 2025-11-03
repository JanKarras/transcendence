const db = require("../db");
const { isInvalid } = require("../services/isValidService");

function getUserById(userId) {
	return db.prepare(`
		SELECT username, path
		FROM users
		WHERE id = ?
	`).get(userId);
}

module.exports = {
	getUserById
};
