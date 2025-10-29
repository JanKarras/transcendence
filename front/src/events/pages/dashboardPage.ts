import { headerTemplate } from "../../logic/templates/headerTemplate.js";
import { navigateTo } from "../../router/navigateTo.js";

export async function setEventListenersDashboardPage() {
	const playNowBtn = document.getElementById("playNowBtn");
	const localBtn = document.getElementById("localBtn");
	const remoteBtn = document.getElementById("remoteBtn");
	const startTournamentBtn = document.getElementById("startTournamentBtn");
	const mode = document.getElementById("modeModal");

	const chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;

	chatInput.addEventListener('input', () => {
		chatInput.style.height = 'auto';
		const lineHeight = 24;
		const maxLines = 5;
		const maxHeight = lineHeight * maxLines;
		chatInput.style.height = Math.min(chatInput.scrollHeight, maxHeight) + 'px';
	});

	playNowBtn?.addEventListener("click", () => mode?.classList.remove("hidden"));
	mode?.addEventListener("click", (e) => { if (e.target === mode) mode.classList.add("hidden"); });
	localBtn?.addEventListener("click", () => { const p = new URLSearchParams(); p.set("mode","local"); navigateTo("game", p); });
	remoteBtn?.addEventListener("click", () => navigateTo("matchmaking"));
	startTournamentBtn?.addEventListener("click", () => navigateTo("tournament"));
	window.location.hash = "#dashboard";
	headerTemplate();
}
