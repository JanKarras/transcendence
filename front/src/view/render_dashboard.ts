import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { initTranslations, t } from "../constants/i18n.js";

export async function render_dashboard(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer || !headernavs || !friendsBtn) {
		console.error("bodyContainer Container missing")
		return;
	}

	await render_header();

	const html = `
		<h1 class="text-5xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent">
			${t('readyTitle')}
		</h1>

		<span class="text-2xl font-bold pt-4 pb-6">${t('readySubtitle')}</span>
		<div class="w-[40%]">
			<div class="flex items-center justify-between gap-x-6">
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

		    <div class="flex items-center justify-between gap-x-6">
				<a class="w-[33%] mt-4 flex items-center justify-center flex-col block max-w-sm px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
					<h5 id="online" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
					<p class="font-normal text-gray-700 dark:text-gray-400">${t('onlinePlayers')}</p>
				</a>

				<a class="w-[33%] mt-4 flex items-center justify-center flex-col block max-w-sm px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
					<h5 id="tourn" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
					<p class="font-normal text-gray-700 dark:text-gray-400">${t('activeTournaments')}</p>
				</a>

				<a class="w-[33%] mt-4 flex items-center justify-center flex-col block max-w-sm px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
					<h5 id="matches" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
					<p class="font-normal text-gray-700 dark:text-gray-400">${t('matchesToday')}</p>
				</a>
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
		  </div>

<!--		  <button id="ToTournaentGameID1">ToTournaentGameID1</button>-->

		`


	bodyContainer.innerHTML = html;

	const online = document.getElementById("online")

	const tourn = document.getElementById("tourn")

	const matches = document.getElementById("matches")

	const mode = document.getElementById("modeModal")

	const playNowBtn = document.getElementById("playNowBtn")

	const localBtn = document.getElementById("localBtn")

	const remoteBtn = document.getElementById("remoteBtn")

	const ToTournaentGameID1 = document.getElementById("ToTournaentGameID1");

	ToTournaentGameID1?.addEventListener("click", () => {
		const params = new URLSearchParams();
		params.set("gameId", "1");
		navigateTo("tournament", params);
	});


	playNowBtn?.addEventListener("click", () => {
        mode?.classList.remove("hidden");
		// navigateTo("game");
		// navigateTo("matchmaking");
	});

    mode?.addEventListener("click", (e) => {
        if (e.target === mode) {
            mode?.classList.add("hidden");
        }
    });

    localBtn?.addEventListener("click", () => {
        const params = new URLSearchParams();
        params.set("mode", "local");
        navigateTo("game", params);
    });

    remoteBtn?.addEventListener("click", () => {
        navigateTo("matchmaking");
    });
	window.location.hash = "#dashboard";
	render_header();
	const startTournamentBtn = document.getElementById("startTournamentBtn");

	startTournamentBtn?.addEventListener("click", () => {
		console.log("Tournament clicked");
		navigateTo("tournament");
	});


}
