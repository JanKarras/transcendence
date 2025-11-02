const gameEngine = require("./gameEngine");
const Fastify = require('fastify');
const fastify = Fastify({ logger: { level: 'info' } });
const logger = require('../../logger/logger');


function handleMessage(msg, userId, ws, remoteAddress) {
	const msgString = msg.toString();
	logger.info(`📩 Message from client: ${msgString}`);

	switch (msgString) {
		case "movePaddleUp": {
			gameEngine.updateVelocity(userId, "up", "right")
			break;
		}
		case "movePaddleDown": {
			gameEngine.updateVelocity(userId, "down", "right")
			break;
		}
		case "moveLeftPaddleUp": {
			gameEngine.updateVelocity(userId, "up", "left")
			break;
		}
		case "moveLeftPaddleDown": {
			gameEngine.updateVelocity(userId, "down", "left")
			break;
		}
		case "stopPaddle": {
			gameEngine.updateVelocity(userId, "stop")
			break;
		}
		case "stopLeftPaddle": {
			gameEngine.updateVelocity(userId, "stop", "left")
			break;
		}
		default:
			break;
	}
}

module.exports = {
	handleMessage,
}