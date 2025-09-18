const matchRepository = require("../../repositories/matchRepository");
const matchPlayerRepository = require("../../repositories/matchPlayerRepository");
const userRepository = require("../../repositories/userRepository");
const gameStore = require("./gameStore");
const { GameState } = require("../../constants/constants");

function getMatchesWithPlayersByUserId(userId) {
    const userMatches = matchRepository.getMatchesByUserId(userId);
    return userMatches.map(match => {
        const players = matchPlayerRepository.getPlayersByMatchId(match.id)
        return {
            ...match,
            players
        };
    });
}

function getMatchByUserId(userId) {
    for (let i = 0; i < gameStore.onGoingMatches.length; i++) {
        const match = gameStore.onGoingMatches[i];
        if (match.userId1 === userId || match.userId2 === userId) {
            return match;
        }
    }
    return null
}

function createMatch(userData1, userData2) {
    console.log("createMatch");
    const matchData = initMatch(userData1, userData2);
    gameStore.onGoingMatches.push(matchData);
    userData1.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId2 }));
    userData2.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId1 }));
}


function initMatch(userData1, userData2) {
    const user1 = userRepository.getUserById(userData1.userId);
    const user2 = userRepository.getUserById(userData2.userId);
    return  {
        wsUser1: null,
        userId1: userData1.userId,
        wsUser2: null,
        countdownFinished1: false,
        user1Connected: false,
        userId2: userData2.userId,
        user2Connected: false,
        countdownFinished2: false,
        gameState: GameState.NOT_STARTED,
        gameInfo: {
            ball: {
                position: { x: 400, y: 300 },
                radius: 10,
                velocity: { x: 5, y: 4 },
                speed: 5,
            },
            paddleLeft: {
                position: { x: 20, y: 250 },
                size: { x: 10, y: 50 },
                speed: 5,
                velocity: { x: 0, y: 0 },
            },
            paddleRight: {
                position: { x: 770, y: 250 },
                size: { x: 10, y: 50 },
                speed: 5,
                velocity: { x: 0, y: 0 },
            },
            playerLeft: {
                userId : userData1.userId,
                name: user1.username || "Player1",
                path: user1.path || "std_user_img.png",
                score: 0,
            },
            playerRight: {
                userId : userData2.userId,
                name: user2.username || "Player2",
                path: user2.path || "std_user_img.png",
                score: 0,
            }
        },
    };
}

function connectUserToMatch(data) {
    const userId = data.userId;
    console.log("connecting userToMatch", userId);
    const ws = data.ws;
    console.log(gameStore.onGoingMatches);
    for (let i = 0; i < gameStore.onGoingMatches.length; i++) {
        const match = gameStore.onGoingMatches[i];
        if (match.userId1 === userId && match.gameState === GameState.NOT_STARTED) {
            match.user1Connected = true;
            match.wsUser1 = ws;
            break;
        } else if (match.userId2 === userId && match.gameState === GameState.NOT_STARTED) {
            match.user2Connected = true;
            match.wsUser2 = ws;
            break;
        }
    }
}

module.exports = {
    getMatchesWithPlayersByUserId,
    createMatch,
    getMatchByUserId,
    connectUserToMatch,
}