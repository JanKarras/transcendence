import { bodyContainer } from "../constants/constants.js";
import { initTranslations, t } from "../constants/i18n.js";
import { Friend, UserInfo, RequestInfo, FriendsViewData } from "../constants/structs.js";
import { connectFriend, getFriendSocket } from "../websocket/wsFriendsService.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";

let friendsData: FriendsViewData | null = null;

export async function render_friends(params: URLSearchParams | null) {
	await initTranslations();

	if (!bodyContainer) return;
	await render_header();

	bodyContainer.innerHTML = "";

	const wrapper = document.createElement("div");
	wrapper.className = "w-full h-full p-10 min-h-[200px]";

	const tabNav = document.createElement("div");
	tabNav.className = "flex gap-4 border-b mb-4";

	const contentContainer = document.createElement("div");
	contentContainer.id = "friends-content";
	contentContainer.className = "mt-4";
	contentContainer.setAttribute("data-active-tab", "online");

	const tabs = [
		{ id: "online", label: "Freunde online", icon: "🟢" },
		{ id: "all", label: "Alle Freunde", icon: "👥" },
		{ id: "add", label: "Freunde hinzufügen", icon: "➕" },
		{ id: "requests", label: "Anfragen", icon: "✉️" },
	];

	tabs.forEach((tab, index) => {
		const btn = document.createElement("button");
		btn.textContent = `${tab.icon} ${tab.label}`;
		btn.className = "py-2 px-4 border-b-2 border-transparent hover:border-blue-400 text-white transition";

		if (index === 0) btn.classList.add("border-blue-500", "font-semibold");

		btn.addEventListener("click", () => {
			Array.from(tabNav.children).forEach(child =>
				child.classList.remove("border-blue-500", "font-semibold")
			);
			btn.classList.add("border-blue-500", "font-semibold");
			contentContainer.setAttribute("data-active-tab", tab.id);
			renderActiveTab();
		});

		tabNav.appendChild(btn);
	});

	wrapper.appendChild(tabNav);
	wrapper.appendChild(contentContainer);
	bodyContainer.appendChild(wrapper);

	await connect();
}


async function connect() {
	const socket = await connectFriend();

	socket.onmessage = (msg) => {
		const message = JSON.parse(msg.data.toString());
		console.log("📩 WS message:", message);

		switch (message.type) {
			case "friendsUpdate":
				console.log("🟢 Neue Friends-Daten empfangen:", message.data);
				friendsData = message.data as FriendsViewData;
				renderActiveTab();
				break;
		}
	};

	socket.onclose = () => {
		console.log("🔴 Friends WebSocket disconnected");
		navigateTo("dashboard");
	};

	setInterval(() => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: "ping" }));
		}
	}, 30000);
}

function renderActiveTab() {
	const container = document.getElementById("friends-content");
	if (!container) return;

	const activeTab = container.getAttribute("data-active-tab");

	if (!friendsData) {
		container.innerHTML = `<p class="text-gray-400">${t("loadingFriends") || "Freunde werden geladen..."}</p>`;
		return;
	}

	switch (activeTab) {
		case "online":
			renderFriendsOnline(friendsData.onlineFriends);
			break;
		case "all":
			renderOfflineFriends(friendsData.offlineFriends);
			break;
		case "add":
			renderAddFriends(friendsData.allUsers, friendsData.notFriends, friendsData.recvRequest, friendsData.sendRequest);
			break;
		case "requests":
			renderFriendRequests(friendsData.recvRequest, friendsData.sendRequest);
			break;
	}
}


