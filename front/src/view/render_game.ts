import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { renderFrame } from "../game/Renderer.js";
import { getFreshToken } from "../remote_storage/remote_storage.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { GameInfo } from "../game/GameInfo.js"
import { connect, getSocket } from "../websocket/wsService.js";

let gameInfo : GameInfo;
let gameState = 0;
let gameOver = false;

const wsUrl = `wss://${location.host}/ws/game?token=${localStorage.getItem('auth_token')}`;

export async function render_game(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer || !headernavs || !friendsBtn) {
		console.error("bodyContainer Container missing")
		return;
	}

	render_header();

	const html = `<div class="flex flex-col items-center gap-8">
		<h1 class="text-5xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent">
			Welcome to Pong
		</h1>

		<div class="flex items-center gap-8 relative">
			<!-- Left Player Info -->
			<div class="flex flex-col items-center text-white">
				<span id="playerLeftName" class="text-xl font-bold">Left</span>
				<span class="text-sm">Controls: W / S</span>
			</div>

			<!-- Game Canvas -->
			<canvas id="gameCanvas" class="w-[800px] h-[600px] bg-[#0a001a]"></canvas>

			<!-- Right Player Info -->
			<div class="flex flex-col items-center text-white">
				<span id="playerRightName" class="text-xl font-bold">Right</span>
				<span class="text-sm">Controls: ↑ / ↓</span>
			</div>
		</div>

		<!-- Winner modal -->
		<div id="winnerModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
			<div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
				<h2 id="winnerText" class="text-3xl font-bold text-white"></h2>
				<p class="text-white">Do you want to play again?</p>
				<div class="flex gap-4 mt-4">
					<button id="playAgainBtn" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Yes</button>
					<button id="exitBtn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">No</button>
				</div>
			</div>
		</div>

		<!-- Countdown display -->
		<div id="countdown" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white hidden"></div>
	</div>`


	bodyContainer.innerHTML = html;

	const modal = document.getElementById('nameModal')!;
	const countdownEl = document.getElementById('countdown')!;
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const winnerModal = document.getElementById('winnerModal')!;
	const winnerText = document.getElementById('winnerText')!;
	const playAgainBtn = document.getElementById('playAgainBtn')!;
	const exitBtn = document.getElementById('exitBtn')!;

	canvas.width = 800;
	canvas.height = 600;
	const ctx = canvas.getContext('2d')!;

	

	connect();

	if (!ctx) {
		// disconnect?
		throw new Error('Canvas 2D context not supported');
	}

	function enablePaddles() {
        const socket = getSocket();
        if (!socket) {
            throw new Error("WebSocket is not connected");
        }
		window.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowUp') {
				socket?.send('movePaddleUp');
				console.log("movePaddleUp send");
			} else if (e.key === 'ArrowDown') {
				console.log("movePaddleDown send")
				socket?.send('movePaddleDown');
			}
		});

		window.addEventListener('keyup', (e) => {
			socket?.send('stopPaddle');
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
                // socket?.send("countdownFinished")
                const response = await fetch(`https://${window.location.host}/api/set/matchmaking/start`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                    credentials: "include"
                });

                const data = await response.json();
                console.log(data);

                console.log("countdownFinished");
                enablePaddles();
                gameLoop();
            }
        }, 1000);
	}

	function gameLoop() {
		// calculate estimation
		renderFrame(ctx, gameInfo);
		if (gameOver) {
			showWinner();
			return; // stop the loop
		}
		requestAnimationFrame(gameLoop);
	}

	function showWinner() {
		const winnerModal = document.getElementById('winnerModal')!;
		const winnerText = document.getElementById('winnerText')!;
		const playAgainBtn = document.getElementById('playAgainBtn')!;
		const exitBtn = document.getElementById('exitBtn')!;

		// Determine winner
		const winnerName = gameInfo.playerLeft.score > gameInfo.playerRight.score ? gameInfo.playerLeft.name : gameInfo.playerRight.name;
		winnerText.textContent = `${winnerName} wins! 🎉`;

		winnerModal.classList.remove('hidden');

		playAgainBtn.onclick = () => {
			// disconnect
			navigateTo("matchmaking");
		};

		exitBtn.onclick = () => {
			navigateTo("dashboard");
		};
	}

	function displayNames() {
		(document.getElementById("playerLeftName") as HTMLElement).textContent = gameInfo.playerLeft.name;
  		(document.getElementById("playerRightName") as HTMLElement).textContent = gameInfo.playerRight.name;
	}

	async function connect() {

		const token = await getFreshToken();
		console.log(token)
        const socket = getSocket();
        if (!socket) {
            throw new Error("WebSocket is not connected");
        }

		// const wsUrl = `wss://${location.host}/ws/game?token=${localStorage.getItem('auth_token')}`;
		// socket = new WebSocket(wsUrl);
		// await new Promise<void>((resolve, reject) => {
        //     if (!socket) return reject("Socket not created");
        //     socket.onopen = () => {
        //         console.log(`✅ WebSocket connected to ${wsUrl}`);
        //         resolve();
        //     };
        //     socket.onerror = (err) => {
        //         console.error(`⚠️ WebSocket error:`, err);
        //         reject(err);
        //     };
		// });
		// socket.send("waiting");
        const response = await fetch(`https://${window.location.host}/api/set/matchmaking/wait`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('auth_token')}`,
            },
            credentials: "include"
        });

        const data = await response.json();
        console.log(data);
		
		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
            switch (data.type) {
                case 'startGame':
                    gameState = data.gameState;
                    gameInfo = data.gameInfo;
					displayNames();
                    renderFrame(ctx, gameInfo)
                    startCountdown();
                    break;
                case 'sendFrames':
                    gameInfo = data.gameInfo;
                    gameState = data.gameState;
                    break;
			    case 'gameOver':
					gameOver = true;
                    break; 
					/* 			case 'partnerLeft':
                    // winner modal +
                    break;
					*/
                default:

            }
		};	
		// socket.onclose = (event) => {
		// console.warn(`❌ WebSocket closed (code=${event.code}, reason=${event.reason || "no reason"})`);
		// };
	}
}

/* 	function updatePaddleVelocity(state: GameState, keys: Set<string>) {
		// Reset velocities
		state.paddleLeft.velocity.y = 0;
		state.paddleRight.velocity.y = 0;
		// Right paddle controls: ArrowUp and ArrowDown
		if (keys.has('ArrowUp')) {
			state.paddleRight.velocity.y = -state.paddleRight.speed;
		}
		if (keys.has('ArrowDown')) {
			state.paddleRight.velocity.y = state.paddleRight.speed;
		}
	} */