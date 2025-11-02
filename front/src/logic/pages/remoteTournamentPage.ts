import { getFreshToken } from "../../api/getFreshToken.js";
import { GameInfo } from "../../game/GameInfo.js";
import { renderFrame } from "../../game/Renderer.js";
import { displayNames, renderGameChat, renderRemoteTournamentPage, showCountdownForNextRound, showPodium, showWaitingForNextRound } from "../../render/pages/renderRemoteTournament.js";
import { connectGameSocket, getGameSocket } from "../../websocket/wsGameService.js";
import { getTournamentSocket } from "../../websocket/wsTournamentService.js";
import { initTranslations } from "../gloabal/initTranslations.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export let gameInfo: GameInfo;
export let gameState = 0;
export let gameOver = false;
export let matchfound = false;

export let canvas: HTMLCanvasElement;
export let ctx : CanvasRenderingContext2D;

export function resetGameState() {
	gameOver = false;
	matchfound = false;
}

export async function remoteTournamentPage(params: URLSearchParams | null) {
	await headerTemplate();

	await initTranslations();
	await renderRemoteTournamentPage()
	await connectGameSocket();
	connectGame();
	canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	ctx = canvas.getContext('2d')!;
	resetGameState()

	const initialMessages: { text: string, type: "system" | "user" }[] = [
		{ text: "Tournament will starting Soon", type: "system" }
	];

	renderGameChat(initialMessages);

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

				matchfound = true;
				break
			case 'tournamentFinished':
				console.log("Tournament Finished", data.data)
				showPodium(data.data.results);
				break
			case 'firstRoundFinished':
				showCountdownForNextRound();
				break;
			case 'endTournament':
				const socket = getGameSocket();
				try { socket?.close(); } catch {}
			default:
				break;
		}
	}
}

async function GameSocketEventListeners() {
	const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	console.log("GameSocketEventListenersCalled")
	const socket = getGameSocket();
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
			await connectGameSocket();
			GameSocketEventListeners();
			gameOver = false;
		}
	}, 10)
}

function startCountdown() {
	const countdownEl: HTMLElement = document.getElementById('countdown')!;;
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
						mode: "tournament",
					}),
					credentials: "include"
				});
			enablePaddles();
			gameLoop();
		}
	}, 1000);
}

function enablePaddles() {
	const socket = getGameSocket();
	if (!socket) throw new Error("WebSocket is not connected");

	window.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp') socket.send('movePaddleUp');
		else if (e.key === 'ArrowDown') socket.send('movePaddleDown');
	});

	window.addEventListener('keyup', () => {
		socket.send('stopPaddle');
	});
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

	const socket = getGameSocket();
	matchfound = false;

	if (!socket) {
		console.warn("No game socket, sending immediately");
		tournamentSocket?.send(JSON.stringify({ type: "roundWin", data: payload }));
		showWaitingForNextRound();
		return;
	}

	if (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED) {
		console.log("Socket already closed or closing, sending roundWin immediately");
		tournamentSocket?.send(JSON.stringify({ type: "roundWin", data: payload }));
		showWaitingForNextRound();
		return;
	}

	socket.addEventListener("close", () => {
		console.log("Socket successfully closed, sending roundWin");
		tournamentSocket?.send(JSON.stringify({ type: "roundWin", data: payload }));
		showWaitingForNextRound();
	});

	socket.close();
}