export function renderFriendsOnline(friends: Friend[]): void {
	const container = document.getElementById("friends-content");
	if (!container) return;

	container.innerHTML = "";

	if (!friends || friends.length === 0) {
		const emptyMsg = document.createElement("p");
		emptyMsg.className = "text-gray-400";
		emptyMsg.textContent = t("noFriendsOnline") || "Keine Freunde online 😢";
		container.appendChild(emptyMsg);
		return;
	}

	const list = document.createElement("div");
	list.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

	friends.forEach(friend => {
		const card = document.createElement("div");
		card.className =
			"bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition cursor-pointer";

		const header = document.createElement("div");
		header.className = "flex items-center gap-3 mb-2";

		const img = document.createElement("img");
		img.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}`;
		img.alt = friend.username;
		img.className = "w-12 h-12 rounded-full object-cover border border-gray-600";

		const name = document.createElement("span");
		name.className = "font-semibold text-white text-lg";
		name.textContent = friend.username;

		const dot = document.createElement("span");
		dot.className = "ml-auto w-3 h-3 rounded-full bg-green-500";

		header.appendChild(img);
		header.appendChild(name);
		header.appendChild(dot);

		// 🕓 Info
		const info = document.createElement("div");
		info.className = "text-sm text-gray-400 mt-1";
		info.textContent = `${t("lastSeen") || "Zuletzt online"}: ${friend.last_seen || "-"}`;

		// ⚙️ Aktionen
		const actions = document.createElement("div");
		actions.className = "flex gap-3 mt-3";

		// 👤 Profil anzeigen
		const profileBtn = document.createElement("button");
		profileBtn.textContent = "👤 Profil";
		profileBtn.className =
			"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
		profileBtn.addEventListener("click", e => {
			e.stopPropagation();
			console.log(`Profil von ${friend.username} anzeigen`);
			// Hier später: navigateTo(`profile?user=${friend.id}`)
		});

		// 🗑 Freund entfernen
		const removeBtn = document.createElement("button");
		removeBtn.textContent = "🗑 Freund entfernen";
		removeBtn.className =
			"bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded";
		removeBtn.addEventListener("click", e => {
			e.stopPropagation();
			console.log(`❌ Freund ${friend.username} entfernen`);
			removeFriend(friend);
		});

		actions.appendChild(profileBtn);
		actions.appendChild(removeBtn);

		card.appendChild(header);
		card.appendChild(info);
		card.appendChild(actions);

		list.appendChild(card);
	});

	container.appendChild(list);
}

export function renderOfflineFriends(friends: Friend[]): void {
	const container = document.getElementById("friends-content");
	if (!container) return;

	container.innerHTML = "";

	if (!friends || friends.length === 0) {
		const emptyMsg = document.createElement("p");
		emptyMsg.className = "text-gray-400";
		emptyMsg.textContent = t("noFriendsOffline") || "Keine Freunde offline 🙌";
		container.appendChild(emptyMsg);
		return;
	}

	const list = document.createElement("div");
	list.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

	friends.forEach(friend => {
		const card = document.createElement("div");
		card.className =
			"bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition cursor-pointer";

		// 🧩 Header
		const header = document.createElement("div");
		header.className = "flex items-center gap-3 mb-2";

		const img = document.createElement("img");
		img.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}`;
		img.alt = friend.username;
		img.className = "w-12 h-12 rounded-full object-cover border border-gray-600";

		const name = document.createElement("span");
		name.className = "font-semibold text-white text-lg";
		name.textContent = friend.username;

		const dot = document.createElement("span");
		dot.className = "ml-auto w-3 h-3 rounded-full bg-gray-500";

		header.appendChild(img);
		header.appendChild(name);
		header.appendChild(dot);

		// 🕓 Info
		const info = document.createElement("div");
		info.className = "text-sm text-gray-400 mt-1";
		info.textContent = `${t("lastSeen") || "Zuletzt online"}: ${friend.last_seen || "-"}`;

		// ⚙️ Aktionen
		const actions = document.createElement("div");
		actions.className = "flex gap-3 mt-3";

		const profileBtn = document.createElement("button");
		profileBtn.textContent = "👤 Profil";
		profileBtn.className =
			"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
		profileBtn.addEventListener("click", e => {
			e.stopPropagation();
			console.log(`Profil von ${friend.username} anzeigen`);
		});

		const removeBtn = document.createElement("button");
		removeBtn.textContent = "🗑 Freund entfernen";
		removeBtn.className =
			"bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded";
		removeBtn.addEventListener("click", e => {
			e.stopPropagation();
			removeFriend(friend);
		});

		actions.appendChild(profileBtn);
		actions.appendChild(removeBtn);

		card.appendChild(header);
		card.appendChild(info);
		card.appendChild(actions);

		list.appendChild(card);
	});

	container.appendChild(list);
}



