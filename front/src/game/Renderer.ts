import { GameState } from './GameState.js';

export function renderFrame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(state.ball.position.x, state.ball.position.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Draw paddles
  for (const paddle of [state.paddleLeft, state.paddleRight]) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.position.x, paddle.position.y, paddle.size.x, paddle.size.y);
  }

  // Draw scores
  ctx.font = '50px Arial';
  ctx.fillText(state.playerLeft.score.toString(), ctx.canvas.width / 4, 50);
  ctx.fillText(state.playerRight.score.toString(), (ctx.canvas.width * 3) / 4, 50);
}
