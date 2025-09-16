const onGoingMatches = [];
const queue = new Map(); // userId -> { userId, ws, remoteAddress }
const connectedUsers = new Map(); // userId -> { userId, ws, remoteAddress }

module.exports = {
    onGoingMatches,
    queue,
    connectedUsers,
}