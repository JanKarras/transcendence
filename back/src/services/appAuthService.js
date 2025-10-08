const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const userRepository = require('../repositories/userRepository');

async function generateTwoFaSecret(userId) {
    const secret = authenticator.generateSecret();
    await userRepository.saveTwoFaSecret(userId, secret);
    const otpAuthUrl = authenticator.keyuri(`${userId}@Pong Trouble`, 'Pong Trouble', secret);

    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    return { secret, qrCodeDataUrl };
}

module.exports = {
    generateTwoFaSecret
};
