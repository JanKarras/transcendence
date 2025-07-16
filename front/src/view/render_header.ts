import { friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { Friend, UserInfo, UserStats } from "../constants/structs.js";
import { getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showFriendsDropdown } from "../templates/freinds_menu.js";
import { buildMenuItems, getMenuEntries, showMenu } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { removeEventListenerByClone } from "../utils/remove_eventlistener.js";
import { render_with_delay } from "../utils/render_with_delay.js";

function getPos() {
	return window.location.hash.replace(/^#/, '');
}

export async function render_header() {
	const userData = await getUser();

	const pos = getPos();

	if (!userData || !profileImg || !profile || !headernavs || !profileContainer || !friendsNumber || !friendsBtn) {
		showErrorMessage("Database Error. You will be logged out");
		logOutApi();
		render_with_delay('login');
		return;
	}

	if (pos !== "login") {
		headernavs.classList.remove('hidden');
	} else {
		headernavs.classList.add('hidden');
		return;
	}

	const user: UserInfo = userData.user;

	const friends: Friend[] = userData.friends;

	const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : '/api/get/getImage?filename=std_user_img.png';

	profileImg.src = safePath;

	profile.innerHTML = user.username;


	const now = Date.now();
	const FIVE_MINUTES_MS = 5 * 60 * 1000;
	let count = 0;
	for (const f of friends) {
		if (f.last_seen && (now - new Date(f.last_seen + ' UTC').getTime()) <= FIVE_MINUTES_MS) {
			count++;
		}
	}
	friendsNumber.textContent = count.toLocaleString();

	friendsBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		showFriendsDropdown();
	});

	removeEventListenerByClone(MENU_CONTAINER_ID);

	profileContainer.addEventListener("click", (e) => {
		e.stopPropagation();
		const items = buildMenuItems(getMenuEntries(pos));
		showMenu(items);
	});
}
