import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { getMatchHistory, getUser, logOutApi, saveProfileChanges } from "../remote_storage/remote_storage.js";
import { t } from "../constants/i18n.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { UserInfo } from "../constants/structs.js";
import { connectWebSocket, friendChat, refreshFriendsList, connectDialog } from "../websocket/ws.js";

// Helper: renders the match history HTML
function renderMatchHistory(matches: any[]) {
	const formatMatchType = (type: string) => {
		switch(type) {
			case "1v1_local": return t('matchType1v1Local');
			case "1v1_remote": return t('matchType1v1Remote');
			case "tournament": return t('matchTypeTournament');
			default: return type;
		}
	};

	return `
	<div class="text-white p-4 bg-[#2c2c58] rounded-lg shadow-md">
		<h2 class="text-xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent mb-4">${t('matchHistoryTitle')}</h2>
		<div class="space-y-4">
			${matches.slice().reverse().map(match => `
				<div class="p-3 rounded bg-gradient-to-r from-[#8e00a8] to-[#7c0bac] border border-gray-200 rounded-lg shadow-[0_0_10px_#174de1] dark:border-gray-700">
					<p class="font-medium">
						<strong>${formatMatchType(match.match_type)}</strong>
						${match.tournament_name ? `- ${match.tournament_name} (${t('round')} ${match.round})` : ''}
					</p>
					<p class="text-sm text-gray-300 mb-2">${match.match_date}</p>
					<ul class="pl-4 list-disc">
						${match.players.map((p: any) => `
							<li>${p.username} - ${t('score')}: ${p.score} ${p.rank === 1 ? t('trophy') : ''}</li>
						`).join('')}
					</ul>
				</div>
			`).join('')}
		</div>
	</div>
	`;
}

export function renderChatSidebar(selectedFriend: string | null, friends: any[] = []) {
    return `
		<div class="flex flex-col h-full gap-3 p-4 bg-[#2c2c58] rounded-lg shadow-md ">
			<!-- Top spacing -->
			<div class="mb-2"></div>

			<!-- Selected Friend -->
			<div class="flex justify-between items-center mb-0">
				<div id="chatHeader" class="text-xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent p-0 rounded mb-0">
					${selectedFriend || t('selectChatPartner')}
				</div>
				<div id="chatControls" class="flex gap-2"></div>
			</div>

			<!-- Chat Messages -->
			<div id="chatMessages" class="overflow-y-auto p-3 bg-gradient-to-r from-[#8e00a8] to-[#7c0bac] rounded-lg shadow-[0_0_10px_#174de1] mb-2 min-h-[10rem] max-h-[300px]">
				<!-- Messages will be injected here -->
			</div>

			<!-- Input -->

			

			<div class="flex gap-2 mb-2">
				<input id="chatInput" 
					placeholder="${t('enterMessage')}" 
					class="flex-1 p-2 rounded-lg border border-gray-200 bg-[#2c2c58] text-white focus:outline-none focus:ring-2 focus:ring-[#174de1] resize-none overflow-y-auto"
					rows="1" 
				>
				<button id="sendBtn" 
					class="px-3 py-2 rounded-lg bg-[#5656aa] text-white hover:bg-[#7878cc] transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
					<img class="h-6 w-6" src="./assets/img/send-32.png" alt="Send" />
				</button>
			</div>

			<!-- Friends List -->
			<div class="overflow-y-auto max-h-[200px]">
				<h3 class="text-white font-bold text-lg mb-2">${t('friends')}</h3>
				<ul id="friendsList" class="list-none p-0 space-y-1">
					${friends.map(f => `<li class="p-1 text-white cursor-pointer hover:bg-[#3a3a7a] rounded">${f.username}</li>`).join('')}
				</ul>
			</div>
		</div>
    `;
}

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

	bodyContainer.innerHTML = `
	<div class="flex h-screen w-full">
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
							<button id="playNowBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
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
							<button id="startTournamentBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-[#6a047c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
								${t('tournamentBtn')}
							</button>

						</div>
					</div>
				</div>

				<!-- Stats boxes (centered, closer together) -->
				<div class="grid grid-cols-3 gap-6 mt-4 max-w-lg mx-auto">
					<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 id="online" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">${t('onlinePlayers')}</p>
					</a>
					<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 id="tourn" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">${t('activeTournaments')}</p>
					</a>
					<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 id="matches" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">${t('matchesToday')}</p>
					</a>
				</div>
			</div>
			<!--  Mode modal  -->
			<div id="modeModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
              <div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
                <h4 class="text-3xl font-bold text-white">${t('game.chooseMode')}</h4>
                <div class="flex gap-12 mt-4">
                  <button id="localBtn" class="px-6 py-3 bg-purple-600 hover:bg-green-700 text-white rounded">${t('game.local')}</button>
                  <button id="remoteBtn" class="px-6 py-3 bg-blue-600 hover:bg-red-700 text-white rounded">${t('game.remote')}</button>
                </div>
			  </div>
			</div>
			<!--  Invite  -->
			<div id="inviteModeModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
              <div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
                <!-- <h4 class="text-3xl font-bold text-white">${t('game.chooseMode')}</h4> -->
                <div class="flex gap-12 mt-4">
                  <button id="startBtn" class="px-6 py-3 bg-purple-600 hover:bg-green-700 text-white rounded">${t('startMatch')}</button>
                  <button id="cancelBtn" class="px-6 py-3 bg-blue-600 hover:bg-red-700 text-white rounded">${t('game.cancel')}</button>
                </div>
			  </div>
			</div>
			<!--  Invite  one cansel-->
			<div id="inviteModeModalCancel" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
              <div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
                <!-- <h4 class="text-3xl font-bold text-white">${t('game.chooseMode')}</h4> -->
                <div class="flex gap-12 mt-4">
                  <button id="cancelBtnNew" class="px-6 py-3 bg-blue-600 hover:bg-red-700 text-white rounded">${t('game.cancel')}</button>
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
	connectWebSocket();
	refreshFriendsList();

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
	// Event listeners
	const playNowBtn = document.getElementById("playNowBtn");
	const localBtn = document.getElementById("localBtn");
	const remoteBtn = document.getElementById("remoteBtn");
	const startTournamentBtn = document.getElementById("startTournamentBtn");
	const mode = document.getElementById("modeModal");

	//const chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;

	// chatInput.addEventListener('input', () => {
	// 	chatInput.style.height = 'auto'; // reset height
	// 	const lineHeight = 24; // approximate line height in px
	// 	const maxLines = 5;
	// 	const maxHeight = lineHeight * maxLines;
	// 	chatInput.style.height = Math.min(chatInput.scrollHeight, maxHeight) + 'px';
	// });

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

	const storedId = localStorage.getItem('selectedFriendId');
	console.log("ID = ", storedId);
    if (storedId){
        connectDialog( parseInt(storedId), '');
        localStorage.removeItem('selectedFriendId');
    }
	
	//render_header();
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