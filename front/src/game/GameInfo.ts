import type {Ball } from './Ball.js';
import type { Paddle } from './Paddle.js';
import type { PaddleSizeOption } from './GameConfig.js';
import { PaddleSizes } from './GameConfig.js';
import type {Player} from './Player.js'

export interface GameInfo {
  ball: Ball;
  paddleLeft: Paddle;
  paddleRight: Paddle;
  playerLeft: Player;
  playerRight: Player;
  end: boolean;
}

export function createInitialState( paddleSize: PaddleSizeOption = 'medium',  ): GameInfo {
	const baseSpeed = { x: 5, y: 4 }
	const angle = (Math.random() - 0.5) * (Math.PI / 2);

	// Randomize horizontal direction (left/right)
	const direction = Math.random() > 0.5 ? 1 : -1;

	return {
		ball: {
		position: { x: 400, y: 300 },
		velocity: { x: direction * baseSpeed.x * Math.cos(angle),
		y: baseSpeed.y * Math.sin(angle) },
		radius: 10,
		},
		paddleLeft: {
		position: { x: 20, y: 250 },
		size: { ...PaddleSizes[paddleSize] },
		speed: baseSpeed.x * 1.8,
		velocity: { x: 0, y: 0 },
		},
		paddleRight: {
		position: { x: 770, y: 250 },
		size: { ...PaddleSizes[paddleSize] },
		speed: baseSpeed.x * 1.8,
		velocity: { x: 0, y: 0 },
		},
		playerLeft: {name: "Left", score: 0},
		playerRight: {name: "Right", score: 0},
		end: false
	};
}