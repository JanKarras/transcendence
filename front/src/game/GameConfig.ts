import type { Vector } from './Vector.js';

export type PaddleSizeOption = 'small' | 'medium' | 'large';

export const PaddleSizes: Record<PaddleSizeOption, Vector> = {
	small: { x: 10, y: 40 },
	medium: { x: 10, y: 70 },
	large: { x: 10, y: 100 },
};
