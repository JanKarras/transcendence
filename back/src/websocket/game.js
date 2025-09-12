const { match } = require('assert');
const userUtils = require('../utils/userUtil');
const { json } = require('stream/consumers');

const lookingForMatch = new Map();
const onGoingMatches = [];

function pairMatch(userData1, userData2) {
	const user1 = userUtils.getUser(userData1.userId);
	const user2 = userUtils.getUser(userData2.userId);
	  const matchData = {
    	wsUser1: null,
    	userId1: userData1.userId,
    	wsUser2: null,
		coutndownFinished1: false,
    	user1Connected: false,
    	userId2: userData2.userId,
    	user2Connected: false,
		coutndownFinished2: false,
    	gameState: 0,
    	gameInfo: {
    	  ball: {
    	    position: { x: 400, y: 300 },
    	    radius: 10,
    	    velocity: { x: 5, y: 4 },
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

	onGoingMatches.push(matchData);
	userData1.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId2 }));
	userData2.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId1 }));
}

module.exports = async function chatWebSocketRoute(fastify) {
  fastify.get('/game', { websocket: true }, (ws, request) => {
    const { token } = request.query;
    const remoteAddress = request.socket.remoteAddress;
    fastify.log.info('🟢 Game connected from ' + remoteAddress);
	const userId = userUtils.getUserIdFromToken(token);

    ws.on('message', (msg) => {
      const msgString = msg.toString();
      fastify.log.info(`📩 Message from client: ${msgString}`);

	  switch (msgString) {
		case "matchmaking" :
			matchmaking(userId, ws)
			break;
		case "waiting" : {
			matchConnectUser(userId, ws, remoteAddress);
			break;
		}
		case "countdownFinished" : {
			setCountdownFinished(userId);
			break;
		}
		case "movePaddleUp": {
			updateVelocity(userId, "up")
			break;
		}
		case "movePaddleDown": {
			updateVelocity(userId, "down")
			break;
		}
			case "stopPaddle": {
			updateVelocity(userId, "stop")
			break;
		}
		default:
			break;
	  }
	console.log(lookingForMatch)
});

    ws.on('close', (code, reason) => {
      fastify.log.info(
        `❌ WS disconnected, code: ${code}, reason: ${reason?.toString() || ''}`
      );
      // sicherstellen dass er nicht mehr in der Queue hängt
      lookingForMatch.delete(userId);
    });

    ws.on('error', (err) => {
      fastify.log.error(`⚠️ WS error: ${err.message}`);
    });
  });
};

// 0 notStarted
// 1 BothConnected
// 2 Started
// 3 finished
// 4 error
// mainGameLoop();

function getMatchByUserId(userId) {
	for (let i = 0; i < onGoingMatches.length; i++) {
		const match = onGoingMatches[i];
		if (match.userId1 === userId) {
			return match
		} else if (match.userId2 === userId) {
			return match
		}
	}
	return null
}

function updateVelocity(userId, dir) {
	const match = getMatchByUserId(userId);
	console.log (dir);
	const state = match.gameInfo;
	const paddle = match.gameInfo.playerLeft.userId === userId ? match.gameInfo.paddleLeft : match.gameInfo.paddleRight;
	switch (dir) {
		case "up":
			paddle.velocity.y = -state.paddleLeft.speed;
			break;
		case "down":
			paddle.velocity.y = state.paddleLeft.speed;
			break;
		case "stop":
			paddle.velocity.y = 0;
			break;
		default:
			break;
	}
}

function setCountdownFinished(userId) {
	for (let i = 0; i < onGoingMatches.length; i++) {
		const match = onGoingMatches[i];
		if (match.userId1 === userId) {
			match.coutndownFinished1 = true;
		} else if (match.userId2 === userId) {
			match.coutndownFinished2 = true;
		}
	}
}




const interValdId = setInterval(() => {
	mainGameLoop();
}, 1000/60)

function mainGameLoop() {
	for (let i = 0; i < onGoingMatches.length; i++) {
		const match = onGoingMatches[i];
		switch (match.gameState) {
			case 0:
				CheckForBothConnected(match);
				break;
				case 1:
					Startgame(match)
					break;
					case 2:
						countdownFinished(match)
						break;
						case 3:
							updateGameInfo(match)
							SendFrames(match)
				break;
				case 4:
					SendWinner(match)
					SafeGameToMatchHistory(match)
					break;
					case 5:
						break;
						default:
							break;
						}
					}
				}

				function countdownFinished(match) {
					if (match.coutndownFinished1 && match.coutndownFinished2) {
						match.gameState = 3
					}
				}
				function CheckForBothConnected(match) {
					if (match.user1Connected && match.user2Connected) {
						match.gameState = 1;
	}
}

