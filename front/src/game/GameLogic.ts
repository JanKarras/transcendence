import { GameState } from './GameState';
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import type { PaddleSizeOption } from './GameConfig.js';
import { PaddleSizes } from './GameConfig.js';

export function updateGameState(state: GameState, canvasHeight: number): void {
  const ball = state.ball;
  moveBall(ball);
  bounceBall(ball, canvasHeight);
  movePaddles(state, canvasHeight);
  handleCollisions(state);
  handleScoring(state);
}

function moveBall(ball: Ball): void {
  ball.position.x += ball.velocity.x;
  ball.position.y += ball.velocity.y;
}

function bounceBall(ball: Ball, canvasHeight: number): void {
  if (ball.position.y - ball.radius < 0 || ball.position.y + ball.radius > canvasHeight) {
    ball.velocity.y *= -1;
  }
}

function movePaddles(state: GameState, canvasHeight: number): void {
  // Move paddles using their velocity vector
  state.paddleLeft.position.y += state.paddleLeft.velocity.y;
  state.paddleRight.position.y += state.paddleRight.velocity.y;

  // Clamp paddles inside canvas
  for (const paddle of [state.paddleLeft, state.paddleRight]) {
    if (paddle.position.y < 0) paddle.position.y = 0;
    if (paddle.position.y + paddle.size.y > canvasHeight) paddle.position.y = canvasHeight - paddle.size.y;
  }
}

function handleCollisions(state: GameState): void {
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

function handleScoring(state: GameState): void {
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

export function resetBall(ball: Ball): void {
	ball.position.x = 400;
	ball.position.y = 300;

	const baseSpeed = { x: 5, y: 4 };
	ball.velocity.x = Math.random() > 0.5 ? baseSpeed.x : -baseSpeed.x;
	ball.velocity.y = (Math.random() > 0.5 ? 1 : -1) * baseSpeed.y;
}