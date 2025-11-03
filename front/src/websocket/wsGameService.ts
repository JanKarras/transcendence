import { getFreshToken } from "../api/getFreshToken.js";


let socket: WebSocket | null = null;

export function getGameSocket(): WebSocket | null {
	return socket;
}

export async function connectGameSocket() {
	if (socket && socket.readyState === WebSocket.OPEN) {
		return socket;
	}

	const token = await getFreshToken();
	if (!token) {
		throw new Error("No auth token found");
	}

	const wsUrl = `wss://${location.host}/ws/game?token=${token}`;
	socket = new WebSocket(wsUrl);

	await new Promise<void>((resolve, reject) => {
		socket!.onopen = () => {
			console.log(`✅ WebSocket connected to ${wsUrl}`);
			resolve();
		};
		socket!.onerror = (err) => {
			reject(err);
		};
	});

	return socket!;
}
