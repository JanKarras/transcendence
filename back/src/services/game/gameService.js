const matchService = require("../../services/game/matchService");
// const { connectedUsers } = require("../../controllers/gameController");
const gameStore = require("./gameStore");


function tryMatch(userId) {
    const data = gameStore.connectedUsers.get(userId);
    // console.log(data);
    if (gameStore.queue.size > 0) {
        const [otherUserId, otherData] = gameStore.queue.entries().next().value;
        // console.log(otherUserId);
        // console.log(otherData);
        gameStore.queue.delete(otherUserId);
        matchService.createMatch(otherData, data);
    } else {
        gameStore.queue.set(userId, data);
    }
}

module.exports = {
    tryMatch,
}