import { bodyContainer } from "../../constants/constants.js";
import { t } from "../../logic/global/initTranslations.js";

export async function renderGamePage(mode : string | null | undefined, showUsernameModal : boolean) {
	if (!bodyContainer) {
		console.error("Body container missing");
		return;
	}

	bodyContainer.innerHTML = `
	<div class="flex flex-col items-center gap-8">
		<h1 class="text-5xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent">
			Welcome to Pong
		</h1>

		<div class="flex items-center gap-8 relative">
			<div class="flex flex-col items-center text-white">
				<span id="playerLeftName" class="text-xl font-bold">${t('game.left')}</span>
				<span id="playerLeftControls" class="text-sm">${mode === "local" ? `${t('game.controls')}: W / S` : `${t('game.controls')}: ↑ / ↓`}</span>
			</div>

			<canvas id="gameCanvas" class="w-[800px] h-[600px] bg-[#0a001a]"></canvas>

			<div class="flex flex-col items-center text-white">
				<span id="playerRightName" class="text-xl font-bold">${t('game.right')}</span>
				<span id="playerRightControls" class="text-sm">${t('game.controls')}: ↑ / ↓</span>
			</div>
		</div>

		<!-- Winner Modal -->
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

		<!-- Username Modal -->
		<div id="usernameModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 ${showUsernameModal ? "" : "hidden"}">
			<div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
				<h4 class="text-2xl font-bold text-white">${t('game.secondPlayerUsername')}</h4>
				<input id="usernameInput" type="text" placeholder="username"
					class="px-4 py-2 rounded bg-gray-600 text-white text-center w-64">
				<div class="flex gap-6 mt-4">
					<button id="submitUsernameBtn" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded">${t('game.submit')}</button>
					<button id="cancelUsernameBtn" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded">${t('game.cancel')}</button>
				</div>
			</div>
		</div>

		<div id="countdown" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white hidden"></div>
	</div>`;
	const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null;
	if (canvas) {
		canvas.width = 800;
		canvas.height = 600;
	}
}
