import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { getFreshToken } from "../remote_storage/remote_storage.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { connect } from "../websocket/wsService.js";
import { initTranslations, t } from "../constants/i18n.js"

let socket: WebSocket | null = null;

export async function render_matchmaking(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer || !headernavs || !friendsBtn) {
		console.error("bodyContainer Container missing")
		return;
	}

    await initTranslations();

	const html = `	<style>
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
					</div>`

	render_header();
    startMatchmaking();

	bodyContainer.innerHTML = html;

	const cancelBtn = document.getElementById("cancelBtn");
	cancelBtn?.addEventListener('click', () => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.close(1000, "User cancelled matchmaking"); 
		}
		navigateTo("dashboard");
	});
}

async function startMatchmaking() {
	const token = await getFreshToken();
	console.log(token)

    const socket = await connect();

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📩", data);

        if (data.type === "matchFound") {
            const params = new URLSearchParams();
            params.set("mode", "remote");
            navigateTo("game", params);
        }
    };

    const response = await fetch(`https://${window.location.host}/api/set/matchmaking/join`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
    });

    const result = await response.json();
    console.log("Waiting for game:", result);
}
