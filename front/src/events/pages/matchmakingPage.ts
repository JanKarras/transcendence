import { navigateTo } from "../../router/navigateTo.js";
import { getGameSocket } from "../../websocket/wsGameService.js";

export async function setEventLsitenersForMatchmaking() {
	const cancelBtn = document.getElementById("cancelBtn");
	cancelBtn?.addEventListener('click', () => {
		const socket = getGameSocket();
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.close(1000, "User cancelled matchmaking");
		}
		navigateTo("dashboard");
	});
}
