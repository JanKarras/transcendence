import { bodyContainer, friendsNumber, profile, profileContainer, profileImg } from "../constants/constants.js";
import { Friend, UserInfo, UserStats } from "../constants/structs.js";
import { getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showMenu } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";

export async function render_dashboard(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !profileImg || !friendsNumber || !profileContainer) {
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
		{ label: "Logout", onClick: () => console.log("Logout clicked") }
	]);
});

	const freinds: Friend[] = userData.friends;

	const stats: UserStats = userData.stats;

	profileImg.src = user.path;


	profile.innerHTML = user.username

	friendsNumber.innerHTML = freinds.length.toLocaleString();

}
