import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { Friend, FriendsViewData, UserInfo } from "../constants/structs.js";
import { getAllUser, getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showFriendsDropdown } from "../templates/freinds_menu.js";
import { buildMenuItems, showMenu } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { removeEventListenerByClone } from "../utils/remove_eventlistener.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { navigateTo } from "./history_views.js";

async function fetchAndPrepareFriendsData(): Promise<FriendsViewData | null> {
  const [userData, allUsers] = await Promise.all([getUser(), getAllUser()]);

  if (!userData || !allUsers) {
    showErrorMessage("Fehler beim Laden der Freundesdaten. Du wirst ausgeloggt.");
    await logOutApi();
    render_with_delay("login");
    return null;
  }

  const currentUser = userData.user;

  const allFriends: Friend[] = userData.friends;

  const usersWithoutMe = allUsers.filter(user => user.username !== currentUser.username);

  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const now = Date.now();

  const onlineFriends: Friend[] = allFriends.filter(friend => {
    if (!friend.last_seen) return true;
    const lastSeenTime = new Date(friend.last_seen + " UTC").getTime();
    return now - lastSeenTime <= FIVE_MINUTES_MS;
  });

  return {
    allUsers: usersWithoutMe,
    allFriends,
    onlineFriends
  };
}

export async function render_friends(params: URLSearchParams | null) {
	if (!bodyContainer || !profileContainer || !friendsBtn || !headernavs || !profile || !profileImg) {
		showErrorMessage('Error with DOM loading. You will be logged out. Please try again later');
		await logOutApi();
		render_with_delay("login");
		return;
	}

	removeEventListenerByClone(MENU_CONTAINER_ID);
	removeEventListenerByClone(FRIENDS_CONTAINER_ID);
	profileContainer.addEventListener("click", (event) => {
		event.stopPropagation();
		const menuItems = buildMenuItems([
			{ label: "👤 Profil", onClick: () => navigateTo("profile") }
		]);
		showMenu(menuItems);
	});
	friendsBtn.addEventListener("click", (event) => {
		event.stopPropagation();
		showFriendsDropdown();
	})

	headernavs.classList.remove('hidden')
	profile.classList.remove('hidden')

	bodyContainer.innerHTML = "";

	const data = await fetchAndPrepareFriendsData();
	if (!data) return;

	const userData = await getUser();
	if (!userData) {
		showErrorMessage("Database error. You will will be logged out");
		await logOutApi()
		render_with_delay("login");
		return;
	}

	const user = userData.user;

	const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : './assets/img/default-user.png';

	profileImg.src = safePath

	profile.innerHTML = user.username

	const wrapper = document.createElement("div");
wrapper.className = "w-full h-full p-10 min-h-[200px]";

	const tabNav = document.createElement("div");
	tabNav.className = "flex gap-4 border-b mb-4";

	const contentContainer = document.createElement("div");
	contentContainer.id = "friends-content";

	const tabs = [
		{ id: "online", label: "Freunde Online", render: () => renderFriendsOnline(data.onlineFriends) },
		{ id: "all", label: "Alle Freunde", render: () => renderAllFriends(data.allFriends) },
		{ id: "add", label: "Freunde hinzufügen", render: () => renderAddFriends(data.allUsers, data.allFriends) },
		{ id: "requests", label: "Anfragen", render: () => renderFriendRequests() },
	];

	tabs.forEach((tab, index) => {
		const btn = document.createElement("button");
		btn.textContent = tab.label;
		btn.className = "py-2 px-4 border-b-2 border-transparent hover:border-blue-400 transition";
		if (index === 0) btn.classList.add("border-blue-500", "font-semibold");

		btn.addEventListener("click", () => {
			Array.from(tabNav.children).forEach(child => child.classList.remove("border-blue-500", "font-semibold"));
			btn.classList.add("border-blue-500", "font-semibold");

			contentContainer.innerHTML = "";
			tab.render();
		});

		tabNav.appendChild(btn);
	});

	wrapper.appendChild(tabNav);
	wrapper.appendChild(contentContainer);
	bodyContainer.appendChild(wrapper);

	tabs[0].render();
}

function renderFriendsOnline(friends: Friend[]) {
	const container = document.getElementById("friends-content");
	if (!container) return;

	friends.forEach(friend => {
		const div = document.createElement("div");
		div.textContent = `🟢 ${friend.username}`;
		container.appendChild(div);
	});
}

function renderAllFriends(friends: Friend[]) {
	const container = document.getElementById("friends-content");
	if (!container) return;

	friends.forEach(friend => {
		const div = document.createElement("div");
		div.textContent = friend.username;
		container.appendChild(div);
	});
}

function renderAddFriends(allUsers: UserInfo[], friends: Friend[]) {
	const container = document.getElementById("friends-content");
	if (!container) return;

	const friendUsernames = new Set(friends.map(f => f.username));
	allUsers.forEach(user => {
		if (!friendUsernames.has(user.username)) {
			const div = document.createElement("div");
			div.textContent = `➕ ${user.username}`;
			container.appendChild(div);
		}
	});
}

function renderFriendRequests() {
	const container = document.getElementById("friends-content");
	if (!container) return;

	container.innerHTML = "<p>Anfragen werden später geladen...</p>";
}

