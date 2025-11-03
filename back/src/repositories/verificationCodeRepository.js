const db = require("../db");
const { isInvalid } = require("../services/isValidService");
const { safeDBExecute } = require("../services/safeDBExecute");

function addVerificationCode(userId, code) {
	if (isInvalid(userId, code)) {
		console.error("❌ addVerificationCode: invalid params", { userId, code });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			INSERT INTO verification_codes (user_id, code)
			VALUES (?, ?)
		`).run(userId, code);
	}, { userId, code }, null);
}

function getLastVerificationCodeByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getLastVerificationCodeByUserId: invalid userId", { userId });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT created_at
			FROM verification_codes
			WHERE user_id = ?
			ORDER BY created_at DESC
			LIMIT 1
		`).get(userId);
	}, { userId }, null);
}

function getVerificationCodeByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ getVerificationCodeByUserId: invalid userId", { userId });
		return null;
	}
	return safeDBExecute(() => {
		return db.prepare(`
			SELECT code, created_at
			FROM verification_codes
			WHERE user_id = ?
		`).get(userId);
	}, { userId }, null);
}

function deleteVerificationCodeByUserId(userId) {
	if (isInvalid(userId)) {
		console.error("❌ deleteVerificationCodeByUserId: invalid userId", { userId });
		return;
	}
	safeDBExecute(() => {
		db.prepare(`
			DELETE FROM verification_codes
			WHERE user_id = ?
		`).run(userId);
	}, { userId });
}

module.exports = {
	addVerificationCode,
	getLastVerificationCodeByUserId,
	deleteVerificationCodeByUserId,
	getVerificationCodeByUserId,
}
