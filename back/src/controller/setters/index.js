const db = require("../../db");
require('dotenv').config();
const bcrypt = require('bcrypt');
const transporter = require("../../email")
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../../logger/logger');
const fs = require('fs');
const path = require('path');

async function hashPassword(password) {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

async function verifyPassword(password, hash) {
  const match = await bcrypt.compare(password, hash);
  return match;
}

async function sendMail(to, subject, text) {
  const info = await transporter.sendMail({
    from: '"Transcendence"',
    to,
    subject,
    text,
  });
  console.log('Email sent:', info.messageId);
}

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function insertValidationCode(userId) {
  const insertQuery = db.prepare('INSERT INTO validation_codes (user_id, code) VALUES (?, ?)');
  let retries = 5;

  while (retries > 0) {
    const code = generateSixDigitCode();
    try {
      insertQuery.run(userId, code);
      return code;
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        retries--;
        if (retries === 0) throw new Error('Failed to generate unique validation code');
      } else {
        throw err;
      }
    }
  }
}

exports.createUser = async (request, reply) => {
  const { username, email, password } = request.body;

  if (!username || !email || !password) {
    return reply.code(400).send({ error: 'Missing credentials: username, email and password are required.' });
  }

  try {
    const hashedPw = await hashPassword(password);

    const query = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');

    const info = query.run(username, email, hashedPw);

	const userId = info.lastInsertRowid;

	db.prepare('INSERT INTO stats (user_id, wins, loses, tournamentWins) VALUES (?, 0, 0, 0)').run(userId);

	const validationCode = await insertValidationCode(userId);

	const verificationLink = `https://localhost/#email_validation?email=${email}`;

	await sendMail(email, 'Your verification code', `Your verification code is: ${validationCode}\n\nClick here to confirm your email: ${verificationLink}`);

    return reply.code(201).send({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return reply.code(409).send({ error: 'Username or email already exists' });
    }
    return reply.code(500).send({ error: 'Database error' });
  }
};

exports.login = async (request, reply) => {
  const { username, password } = request.body;
  if (!username || !password) {
    return reply.code(400).send({ error: 'Missing credentials: username, password are required.' });
  }

  try {
	let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
	if (!user) {
		user = db.prepare('SELECT * FROM users WHERE email = ?').get(username);
	}

	if (!user) {
		return reply.code(401).send({ error: 'Invalid username or email.' });
	}

	if (user.validated == false) {
		return reply.code(403).send({ error: 'Account is not validated. Please confirm your email address.' });
	}

	const isValid = await verifyPassword(password, user.password);

	if (!isValid) {
		return reply.code(401).send({ error: 'Incorrect password.' });
	}

	const twoFaCode = await insertValidationCode(user.id);

	const verificationLink = `https://localhost/#two_fa?email=${encodeURIComponent(user.email)}`;

	await sendMail(user.email, 'Your 2FA code', `Your 2FA code is: ${twoFaCode}\n\nYou can confirm here: ${verificationLink}`);

	return reply.code(200).send({ message: '2FA code sent to your email.' });

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
    const user = db.prepare('SELECT id, validated FROM users WHERE email = ?').get(email);
    if (!user) {
      return reply.code(401).send({ error: 'Invalid email.' });
    }

    const validation = db.prepare(`
      SELECT code, created_at FROM validation_codes WHERE user_id = ?
    `).get(user.id);
    if (!validation) {
      return reply.code(404).send({ error: 'No validation code found for this user.' });
    }

    const TEN_MINUTES = 10 * 60 * 1000;
    const createdAt = new Date(validation.created_at);
    const now = new Date();

    if (now - createdAt > TEN_MINUTES) {

		db.prepare('DELETE FROM validation_codes WHERE user_id = ?').run(user.id);

      	const validationCode = await insertValidationCode(user.id);

		const verificationLink = `https://localhost/#email_validation?email=${email}`;

		await sendMail(email, 'Your verification code', `Your verification code is: ${validationCode}\n\nClick here to confirm your email: ${verificationLink}`);

		return reply.code(410).send({ error: 'Validation code expired. A new code has been generated and sent to your email.' });
    }

    if (validation.code !== code) {
      return reply.code(401).send({ error: 'Invalid validation code.' });
    }

    db.prepare('DELETE FROM validation_codes WHERE user_id = ?').run(user.id);

    db.prepare('UPDATE users SET validated = 1 WHERE id = ?').run(user.id);

    return reply.code(200).send({ message: 'Email successfully validated.' });
  } catch (err) {
    return reply.code(500).send({ error: 'Database error' });
  }
};


exports.two_fa_api = async (request, reply) => {
  const { email, code } = request.body;

  if (!email || !code) {
    return reply.code(400).send({ error: 'Missing credentials: email/username and code are required.' });
  }

  try {
    // Suche den User per Email oder Username
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE username = ?').get(email);
    }

    if (!user) {
      return reply.code(401).send({ error: 'Invalid email or username.' });
    }

    const validation = db.prepare('SELECT code, created_at FROM validation_codes WHERE user_id = ?').get(user.id);

    if (!validation) {
      return reply.code(404).send({ error: 'No validation code found for this user.' });
    }

    const TEN_MINUTES = 10 * 60 * 1000;
    const createdAt = new Date(validation.created_at);
    const now = new Date();

    if (now - createdAt > TEN_MINUTES) {
      // Alten Code löschen
      db.prepare('DELETE FROM validation_codes WHERE user_id = ?').run(user.id);

      // Neuen Code erstellen
      const newCode = await insertValidationCode(user.id);

      const verificationLink = `https://localhost/#two_fa?email=${encodeURIComponent(email)}`;

      // Neue Mail senden
      await sendMail(user.email, 'Your new 2FA code', `Your new 2FA code is: ${newCode}\n\nYou can confirm here: ${verificationLink}`);

      return reply.code(410).send({ error: 'Validation code expired. A new code has been generated and sent to your email.' });
    }

    if (validation.code !== code) {
      return reply.code(401).send({ error: 'Invalid validation code.' });
    }

    // Code korrekt → JWT-Token erstellen und Cookie setzen
    db.prepare('DELETE FROM validation_codes WHERE user_id = ?').run(user.id);

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    reply.setCookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600
    });

    return reply.code(200).send({ message: 'Login successful' });

  } catch (err) {
    console.error(err);
    return reply.code(500).send({ error: 'Database error' });
  }
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

