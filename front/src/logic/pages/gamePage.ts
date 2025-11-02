import { setGameEventListeners } from "../../events/pages/gamePage.js";
import { GameInfo } from "../../game/GameInfo.js";
import { renderFrame } from "../../game/Renderer.js";
import { renderGamePage } from "../../render/pages/renderGamePage.js";
import { navigateTo } from "../../router/navigateTo.js";
import { connectGameSocket, getGameSocket } from "../../websocket/wsGameService.js";
import { headerTemplate } from "../templates/headerTemplate.js";

let gameInfo : GameInfo;
let gameOver = false;

export let currentMode: "local" | "remote" | null = null;

export async function gamePage(params: URLSearchParams | null) {

	const modeParam = params?.get("mode");
	let username = params?.get("username");
	console.log(params)
	currentMode = modeParam === "local" || modeParam === "remote" ? modeParam : null;

	let showUsernameModal = false;
	if (currentMode === "local" && !username) showUsernameModal = true;
	gameOver = false;
	await headerTemplate();
	await renderGamePage(currentMode, showUsernameModal);

	setGameEventListeners(username, params);

}

export async function startLocalGame(username: string, ctx: CanvasRenderingContext2D): Promise<void> {
	const socket = await connectGameSocket();
	if (!socket) return;

	socket.onmessage = (event: MessageEvent) => handleGameMessage(event, ctx, "local");

	await fetch(`https://${window.location.host}/api/set/game/create`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`,
		},
		body: JSON.stringify({ username }),
		credentials: "include",
	});
}

export async function startRemoteGame(ctx: CanvasRenderingContext2D, params: URLSearchParams | null): Promise<void> {
	const socket = await connectGameSocket();
	if (!socket) return;

	socket.onmessage = (event: MessageEvent) => handleGameMessage(event, ctx, "remote");

	const via = params?.get("via");
	console.log("VIAA", via);

    const response = await fetch(`https://${window.location.host}/api/set/matchmaking/wait`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('auth_token')}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ via }),
        credentials: "include"
    });
}

function handleGameMessage(event: MessageEvent, ctx: CanvasRenderingContext2D, mode: "local" | "remote"): void {
	const data = JSON.parse(event.data);
	switch (data.type) {
		case "startGame":
			gameInfo = data.gameInfo as GameInfo;
			displayNames()
			startCountdown(ctx, mode);
			break;
		case "sendFrames":
			gameInfo = data.gameInfo as GameInfo;
			renderFrame(ctx, gameInfo);
			break;
		case "gameOver":
			gameOver = true;
			showWinner();
			break;
		default:
			console.warn("Unbekannter WS-Typ:", data.type);
	}
}

function startCountdown(ctx: CanvasRenderingContext2D, mode: "local" | "remote"): void {
	let counter = 5;
	const el = document.getElementById("countdown") as HTMLElement | null;
	if (!el) return;

	el.classList.remove("hidden");
	el.textContent = counter.toString();

	const interval = setInterval(async () => {
		counter--;
		if (counter > 0) {
			el.textContent = counter.toString();
		} else {
			clearInterval(interval);
			el.classList.add("hidden");

			await fetch(`https://${window.location.host}/api/set/game/start`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`,
				},
				body: JSON.stringify({ mode }),
				credentials: "include",
			});

			enablePaddles();
			gameLoop(ctx);
		}
	}, 1000);
}

function showWinner(): void {
	const winnerModal = document.getElementById("winnerModal") as HTMLElement | null;
	const winnerText = document.getElementById("winnerText") as HTMLElement | null;
	const playAgainBtn = document.getElementById("playAgainBtn") as HTMLButtonElement | null;
	const exitBtn = document.getElementById("exitBtn") as HTMLButtonElement | null;

	if (!winnerModal || !winnerText || !playAgainBtn || !exitBtn || !gameInfo) return;

	const winner =
		gameInfo.playerLeft.score > gameInfo.playerRight.score
			? gameInfo.playerLeft.name
			: gameInfo.playerRight.name;

	winnerText.textContent = `${winner} wins!`;
	winnerModal.classList.remove("hidden");

	playAgainBtn.onclick = () => {
		gameOver = false;
		winnerModal.classList.add("hidden");
		if (currentMode === "local") {
			const params = new URLSearchParams();
			params.set("mode", "local");

			const username = gameInfo.playerLeft?.name || "";
			if (username) params.set("username", username);

			navigateTo("game", params);
		} else {
			navigateTo("matchmaking");
		}
	};
	exitBtn.onclick = () => navigateTo("dashboard");
}

function enablePaddles(): void {
	const socket = getGameSocket();
	if (!socket || socket.readyState !== WebSocket.OPEN){
		throw new Error("WebSocket is not connected");
	}
	window.addEventListener("keydown", (e) => {
		if (socket.readyState !== WebSocket.OPEN) return;
		console.log(e)
		switch (e.key) {
			case "ArrowUp":
				socket.send("movePaddleUp");
				break;
			case "ArrowDown":
				socket.send("movePaddleDown");
				break;
			case "w":
			case "W":
				socket.send("moveLeftPaddleUp");
				break;
			case "s":
			case "S":
				socket.send("moveLeftPaddleDown");
				break;
		}
	});

	window.addEventListener("keyup", (e) => {
		if (socket.readyState !== WebSocket.OPEN) return;

		switch (e.key) {
			case "ArrowUp":
			case "ArrowDown":
				socket.send("stopPaddle");
				break;
			case "w":
			case "W":
			case "s":
			case "S":
				socket.send("stopLeftPaddle");
				break;
		}
	});
}

function gameLoop(ctx: CanvasRenderingContext2D): void {
	renderFrame(ctx, gameInfo);
	if (!gameOver) requestAnimationFrame(() => gameLoop(ctx));
	else showWinner();
}

function displayNames() {
	(document.getElementById("playerLeftName") as HTMLElement).textContent = gameInfo.playerLeft.name;
	(document.getElementById("playerRightName") as HTMLElement).textContent = gameInfo.playerRight.name;
}
