import { handleTournamentMessage, sendChatMessage } from "../../logic/pages/tournamentPage.js";
import { navigateTo } from "../../router/navigateTo.js";

export async function setTournamentEventListeners(socket: WebSocket): Promise<void> {
	const chatInput = document.getElementById("chatInput") as HTMLInputElement;
	const chatSend = document.getElementById("chatSend");
	chatSend?.addEventListener("click", () => sendChatMessage(socket, chatInput));
	chatInput?.addEventListener("keydown", (e) => {
		if (e.key === "Enter") sendChatMessage(socket, chatInput);
	});

	const startBtn = document.getElementById("startTournamentBtn") as HTMLButtonElement;
	startBtn?.addEventListener("click", () => {
		socket.send(JSON.stringify({ type: "startTournament" }));
	});

	document.getElementById("cancelInvite")?.addEventListener("click", () => {
		document.getElementById("inviteModal")?.classList.add("hidden");
	});

	socket.onmessage = (msg) => handleTournamentMessage(msg, socket);
	socket.onclose = () => {
		console.warn("🔴 Tournament WebSocket disconnected");
		navigateTo("dashboard");
	};
}
