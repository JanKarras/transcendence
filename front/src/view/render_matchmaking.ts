import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { getFreshToken } from "../remote_storage/remote_storage.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { connect, getSocket } from "../websocket/wsService.js";

let socket: WebSocket | null = null;

const wsUrl = `wss://${location.host}/ws/game?token=${localStorage.getItem('auth_token')}`;


export async function render_matchmaking(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer || !headernavs || !friendsBtn) {
		console.error("bodyContainer Container missing")
		return;
	}

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
								<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Waiting for match<span class="waiting-dots"></span></h5>
							</a>
							<a href="#" id="cancelBtn" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
								Cancel
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
            navigateTo("game");
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


	// const wsUrl = `wss://${location.host}/ws/game?token=${localStorage.getItem('auth_token')}`;
	// socket = new WebSocket(wsUrl);
	// await new Promise<void>((resolve, reject) => {
	//   if (!socket) return reject("Socket not created");
	//   socket.onopen = () => {
	//     console.log(`✅ WebSocket connected to ${wsUrl}`);
	//     resolve();
	//   };
	//   socket.onerror = (err) => {
	//     console.error(`⚠️ WebSocket error:`, err);
	//     reject(err);
	//   };
	// });
	// // socket.send("matchmaking");
    // const response = await fetch(`https://${window.location.host}/api/set/matchmaking/join`, {
    //     method: "POST",
    //     headers: {
    //         // "Content-Type": "application/json",
    //         "Authorization": `Bearer ${localStorage.getItem('auth_token')}`,
    //     },
    //     credentials: "include"
    // });
    //
    // const data = await response.json();
    // console.log(data);
    //
	// socket.onmessage = (event) => {
	// 	const data = JSON.parse(event.data);
	// 	console.log(event.data);
	//   if (data.type === "matchFound") {
	// 	socket?.close(1000, "Moved to GameView");
	// 	navigateTo('game')
	//   }
	// };
	// socket.onclose = (event) => {
	//   console.warn(`❌ WebSocket closed (code=${event.code}, reason=${event.reason || "no reason"})`);
	// };
}
