import { bodyContainer } from "../../constants/constants.js";
import { t } from "../../logic/gloabal/initTranslations.js";
import { gameInfo } from "../../logic/pages/remoteTournamentPage.js";
import { navigateTo } from "../../router/navigateTo.js";
import { getSocket } from "../../websocket/wsService.js";
import { getTournamentSocket } from "../../websocket/wsTournamentService.js";

let leaveButtonRect = { x: 0, y: 0, width: 200, height: 50 };

export async function renderRemoteTournamentPage() {
	if (!bodyContainer) {
		return;
	}

	const html = `<div class="flex flex-col items-center gap-8">
			<h1 class="text-5xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent">
				Welcome to Pong
			</h1>

			<!-- Spieler + Canvas Zeile -->
			<div class="flex items-center gap-8 relative">
				<div class="flex flex-col items-center text-white">
					<span id="playerLeftName" class="text-xl font-bold">Left Player</span>
					<span class="text-sm">Controls: ↑ / ↓</span>
					<span id="playerLeftScore" class="text-2xl font-bold mt-2">0</span>
				</div>

				<canvas id="gameCanvas" class="w-[800px] h-[600px] bg-[#0a001a]" width="800" height="600"></canvas>

				<div class="flex flex-col items-center text-white">
					<span id="playerRightName" class="text-xl font-bold">Right Player</span>
					<span class="text-sm">Controls: ↑ / ↓</span>
					<span id="playerRightScore" class="text-2xl font-bold mt-2">0</span>
				</div>
			</div>

			<!-- Chat unter der Spiel-Zeile -->
			<div id="gameChatContainer" class="w-full max-w-3xl bg-gray-900 rounded-lg mt-6 p-4 flex flex-col h-64">
				<div id="gameChatMessages" class="flex-1 overflow-y-auto text-sm text-white space-y-2 mb-2">
					<div class="text-gray-400 italic">${t('game.tournament.willStartSoon')}</div>
				</div>
				<div class="flex gap-2">
					<input id="gameChatInput" class="flex-1 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none" placeholder=${t('typeMessage')}>
					<button id="gameChatSend" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold">${t('send')}</button>
				</div>
			</div>

			<div id="winnerModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
				<div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
					<h2 id="winnerText" class="text-3xl font-bold text-white"></h2>
					<p class="text-white">${t('game.playAgain')}</p>
					<div class="flex gap-4 mt-4">
						<button id="playAgainBtn" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">${t('game.yes')}</button>
						<button id="exitBtn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">${t('game.no')}</button>
					</div>
				</div>
			</div>

			<div id="countdown" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white hidden"></div>
		</div>`;
		bodyContainer.innerHTML = html;
}

export function renderGameChat(messages: { text: string, type: "system" | "user" }[]) {
	console.log("renderGameChat was acalled: ", messages);
	let chatContainer = document.getElementById("gameChatContainer");
	if (!chatContainer) {
		chatContainer = document.createElement("div");
		chatContainer.id = "gameChatContainer";
		chatContainer.className = "w-full max-w-3xl bg-gray-900 rounded-lg mt-6 p-4 flex flex-col h-64";

		const chatMessages = document.createElement("div");
		chatMessages.id = "gameChatMessages";
		chatMessages.className = "flex-1 overflow-y-auto text-sm text-white space-y-2 mb-2";
		chatContainer.appendChild(chatMessages);

		const chatInputWrapper = document.createElement("div");
		chatInputWrapper.className = "flex gap-2";

		const chatInput = document.createElement("input");
		chatInput.id = "gameChatInput";
		chatInput.className = "flex-1 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none";
		chatInput.placeholder = t('typeMessage');
		chatInputWrapper.appendChild(chatInput);

		const chatSend = document.createElement("button");
		chatSend.id = "gameChatSend";
		chatSend.className = "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold";
		chatSend.textContent = "Send";
		chatInputWrapper.appendChild(chatSend);

		chatContainer.appendChild(chatInputWrapper);

		const canvas = document.getElementById("gameCanvas");
		canvas?.insertAdjacentElement("afterend", chatContainer);
	}

	const chatMessages = document.getElementById("gameChatMessages")!;
	chatMessages.innerHTML = "";

	messages.forEach(msg => {
		const div = document.createElement("div");
		div.className = msg.type === "system" ? "text-gray-400 italic" : "text-white";
		div.textContent = msg.text;
		chatMessages.appendChild(div);
	});

	chatMessages.scrollTop = chatMessages.scrollHeight;

	const chatInput = document.getElementById("gameChatInput") as HTMLInputElement;
	const chatSend = document.getElementById("gameChatSend") as HTMLButtonElement;

	chatSend.onclick = () => {
		if (!chatInput.value.trim()) return;
		const msg = chatInput.value.trim();
		const socket = getTournamentSocket();
		socket?.send(JSON.stringify({ type: "tournamentChat", data: { message: msg } }));
		chatInput.value = "";
	};

	chatInput.onkeydown = (e) => {
		if (e.key === "Enter") chatSend.click();
	};
}

