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
    return gameStore.onGoingMatches.find(
        m => m.userId1 === userId || m.userId2 === userId
    );
}

async function createMatch(userData1, userData2) {
    const matchData = await initRemoteMatch(userData1, userData2);
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

async function initRemoteMatch(userData1, userData2) {
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
    const gameInfo = await initGameInfo(playerLeft, playerRight);
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
    const userId = data.userId;
    const ws = data.ws;
    const match = gameStore.onGoingMatches.find(
        m => m.userId1 === userId || m.userId2 === userId
    );
    if (!match) {
		console.log("Could not find match for cennection.")
		return;
	}

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
	// console.log("Match After Connected")
	// console.log("userId1", match.userId1);
	// console.log("userId2", match.userId2);
	// console.log("user1Connected:", match.user1Connected)
	// console.log("user2Connected:", match.user2Connected)
	// console.log("Game State", match.gameState);
}

async function connectUserToMatchFromChat(data) {
  const userId = data.userId;
  const ws = data.ws;
  // Проверка: уже есть матч?
  if (gameStore.queue.has(userId)) {
    console.log(`⚠️ Cleaning stale queue entry for ${userId}`);
    gameStore.queue.delete(userId);
    }
  let match = gameStore.onGoingMatches.find( m => m.userId1 === userId || m.userId2 === userId );

  if (match) {
    // Обновляем подключение
    if (match.userId1 === userId){
      match.user1Connected = true; match.wsUser1 = ws;
    }
    else {
      match.user2Connected = true; match.wsUser2 = ws;
    }
    const message = { type: "startGame", gameInfo: match.gameInfo, gameState: match.gameState };
    // Если оба подключены и игра ещё не началась — отправить обоим
    if (match.user1Connected && match.user2Connected && match.gameState !== GameState.STARTED) {
       match.wsUser1.send(JSON.stringify(message));
       match.wsUser2.send(JSON.stringify(message));
       match.gameState = GameState.STARTED;
       console.log('🎮 Match started between ${match.userId1} and ${match.userId2}');
      } // Если игра уже началась — отправить текущему игроку повторно
    if (match.gameState === GameState.STARTED) {
      ws.send(JSON.stringify(message));
      console.log("🔁 Re-sent startGame to reconnected user ${userId}");
    } return;
  }
    // Если игрок уже в очереди — ничего не делаем
  if (gameStore.queue.has(userId)) {
    console.log("🕓 User ${userId} already in queue");
    return;
  }
  // Проверка: есть ли другой игрок в очереди
  const waitingEntry = Array.from(gameStore.queue.entries()).find(([otherId]) => otherId !== userId);
  if (waitingEntry) {
    const [waitingUserId, otherData] = waitingEntry; gameStore.queue.delete(waitingUserId);
    // Создаём новый матч
    match = await initRemoteMatch(otherData, data);
    match.wsUser1 = otherData.ws;
    match.wsUser2 = ws;
    match.user1Connected = true;
    match.user2Connected = true;
    gameStore.onGoingMatches.push(match);
    console.log("📩 Message from WS: match.gameInfo,  match.gameState, userId", match.gameInfo, match.gameState, userId);
    const message = { type: "startGame", gameInfo: match.gameInfo, gameState: match.gameState };
    setTimeout(() => {
      try {
        match.wsUser1.send(JSON.stringify(message));
        console.log(`📤 Sent startGame to user1 (${match.userId1})`);
    } catch (e) {
        console.error(`❌ Failed to send to user1 (${match.userId1})`, e);
    }

    try {
        match.wsUser2.send(JSON.stringify(message));
        console.log(`📤 Sent startGame to user2 (${match.userId2})`);
    } catch (e) {
        console.error(`❌ Failed to send to user2 (${match.userId2})`, e);
    }

    match.gameState = GameState.STARTED;
    }, 200);
      console.log(`🎮 Match started between ${match.userId1} and ${match.userId2}`);
    }
  else {
      // Никого нет — добавляем в очередь
    gameStore.queue.set(userId, data);
    console.log("🕓 User ${userId} added to queue");
  }
  console.log("🔄 connectUserToMatch called for", userId);
  console.log("📦 Current queue:", Array.from(gameStore.queue.keys()));
  console.log("📦 Current matches:", gameStore.onGoingMatches.map(m => [m.userId1, m.userId2]));
}


module.exports = {
    getMatchesWithPlayersByUserId,
    createMatch,
    getMatchByUserId,
    connectUserToMatch,
    createLocalMatch,
	connectUserToMatchFromChat
}
