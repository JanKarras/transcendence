const db = require("../db");

function addVerificationCode(userId, code) {
    return db.prepare(`
        INSERT INTO verification_codes (user_id, code) VALUES (?, ?)
    `).run(userId, code);
}

function getLastVerificationCodeByUserId(userId) {
    return db.prepare(`
		SELECT created_at
		FROM verification_codes
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT 1
	`).get(userId);
}

function getVerificationCodeByUserId(userId) {
    return db.prepare(`
        SELECT code, created_at FROM verification_codes WHERE user_id = ?
    `).get(userId);
}

function deleteVerificationCodeByUserId(userId) {
    db.prepare('DELETE FROM verification_codes WHERE user_id = ?').run(userId);
}

module.exports = {
    addVerificationCode,
    getLastVerificationCodeByUserId,
    deleteVerificationCodeByUserId,
    getVerificationCodeByUserId,
}