exports.updateUser = async function (req, reply) {
	const parts = req.parts();

	let username = null;
	let first_name = null;
	let last_name = null;
	let age = null;

	let imageName = null;

	for await (const part of parts) {

		if (part.file) {
			const buffer = await part.toBuffer();

			if (buffer.length > MAX_IMAGE_SIZE) {
				return reply
					.code(400)
					.send({ success: false, error: "Image to large. Max 5 MB" });
			}

			if (part.filename) {
				const uploadsDir = path.join(__dirname, '../../../profile_images');
				if (!fs.existsSync(uploadsDir)) {
					fs.mkdirSync(uploadsDir, { recursive: true });
				}

				const extension = path.extname(part.filename);
				const uniqueFilename = `${Date.now()}${extension}`;
				const fullPath = path.join(uploadsDir, uniqueFilename);

				fs.writeFileSync(fullPath, buffer);

				imageName = uniqueFilename;
			}
		} else {
			if (part.fieldname === "username") {
				username = part.value;
			} else if (part.fieldname === "first_name") {
				first_name = part.value;
			} else if (part.fieldname === "last_name") {
				last_name = part.value;
			} else if (part.fieldname === "age") {
				age = part.value;
			}
		}
	}

	let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

	if (username) {
		if (first_name) {
			db.prepare('UPDATE users SET first_name = ? WHERE username = ?').run(first_name, username);
		}
		if (last_name) {
			db.prepare('UPDATE users SET last_name = ? WHERE username = ?').run(last_name, username);
		}
		if (age) {
			db.prepare('UPDATE users SET age = ? WHERE username = ?').run(age, username);
		}
		if (imageName) {
			db.prepare('UPDATE users SET path = ? WHERE username = ?').run(imageName, username);
		}
	} else {
		return reply.code(400).send({ success: false, error: "No Username was send to the server" });
	}

	reply.send({ success: true });
};



