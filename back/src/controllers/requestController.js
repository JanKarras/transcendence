const userRepository = require("../repositories/userRepository");
const requestRepository = require("../repositories/requestRepository");
const userUtil = require("../utils/userUtil");
const db = require("../db");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.sendFriendRequest = async function (req, reply) {
	try {
		const token = req.cookies.auth_token;
		if (!token) {
			return reply.code(401).send({ success: false, error: "Not authenticated" });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, JWT_SECRET);
		} catch (err) {
			return reply.code(403).send({ success: false, error: "Invalid token" });
		}

		const senderId = decoded.id;
		const { username } = req.body;

		if (!username) {
			return reply.code(400).send({ success: false, error: "Missing username in request body" });
		}

		const receiver = await userRepository.getUserIdByUsername(username);
		if (!receiver) {
			return reply.code(404).send({ success: false, error: "User not found" });
		}

		if (receiver.id === senderId) {
			return reply.code(400).send({ success: false, error: "You cannot send a request to yourself" });
		}

		const existingRequest = await requestRepository.doesFriendRequestExist(senderId, receiver.id);
		if (existingRequest) {
			return reply.code(409).send({ success: false, error: "Friend request already sent" });
		}

		await requestRepository.addFriendRequest(senderId, receiver.id);
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

	const userId = userUtil.getUserIdFromRequest(req);
	if (!userId) {
		return reply.code(401).send({ error: "Not authenticated" });
	}

	try {
		const request = requestRepository.getRequestById(id);
		if (!request) {
			return reply.code(404).send({ error: "Request not found" });
		}

		if (request.receiver_id !== userId) {
			return reply.code(403).send({ error: "You are not allowed to accept this request" });
		}

		if (request.status === "accepted") {
			return reply.code(409).send({ error: "Request already accepted" });
		}
		const transaction = db.transaction(() => {
			requestRepository.updateRequestStatusById("accepted", id);
			userRepository.addFriend(request.sender_id, request.receiver_id);
		});

		transaction();

		return reply.code(200).send({ success: true });
	} catch (err) {
		console.error(err);
		return reply.code(500).send({ error: "Database error" });
	}
};

exports.handleDeclineRequest = async function (req, reply) {
	const { id } = req.body;

	if (!id) {
		return reply.code(400).send({ error: "Request ID missing" });
	}

	const userId = userUtil.getUserIdFromRequest(req);
	if (!userId) {
		return reply.code(401).send({ error: "Not authenticated" });
	}
	try {
		const request = requestRepository.getRequestById(id);
		if (!request) {
			return reply.code(404).send({ error: "Request not found" });
		}

		if (request.sender_id !== userId && request.receiver_id !== userId) {
			return reply.code(403).send({ error: "Not authorized to decline this request" });
		}

		if (["declined", "accepted"].includes(request.status)) {
			return reply.code(409).send({ error: `Request already ${request.status}` });
		}

		requestRepository.updateRequestStatusById("declined", id);

		return reply.code(200).send({ success: true });
	} catch (err) {
		return reply.code(500).send({ error: "Database error" });
	}
};
