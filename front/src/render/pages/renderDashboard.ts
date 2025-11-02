import { bodyContainer } from "../../constants/constants.js";
import { MatchHistoryEntry, Stats } from "../../constants/structs.js";
import { t } from "../../logic/gloabal/initTranslations.js";
import { getMatchHistoryHTML } from "../../logic/templates/matchHistoryTemplate.js";
import { getChatSidebarHTML } from "../templates/renderChatSideBar.js";

export async function renderDashboard(params: URLSearchParams | null, stats: Stats | undefined, matchesFromHistory: MatchHistoryEntry[] | undefined) {
	if (!bodyContainer) {
		console.error("Body container not found");
		return;
	}

	bodyContainer.innerHTML = `
		<div class="flex w-full max-h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)]">
			<aside class="w-96 p-4 overflow-y-auto">
				${await getMatchHistoryHTML(matchesFromHistory || [])}
			</aside>

			<main class="flex-1 flex items-center justify-center overflow-y-auto p-6">
				<div class="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
					<div class="flex flex-col items-center text-center">
						<h1 class="text-5xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent">
							${t('readyTitle')}
						</h1>
						<span class="text-2xl font-bold pt-4 pb-6">${t('readySubtitle')}</span>
					</div>

					<div class="flex justify-center gap-6 w-full">
						<div class="w-[50%] bg-gradient-to-r from-[#07ae2d] to-[#0d6500] border border-gray-200 rounded-lg shadow-[0_0_30px_#b01ae2] dark:border-gray-700">
							<a class="flex items-center justify-center">
								<img class="rounded-t-lg h-24" src="./assets/img/pingpong.png" alt="" />
							</a>
							<div class="p-5 flex items-center justify-center flex-col">
								<a>
									<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
										${t('playTitle')}
									</h5>
								</a>
								<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
									${t('playDesc')}
								</p>
								<button id="playNowBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white
									bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
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
									<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
										${t('tournamentTitle')}
									</h5>
								</a>
								<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
									${t('tournamentDesc')}
								</p>
								<button id="startTournamentBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white
									bg-[#6a047c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
									${t('tournamentBtn')}
								</button>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-3 gap-6 mt-4 w-full max-w-4xl">
						<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
							<h5 id="online" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
								${stats?.wins}
							</h5>
							<p class="font-normal text-gray-700 dark:text-gray-400">
								${t('wonGames')}
							</p>
						</a>
						<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
							<h5 id="tourn" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
								${stats?.loses}
							</h5>
							<p class="font-normal text-gray-700 dark:text-gray-400">
								${t('lostGames')}
							</p>
						</a>
						<a class="flex flex-col items-center justify-center px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
							<h5 id="matches" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
								${stats?.tournamentWins}
							</h5>
							<p class="font-normal text-gray-700 dark:text-gray-400">
								${t('wonTournaments')}
							</p>
						</a>
					</div>
				</div>

				<div id="modeModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
					<div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
						<h4 class="text-3xl font-bold text-white">
							${t('game.chooseMode')}
						</h4>
						<div class="flex gap-12 mt-4">
							<button id="localBtn" class="w-[40%] px-6 py-3 bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300 text-white flex items-center justify-center">
								${t('game.local')}
							</button>
							<button id="remoteBtn" class="w-[40%] px-6 py-3 bg-[#6a047c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300 text-white flex items-center justify-center">
								${t('game.remote')}
							</button>
						</div>
					</div>
				</div>
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

			<aside class="w-96 p-4 overflow-y-auto">
				${await getChatSidebarHTML(null, [])}
			</aside>
		</div>
	`;
}
