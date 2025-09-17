const gameEngine = require("../services/game/gameEngine");
const logger = require('../logger/logger');
const userUtils = require("../utils/userUtil");
const userRepository = require("../repositories/userRepository");
const gameService = require("../services/game/gameService");
const webSocketService = require("../services/game/webSocketService");
const gameStore = require("../services/game/gameStore");
const matchService = require("../services/game/matchService");
const gameProcessor = require("../services/game/gameProcessor");

exports.chatWebSocketRoute = async function (fastify) {
    fastify.get('/game', { websocket: true }, (ws, request) => {
        const { token } = request.query;
        const remoteAddress = request.socket.remoteAddress;
        fastify.log.info('🟢 Game connected from ' + remoteAddress);
        const userId = userUtils.getUserIdFromToken(token);

        if (!userId) {
            fastify.log.warn("⚠️ Invalid token, cannot get userId");
            ws.close(4001, "Invalid token");
            return;
        }

        const data = {
            userId: userId,
            ws: ws,
            remoteAddress: remoteAddress
        }
        gameStore.connectedUsers.set(userId, data);
        // console.log(gameStore.connectedUsers.get(userId));

        ws.on('message', (msg) => {
            webSocketService.handleMessage(msg, userId, ws, remoteAddress);
        });

        ws.on('close', (code, reason) => {
            fastify.log.info(
                `❌ WS disconnected, code: ${code}, reason: ${reason?.toString() || ''}`
            );
            // sicherstellen dass er nicht mehr in der Queue hängt
            gameStore.queue.delete(userId);
            gameStore.connectedUsers.delete(userId);
        });

        ws.on('error', (err) => {
            fastify.log.error(`⚠️ WS error: ${err.message}`);
        });
    });
}

exports.joinQueue = async (req, reply) => {
    const userId = userUtils.getUserIdFromRequest(req);
    if (!userId) {
        return reply.status(400).send({ error: 'UserId required' });
    }
    // if (!gameStore.queue.has(userId)) {
    //     return res.status(404).json({ error: 'User not connected via websocket' });
    // }

    gameService.tryMatch(userId);
    console.log(`Waiting for joining the game ${userId}`);
    reply.send({ message: "Waiting for joining the game" });
}

exports.waitForTheGame = async (req, reply) => {
    const userId = userUtils.getUserIdFromRequest(req);
    if (!userId) {
        return reply.status(400).send({ error: 'UserId required' });
    }
    const data = gameStore.connectedUsers.get(userId);
    matchService.connectUserToMatch(data);
    console.log(`Waiting for the game to start by ${userId}`);
    reply.send({ message: "Waiting for the game to start" });
}

exports.startTheGame = async (req, reply) => {
    const userId = userUtils.getUserIdFromRequest(req);
    if (!userId) {
        return reply.status(400).send({ error: 'UserId required' });
    }
    gameProcessor.setCountdownFinished(userId);
    console.log("Game started");
    reply.send({ message: "Game started" });
}

exports.movePaddle = async (req, reply) => {
    if (typeof req.body !== 'object' || req.body === null || typeof req.body.direction !== 'string') {
        return reply.status(400).send({ error: 'Invalid request body' });
    }

    const direction = req.body.direction;
    const userId = userUtils.getUserIdFromRequest(req);
    const user = await userRepository.getUserById(userId);

    if (!['up', 'down', 'stop'].includes(direction)) {
        return reply.status(400).send({ error: 'Invalid direction' });
    }

    gameEngine.updateVelocity(userId, direction);
    reply.send({ message: `${user.username} paddle moved ${direction}` });
}

exports.getState = async (req, reply) => {
    reply.send(game.getState());
}
