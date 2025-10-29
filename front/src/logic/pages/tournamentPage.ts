import { navigateTo } from "../../router/navigateTo";
import { showErrorMessage } from "../../templates/popup_message";
import { connectTournament, getTournamentSocket } from "../../websocket/wsTournamentService";
import { headerTemplate } from "../templates/headerTemplate";

export async function tournamentPage(params: URLSearchParams | null) {
	await headerTemplate()
	await connect()

	const socket = getTournamentSocket();

	const gameId = params?.get("gameId");
	if (gameId) {
		socket?.send(JSON.stringify({
			type: "joinGame",
			data: { gameId: Number(gameId) }
		}));
		const btn = document.getElementById("toggleBtn");
		if (btn) btn.style.display = "none";
	}
}

async function connect() {
	const socket = await connectTournament();

	socket.onmessage = (msg) => {
		const message = JSON.parse(msg.data.toString());
		console.log("📩 WS message:", message);

		switch (message.type) {
			case "tournamentCreated":
				//renderRemoteTournament(message.data.players, message.data.messages);
				break;
			case "remoteTournamentUpdated":
				//renderRemoteTournament(message.data.players, message.data.messages, message.data.ready);
				break;
			case "endTournament":
				showErrorMessage(message.data.message || "Tournament ended.");
				navigateTo("dashboard");
				break;
			case "pong":
				console.log("Pong received");
				break;
			case "tournamentStarting":
				const params = new URLSearchParams();
				params.set("gameId", message.data.gameId);
				console.log("Tournament starting, navigating to game with params:", params.toString());
				navigateTo("remote_tournament_game", params);
				break;
		}
	};

	socket.onclose = () => {
		console.log("🔴 Tournament WebSocket disconnected");
		navigateTo("dashboard");
	};

	setInterval(() => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: "ping" }));
		}
	}, 30000);
}
