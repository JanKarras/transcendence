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

        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        const data = {
            userId: userId,
            ws: ws,
            remoteAddress: remoteAddress
        }

        console.log(gameStore.onGoingMatches);
        // If user reconnects, handle it
        // if (gameStore.onGoingMatches.find(m => m.userId1 === userId || m.userId2 === userId)) {
        //     reconnectUser(data);
        // }
        gameStore.connectedUsers.set(userId, data);
        // console.log(gameStore.connectedUsers.get(userId));

        ws.on('message', (msg) => {
            webSocketService.handleMessage(msg, userId, ws, remoteAddress);
        });

        ws.on('close', () => {
            fastify.log.info(
                `User ${userId} disconnected`
            );
            request.socket = null;
            // sicherstellen dass er nicht mehr in der Queue hängt
            gameStore.queue.delete(userId);
            gameStore.connectedUsers.delete(userId);

            disconnectUser(userId);
        });

        ws.on('error', (err) => {
            fastify.log.error(`⚠️ WS error: ${err.message}`);
        });
    });
}

function disconnectUser(userId) {
    const match = gameStore.onGoingMatches.find(
        m => m.userId1 === userId || m.userId2 === userId
    );
    if (!match) {
        return;
    }

    if (match.userId1 === userId) {
        match.user1Connected = false;
    }
    if (match.userId2 === userId) {
        match.user2Connected = false;
    }

    console.log(match.user1Connected, match.user2Connected);
    // Start a timeout to remove the match if both disconnected
    // match.disconnectTimeout = setTimeout(() => {
        if (!match.user1Connected && !match.user2Connected) {
            gameStore.onGoingMatches = gameStore.onGoingMatches.filter(m => m !== match);
            console.log(`Both users disconnected. Removing match ${match.userId1} vs ${match.userId2}`);
        }
    // }, 10000);
}

function reconnectUser(data) {
    const match = gameStore.onGoingMatches.find(
        m => m.userId1 === data.userId || m.userId2 === data.userId
    );
    if (!match) return;

    matchService.connectUserToMatch(data)

    const gameStatePayload = {
        type: "restoreGame",
        gameState: match.gameState,
        gameInfo: match.gameInfo
    };

    try {
        data.ws.send(JSON.stringify(gameStatePayload));
        console.log(`User ${data.userId} reconnected and game state sent`);
    } catch (err) {
        console.error("Failed to send game state to reconnecting user:", err);
    }
}

setInterval(() => {
    gameStore.connectedUsers.forEach((data, userId) => {
        const ws = data.ws;

        if (ws.isAlive === false) {
            console.log(`❌ User ${userId} is unresponsive, terminating`);
            ws.terminate();
            gameStore.queue.delete(userId);
            gameStore.connectedUsers.delete(userId);
            return;
        }

        ws.isAlive = false;
        ws.ping(); // client will auto-respond with pong
    });
}, 30000);

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

/* new by alex */
exports.createInvitation = async (req, reply) => {
    const userId = userUtils.getUserIdFromRequest(req);
    // const otherId = req.body;
    if (!userId) {
        return reply.status(400).send({ error: 'UserId required' });
    }
    invitationService.invite(userId, other);
    console.log(`Waiting for friend to accept the invitation ${userId}`);
    reply.send({ message: "Waiting for friend to accept the invitation" });
}

/* new by alex */
exports.acceptInvitation = async (req, reply) => {
    const userId = userUtils.getUserIdFromRequest(req);
    // const other = req.body;
    if (!userId) {
        return reply.status(400).send({ error: 'UserId required' });
    }
    invitationService.accept(userId, other);
    console.log(`Waiting for friend to accept the invitation by ${userId}`);
    reply.send({ message: "Waiting for friend to accept the invitation" });
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
    const { mode } = req.body;
    const userId = userUtils.getUserIdFromRequest(req);
    if (!userId) {
        return reply.status(400).send({ error: 'UserId required' });
    }
    gameProcessor.setCountdownFinished(userId, mode);
    console.log("Game started lod");
    reply.send({ message: "Game started" });
}

exports.createLocalGame = async (req, reply) => {
    const { username } = req.body || {};
    const userId = userUtils.getUserIdFromRequest(req);
    if (!userId) {
        return reply.status(400).send({ error: 'UserId required' });
    }

    const userData = gameStore.connectedUsers.get(userId);
    // console.log(connectedUsers);
    matchService.createLocalMatch(userData, username);

    console.log("Local game created");
    reply.send({ message: "Local game created" });
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
