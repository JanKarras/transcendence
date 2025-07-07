import { bodyContainer, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { Friend, UserInfo, UserStats } from "../constants/structs.js";
import { getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showMenu } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";

export async function render_dashboard(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer || !headernavs) {
		console.error("bodyContainer Container missing")
		return;
	}

	profile.classList.remove('hidden')
	const userData = await getUser();
	console.log(userData);

	if (!userData) {
		showErrorMessage("Database error. You will will be logged out");
		await logOutApi()
		render_with_delay("login");
		return;
	}
	const user: UserInfo = userData.user;

	profileContainer.addEventListener("click", (event) => {
	event.stopPropagation();
	showMenu([
			{ label: "Profil", onClick: () => console.log("Profil clicked") },
			{ label: "Einstellungen", onClick: () => console.log("Einstellungen clicked") },
			{ label: "Logout", onClick: () => logOutApi() }
		]);
	});


	headernavs.classList.remove('hidden')

	const freinds: Friend[] = userData.friends;

	const stats: UserStats = userData.stats;

	profileImg.src = user.path;

	profile.innerHTML = user.username

	friendsNumber.innerHTML = freinds.length.toLocaleString();

	const html = `
			<h1 class="text-5xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent">
				Ready for the next match?
			</h1>

			<span class="text-2xl font-bold pt-4 pb-6">Play online Ping Pong against friends or compete in a tournament!</span>
			<div class="w-[40%]">
				<div class="flex items-center justify-between gap-x-6">
					<div class="w-[50%] bg-gradient-to-r from-[#07ae2d] to-[#0d6500] border border-gray-200 rounded-lg shadow-[0_0_30px_#b01ae2] dark:border-gray-700">
						<a  class="flex items-center justify-center">
							<img class="rounded-t-lg h-24" src="./assets/img/pingpong.png" alt="" />
						</a>
						<div class="p-5 flex items-center justify-center flex-col">
							<a >
								<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Play</h5>
							</a>
							<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Start a quick match</p>
							<a href="#" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-[#48ac3c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
								Play now!
							</a>
						</div>
					</div>
					<div class="w-[50%] bg-gradient-to-r from-[#8e00a8] to-[#7c0bac] border border-gray-200 rounded-lg shadow-[0_0_30px_#174de1] dark:border-gray-700">
							<a class="flex items-center justify-center">
								<img class="rounded-t-lg h-24" src="./assets/img/trophy.png" alt="" />
							</a>
							<div class="p-5 flex items-center justify-center flex-col">
								<a>
									<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tournament</h5>
								</a>
								<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Start a tournament</p>
								<a href="#" class="w-full text-center inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-[#6a047c] rounded-lg hover:bg-[#3b8b30] focus:ring-4 focus:outline-none focus:ring-green-300">
									Start now!
								</a>
							</div>
					</div>
				</div>

				<div class="flex items-center justify-between gap-x-6">

					<a class="w-[33%] mt-4 flex items-center justify-center flex-col block max-w-sm px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">Online Players</p>
					</a>

					<a class="w-[33%] mt-4 flex items-center justify-center flex-col block max-w-sm px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">Aktiv Tournaments</p>
					</a>

					<a class="w-[33%] mt-4 flex items-center justify-center flex-col block max-w-sm px-3 py-3 rounded-lg shadow-sm bg-[#0e0e25]">
						<h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">1,247</h5>
						<p class="font-normal text-gray-700 dark:text-gray-400">Matches Today</p>
					</a>

				</div>
			</div>`

	bodyContainer.innerHTML = html;

}
