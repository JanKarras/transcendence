const userUtil = require("../utils/userUtil");
const passwordUtil = require("../utils/passwordUtil");
const mailService = require("../services/mailService");
const userRepository = require("../repositories/userRepository");
const statsRepository = require("../repositories/statsRepository");
const requestRepository = require("../repositories/requestRepository");
const twoFaService = require("../services/appAuthService");
const validatorUtil = require("../utils/validator");
const validator = require("validator");
const {MAX_IMAGE_SIZE, NAME_REGEX} = require("../constants/constants");
const userService = require("../services/userService");
const logger = require('../logger/logger');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const sharp = require('sharp');

require('dotenv').config();

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

exports.getFriends = async (req, reply) => {
	const userId = req.user.id;
	const friends = await userRepository.getFriends(userId);
	reply.send(friends);
};

exports.getBlocked = async (req, reply) => {
	const userId = req.user?.id;
	if (!userId) {
		return reply.code(401).send({ error: 'Unauthorized' });
	}

	const { friendId: friendIdRaw } = req.params;
	const friendId = Number(friendIdRaw);
	if (!validatorUtil.validateFriendId(friendId)) {
		return reply.code(400).send({ error: 'friendId must be a positive integer' });
	}

	const row = await userRepository.isUserBlockedByFriend(friendId, userId);
	return reply.send({ blocked: row.blocked });
};

exports.createUser = async (request, reply) => {
	const { username, email, password } = request.body;
	const result = validatorUtil.validateUserInput(username, email, password);

	if (!result.valid) {
		return reply.code(400).send({ error: result.errors.join(' ') });
	}

	const existingUserEmail = await userRepository.getUserByEmail(result.email);
	const existingUserUsername = await userRepository.getUserByUsername(result.username);
	if (existingUserEmail) {
		return reply.code(409).send({ error: 'Email already in use' });
	} else if (existingUserUsername) {
		return reply.code(409).send({ error: 'Username already in use' });
	}

	try {
		const hashedPw = await passwordUtil.hashPassword(result.password);
		const info = await userRepository.addUser(result.username, result.email, hashedPw);
		const userId = info.lastInsertRowid;

		await statsRepository.addStats(userId, 0, 0, 0);
		await mailService.sendEmailValidationMail(userId, result.email);

		return reply.code(201).send({ message: 'User created successfully' });
	} catch (err) {
		if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			return reply.code(409).send({ error: 'Username or email already exists' });
		}
		return reply.code(500).send({ error: 'Database error' });
	}
};

const rawAllowed = (process.env.ALLOWED_IMAGE_TYPES || '').trim();
const ALLOWED_IMAGE_MIME = rawAllowed
	? rawAllowed.split(',').map(s => s.trim().toLowerCase())
	: ['image/png', 'image/jpeg', 'image/webp'];

