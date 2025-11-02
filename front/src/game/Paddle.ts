import type { Vector } from './Vector.js';

export interface Paddle {
	position: Vector;
	size: Vector;
	speed: number;
	velocity: Vector;
}