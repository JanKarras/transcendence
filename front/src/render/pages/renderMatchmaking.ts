import { bodyContainer } from "../../constants/constants.js";
import { t } from "../../logic/gloabal/initTranslations.js";

export async function renderMatchmaking() {
	if (!bodyContainer) {
		return;
	}

	bodyContainer.innerHTML = `
	<style>
					@keyframes dots {
					0%, 20% {
						content: "";
					}
					40% {
						content: ".";
					}
					60% {
						content: "..";
					}
					80%, 100% {
						content: "...";
					}
					}

					.waiting-dots::after {
					display: inline-block;
					animation: dots 2s steps(1, end) infinite;
					content: "";
					}
					</style>
					<div class="w-[40%] flex justify-center">
						<div class="w-[50%] bg-gradient-to-r from-[#07ae2d] to-[#0d6500] border border-gray-200 rounded-lg shadow-[0_0_30px_#b01ae2] dark:border-gray-700">
							<a class="flex items-center justify-center">
								<img class="rounded-t-lg h-24" src="./assets/img/pingpong.png" alt="" />
							</a>
						<div class="p-5 flex items-center justify-center flex-col">
							<a>
								<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${t('game.waitingForMatch')}<span class="waiting-dots"></span></h5>
							</a>
							<a href="#" id="cancelBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
								${t('game.cancel')}
							</a>
						</div>
					</div>
	`


}