exports.updateUser = async function (req, reply) {
	const userId = await userUtil.getUserIdFromRequest(req);
	if (!userId) {
		return reply.code(401).send({ success: false, error: "Not authenticated" });
	}

	const parts = req.parts();
	let firstName = null;
	let lastName = null;
	let age = null;
	let imageName = null;
	let twofaActive = null;
	let twofa_method = null;

	for await (const part of parts) {
		if (part.type === "file") {
			const buffer = await part.toBuffer();

			if (buffer.length > MAX_IMAGE_SIZE) {
				return reply.code(400).send({ success: false, error: "Image too large. Max 5 MB" });
			}

			const type = await FileType.fileTypeFromBuffer(buffer);
			if (!type || !ALLOWED_IMAGE_MIME.includes(type.mime)) {
				return reply.code(400).send({ success: false, error: "Invalid image type" });
			}

			try {
				await sharp(buffer).metadata();
			} catch (err) {
				return reply.code(400).send({ success: false, error: "File is not a valid image" });
			}

			const uploadsDir = path.join(__dirname, '../../profile_images');
			if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

			const uniqueFilename = `${Date.now()}.${type.ext}`;
			const fullPath = path.join(uploadsDir, uniqueFilename);

			fs.writeFileSync(fullPath, buffer);
			imageName = uniqueFilename;
		} else if (part.type === "field") {
			const val = typeof part.value === "string" ? part.value.trim() : "";

			switch (part.fieldname) {
				case "first_name": {
					if (val === "") {
						firstName = null;
						break;
					}
					const sanitized = validatorUtil.sanitizeTextInput(val, {
						maxLength: validatorUtil.MAX_NAME_LEN,
						whitelistRegex: /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-.']+$/,
					});
					if (sanitized === null) {
						return reply.code(400).send({ success: false, error: "Invalid first name" });
					}
					firstName = sanitized;
					break;
				}

				case "last_name": {
					if (val === "") {
						lastName = null;
						break;
					}
					const sanitized = validatorUtil.sanitizeTextInput(val, {
						maxLength: validatorUtil.MAX_NAME_LEN,
						whitelistRegex: /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-.']+$/,
					});
					if (sanitized === null) {
						return reply.code(400).send({ success: false, error: "Invalid last name" });
					}
					lastName = sanitized;
					break;
				}

				case "age": {
					if (val === "") {
						age = null;
						break;
					}
					const sanitizedAge = validatorUtil.sanitizeAge(val);
					if (sanitizedAge === null) {
						return reply.code(400).send({ success: false, error: "Invalid age" });
					}
					age = sanitizedAge;
					break;
				}

				case "twofa_active": {
					twofaActive = val === "1" ? 1 : 0;
					break;
				}

				case "twofa_method": {
					if (val === "") {
						twofa_method = null;
						break;
					}
					const sanitizedMethod = validatorUtil.sanitizeTwoFaMethod(val);
					if (sanitizedMethod === null) {
						return reply.code(400).send({ success: false, error: "Invalid 2FA method" });
					}
					twofa_method = sanitizedMethod;
					break;
				}
			}
		}
	}

	try {
		await userService.updateUser(firstName, lastName, age, imageName, userId, twofaActive, twofa_method);
		return reply.send({ success: true });
	} catch (err) {
		logger.error("updateUser failed:", err);
		return reply.code(500).send({ success: false, error: "Internal server error" });
	}
};


exports.removeFriend = async function (req, reply) {
	const { friendUsername } = req.body;
	if (!friendUsername) {
		return reply.code(400).send({ error: "friendUsername is required" });
	}

	const userId = userUtil.getUserIdFromRequest(req);
	if (!userId) {
		return reply.code(401).send({ error: "Not authenticated" });
	}

	if (friendUsername.trim() === "") {
		return reply.code(400).send({ error: "Invalid friendUsername" });
	}

	try {
		const friend = userRepository.getUserIdByUsername(friendUsername);
		if (!friend) {
			return reply.code(404).send({ error: "Friend not found" });
		}

		const friendId = friend.id;
		if (friendId === userId) {
			return reply.code(400).send({ error: "Cannot remove yourself" });
		}

		const deleteFriendsResult = await userRepository.deleteFriends(userId, friendId, friendId, userId);
		if (deleteFriendsResult.changes === 0) {
			return reply.code(404).send({ error: "Friendship not found" });
		}

		await requestRepository.deleteRequestBySenderIdAndReceiverId(userId, friendId, friendId, userId);
		return reply.code(200).send({ success: true, message: "Friend removed successfully" });
	} catch (err) {
		console.error(err);
		return reply.code(500).send({ error: "Database error" });
	}
};

exports.twoFaSetUp = async function (req, reply) {
	try {
		const userId = userUtil.getUserIdFromRequest(req);
		if (!userId) return reply.code(401).send({ error: "Unauthorized" });

		const { qrCodeDataUrl } = await twoFaService.generateTwoFaSecret(userId);

		return reply.send({ qrCodeDataUrl });
	} catch (err) {
		console.error(err);
		return reply.code(500).send({ error: "Failed to setup 2FA" });
	}
};

exports.getFriendsData = async function (req, reply) {
	const { friendId } = req.query;

	const userId = userUtil.getUserIdFromRequest(req);

	const friends = await userRepository.getFriends(userId);

	for (const friend of friends) {
		if (friend.id === Number(friendId)) {
			return reply.send(friend);
		}
	}
	return reply.code(404).send({ error: "Friend not found" });
}
