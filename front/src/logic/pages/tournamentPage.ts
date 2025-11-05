import { setTournamentEventListeners } from "../../events/pages/tournament.js";
import { renderRemoteTournament, renderTournamentPage } from "../../render/pages/renderTournament.js";
import { navigateTo } from "../../router/navigateTo.js";
import { connectTournament, getTournamentSocket } from "../../websocket/wsTournamentService.js";
import { headerTemplate } from "../templates/headerTemplate.js";
import { showErrorMessage } from "../templates/popupMessage.js";
import { t } from "../../logic/global/initTranslations.js";

export async function tournamentPage(params: URLSearchParams | null) {
	await headerTemplate();
	await connectTournament();

	const startTournamentBtn = document.getElementById("startTournamentBtn");
	if (params) {
		startTournamentBtn?.classList.add("hidden")
	}

	const socket = getTournamentSocket();
	if (!socket) {
		showErrorMessage(t('tournament.connectionFail'));
		return navigateTo("dashboard");
	}

	await renderTournamentPage();

	const gameId = params?.get("gameId");
	if (gameId) {
		socket.send(JSON.stringify({
			type: "joinGame",
			data: { gameId: Number(gameId) }
		}));
		const btn = document.getElementById("startTournamentBtn");
		const tournamentContent = document.getElementById("tournamentContent");
		tournamentContent?.classList.add("pointer-events-none");
		btn?.classList.add("hidden");
	}

	await setTournamentEventListeners(socket);
	if (!gameId) {
		socket.send(JSON.stringify({ type: "createRemoteTournament" }));
	}
}

export function sendChatMessage(socket: WebSocket, input: HTMLInputElement): void {
	const msg = input.value.trim();
	if (!msg) return;
	socket.send(JSON.stringify({ type: "tournamentChat", data: { message: msg } }));
	addChatMessage(`You: ${msg}`, "user");
	input.value = "";
}

export function handleTournamentMessage(msg: MessageEvent, socket: WebSocket): void {
	const message = JSON.parse(msg.data.toString());

	switch (message.type) {
		case "tournamentCreated":
		case "remoteTournamentUpdated":
			renderRemoteTournament(message.data.players, message.data.messages, message.data.ready);
			break;
		case "endTournament":
			showErrorMessage(message.data.message || t('tournament.end'));
			navigateTo("dashboard");
			break;
		case "tournamentStarting":
			const params = new URLSearchParams();
			params.set("gameId", message.data.gameId);
			navigateTo("remote_tournament_game", params);
			break;
		case "tournamentNotFound":
			showErrorMessage(t('tournament.notExist'));
			navigateTo("dashboard");
			break;
	}
}

export function addChatMessage(text: string, type: "system" | "user" = "system"): void {
	const chat = document.getElementById("chatMessages");
	if (!chat) return;
	const msg = document.createElement("div");
	msg.className = type === "system" ? "text-gray-400 italic" : "text-white";
	msg.textContent = text;
	chat.appendChild(msg);
	chat.scrollTop = chat.scrollHeight;
}