exports.sendFriendRequest = async function (req, reply) {
	try {
		const token = req.cookies.auth_token;
		if (!token) {
			return reply.code(401).send({ success: false, error: "Not authenticated" });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return reply.code(403).send({ success: false, error: "Invalid token" });
		}

		const senderId = decoded.id;

		const { username } = req.body;

		if (!username) {
			return reply.code(400).send({ success: false, error: "Missing username in request body" });
		}

		const receiver = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
		if (!receiver) {
			return reply.code(404).send({ success: false, error: "User not found" });
		}

		if (receiver.id === senderId) {
			return reply.code(400).send({ success: false, error: "You cannot send a request to yourself" });
		}

		const existingRequest = db.prepare(`
			SELECT * FROM requests
			WHERE sender_id = ? AND receiver_id = ? AND type = 'friend'
		`).get(senderId, receiver.id);

		if (existingRequest) {
			return reply.code(409).send({ success: false, error: "Friend request already sent" });
		}

		db.prepare(`
			INSERT INTO requests (sender_id, receiver_id, type)
			VALUES (?, ?, 'friend')
		`).run(senderId, receiver.id);

		return reply.code(201).send({ success: true, message: "Friend request sent" });

	} catch (err) {
		console.error(err);
		return reply.code(500).send({ success: false, error: "Internal server error" });
	}
};

exports.handleAcceptRequest = async function (req, reply) {
	const { id } = req.body;

	if (!id) {
		return reply.code(400).send({ error: "Request ID missing" });
	}

	try {
		const transaction = db.transaction(() => {
			const request = db.prepare('SELECT sender_id, receiver_id, status FROM requests WHERE id = ?').get(id);
			if (!request) {
				throw new Error("Request not found");
			}
			if (request.status === "accepted") {
				return "already_accepted";
			}

			db.prepare('UPDATE requests SET status = ? WHERE id = ?').run("accepted", id);

			const insertFriend = db.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)');

			insertFriend.run(request.sender_id, request.receiver_id);
			insertFriend.run(request.receiver_id, request.sender_id);

			return "success";
		});

		const result = transaction();

		if (result === "already_accepted") {
			return reply.code(409).send({ error: "Request already accepted" });
		}

		return reply.code(200).send({ success: true });
	} catch (err) {
		if (err.message === "Request not found") {
			return reply.code(404).send({ error: err.message });
		}
		return reply.code(500).send({ error: "Database error" });
	}
};


exports.handleDeclineRequest = async function (req, reply) {
	const { id } = req.body;

	if (!id) {
		return reply.code(400).send({ error: "Request ID missing" });
	}

	try {
		const result = db.prepare('UPDATE requests SET status = ? WHERE id = ?').run("declined", id);

		if (result.changes === 0) {
			return reply.code(404).send({ error: "Request not found" });
		}

		return reply.code(200).send({ success: true });
	} catch (err) {
		return reply.code(500).send({ error: "Database error" });
	}
};

exports.removeFriend = async function (req, reply) {
	const { friendUsername } = req.body;
	if (!friendUsername) {
		return reply.code(400).send({ error: "friendUsername fehlt" });
	}

	const userId = req.user && req.user.id;
	if (!userId) {
		return reply.code(401).send({ error: "Nicht eingeloggt" });
	}

	try {
		const friend = db.prepare('SELECT id FROM users WHERE username = ?').get(friendUsername);
		if (!friend) {
			return reply.code(404).send({ error: "Freund nicht gefunden" });
		}
		const friendId = friend.id;

		const deleteFriendsStmt = db.prepare(`
			DELETE FROM friends
			WHERE (user_id = ? AND friend_id = ?)
			OR (user_id = ? AND friend_id = ?)
		`);
		const friendsResult = deleteFriendsStmt.run(userId, friendId, friendId, userId);

		if (friendsResult.changes === 0) {
			return reply.code(404).send({ error: "Freundschaft nicht gefunden" });
		}

		const deleteRequestsStmt = db.prepare(`
			DELETE FROM requests
			WHERE (sender_id = ? AND receiver_id = ?)
			OR (sender_id = ? AND receiver_id = ?)
		`);
		deleteRequestsStmt.run(userId, friendId, friendId, userId);

		return reply.code(200).send({ success: true });
	} catch (err) {
		console.error(err);
		return reply.code(500).send({ error: "Datenbankfehler" });
	}
};


