const {TEN_MINUTES} = require("../constants/constants");
const verificationCodeRepository = require("../repositories/verificationCodeRepository");
const mailService = require("./mailService");


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

module.exports = {
    isVerificationCodeExpired,
}