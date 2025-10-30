import { navigateTo } from "../../router/navigateTo.js";
import { friendChat } from "../../websocket/ws.js";

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
}

export async function setEventListenersDashboardPageChat() {
	const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
	const chatInput = document.getElementById('chatInput') as HTMLInputElement;

	function sendMessageHandler() {
	    const content: string = chatInput.value.trim();
	    if (content) {
	        friendChat(content);
	        chatInput.value = '';
	    }
	}

	sendBtn.addEventListener('click', sendMessageHandler);

	chatInput.addEventListener('keydown', (e) => {
	    if (e.key === 'Enter') {
	        e.preventDefault();
	        sendMessageHandler();
	    }
	});
}
