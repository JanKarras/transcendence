const db = require("../db");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function getUserById(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getUserById: userId invalid", { userId });
		return null;
	}

	safeDBExecute(() => {
		return db.prepare(`
			SELECT username, path
			FROM users
			WHERE id = ?
		`).get(userId);
	}, { userId });
}

module.exports = {
	getUserById
};
