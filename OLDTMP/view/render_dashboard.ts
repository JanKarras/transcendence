import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { getMatchHistory, getUser, logOutApi, getStats, saveProfileChanges } from "../remote_storage/remote_storage.js";
import { initTranslations, t } from "../constants/i18n.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { UserInfo } from "../constants/structs.js";
import { connectWebSocket, friendChat, refreshFriendsList, connectDialog } from "../websocket/ws.js";
import { renderMatchHistory } from "../templates/match_history_sidebar.js";
import { renderChatSidebar } from "../templates/chat_sidebar.js";

export async function render_dashboard(params: URLSearchParams | null, matches: any[] = []) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer || !headernavs || !friendsBtn) {
		console.error("bodyContainer Container missing")
		return;
	}

	await render_header();

	const userData = await getUser();
	if (!userData) {
		showErrorMessage(t('profileDbError'));
		await logOutApi();
		render_with_delay("login");
		return;
	}
	const user: UserInfo = userData.user;
	const matchesFromHistory = await getMatchHistory(user.id);
	const stats = await getStats(user.id);
	console.log(stats);
	bodyContainer.innerHTML = `
	<div class="flex w-full max-h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)]">

		<!-- Left sidebar: Match History -->
		<aside class="w-96 p-4 overflow-y-auto ">
			${renderMatchHistory(matchesFromHistory || [])}
		</aside>

		<!-- Center: Main dashboard -->
		<main class="flex-1 flex items-center justify-center overflow-y-auto p-6">
			<div class="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">

				<!-- Header (centered) -->
				<div class="flex flex-col items-center text-center">
					<h1 class="text-5xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent">
						${t('readyTitle')}
					</h1>
					<span class="text-2xl font-bold pt-4 pb-6">${t('readySubtitle')}</span>
				</div>

				<!-- Play & Tournament cards -->
				<div class="flex justify-center gap-6 w-full">
					<!-- Play card -->
					<div class="w-[50%] bg-gradient-to-r from-[#07ae2d] to-[#0d6500] border border-gray-200 rounded-lg shadow-[0_0_30px_#b01ae2] dark:border-gray-700">
						<a class="flex items-center justify-center">
							<img class="rounded-t-lg h-24" src="./assets/img/pingpong.png" alt="" />
						</a>
						<div class="p-5 flex items-center justify-center flex-col">
							<a>
								<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${t('playTitle')}</h5>
							</a>
							<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${t('playDesc')}</p>
							<button id="playNowBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white
								bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
								${t('playNowBtn')}
							</button>
						</div>
					</div>

					<!-- Tournament card -->
					<div class="w-[50%] bg-gradient-to-r from-[#8e00a8] to-[#7c0bac] border border-gray-200 rounded-lg shadow-[0_0_30px_#174de1] dark:border-gray-700">
						<a class="flex items-center justify-center">
							<img class="rounded-t-lg h-24" src="./assets/img/trophy.png" alt="" />
						</a>
						<div class="p-5 flex items-center justify-center flex-col">
							<a>
								<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${t('tournamentTitle')}</h5>
							</a>
							<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${t('tournamentDesc')}</p>
							<button id="startTournamentBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white
								bg-[#6a047c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
								${t('tournamentBtn')}
							</button>

						</div>
					</div>
				</div>

				<!-- Stats boxes (centered, closer together) -->
				<div class="grid grid-cols-3 gap-6 mt-4 w-full max-w-4xl">
					<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 id="online" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${stats?.wins}</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">${t('wonGames')}</p>
					</a>
					<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 id="tourn" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${stats?.loses}</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">${t('lostGames')}</p>
					</a>
					<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 id="matches" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${stats?.tournamentWins}</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">${t('wonTournaments')}</p>
					</a>
				</div>
			</div>
			<!--  Mode modal  -->
			<div id="modeModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
              <div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
                <h4 class="text-3xl font-bold text-white">${t('game.chooseMode')}</h4>
                <div class="flex gap-12 mt-4">
                  <button id="localBtn" class="w-[40%] px-6 py-3 bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300 text-white
         						flex items-center justify-center">${t('game.local')}</button>
                  <button id="remoteBtn" class="w-[40%] px-6 py-3 bg-[#6a047c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300 text-white
         						flex items-center justify-center">${t('game.remote')}</button>
                </div>
			  </div>
			</div>
		</main>

		<!-- Right sidebar: Chat -->
		<aside class="w-96 p-4 overflow-y-auto">
    		${renderChatSidebar(null, [])}
		</aside>

	</div>
	`;

	// Event listeners
	const playNowBtn = document.getElementById("playNowBtn");
	const localBtn = document.getElementById("localBtn");
	const remoteBtn = document.getElementById("remoteBtn");
	const startTournamentBtn = document.getElementById("startTournamentBtn");
	const mode = document.getElementById("modeModal");

	const chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;

	chatInput.addEventListener('input', () => {
		chatInput.style.height = 'auto'; // reset height
		const lineHeight = 24; // approximate line height in px
		const maxLines = 5;
		const maxHeight = lineHeight * maxLines;
		chatInput.style.height = Math.min(chatInput.scrollHeight, maxHeight) + 'px';
	});

/* 	refreshFriendsList();
	connectWebSocket();

	const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;

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
	}); */

	playNowBtn?.addEventListener("click", () => mode?.classList.remove("hidden"));
	mode?.addEventListener("click", (e) => { if (e.target === mode) mode.classList.add("hidden"); });
	localBtn?.addEventListener("click", () => { const p = new URLSearchParams(); p.set("mode","local"); navigateTo("game", p); });
	remoteBtn?.addEventListener("click", () => navigateTo("matchmaking"));
	startTournamentBtn?.addEventListener("click", () => navigateTo("tournament"));

	window.location.hash = "#dashboard";
	render_header();
}

// function selectFriend(friendName: string) {
//     selectedFriend = friendName;
//     const chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;
//     chatInput.disabled = !friendName; // enable only if a friend is selected
//     chatInput.focus();

//     // Also update the header
//     const chatHeader = document.getElementById('chatHeader')!;
//     chatHeader.textContent = friendName || t('selectChatPartner');
// }
