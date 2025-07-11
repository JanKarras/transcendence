import { friendsBtn } from "../constants/constants.js";
import { showFriendsDropdown } from "../templates/freinds_menu.js";

export function removeEventListenerByClone(id: string) {
	const el = document.getElementById(id);
	if (!el || !el.parentNode) return;
	const cleanClone = el.cloneNode(true);
	el.parentNode.replaceChild(cleanClone, el);
}

export function resetFriendsBtnListener() {
	if (friendsBtn && friendsBtn.parentNode) {
		const newBtn = friendsBtn.cloneNode(true);
		friendsBtn.parentNode.replaceChild(newBtn, friendsBtn);
		newBtn.addEventListener("click", (event) => {
			event.stopPropagation();
			showFriendsDropdown();
		});
	}
}
