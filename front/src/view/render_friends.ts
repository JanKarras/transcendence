import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { Friend, FriendsViewData, UserInfo } from "../constants/structs.js";
import { getAllUser, getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { render_header } from "./render_header.js";

let data: FriendsViewData | null = null;
let lastDataJSON: string = "";

async function fetchAndPrepareFriendsData(): Promise<FriendsViewData | null> {
	const [userData, allUsers] = await Promise.all([getUser(), getAllUser()]);
	if (!userData || !allUsers) return null;

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

	render_header();

	bodyContainer.innerHTML = "";

	data = await fetchAndPrepareFriendsData();

	if (!data) {
		return;
	}

	lastDataJSON = JSON.stringify(data);

	const wrapper = document.createElement("div");
	wrapper.className = "w-full h-full p-10 min-h-[200px]";

	const tabNav = document.createElement("div");
	tabNav.className = "flex gap-4 border-b mb-4";

	const contentContainer = document.createElement("div");
	contentContainer.id = "friends-content";

	const tabs = [
		{ id: "online", label: "Freunde Online", render: () => renderFriendsOnline(data?.onlineFriends ?? []) },
		{ id: "all", label: "Alle Freunde", render: () => renderAllFriends(data?.allFriends ?? []) },
		{ id: "add", label: "Freunde hinzufügen", render: () => renderAddFriends(data?.allUsers ?? [], data?.allFriends ?? []) },
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
			contentContainer.setAttribute("data-active-tab", tab.id); // <== HIER!
			tab.render();
		});

		tabNav.appendChild(btn);
	});

	wrapper.appendChild(tabNav);
	wrapper.appendChild(contentContainer);
	bodyContainer.appendChild(wrapper);

	tabs[0].render();
	contentContainer.setAttribute("data-active-tab", "online");

}

function renderFriendsOnline(friends: Friend[]) {
	const container = document.getElementById("friends-content");
	if (!container) {
		return;
	}
	container.innerHTML = "";
	friends.forEach(friend => {
		const friendDiv = document.createElement("div");
		friendDiv.className = "friend-item border-b border-gray-700 p-2 cursor-pointer";
		const headerDiv = document.createElement("div");
		headerDiv.className = "flex items-center gap-3";
		const img = document.createElement("img");
		img.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}`;
		img.alt = friend.username;
		img.className = "w-10 h-10 rounded-full object-cover";
		const usernameSpan = document.createElement("span");
		usernameSpan.textContent = friend.username;
		usernameSpan.className = "font-semibold text-white";
		headerDiv.appendChild(img);
		headerDiv.appendChild(usernameSpan);
		friendDiv.appendChild(headerDiv);
		const detailsDiv = document.createElement("div");
		detailsDiv.className = "friend-details mt-2 text-sm text-gray-300 hidden";
		const nameAge = document.createElement("div");
		const fullName =
		  (friend.first_name || "") +
		  (friend.last_name ? " " + friend.last_name : "");
		nameAge.textContent = `Name: ${fullName.trim() || "-"}`;
		if (friend.age !== null && friend.age !== undefined) {
		  nameAge.textContent += `, Alter: ${friend.age}`;
		}
		const statsDiv = document.createElement("div");
		statsDiv.innerHTML = `
		  Wins: <strong>${friend.wins || 0}</strong>,
		  Loses: <strong>${friend.loses || 0}</strong>,
		  Tournament Wins: <strong>${friend.tournamentWins || 0}</strong>
		`;
		const btnContainer = document.createElement("div");
		btnContainer.className = "mt-2 flex gap-3";
		const chatBtn = document.createElement("button");
		chatBtn.textContent = "💬 Start Chat";
		chatBtn.className = "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
		chatBtn.addEventListener("click", e => {
		  e.stopPropagation();
		  console.log(`Chat mit ${friend.username} starten...`);
		});
		const gameBtn = document.createElement("button");
		gameBtn.textContent = "🎮 Start Match";
		gameBtn.className = "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded";
		gameBtn.addEventListener("click", e => {
		  e.stopPropagation();
		  console.log(`Spiel-Einladung an ${friend.username} senden...`);
		});
		btnContainer.appendChild(chatBtn);
		btnContainer.appendChild(gameBtn);
		detailsDiv.appendChild(nameAge);
		detailsDiv.appendChild(statsDiv);
		detailsDiv.appendChild(btnContainer);
		friendDiv.appendChild(detailsDiv);
		friendDiv.addEventListener("click", () => {
		  detailsDiv.classList.toggle("hidden");
		});
		container.appendChild(friendDiv);
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

setInterval(async () => {
	const newData = await fetchAndPrepareFriendsData();
	if (!newData) {
		return;
	}


	const newDataJSON = JSON.stringify(newData);

	if (newDataJSON === lastDataJSON) {
		return;
	}

	lastDataJSON = newDataJSON;
	data = newData;

	const currentTab = document.querySelector("#friends-content")?.getAttribute("data-active-tab");
	if (currentTab === "online") {
		renderFriendsOnline(data.onlineFriends);
	}
	if (currentTab === "all") {
		renderAllFriends(data.allFriends);
	}
	if (currentTab === "add") {
		renderAddFriends(data.allUsers, data.allFriends);
	}
	if (currentTab === "requests") {
		renderFriendRequests();
	}
}, 10000);


