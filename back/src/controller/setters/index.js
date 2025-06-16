const Database = require('better-sqlite3');
const path = require('path');

exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing credentials: username, email and password are required.' });
  }



  res.status(201).json({ message: 'User created successfully' });
};