function Startgame(match) {
	const startMessage = {
		type: "startGame",
		gameInfo: match.gameInfo,
		userId1 : match.userId1,
		userId2 : match.userId2,
		gameState : match.gameState
	};

    match.wsUser1.send(JSON.stringify(startMessage));
    match.wsUser2.send(JSON.stringify(startMessage));
	// Countdown
	match.gameState = 2;
}


function SendFrames(match) {
	const startMessage = {
		type: "sendFrames",
		gameInfo: match.gameInfo,
		userId1 : match.userId1,
		userId2 : match.userId2,
		gameState : match.gameState
	};

    match.wsUser1.send(JSON.stringify(startMessage));
    match.wsUser2.send(JSON.stringify(startMessage));
}

function SendWinner(match) {

}

function SafeGameToMatchHistory(match) {

}

function matchmaking(userId, ws, remoteAddress) {
	if (!userId) {
		fastify.log.warn("⚠️ Invalid token, cannot get userId");
		ws.close(4001, "Invalid token");
		return;
    }
	const data = {
		userId: userId,
		ws: ws,
		remoteAddress: remoteAddress
	}
	if (lookingForMatch.size > 0) {
		const [otherUserId, otherData] = lookingForMatch.entries().next().value;
		lookingForMatch.delete(otherUserId);
		pairMatch(otherData, data)
	} else {
		lookingForMatch.set(userId, data);
	}
}

function matchConnectUser(userId, ws) {
	for (let i = 0; i < onGoingMatches.length; i++) {
		const match = onGoingMatches[i];
		if (match.userId1 === userId) {
			match.user1Connected = true;
			match.wsUser1 = ws;
			break;
		} else if (match.userId2 === userId) {
			match.user2Connected = true;
			match.wsUser2 = ws;
			break;
		}
	}
}
const canvasHeight = 600;
const canvasWidth = 800;

function updateGameInfo(match) {
  const ball = match.gameInfo.ball;
  moveBall(ball);
  bounceBall(ball, canvasHeight);
  movePaddles(match.gameInfo, canvasHeight);
  handleCollisions(match.gameInfo);
  handleScoring(match.gameInfo);
}

function moveBall(ball) {
  ball.position.x += ball.velocity.x;
  ball.position.y += ball.velocity.y;
}

function bounceBall(ball, canvasHeight) {
  if (ball.position.y - ball.radius < 0 || ball.position.y + ball.radius > canvasHeight) {
    ball.velocity.y *= -1;
  }
}

function movePaddles(state, canvasHeight) {
  // Move paddles using their velocity vector
  state.paddleLeft.position.y += state.paddleLeft.velocity.y;
  state.paddleRight.position.y += state.paddleRight.velocity.y;

  // Clamp paddles inside canvas
  for (const paddle of [state.paddleLeft, state.paddleRight]) {
    if (paddle.position.y < 0) paddle.position.y = 0;
    if (paddle.position.y + paddle.size.y > canvasHeight) paddle.position.y = canvasHeight - paddle.size.y;
  }
}

function handleCollisions(state) {
  const { ball, paddleLeft, paddleRight } = state;
  const bx = ball.position.x;
  const by = ball.position.y;

  // Left paddle collision
  if (
    bx - ball.radius < paddleLeft.position.x + paddleLeft.size.x &&
    by > paddleLeft.position.y &&
    by < paddleLeft.position.y + paddleLeft.size.y
  ) {
    ball.velocity.x *= -1;
    ball.position.x = paddleLeft.position.x + paddleLeft.size.x + ball.radius;
  }

  // Right paddle collision
  if (
    bx + ball.radius > paddleRight.position.x &&
    by > paddleRight.position.y &&
    by < paddleRight.position.y + paddleRight.size.y
  ) {
    ball.velocity.x *= -1;
    ball.position.x = paddleRight.position.x - ball.radius;
  }
}

function handleScoring(state) {
  const ball = state.ball;
  const bx = ball.position.x;

  if (bx < 0) {
    state.playerRight.score++;
    resetBall(ball);
  } else if (bx > 800) {
    state.playerLeft.score++;
    resetBall(ball);
  }
  if (state.playerLeft.score >= 10 || state.playerRight.score >= 10)
    state.end = true;
}

function resetBall(ball) {
	ball.position.x = 400;
	ball.position.y = 300;

	const baseSpeed = { x: 5, y: 4 };
	ball.velocity.x = Math.random() > 0.5 ? baseSpeed.x : -baseSpeed.x;
	ball.velocity.y = (Math.random() > 0.5 ? 1 : -1) * baseSpeed.y;
}
