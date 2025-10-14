const { CANVAS_HEIGHT, CANVAS_WIDTH } = require("../../constants/constants");
const matchService = require("../../services/game/matchService");
const gameStore = require("./gameStore");

function updateGameInfo(match) {
    const ball = match.gameInfo.ball;
    moveBall(ball);
    bounceBall(ball, CANVAS_HEIGHT);
    movePaddles(match.gameInfo, CANVAS_HEIGHT);
    handleCollisions(match.gameInfo);
    handleScoring(match.gameInfo);
    if (match.gameInfo.end)
        match.gameState = "GAMEOVER";
}

function moveBall(ball) {
    ball.position.x += ball.velocity.x;
    ball.position.y += ball.velocity.y;
}

function bounceBall(ball, canvasHeight) {
    const MIN_DY = 2;

    if (ball.position.y - ball.radius < 0) {
        ball.position.y = ball.radius; // <-- correct position
        ball.velocity.y *= -1;
    } 
    else if (ball.position.y + ball.radius > canvasHeight) {
        ball.position.y = canvasHeight - ball.radius; // <-- correct position
        ball.velocity.y *= -1;
    }

    // Ensure dy is not too small after wall bounce
    if (Math.abs(ball.velocity.y) < MIN_DY) {
        ball.velocity.y = (ball.velocity.y < 0 ? -MIN_DY : MIN_DY);
    }
}

function movePaddles(state, canvasHeight) {
    // Move paddles using their velocity vector
    state.paddleLeft.position.y += state.paddleLeft.velocity.y;
    state.paddleRight.position.y += state.paddleRight.velocity.y;

    // Clamp paddles inside canvas
    for (const paddle of [state.paddleLeft, state.paddleRight]) {
        if (paddle.position.y < 0) {
            paddle.position.y = 0;
        }
        if (paddle.position.y + paddle.size.y > canvasHeight) {
            paddle.position.y = canvasHeight - paddle.size.y;
        }
    }
}

function paddleBounce(ball, paddle) {
    let relativeIntersectY = (ball.position.y - (paddle.position.y + paddle.size.y / 2));
    let normalized = relativeIntersectY / (paddle.size.y / 2);

    // Max bounce angle = 75 degrees
    let bounceAngle = normalized * (Math.PI / 3);

    // Clamp to avoid too flat (horizontal) or too steep (vertical)
    const MIN_ANGLE = 0.1;                 // ~6°
    const MAX_ANGLE = Math.PI / 2 - 0.1;   // ~84°
    if (Math.abs(bounceAngle) < MIN_ANGLE) {
        bounceAngle = (bounceAngle >= 0 ? MIN_ANGLE : -MIN_ANGLE);
    } else if (Math.abs(bounceAngle) > MAX_ANGLE) {
        bounceAngle = (bounceAngle >= 0 ? MAX_ANGLE : -MAX_ANGLE);
    }

    let direction = (ball.position.x < CANVAS_WIDTH / 2) ? 1 : -1;
    ball.velocity.x = direction * ball.speed * Math.cos(bounceAngle);
    ball.velocity.y = ball.speed * Math.sin(bounceAngle);

    // Increase speed slightly
    ball.speed += 0.5;
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
        paddleBounce(ball, paddleLeft);
    }

    // Right paddle collision
    if (
        bx + ball.radius > paddleRight.position.x &&
        by > paddleRight.position.y &&
        by < paddleRight.position.y + paddleRight.size.y
    ) {
        paddleBounce(ball, paddleRight);
    }
}

function handleScoring(state) {
    const ball = state.ball;
    const bx = ball.position.x;

    if (bx < 0) {
        state.playerRight.score++;
        resetBall(ball);
    } else if (bx > CANVAS_WIDTH) {
        state.playerLeft.score++;
        resetBall(ball);
    }
    if (state.playerLeft.score >= 3 || state.playerRight.score >= 3)
        state.end = true;
}

function jitter(ball) {
    const MIN_DY = 2;
    if (Math.abs(ball.velocity.y) < MIN_DY) {
        let jitter = (Math.random() - 0.5) * 2;
        ball.velocity.y = (ball.velocity.y < 0 ? -MIN_DY : MIN_DY) + jitter;
    } 
}

function resetBall(ball) {
    ball.position.x = CANVAS_WIDTH / 2;
    ball.position.y = CANVAS_HEIGHT / 2;
    ball.speed = 5;
    // Choose left (-1) or right (+1)
    const direction = Math.random() < 0.5 ? -1 : 1;

    // Random angle within ±45° from horizontal
    const maxAngle = 45 * (Math.PI / 180); // convert degrees to radians
    const angle = (Math.random() * 2 - 1) * maxAngle; // random between -maxAngle and +maxAngle

      // Compute velocity
    ball.velocity.x = direction * ball.speed * Math.cos(angle);
    ball.velocity.y = ball.speed * Math.sin(angle);
    jitter(ball);
}


function updateVelocity(userId, dir, side) {
    console.log(gameStore.onGoingMatches);
    const match = matchService.getMatchByUserId(userId);
    console.log (dir);
    if (!match)
        return;
    const state = match.gameInfo;
    const paddle = match.gameInfo.playerLeft.userId === userId
        || (side === "left" && match.gameInfo.playerLeft.userId === null)
        ? match.gameInfo.paddleLeft
        : match.gameInfo.paddleRight;
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

module.exports = {
    updateVelocity,
    updateGameInfo,
    resetBall,
}