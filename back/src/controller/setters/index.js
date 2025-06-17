const db = require("../../db");
const bcrypt = require('bcrypt');
const transporter = require("../../email")

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

	const validationCode = await insertValidationCode(userId);

	const verificationLink = `https://localhost/email_validation?email=${email}`;

	await sendMail(email, 'Your verification code', `Your verification code is: ${validationCode}\n\nClick here to confirm your email: ${verificationLink}`);

    return reply.code(201).send({ message: 'User created successfully' });
  } catch (err) {
	console.log(err.code);
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

	return reply.code(200).send({ message: 'Login successful' });
  } catch (err) {
    return reply.code(500).send({ error: 'Database error' });
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
      return reply.code(410).send({ error: 'Validation code expired.' });
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


