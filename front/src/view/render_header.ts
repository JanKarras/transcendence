import { friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { Friend, UserInfo, UserStats } from "../constants/structs.js";
import { getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showFriendsDropdown } from "../templates/freinds_menu.js";
import { buildMenuItems, getMenuEntries, showMenu } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { removeEventListenerByClone } from "../utils/remove_eventlistener.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { lang, t } from "../constants/language_vars.js";
import { LANGUAGE } from "../constants/gloabal.js";

export function getPos() {
    const hash = window.location.hash.replace(/^#/, '');
    const [pos] = hash.split('?');
    return pos;
}

function updateOnlineUser(friends : Friend[]) {
	if (!friendsNumber) {
		return;
	}
	const now = Date.now();
	const FIVE_MINUTES_MS = 5 * 60 * 1000;
	let count = 0;
	for (const f of friends) {
		if (f.last_seen && (now - new Date(f.last_seen + ' UTC').getTime()) <= FIVE_MINUTES_MS) {
			count++;
		}
	}
	friendsNumber.textContent = count.toLocaleString();
}

let profileMenuListenerAttached = false;

export async function render_header() {

	const pos = getPos();
	const friendsCotnainer = document.getElementById("FriendsContainer")

	if (!friendsCotnainer || !profileImg || !profile || !headernavs || !profileContainer || !friendsNumber || !friendsBtn) {
		showErrorMessage(t(lang.databaseError, LANGUAGE));
		logOutApi();
		render_with_delay('login');
		return;
	}
	friendsCotnainer.innerHTML = t(lang.friends, LANGUAGE)

	if (pos !== "login" && pos !== "register" && pos !== "email_validation" && pos !== "two_fa") {
		headernavs.classList.remove('hidden');
	} else {
		headernavs.classList.add('hidden');
		return;
	}

	const userData = await getUser();

	if (!userData ) {
		showErrorMessage(t(lang.databaseError, LANGUAGE));
		logOutApi();
		render_with_delay('login');
		return;
	}


	const user: UserInfo = userData.user;

	const friends: Friend[] = userData.friends;

	const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : '/api/get/getImage?filename=std_user_img.png';

	profileImg.src = safePath;

	profile.innerHTML = user.username;


	updateOnlineUser(friends);

	friendsBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		showFriendsDropdown();
	});

	removeEventListenerByClone(MENU_CONTAINER_ID);
	if (!profileMenuListenerAttached) {
		profileContainer.addEventListener("click", (e) => {
			e.stopPropagation();
			const pos = getPos();
			const items = buildMenuItems(getMenuEntries(pos));
			showMenu(items);
		});
		profileMenuListenerAttached = true;
	}
}

let intervalId: ReturnType<typeof setInterval>;

intervalId = setInterval(async () => {
	const pos = getPos();

	if (pos == 'login' || pos == 'register' || pos == 'two_fa' || pos == 'email_validation') {
		clearInterval(intervalId);
		return;
	}

	const user = await getUser();
	if (!user) {
		return;
	}
	const friends: Friend[] = user.friends;
	updateOnlineUser(user.friends);
}, 10000);
