const transporter = require("../email")
const verificationCodeService = require("./verificationCodeService");

async function sendMail(to, subject, text) {
    const info = await transporter.sendMail({
        from: '"Transcendence"',
        to,
        subject,
        text,
    });
    console.log('Email sent:', info.messageId);
}

async function sendEmailValidationMail(userId, email) {
    const verificationCode = await verificationCodeService.insertVerificationCode(userId);
    const verificationLink = `https://localhost/#email_validation?email=${encodeURIComponent(email)}`;

    await sendMail(
        email,
        'Your verification code',
        `Your verification code is: ${verificationCode}\n\nClick here to confirm your email: ${verificationLink}`
    );
}

async function sendTwoFAMail(userId, email) {
    const twoFaCode = await verificationCodeService.insertVerificationCode(userId);
    const verificationLink = `https://localhost/#two_fa?email=${encodeURIComponent(email)}`;

    await sendMail(
        email,
        'Your 2FA code',
        `Your 2FA code is: ${twoFaCode}\n\nYou can confirm here: ${verificationLink}`
    );
}

module.exports = {
    sendMail,
    sendEmailValidationMail,
    sendTwoFAMail,
}