import { headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../../constants/constants.js";
import { navigateTo } from "../../router/navigateTo.js";
import { Friend, UserInfo, UserResponse } from "../../constants/structs.js";
import { t } from "../../logic/global/initTranslations.js";
import { logOut } from "../../logic/global/logOut.js";
import { removeEventListenerByClone } from "../../logic/global/removeEventListenerByClone.js";
import { getPos } from "../../logic/templates/headerTemplate.js";
import { buildMenuItems, getMenuEntries, showMenu } from "../../logic/templates/menuTemplate.js";
import { hideNewRequestBadge, showNewRequestBadge } from "../pages/renderDashboard.js";
import { getUser } from "../../api/getUser.js";

const pagesWithHiddenHeader = [
	"login",
	"register",
	"email_validation",
	"two_fa",
];

const pagesWithDisabledHeaderLogo = [
	"login",
	"matchmaking",
	"register",
	"email_validation",
	"two_fa",
];

let profileMenuListenerAttached = false;

export async function renderHeader(pos: string, userData: UserResponse | false) {
	const headerTitle = document.getElementById("headline");

	if (!headernavs) return;

	if (pagesWithHiddenHeader.includes(pos)) {
		headernavs.classList.add("hidden");
		return;
	}
	headernavs.classList.remove("hidden");

	if (headerTitle) {
		if (pagesWithDisabledHeaderLogo.includes(pos)) {
			headerTitle.onclick = null;
		} else {
			headerTitle.onclick = () => navigateTo("dashboard");
		}
	}

	if (userData) {
		const user: UserInfo = userData.user;

		const friends: Friend[] = userData.friends;

		const safePath = user.path
			? `/api/get/getImage?filename=${encodeURIComponent(user.path)}`
			: '/api/get/getImage?filename=std_user_img.png';

		if (profileImg) {
			profileImg.src = safePath;
		}

		if (profile) {
			profile.innerHTML = user.username;
		}
	} else {
		logOut(t('databaseError'));
		return;
	}

	removeEventListenerByClone(MENU_CONTAINER_ID);
	if (!profileMenuListenerAttached && profileContainer) {
		profileContainer.addEventListener("click", async (e) => {
			e.stopPropagation();
			const pos = getPos();
			const items = buildMenuItems(getMenuEntries(pos));
			showMenu(items);

			const userData = await getUser();

			if (userData) {

				const pendingRequests = userData.requests?.received?.filter((r) => r.type === "friend" && r.status === "nothandled") ?? [];
				if (pendingRequests.length > 0) {
					showNewRequestBadge();
				} else {
					hideNewRequestBadge();
				}
			}

		});
		profileMenuListenerAttached = true;
	}
}
