const db = require("../db");
const verificationCodeRepository = require("../repositories/verificationCodeRepository");

function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function insertVerificationCode(userId) {
    let retries = 5;

    while (retries > 0) {
        const code = generateSixDigitCode();
        try {
            await verificationCodeRepository.addVerificationCode(userId, code);
            return code;
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                retries--;
                if (retries === 0) {
                    throw new Error('Failed to generate unique validation code');
                }
            } else {
                throw err;
            }
        }
    }
}

module.exports = {
    insertVerificationCode,
}