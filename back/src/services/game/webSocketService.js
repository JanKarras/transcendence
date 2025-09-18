const gameEngine = require("./gameEngine");
const Fastify = require('fastify');
const fastify = Fastify({ logger: { level: 'info' } });
const logger = require('../../logger/logger');


function handleMessage(msg, userId, ws, remoteAddress) {
    const msgString = msg.toString();
    logger.info(`📩 Message from client: ${msgString}`);

    switch (msgString) {
        case "movePaddleUp": {
            gameEngine.updateVelocity(userId, "up")
            break;
        }
        case "movePaddleDown": {
            gameEngine.updateVelocity(userId, "down")
            break;
        }
        case "stopPaddle": {
            gameEngine.updateVelocity(userId, "stop")
            break;
        }
        default:
            break;
    }
}

module.exports = {
    handleMessage,
}