function renderAddFriends(
	allUsers: UserInfo[],
	notFriends: UserInfo[],
	recvRequests: RequestInfo[],
	sendRequests: RequestInfo[]
): void {
	const container = document.getElementById("friends-content");
	if (!container) return;

	container.innerHTML = "";

	const title = document.createElement("h2");
	title.textContent = "Freunde hinzufügen";
	title.className = "text-xl font-semibold mb-4 text-white";
	container.appendChild(title);

	if (!notFriends || notFriends.length === 0) {
		const emptyMsg = document.createElement("p");
		emptyMsg.className = "text-gray-400";
		emptyMsg.textContent = "Alle Benutzer sind bereits deine Freunde 👏";
		container.appendChild(emptyMsg);
		return;
	}

	const recvMap = new Map<string, string>();
	recvRequests.forEach(req => {
		if (req.type === "friend" && req.sender_username)
			recvMap.set(req.sender_username, req.status);
	});

	const sendMap = new Map<string, string>();
	sendRequests.forEach(req => {
		if (req.type === "friend" && req.receiver_username)
			sendMap.set(req.receiver_username, req.status);
	});

	// 🔍 Suchfeld
	const searchWrapper = document.createElement("div");
	searchWrapper.className = "mb-4";
	const searchInput = document.createElement("input");
	searchInput.type = "text";
	searchInput.placeholder = "🔍 Benutzer suchen...";
	searchInput.className =
		"w-full p-2 rounded border border-gray-600 bg-gray-800 text-white";
	searchWrapper.appendChild(searchInput);
	container.appendChild(searchWrapper);

	const list = document.createElement("div");
	list.className = "flex flex-col gap-3";
	container.appendChild(list);

	function renderList(users: UserInfo[]) {
		list.innerHTML = "";

		users.forEach(user => {
			const row = document.createElement("div");
			row.className =
				"flex items-center justify-between bg-gray-800 p-3 rounded hover:bg-gray-700 transition";

			const left = document.createElement("div");
			left.className = "flex items-center gap-3";

			const img = document.createElement("img");
			img.src = `/api/get/getImage?filename=${encodeURIComponent(
				user.path || "std_user_img.png"
			)}`;
			img.alt = user.username;
			img.className =
				"w-10 h-10 rounded-full object-cover border border-gray-600";

			const name = document.createElement("span");
			name.className = "font-semibold text-white";
			name.textContent = user.username;

			left.appendChild(img);
			left.appendChild(name);

			let status = null;
			let statusClass = "";
			let actionBtn = null;

			if (recvMap.has(user.username)) {
				const s = recvMap.get(user.username);
				status = s === "nothandled" ? "Hat dir eine Anfrage gesendet" : s;
				statusClass = "text-yellow-400 italic";
			} else if (sendMap.has(user.username)) {
				const s = sendMap.get(user.username);
				status =
					s === "nothandled"
						? "Anfrage gesendet"
						: s === "accepted"
						? "Bereits angenommen"
						: "Abgelehnt";
				statusClass = s === "accepted" ? "text-green-400" : "text-gray-400";
			} else {
				// ➕ Freund hinzufügen
				actionBtn = document.createElement("button");
				actionBtn.textContent = "➕ Freund hinzufügen";
				actionBtn.className =
					"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
				actionBtn.addEventListener("click", async e => {
					e.stopPropagation();
					console.log(`📨 Sende Freundschaftsanfrage an ${user.username}`);
					try {
						const res = await fetch(`/api/set/friend/request`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ receiver_username: user.username }),
							credentials: "include",
						});
						if (res.ok) {
							//actionBtn.textContent = "✅ Anfrage gesendet";
							//actionBtn.className =
								"bg-gray-600 text-white px-3 py-1 rounded cursor-default";
							//actionBtn.disabled = true;
						}
					} catch (err) {
						console.error("Fehler beim Senden der Anfrage:", err);
					}
				});
			}

			row.appendChild(left);

			if (status) {
				const statusSpan = document.createElement("span");
				statusSpan.textContent = status;
				statusSpan.className = statusClass;
				row.appendChild(statusSpan);
			} else if (actionBtn) {
				row.appendChild(actionBtn);
			}

			list.appendChild(row);
		});
	}

	searchInput.addEventListener("input", () => {
		const query = searchInput.value.toLowerCase();
		const filtered = notFriends.filter(user =>
			user.username.toLowerCase().includes(query)
		);
		renderList(filtered);
	});

	renderList(notFriends);
}


function renderFriendRequests(recvRequests: RequestInfo[], sendRequests: RequestInfo[]): void {
	const container = document.getElementById("friends-content");
	if (!container) return;

	container.innerHTML = "";

	const recvSection = document.createElement("div");
	const sendSection = document.createElement("div");

	const recvTitle = document.createElement("h3");
	recvTitle.textContent = "Empfangene Anfragen:";
	recvTitle.className = "font-semibold text-lg mb-2";

	const sendTitle = document.createElement("h3");
	sendTitle.textContent = "Gesendete Anfragen:";
	sendTitle.className = "font-semibold text-lg mb-2 mt-4";

	recvSection.appendChild(recvTitle);
	sendSection.appendChild(sendTitle);

	if (recvRequests.length === 0) {
		recvSection.append("Keine empfangenen Anfragen.");
	} else {
		recvRequests.forEach(req => {
			const p = document.createElement("p");
			p.textContent = `${req.sender_username} → ${req.status}`;
			recvSection.appendChild(p);
		});
	}

	if (sendRequests.length === 0) {
		sendSection.append("Keine gesendeten Anfragen.");
	} else {
		sendRequests.forEach(req => {
			const p = document.createElement("p");
			p.textContent = `${req.receiver_username} → ${req.status}`;
			sendSection.appendChild(p);
		});
	}

	container.appendChild(recvSection);
	container.appendChild(sendSection);
}

async function removeFriend(friend: Friend) {
	const socket = getFriendSocket()

	const payload = {
		type : ""
	}
}