export function showPodium(results: { player: { name: string }, place: number }[]) {
	const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d')!;

	const w = canvas.width;
	const h = canvas.height;

	if (!results || !Array.isArray(results)) {
		console.error("Invalid results:", results);
		return;
	}

	results.sort((a, b) => a.place - b.place);

	const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
	const podiumHeights = [200, 150, 120];
	const baseY = h - 100;
	const boxWidth = 120;
	const spacing = 180;

	const centerX = w / 2;
	const positions = [
		{ place: 1, x: centerX - boxWidth / 2 },
		{ place: 2, x: centerX - spacing - boxWidth / 2 },
		{ place: 3, x: centerX + spacing - boxWidth / 2 }
	];

	ctx.clearRect(0, 0, w, h);

	results.slice(0, 3).forEach((res) => {
		const posIndex = res.place - 1;
		const pos = positions.find(p => p.place === res.place);
		if (!pos) return;

		const height = podiumHeights[posIndex];
		const y = baseY - height;

		ctx.fillStyle = colors[posIndex];
		ctx.fillRect(pos.x, y, boxWidth, height);

		ctx.fillStyle = "#fff";
		ctx.font = "20px Arial";
		ctx.textAlign = "center";
		ctx.fillText(res.player.name, pos.x + boxWidth / 2, y - 20);

		ctx.font = "28px Arial";
		const emoji = pos.place === 1 ? "🥇" : pos.place === 2 ? "🥈" : "🥉";
		ctx.fillText(emoji, pos.x + boxWidth / 2, y - 50);
	});

	const btnWidth = 200;
	const btnHeight = 50;
	const btnX = w / 2 - btnWidth / 2;
	const btnY = baseY + 20;
	leaveButtonRect = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };

	ctx.fillStyle = "#e53935";
	ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

	ctx.fillStyle = "#fff";
	ctx.font = "22px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("🏁 Spiel verlassen", btnX + btnWidth / 2, btnY + btnHeight / 2);

	canvas.addEventListener("click", handleCanvasClick);

	canvas.addEventListener("mousemove", handleCanvasHover);
}

export function handleCanvasClick(event: MouseEvent) {
	const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	if (
		x >= leaveButtonRect.x &&
		x <= leaveButtonRect.x + leaveButtonRect.width &&
		y >= leaveButtonRect.y &&
		y <= leaveButtonRect.y + leaveButtonRect.height
	) {
		try { getSocket()?.close(); } catch {}
		try { getTournamentSocket()?.close(); } catch {}
		navigateTo('dashboard');

		canvas.removeEventListener("click", handleCanvasClick);
		canvas.removeEventListener("mousemove", handleCanvasHover);
	}
}

export function handleCanvasHover(event: MouseEvent) {
	const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	if (
		x >= leaveButtonRect.x &&
		x <= leaveButtonRect.x + leaveButtonRect.width &&
		y >= leaveButtonRect.y &&
		y <= leaveButtonRect.y + leaveButtonRect.height
	) {
		canvas.style.cursor = "pointer";
	} else {
		canvas.style.cursor = "default";
	}
}

export function showCountdownForNextRound() {
	const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d')!;
	let counter = 10;
	const interval = setInterval(() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "#ffffff";
		ctx.font = "72px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillText(counter.toString(), canvas.width / 2, canvas.height / 2);

		counter--;

		if (counter < 0) {
			clearInterval(interval);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	}, 1000);
}

export function displayNames() {
	(document.getElementById("playerLeftName") as HTMLElement).textContent = gameInfo.playerLeft.name;
	(document.getElementById("playerRightName") as HTMLElement).textContent = gameInfo.playerRight.name;
}

export function showWaitingForNextRound() {
	const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#ffffff";
	ctx.font = "36px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("🏁 " + t("tournament.waitForNextRound"), canvas.width / 2, canvas.height / 2);
}
