import { getFreshToken } from "../../api/getFreshToken.js";
import { setEventLsitenersForMatchmaking } from "../../events/pages/matchmakingPage.js";
import { renderMatchmaking } from "../../render/pages/renderMatchmaking.js";
import { navigateTo } from "../../router/navigateTo.js";
import { connect } from "../../websocket/wsService.js";
import { initTranslations } from "../gloabal/initTranslations.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export async function matchmakingPage(params: URLSearchParams | null) {
	await initTranslations();
	await headerTemplate();

	await renderMatchmaking();
	await setEventLsitenersForMatchmaking();
	startMatchmaking()
}

async function startMatchmaking() {
	const token = await getFreshToken();
	console.log(token)

	const socket = await connect();

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("📩", data);

		if (data.type === "matchFound") {
			const params = new URLSearchParams();
			params.set("mode", "remote");
			navigateTo("game", params);
		}
	};

	const response = await fetch(`https://${window.location.host}/api/set/matchmaking/join`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
		},
		credentials: "include",
	});

	const result = await response.json();
	console.log("Waiting for game:", result);
}
