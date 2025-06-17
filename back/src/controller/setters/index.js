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

exports.createUser = async (request, reply) => {
  const { username, email, password } = request.body;

  if (!username || !email || !password) {
    return reply.code(400).send({ error: 'Missing credentials: username, email and password are required.' });
  }

  try {
    const hashedPw = await hashPassword(password);

    const query = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');

    query.run(username, email, hashedPw);

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

