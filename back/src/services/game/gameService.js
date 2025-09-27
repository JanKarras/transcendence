const matchService = require("../../services/game/matchService");
const gameStore = require("./gameStore");


function tryMatch(userId) {
    const data = gameStore.connectedUsers.get(userId);
    if (gameStore.queue.size > 0) {
        const [otherUserId, otherData] = gameStore.queue.entries().next().value;
        gameStore.queue.delete(otherUserId);
        matchService.createMatch(otherData, data);
    } else {
        gameStore.queue.set(userId, data);
    }
}

module.exports = {
    tryMatch,
}