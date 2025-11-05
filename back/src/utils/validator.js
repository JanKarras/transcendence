const validator = require('validator');

const MAX_NAME_LEN = 64;

function sanitizeTextInput(raw, opts = {}) {
	if (typeof raw !== 'string') return null;
	let s = raw.trim();

	if (opts.maxLength && s.length > opts.maxLength) {
		s = s.slice(0, opts.maxLength);
	}

	s = s.replace(/[\u0000-\u001F\u007F]/g, '');

	s = validator.escape(s);

	if (opts.whitelistRegex && !opts.whitelistRegex.test(s)) {
		return null;
	}

	return s;
}

function sanitizeTwoFaMethod(raw) {
	if (!raw || typeof raw !== 'string') return null;
	const allowed = ['app', 'email', 'sms', 'none'];
	if (allowed.includes(raw)) return raw;
	return null;
}

function sanitizeAge(raw) {
	if (raw === null || raw === undefined) return null;
	if (typeof raw === 'number') return raw;
	if (typeof raw !== 'string') return null;
	const val = raw.trim();
	if (val === '') return null;
	if (!/^\d+$/.test(val)) return null;
	const n = parseInt(val, 10);
	if (n < 0 || n > 150) return null;
	return n;
}

function validateFriendId(friendId) {
	return Number.isInteger(friendId) && friendId > 0;
}

function validateUserInput(username, email, password) {
	const errors = [];

	if (!username || !email || !password) {
		errors.push('Missing credentials: username, email and password are required.');
		return { valid: false, errors };
	}

	if (!validator.isEmail(email)) {
		errors.push('Invalid email address.');
	} else {
		email = validator.normalizeEmail(email);
	}

	const sanitizedUsername = sanitizeTextInput(username, {
		maxLength: MAX_NAME_LEN,
		whitelistRegex: /^[A-Za-z0-9_.-]+$/,
	});

	if (!sanitizedUsername) {
		errors.push('Invalid username. Only letters, numbers, and ._- are allowed.');
	} else if (sanitizedUsername.length < 3) {
		errors.push('Username must be at least 3 characters long.');
	}

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long.');
	}
	if (password.length > 256) {
		errors.push('Password too long.');
	}

	if (errors.length > 0) {
		return { valid: false, errors };
	}

	return {
		valid: true,
		errors: [],
		username: sanitizedUsername,
		email,
		password,
	};
}


module.exports = {
	sanitizeTextInput,
	sanitizeTwoFaMethod,
	sanitizeAge,
	MAX_NAME_LEN,
	validateFriendId,
	validateUserInput
};
