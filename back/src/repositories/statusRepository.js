const db = require("../db");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function getStatusByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getStatusByUserId: invalid userId", { userId });
		return { status: 0 };
	}

	return safeDBExecute(() => {
		const row = db.prepare(`
			SELECT COALESCE(
				(SELECT status FROM user_status WHERE user_id = ? LIMIT 1),
				0
			) AS status
		`).get(userId);

		return row || { status: 0 };
	}, { userId }, { status: 0 });
}

module.exports = {
	getStatusByUserId
}
