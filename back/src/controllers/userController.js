const userUtil = require("../utils/userUtil");
const passwordUtil = require("../utils/passwordUtil");
const mailService = require("../services/mailService");
const userRepository = require("../repositories/userRepository");
const statsRepository = require("../repositories/statsRepository");
const requestRepository = require("../repositories/requestRepository");
const validatorUtil = require("../utils/validator");
const validator = require("validator");
const {MAX_IMAGE_SIZE, NAME_REGEX} = require("../constants/constants");
const userService = require("../services/userService");
const logger = require('../logger/logger');
const fs = require('fs');
const path = require('path');
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

    const blockedByFriend = await userRepository.isUserBlockedByFriend(friendId, userId);
    return reply.send({ blocked: !!blockedByFriend.blocked });
};

exports.createUser = async (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
        return reply.code(400).send({ error: 'Missing credentials: username, email and password are required.' });
    }

    if (!validator.isEmail(email)) {
        return reply.code(400).send({ error: 'Invalid email address' });
    }

    const cleanUsername = validator.escape(username);

    try {
        const hashedPw = await passwordUtil.hashPassword(password);
        const info = await userRepository.addUser(cleanUsername, email, hashedPw);
        const userId = info.lastInsertRowid;

        await statsRepository.addStats(userId, 0, 0, 0);
        await mailService.sendEmailValidationMail(userId, email);

        return reply.code(201).send({ message: 'User created successfully' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return reply.code(409).send({ error: 'Username or email already exists' });
        }
        return reply.code(500).send({ error: 'Database error' });
    }
};

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

    for await (const part of parts) {
        if (part.file) {
            const buffer = await part.toBuffer();

            if (buffer.length > MAX_IMAGE_SIZE) {
                return reply.code(400).send({ success: false, error: "Image too large. Max 5 MB" });
            }

            if (part.filename) {
                const uploadsDir = path.join(__dirname, '../../../profile_images');
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

                const extension = path.extname(part.filename);
                const uniqueFilename = `${Date.now()}${extension}`;
                const fullPath = path.join(uploadsDir, uniqueFilename);

                fs.writeFileSync(fullPath, buffer);
                imageName = uniqueFilename;
            }
        } else if (part.fieldname === "first_name") {
            if (!NAME_REGEX.test(part.value)) {
                return reply.code(400).send({ success: false, error: "Invalid first name" });
            }
            firstName = part.value.trim();
        } else if (part.fieldname === "last_name") {
            if (!NAME_REGEX.test(part.value)) {
                return reply.code(400).send({ success: false, error: "Invalid last name" });
            }
            lastName = part.value.trim();
        } else if (part.fieldname === "age") {
            if (!/^\d+$/.test(part.value)) {
                return reply.code(400).send({ success: false, error: "Invalid age" });
            }
            age = parseInt(part.value, 10);
        }
    }

    await userService.updateUser(firstName, lastName, age, imageName, userId);
    reply.send({ success: true });
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