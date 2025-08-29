const userUtil = require("../utils/userUtil");
const userRepository = require("../repositories/userRepository");
const statsRepository = require("../repositories/statsRepository");
const requestRepository = require("../repositories/requestRepository");
const validator = require("../validator/validator");
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
    if (!validator.validateFriendId(friendId)) {
        return reply.code(400).send({ error: 'friendId must be a positive integer' });
    }

    const blockedByFriend = await userRepository.isUserBlockedByFriend(friendId, userId);
    return reply.send({ blocked: !!blockedByFriend.blocked });
};