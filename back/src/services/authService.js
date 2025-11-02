const {TEN_MINUTES} = require("../constants/constants");
const verificationCodeRepository = require("../repositories/verificationCodeRepository");
const mailService = require("./mailService");
const { authenticator } = require('otplib');

async function isVerificationCodeExpired(verification, user) {
	const createdAt = new Date(verification.created_at);
	const now = new Date();

	if (now - createdAt > TEN_MINUTES) {
		await verificationCodeRepository.deleteVerificationCodeByUserId(user.id);
		await mailService.sendTwoFAMail(user.id, user.email);
		return true;
	}
	return false;
}

function verifyAuthAppCode(user, code) {
	if (!user.twofa_secret) return { success: false, error: 'No 2FA secret set.' };

	const isValid = authenticator.check(code, user.twofa_secret);
	return isValid ? { success: true } : { success: false, error: 'Invalid authenticator code.' };
}

module.exports = {
	isVerificationCodeExpired,
	verifyAuthAppCode
}
