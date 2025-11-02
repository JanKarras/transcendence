import { getFreshToken } from "../api/getFreshToken.js";


let chatSocket: WebSocket | null = null;

export function getChatSocket(): WebSocket | null {
	return chatSocket;
}

export async function connectChat(): Promise<WebSocket> {
	if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
		return chatSocket;
	}

	const token = await getFreshToken();
	if (!token) throw new Error("No auth token found");

	const wsUrl = `wss://${location.host}/ws/chat?token=${token}`;
	chatSocket = new WebSocket(wsUrl);

	await new Promise<void>((resolve, reject) => {
		chatSocket!.onopen = () => {
			console.log(`✅ chat WebSocket connected to ${wsUrl}`);
			resolve();
		};
		chatSocket!.onerror = (err) => reject(err);
	});

	return chatSocket!;
}

export function closeChatSocket() {
	if (chatSocket) {
		chatSocket.close();
		chatSocket = null;
	}
}
