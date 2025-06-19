const db = require("../../db");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../../logger/logger');


exports.is_logged_in = async (req, reply) => {
	reply.code(200).send({ loggedIn: true });
};
