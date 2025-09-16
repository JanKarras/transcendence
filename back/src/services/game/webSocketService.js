const gameEngine = require("./gameEngine");


function handleMessage(msg, userId, ws, remoteAddress) {
    const msgString = msg.toString();
    fastify.log.info(`📩 Message from client: ${msgString}`);

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