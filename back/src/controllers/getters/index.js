const db = require("../../db");
const userUtil = require("../../utils/userUtil");
const userRepository = require("../../repositories/userRepository");
const statsRepository = require("../../repositories/statsRepository");
const requestRepository = require("../../repositories/requestRepository");
const messageRepository = require("../../repositories/messageRepository");
const matchService = require("../../services/matchService");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../../logger/logger');
const fs = require('fs');
const path = require('path');

exports.is_logged_in = async (req, reply) => {
	reply.code(200).send({ loggedIn: true });
};

exports.getUser = async (req, reply) => {
    try {
        const userId = userUtil.getUserIdFromRequest(req);
        const user = await userRepository.getUserById(userId);
        if (!user) {
            return reply.code(401).send({ error: 'Unknown user is logged in' });
        }

        const [
            friends,
            stats,
            sentRequests,
            receivedRequests
        ] = await Promise.all([
            userRepository.getFriendsInfoByUserId(userId),
            statsRepository.getStatsByUserId(userId),
            requestRepository.getSentRequestsByUserId(userId),
            requestRepository.getReceivedRequestsByUserId(userId)
        ]);

        const response = {
            user,
            friends,
            stats,
            requests: {
                sent: sentRequests,
                received: receivedRequests
            }
        };

        return reply.code(200).send(response);
    } catch (err) {
        console.error("DB error:", err);
        return reply.code(500).send({ error: "DB error" });
    }
};

exports.getAllUser = async (req, reply) => {
	try {
		const users = userRepository.getAllUsers();
		reply.send(users);
	} catch (err) {
		console.error("DB error:", err);
		reply.code(500).send({ error: "DB Error" });
	}
}

exports.getImage = async (req, reply) => {
	const { filename } = req.query;

	if (!filename) {
		return reply.code(400).send('No file name provided.');
	}

	const uploadsDir = path.join(__dirname, '../../../profile_images');
	const imagePath = path.join(uploadsDir, path.basename(filename));
	const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
	const ext = path.extname(filename).toLowerCase();
	if (!allowedExtensions.includes(ext)) {
		return reply.code(400).send('Only image files are allowed.');
	}

	try {
		await fs.promises.access(imagePath, fs.constants.F_OK);

		const mimeTypes = {
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.png': 'image/png',
			'.gif': 'image/gif',
		};
		const contentType = mimeTypes[ext] || 'application/octet-stream';

		reply.header('Content-Type', contentType);
		reply.header('Content-Disposition', `inline; filename="${filename}"`);
		return fs.createReadStream(imagePath);

	} catch (err) {
		console.error('Image not found:', imagePath);
		return reply.code(404).send('Image not found.');
	}
};

exports.getUserForProfile = async (req, reply) => {
	try {
		const { id } = req.query;
		const userId = await userUtil.getUserIdFromRequest(req);
		if (!id || !userId) {
			return reply.code(400).send({ error: "Id parameter is missing" });
		}

		if (!await userRepository.isFriend(userId, id)) {
			return reply.code(403).send({ error: "You are not friends with this user" });
		}

		const user = await userRepository.getUserById(id);
		if (!user) {
			return reply.code(404).send({ error: "User not found" });
		}

		reply.send(user);
	} catch (err) {
		console.error("DB error:", err);
		reply.code(500).send({ error: "DB Error" });
	}
};

exports.getToken = async (req, reply) => {
	try {
		const token =
			req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

		if (!token) {
			return reply.code(401).send({ error: 'No token provided' });
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET);

		return { token };
	} catch (err) {
		req.log.error(err);
		return reply.code(401).send({ error: 'Invalid or expired token' });
	}
};

exports.getFriends = async (req, reply) => {
	const userId = req.user.id;
	const friends = await userRepository.getFriends(userId);
	reply.send(friends);
};

exports.getMessages = async (req, reply) => {
	const userId = req.user.id;
	const { friendId } = req.params;
	const messages = await messageRepository.getMessagesByUserIdAndFriendId(userId, friendId);
	reply.send(messages);
};

const stmtBlockedByFriend = db.prepare(`
  SELECT EXISTS(
	SELECT 1 FROM blocks
	WHERE blocker_id = ? AND blocked_id = ?
  ) AS blocked
`);

exports.getBlocked = async (req, reply) => {
	const userId = req.user?.id;
	if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

	const { friendId: friendIdRaw } = req.params;
	const friendId = Number(friendIdRaw);

	if (!Number.isInteger(friendId) || friendId <= 0) {
		return reply
			.code(400)
			.send({ error: 'friendId must be a positive integer' });
	}

	const row = stmtBlockedByFriend.get(friendId, userId);
	return reply.send({ blocked: !!row.blocked });
};

const stmtStatusByFriend = db.prepare(`
  SELECT COALESCE(
	(SELECT status FROM user_status WHERE user_id = ? LIMIT 1),
	0
  ) AS status
`);

exports.getStatus = async (req, reply) => {
	const userId = req.user?.id;
	if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

	const { friendId: friendIdRaw } = req.params;
	const friendId = Number(friendIdRaw);

	if (!Number.isInteger(friendId) || friendId <= 0) {
		return reply
			.code(400)
			.send({ error: 'friendId must be a positive integer' });
	}

	const row = stmtStatusByFriend.get(friendId);
	const statusNum = Number(row?.status) ? 1 : 0;

	return reply.send({ status: statusNum });
};

exports.getMatchHistory = async (req, reply) => {
	try {
		const { userId } = req.query;

		if (!userId || typeof userId !== 'string') {
			return reply.code(400).send({ error: 'Missing userId parameter' });
		}

		const userIdNum = Number(userId);
		if (!Number.isInteger(userIdNum)) {
			return reply.code(400).send({ error: "Invalid userId" });
		}

		const matchesWithPlayers = matchService.getMatchesWithPlayersByUserId(userId);

		console.log(`📊 Match-History für userId ${userIdNum}:`, matchesWithPlayers);

		reply.code(200).send({ matchHistory: matchesWithPlayers });
	} catch (err) {
		console.error('Error fetching match history:', err);
		reply.code(500).send({ error: 'DB Error' });
	}
};

