const { GameState } = require("../../constants/constants");
const gameStore = require("./gameStore");
const gameEngine = require("./gameEngine");


const intervalId = setInterval(() => {
    mainGameLoop();
}, 1000/60)

function mainGameLoop() {
    for (let i = 0; i < gameStore.onGoingMatches.length; i++) {
        const match = gameStore.onGoingMatches[i];
        switch (match.gameState) {
            case GameState.NOT_STARTED:
                checkForBothConnected(match);
                break;
            case GameState.BOTH_CONNECTED:
                sendMessage(match, "startGame");
                match.gameState = GameState.STARTED;
                break;
            case GameState.STARTED:
                isCountdownFinished(match)
                break;
            case GameState.FINISHED:
                console.log("FINISHED");
                gameEngine.updateGameInfo(match)
                sendMessage(match, "sendFrames");
                break;
            case GameState.ERROR:
                sendWinner(match)
                safeGameToMatchHistory(match)
                break;
            default:
                break;
        }
    }
}

function checkForBothConnected(match) {
    if (match.user1Connected && match.user2Connected) {
        match.gameState = GameState.BOTH_CONNECTED;
    }
}

function isCountdownFinished(match) {
    if (match.coutndownFinished1 && match.coutndownFinished2) {
        match.gameState = GameState.FINISHED;
    }
}

function setCountdownFinished(userId, mode) {
    const match = gameStore.onGoingMatches.find(m => m.userId1 === userId || m.userId2 === userId);
    if (mode === "local") {
        console.log("mode is local");
        match.coutndownFinished1 = true;
        match.coutndownFinished2 = true;
    }
    else {
        if (match.userId1 === userId) {
            match.coutndownFinished1 = true;
        } else if (match.userId2 === userId) {
            match.coutndownFinished2 = true;
        }
    }
}

function sendMessage(match, type) {
    const message = {
        type: type,
        gameInfo: match.gameInfo,
        userId1 : match.userId1,
        userId2 : match.userId2,
        gameState : match.gameState
    };

    match.wsUser1.send(JSON.stringify(message));
    match.wsUser2.send(JSON.stringify(message));
}


function sendWinner(match) {

}

function safeGameToMatchHistory(match) {

}

module.exports = {
    setCountdownFinished,
}