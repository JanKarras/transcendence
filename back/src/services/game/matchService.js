const matchRepository = require("../../repositories/matchRepository");
const matchPlayerRepository = require("../../repositories/matchPlayerRepository");
const userRepository = require("../../repositories/userRepository");
const gameStore = require("./gameStore");
const { GameState, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH, MatchType } = require("../../constants/constants");

function getMatchesWithPlayersByUserId(userId) {
    const userMatches = matchRepository.getMatchesByUserId(userId);
    return userMatches.map(match => {
        const matchId = match.match_id;
        const players = matchPlayerRepository.getPlayersByMatchId(matchId);
        return {
            ...match,
            players
        };
    });
}

function getMatchByUserId(userId) {
    console.log(gameStore.onGoingMatches);
    return gameStore.onGoingMatches.find(
        m => m.userId1 === userId || m.userId2 === userId
    );
}

function createMatch(userData1, userData2) {
    console.log("createMatch");
	console.log("Userdata1: ", userData1)
	console.log("Userdata2: ", userData2)
    const matchData = initRemoteMatch(userData1, userData2);
    gameStore.onGoingMatches.push(matchData);
    userData1.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId2 }));
    userData2.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId1 }));
}

function createLocalMatch(userData1, username) {
    console.log("createMatch");
    const match = initLocalMatch(userData1, username);
    match.wsUser1 = userData1.ws;
    match.wsUser2 = userData1.ws;
    match.user1Connected = true;
    // match.user2Connected = true;
    gameStore.onGoingMatches.push(match);
    const message = {
        type: "startGame",
        gameInfo: match.gameInfo,
        userId1 : match.userId1,
        userId2 : match.userId2,
        gameState : match.gameState
    };
    userData1.ws.send(JSON.stringify(message));
    match.gameState = GameState.STARTED;
}

function initMatch(userData1, userData2, gameInfo, mode) {
    return  {
        wsUser1: null,
        userId1: userData1.userId,
        wsUser2: null,
        countdownFinished1: false,
        user1Connected: false,
        userId2: userData2?.userId,
        user2Connected: false,
        countdownFinished2: false,
        gameState: GameState.NOT_STARTED,
        gameInfo: gameInfo,
        mode: mode,
    };
}

function initRemoteMatch(userData1, userData2) {
    const user1 = userRepository.getUserById(userData1.userId);
    const user2 = userRepository.getUserById(userData2.userId);
    const playerLeft = {
        userId : userData1.userId,
        name: user1.username || "Player1",
        path: user1.path || "std_user_img.png",
        score: 0,
    };
    const playerRight = {
        userId : userData2.userId,
        name: user2.username || "Player2",
        path: user2.path || "std_user_img.png",
        score: 0,
    };
    const gameInfo = initGameInfo(playerLeft, playerRight);
    return initMatch(userData1, userData2, gameInfo, MatchType.REMOTE_1V1);
}

function initLocalMatch(userData1, username) {
    const user1 = userRepository.getUserById(userData1.userId);
    const playerRight = {
        userId : userData1.userId,
        name: user1.username || "Player1",
        path: user1.path || "std_user_img.png",
        score: 0,
    };
    const playerLeft = {
        userId : null,
        name: username || "Player2",
        path: "std_user_img.png",
        score: 0,
    };
    const gameInfo = initGameInfo(playerLeft, playerRight);
    return initMatch(userData1, null, gameInfo, MatchType.LOCAL_1V1);
}

function initGameInfo(playerLeft, playerRight) {
    return {
        ball: {
            position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
            radius: 10,
            velocity: { x: 0, y: 0 },
            speed: 0,
        },
        paddleLeft: {
            position: { x: 20, y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2},
            size: { x: PADDLE_WIDTH, y: PADDLE_HEIGHT },
            speed: PADDLE_SPEED,
            velocity: { x: 0, y: 0 },
        },
        paddleRight: {
            position: { x: CANVAS_WIDTH - 20, y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2 },
            size: { x: PADDLE_WIDTH, y: PADDLE_HEIGHT },
            speed: PADDLE_SPEED,
            velocity: { x: 0, y: 0 },
        },
        playerLeft: playerLeft,
        playerRight: playerRight,
        end : false,
    };
}

function connectUserToMatch(data) {
    console.log(gameStore.onGoingMatches);
    const userId = data.userId;
    const ws = data.ws;
    const match = gameStore.onGoingMatches.find(
        m => m.userId1 === userId || m.userId2 === userId
    );
    if (!match) return;

    if (match.disconnectTimeout) {
        clearTimeout(match.disconnectTimeout);
        match.disconnectTimeout = null;
    }

    if (match.userId1 === userId) {
        match.user1Connected = true;
        match.wsUser1 = ws;
    } else {
        match.user2Connected = true;
        match.wsUser2 = ws;
    }

    // const userId = data.userId;
    // console.log("connecting userToMatch", userId);
    // const ws = data.ws;
    // console.log(gameStore.onGoingMatches);
    // for (let i = 0; i < gameStore.onGoingMatches.length; i++) {
    //     const match = gameStore.onGoingMatches[i];
    //     if (match.userId1 === userId) {
    //         match.user1Connected = true;
    //         match.wsUser1 = ws;
    //         break;
    //     } else if (match.userId2 === userId) {
    //         match.user2Connected = true;
    //         match.wsUser2 = ws;
    //         break;
    //     }
    // }
}

module.exports = {
    getMatchesWithPlayersByUserId,
    createMatch,
    getMatchByUserId,
    connectUserToMatch,
    createLocalMatch,
}
