const passwordUtil = require("../utils/passwordUtil");
const mailService = require("../services/mailService");
const userService = require("../services/userService");
const authService = require("../services/authService");
const verificationCodeRepository = require("../repositories/verificationCodeRepository");
const { MIN_INTERVAL, TEN_MINUTES } = require('../constants/constants');
const userRepository = require("../repositories/userRepository");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../logger/logger');

exports.is_logged_in = async (req, reply) => {
    reply.code(200).send({ loggedIn: true });
};

exports.getToken = async (req, reply) => {
    try {
        const token =
            req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return reply.code(401).send({ error: 'No token provided' });
        }

        const payload = jwt.verify(token, JWT_SECRET);

        return { token };
    } catch (err) {
        req.log.error(err);
        return reply.code(401).send({ error: 'Invalid or expired token' });
    }
};

exports.login = async (request, reply) => {
    const { username, password } = request.body;
    if (!username || !password) {
        return reply.code(400).send({ error: 'Missing credentials: username, password are required.' });
    }

    try {
        const user = await userService.getUserByEmailOrUsername(username);
        if (!user) {
            return reply.code(401).send({ error: 'Invalid username or email.' });
        }

        if (user.validated === false) {
            return reply.code(403).send({ error: 'Account is not validated. Please confirm your email address.' });
        }

        const isValid = await passwordUtil.verifyPassword(password, user.password);
        if (!isValid) {
            return reply.code(401).send({ error: 'Invalid username or email.' });
        }
		if (user.twofa_active) {
			if (user.twofa_method === 'email') {
				const lastCode = await verificationCodeRepository.getLastVerificationCodeByUserId(user.id);
				if (lastCode) {
					const lastSent = new Date(lastCode.created_at).getTime();
					const now = Date.now();
					if (now - lastSent < MIN_INTERVAL) {
						return reply.code(429).send({ error: 'Please wait before requesting another 2FA code.' });
					}
				}

				await mailService.sendTwoFAMail(user.id, user.email);

				return reply.code(200).send({
					success: true,
					requires2fa: true,
					method: 'email',
					message: '2FA code sent to your email.'
				});
			} else {
				return reply.code(200).send({
					success: true,
					requires2fa: true,
					method: 'authapp',
					message: 'Enter code from Authenticator app.'
				});
			}
		} else {
			const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

			reply.setCookie('auth_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				path: '/',
				maxAge: 3600
			});

			return reply.code(200).send({
				success: true,
				requires2fa: false,
				message: 'Login successful'
			});
		}
    } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Database error' });
    }
};

exports.logout = async (request, reply) => {
    try {
        reply.clearCookie('auth_token', {
            path: '/',
        });

        return reply.code(200).send({ message: 'Logout successful' });
    } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Logout failed' });
    }
};

exports.emailValidation = async (request, reply) => {
    const { email, code } = request.body;
    if (!email || !code) {
        return reply.code(400).send({ error: 'Missing credentials: email and code are required.' });
    }

    try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return reply.code(401).send({ error: 'Invalid email.' });
        }

        const verification = await verificationCodeRepository.getVerificationCodeByUserId(user.id);
        if (!verification) {
            return reply.code(404).send({ error: 'No validation code found for this user.' });
        }

        if (await authService.isVerificationCodeExpired(verification, user)) {
            return reply.code(410)
                .send({ error: 'Verification code expired. A new code has been generated and sent to your email.' });
        }

        if (verification.code !== code) {
            return reply.code(401).send({ error: 'Invalid verification code.' });
        }

        await verificationCodeRepository.deleteVerificationCodeByUserId(user.id);
        await userRepository.updateUserAfterValidation(user.id);

        return reply.code(200).send({ message: 'Email successfully validated.' });
    } catch (err) {
        return reply.code(500).send({ error: 'Database error' });
    }
};

exports.two_fa_api = async (request, reply) => {
    const { email, code, method } = request.body;
    if (!email || !code || !method || !['email','authapp'].includes(method)) {
        return reply.code(400).send({ success: false, error: 'Missing or invalid credentials: email, code, and method are required.' });
    }

    try {
        const user = await userService.getUserByEmailOrUsername(email);
        if (!user) return reply.code(401).send({ success: false, error: 'Invalid email or username.' });

        if (method === 'email') {
            const verification = await verificationCodeRepository.getVerificationCodeByUserId(user.id);
            if (!verification) return reply.code(404).send({ success: false, error: 'No verification code found.' });

            if (await authService.isVerificationCodeExpired(verification, user)) {
                return reply.code(410).send({ success: false, error: 'Verification code expired. A new code has been sent.' });
            }

            if (verification.code !== code) {
                return reply.code(401).send({ success: false, error: 'Invalid verification code.' });
            }

            await verificationCodeRepository.deleteVerificationCodeByUserId(user.id);

        } else if (method === 'authapp') {
            const result = await authService.verifyAuthAppCode(user, code);
            if (!result.success) return reply.code(401).send({ success: false, error: result.error });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        reply.setCookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 3600
        });

        return reply.code(200).send({ success: true, message: 'Login successful' });

    } catch (err) {
        console.error(err);
        return reply.code(500).send({ success: false, error: 'Database error' });
    }
};
