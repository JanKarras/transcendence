import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { renderFrame } from "../game/Renderer.js";
import { getFreshToken } from "../remote_storage/remote_storage.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { GameInfo } from "../game/GameInfo.js"
import { connect, getSocket } from "../websocket/wsService.js";
import { getTournamentSocket } from "../websocket/wsTournamentService.js";
import { t } from "../constants/i18n.js"
import { render_chat } from "./render_chat.js";

let gameInfo: GameInfo;
let gameState = 0;
let gameOver = false;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let countdownEl: HTMLElement;
let winnerModal: HTMLElement;
let winnerText: HTMLElement;
let playAgainBtn: HTMLElement;
let exitBtn: HTMLElement;

export async function render_remote_tournament_game(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer || !headernavs || !friendsBtn) {
		console.error("bodyContainer Container missing");
		return;
	}

	await render_header();

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
				<input id="gameChatInput" class="flex-1 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none" placeholder="Type a message...">
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

	// Canvas & DOM Elemente
	canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	ctx = canvas.getContext('2d')!;
	countdownEl = document.getElementById('countdown')!;
	winnerModal = document.getElementById('winnerModal')!;
	winnerText = document.getElementById('winnerText')!;
	playAgainBtn = document.getElementById('playAgainBtn')!;
	exitBtn = document.getElementById('exitBtn')!;

	canvas.width = 800;
	canvas.height = 600;

	await connect();
	connectGame();

	// Initialen Chat rendern
	const initialMessages: { text: string, type: "system" | "user" }[] = [
		{ text: "Tournament will starting Soon", type: "system" }
	];
	renderGameChat(initialMessages);

	// Chat Input/Send Button Event
	const chatInput = document.getElementById("gameChatInput") as HTMLInputElement;
	const chatSend = document.getElementById("gameChatSend");
	chatSend?.addEventListener("click", () => {
		const msg = chatInput.value.trim();
		if (!msg) return;

		const socket = getTournamentSocket();
		socket?.send(JSON.stringify({ type: "tournamentChat", data: { message: msg } }));

		renderGameChat([{ text: `You: ${msg}`, type: "user" }]);
		chatInput.value = "";
	});

	chatInput?.addEventListener("keydown", (e) => {
		if (e.key === "Enter") chatSend?.click();
	});
}


function enablePaddles() {
	const socket = getSocket();
	if (!socket) throw new Error("WebSocket is not connected");

	window.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp') socket.send('movePaddleUp');
		else if (e.key === 'ArrowDown') socket.send('movePaddleDown');
	});

	window.addEventListener('keyup', () => {
		socket.send('stopPaddle');
	});
}

function startCountdown() {
	let counter = 5;
	countdownEl.textContent = counter.toString();
	countdownEl.classList.remove('hidden');

	const interval = setInterval(async () => {
		counter--;
		if (counter > 0) {
			countdownEl.textContent = counter.toString();
		} else {
			clearInterval(interval);
			countdownEl.classList.add('hidden');

			const response = await fetch(`https://${window.location.host}/api/set/game/start`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                    body: JSON.stringify({
                        mode: "remote",
                    }),
                    credentials: "include"
                });

			enablePaddles();
			gameLoop();
		}
	}, 1000);
}

function gameLoop() {
	renderFrame(ctx, gameInfo);
	if (gameState >= 4 || gameOver) {
		showWinner();
		return;
	}
	requestAnimationFrame(gameLoop);
}

function showWinner() {
	const tournamentSocket = getTournamentSocket();

	if (!gameInfo) {
		console.error("gameInfo not set");
		return;
	}

	const payload = {
		playerLeft : gameInfo.playerLeft,
		playerRight : gameInfo.playerRight
	};

	tournamentSocket?.send(JSON.stringify({ type: "roundWin", data: payload }));
}


async function connectGame() {
	const token = await getFreshToken();
	const socket = getSocket();
	const tournamentSocket = getTournamentSocket()
	if (!socket) throw new Error("WebSocket is not connected");
	if (!tournamentSocket) throw new Error("WebSocket is not connected");
	await fetch(`https://${window.location.host}/api/set/matchmaking/wait`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${localStorage.getItem('auth_token')}` },
		credentials: "include"
	});

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		//console.log("msg from server game", data)
		switch (data.type) {
			case 'startGame':
				gameState = data.gameState;
				gameInfo = data.gameInfo;
				displayNames();
				renderFrame(ctx, gameInfo);
				startCountdown();
				tournamentSocket?.send(JSON.stringify({
					type: "roundStart",
					data: { playerLeft : gameInfo.playerLeft, playerRight : gameInfo.playerRight }
				}));
				break;
			case 'sendFrames':
				gameInfo = data.gameInfo;
				gameState = data.gameState;
				break;
			default:
				break;
		}
	};
	tournamentSocket.onmessage = (event) => {
	const data = JSON.parse(event.data);
	console.log("msg from server tournament", data)
	switch (data.type) {
		case 'remoteTournamentUpdated':
			renderGameChat(data.data.messages);
			break;

		default:
			break;
	}
}
}

function displayNames() {
	(document.getElementById("playerLeftName") as HTMLElement).textContent = gameInfo.playerLeft.name;
	(document.getElementById("playerRightName") as HTMLElement).textContent = gameInfo.playerRight.name;
}

function renderGameChat(messages: { text: string, type: "system" | "user" }[]) {
	console.log("renderGameChat was acalled: ", messages);
    // Prüfen, ob Container existiert, sonst erstellen
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
        chatInput.placeholder = "Type a message...";
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

    // Event Listener für Senden
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
