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
let matchfound = false

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

	// Canvas & DOM Elemente
	canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	ctx = canvas.getContext('2d')!;
	countdownEl = document.getElementById('countdown')!;
	winnerModal = document.getElementById('winnerModal')!;
	winnerText = document.getElementById('winnerText')!;
	playAgainBtn = document.getElementById('playAgainBtn')!;
	exitBtn = document.getElementById('exitBtn')!;
	gameOver = false;
	matchfound = false
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
			console.log("route game start called")
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
			console.log(response)
			enablePaddles();
			gameLoop();
		}
	}, 1000);
}

function gameLoop() {
	renderFrame(ctx, gameInfo);
	if (gameOver) {
		console.log(gameInfo, gameOver)
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
		playerLeft: gameInfo.playerLeft,
		playerRight: gameInfo.playerRight,
	};

	console.log("round win pending...");

	const socket = getSocket();

	matchfound = false;

	if (!socket) {
		console.warn("No game socket, sending immediately");
		tournamentSocket?.send(JSON.stringify({ type: "roundWin", data: payload }));
		return;
	}

	if (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED) {
		console.log("Socket already closed or closing, sending roundWin immediately");
		tournamentSocket?.send(JSON.stringify({ type: "roundWin", data: payload }));
		return;
	}

	socket.addEventListener("close", () => {
		console.log("Socket successfully closed, sending roundWin");
		tournamentSocket?.send(JSON.stringify({ type: "roundWin", data: payload }));
	});

	socket.close();
}


async function GameSocketEventListeners() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	console.log("GameSocketEventListenersCalled")
	const socket = getSocket();
	if (!socket) throw new Error("WebSocket is not connected");
	const tournamentSocket = getTournamentSocket()
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
			case 'gameOver':
				gameOver = true;
				break;
			default:
				break;
		}
	};
	socket.onclose = () => {
		console.log("Game Socket Closed");
	}
}

async function startSecondRound() {
	const interValId = setInterval(async () => {
		if (matchfound) {
			clearInterval(interValId);
			await connect();
			GameSocketEventListeners();
			gameOver = false;
		}
	}, 10)
}

async function connectGame() {
	const token = await getFreshToken();
	const tournamentSocket = getTournamentSocket()
	if (!tournamentSocket) throw new Error("WebSocket is not connected");

	GameSocketEventListeners();

 	tournamentSocket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("msg from server tournament", data)
		switch (data.type) {
			case 'remoteTournamentUpdated':
				renderGameChat(data.data.messages);
				break;
			case 'startSecondRound':
				console.log("startSecondRound")
				startSecondRound()
				break;
			case 'matchFound' :
				console.log("Match found was send")
				matchfound = true;
				break
			case 'tournamentFinished':
				console.log("Tournament Finished", data.data)
				showPodium(data.data.results);
				break
			default:
				break;
		}
	}
}

let leaveButtonRect = { x: 0, y: 0, width: 200, height: 50 }; // globale Variable für Klickprüfung

function showPodium(results: { player: { name: string }, place: number }[]) {
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

	// Podium zeichnen
	results.slice(0, 3).forEach((res) => {
		const posIndex = res.place - 1;
		const pos = positions.find(p => p.place === res.place);
		if (!pos) return;

		const height = podiumHeights[posIndex];
		const y = baseY - height;

		// Podium Block
		ctx.fillStyle = colors[posIndex];
		ctx.fillRect(pos.x, y, boxWidth, height);

		// Name
		ctx.fillStyle = "#fff";
		ctx.font = "20px Arial";
		ctx.textAlign = "center";
		ctx.fillText(res.player.name, pos.x + boxWidth / 2, y - 20);

		// Medaille / Emoji
		ctx.font = "28px Arial";
		const emoji = pos.place === 1 ? "🥇" : pos.place === 2 ? "🥈" : "🥉";
		ctx.fillText(emoji, pos.x + boxWidth / 2, y - 50);
	});

	// Leave Button im Canvas
	const btnWidth = 200;
	const btnHeight = 50;
	const btnX = w / 2 - btnWidth / 2;
	const btnY = baseY + 20; // unter dem Podium
	leaveButtonRect = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };

	// Button Hintergrund
	ctx.fillStyle = "#e53935";
	ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

	// Button Text
	ctx.fillStyle = "#fff";
	ctx.font = "22px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("🏁 Spiel verlassen", btnX + btnWidth / 2, btnY + btnHeight / 2);

	// Klick-Event
	canvas.addEventListener("click", handleCanvasClick);

	// Hover-Effekt für Cursor
	canvas.addEventListener("mousemove", handleCanvasHover);
}

// Klick-Funktion
function handleCanvasClick(event: MouseEvent) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	if (
		x >= leaveButtonRect.x &&
		x <= leaveButtonRect.x + leaveButtonRect.width &&
		y >= leaveButtonRect.y &&
		y <= leaveButtonRect.y + leaveButtonRect.height
	) {
		// Button geklickt
		try { getSocket()?.close(); } catch {}
		try { getTournamentSocket()?.close(); } catch {}
		navigateTo('dashboard');

		// Eventlistener entfernen
		canvas.removeEventListener("click", handleCanvasClick);
		canvas.removeEventListener("mousemove", handleCanvasHover);
	}
}

// Hover-Funktion
function handleCanvasHover(event: MouseEvent) {
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
