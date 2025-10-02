import { bodyContainer } from "../constants/constants.js";
import { render_header } from "./render_header.js";

let socket: WebSocket | null = null;

const wsUrl = `wss://${location.host}/ws/tournament?token=${localStorage.getItem('auth_token')}`;

const gameData = {
	player1: "",
	path1: "",
	player2: "",
	player3: "",
	player4: "",
};

export async function render_local_tournament_game(params: URLSearchParams | null) {
	if (!bodyContainer) return;

	await render_header();

	// HTML Layout: Canvas in der Mitte, Spielerinfos links & rechts, Chat darunter
	const html = `
	<div class="flex flex-col items-center gap-4 p-4 h-[750px]">
		<!-- Spielerinfos & Canvas -->
		<div class="flex items-center gap-8">
			<!-- Spieler links -->
			<div class="flex flex-col items-center text-white">
				<img id="playerLeftImg" src="" class="w-16 h-16 rounded-full mb-2"/>
				<span id="playerLeftName" class="text-xl font-bold"></span>
				<span id="playerLeftScore" class="text-2xl font-bold mt-2">0</span>
			</div>

			<!-- Canvas -->
			<canvas id="gameCanvas" class="w-[800px] h-[600px] bg-[#0a001a]"></canvas>

			<!-- Spieler rechts -->
			<div class="flex flex-col items-center text-white">
				<img id="playerRightImg" src="" class="w-16 h-16 rounded-full mb-2"/>
				<span id="playerRightName" class="text-xl font-bold"></span>
				<span id="playerRightScore" class="text-2xl font-bold mt-2">0</span>
			</div>
		</div>

		<!-- Chat unter Canvas -->
		<div id="tournamentChat" class="w-[1000px] max-w-full h-[120px] bg-gray-900 text-white p-2 rounded overflow-y-auto flex flex-col-reverse">
			<!-- Nachrichten werden hier eingefügt -->
		</div>

		<!-- Countdown -->
		<div id="countdown" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white hidden"></div>
	</div>
	`;

	bodyContainer.innerHTML = html;

	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d')!;
	const chatEl = document.getElementById('tournamentChat')!;

	canvas.width = 800;
	canvas.height = 600;

	// WebSocket verbinden
	connect(chatEl, ctx);
}

async function connect(chatEl: HTMLElement, ctx: CanvasRenderingContext2D) {
	socket = new WebSocket(wsUrl);

	await new Promise<void>((resolve, reject) => {
		if (!socket) return reject("Socket not created");
		socket.onopen = () => {
			console.log(`✅ WebSocket connected to ${wsUrl}`);
			socket?.send(JSON.stringify({ type: "getData", data: {} }));
			resolve();
		};
		socket.onerror = (err) => {
			console.error(`⚠️ WebSocket error:`, err);
			reject(err);
		};
	});

	socket.onmessage = (event) => {
		const message = JSON.parse(event.data);

		if (message.type === "tournamentData") {
			const { player1, path1, player2 } = message.data;
			gameData.player1 = player1;
			gameData.path1 = path1 || "std_user_img.png";
			gameData.player2 = player2;

			// Spielername & Bild rendern
			const leftName = document.getElementById('playerLeftName')!;
			const rightName = document.getElementById('playerRightName')!;
			const leftImg = document.getElementById('playerLeftImg') as HTMLImageElement;
			const rightImg = document.getElementById('playerRightImg') as HTMLImageElement;

			leftName.textContent = gameData.player1;
			rightName.textContent = gameData.player2;

			leftImg.src = `/api/get/getImage?filename=${encodeURIComponent(gameData.path1)}`;
			rightImg.src = `/api/get/getImage?filename=${encodeURIComponent(gameData.path1)}`;

			startCountdown(ctx, chatEl);
		} else if (message.type === "chatMessage") {
			addChatMessage(chatEl, message.text);
		}
	};
}

function startCountdown(ctx: CanvasRenderingContext2D, chatEl: HTMLElement) {
	const countdownEl = document.getElementById('countdown')!;
	let counter = 5;
	countdownEl.textContent = counter.toString();
	countdownEl.classList.remove('hidden');

	const interval = setInterval(() => {
		counter--;
		if (counter > 0) {
			countdownEl.textContent = counter.toString();
			addChatMessage(chatEl, `Game starting in ${counter}...`);
		} else {
			clearInterval(interval);
			countdownEl.classList.add('hidden');
			addChatMessage(chatEl, `Game started: ${gameData.player1} vs ${gameData.player2}`);
			enableControls(ctx);
			gameLoop(ctx);
		}
	}, 1000);
}

function enableControls(ctx: CanvasRenderingContext2D) {
	window.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp') console.log('movePaddleUp');
		if (e.key === 'ArrowDown') console.log('movePaddleDown');
	});
}

function gameLoop(ctx: CanvasRenderingContext2D) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// hier könnte renderFrame(ctx, gameInfo) laufen
	requestAnimationFrame(() => gameLoop(ctx));
}

function addChatMessage(chatEl: HTMLElement, text: string) {
	const msgEl = document.createElement('div');
	msgEl.textContent = text;
	chatEl.prepend(msgEl); // neueste oben
}
