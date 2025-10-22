import { bodyContainer } from "../constants/constants.js";
import { initTranslations, t } from "../constants/i18n.js";
import { Friend, UserInfo, RequestInfo, FriendsViewData } from "../constants/structs.js";
import { connectFriend, getFriendSocket } from "../websocket/wsFriendsService.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { showFriendProfileModal } from "../templates/friendProfileModal.js";


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

		const info = document.createElement("div");
		info.className = "text-sm text-gray-400 mt-1";
		info.textContent = `${t("lastSeen") || "Zuletzt online"}: ${friend.last_seen || "-"}`;

		const actions = document.createElement("div");
		actions.className = "flex gap-3 mt-3";

		const profileBtn = document.createElement("button");
		profileBtn.textContent = "👤 Profil";
		profileBtn.className =
			"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
		profileBtn.addEventListener("click", e => {
			e.stopPropagation();
			showFriendProfileModal(friend);
		});

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
			showFriendProfileModal(friend);
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



export function renderAddFriends(
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

	// 🧭 Maps für Status
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

			let status: string | null = null;
			let statusClass = "";
			let actionBtn: HTMLButtonElement | null = null;

			// 🔹 Empfangene Anfragen
			if (recvMap.has(user.username)) {
				const s = recvMap.get(user.username);
				if (s === "nothandled") {
					status = "Hat dir eine Anfrage gesendet";
					statusClass = "text-yellow-400 italic";
					// ⛔ kein Button, weil aktive Anfrage besteht
				} else if (s === "accepted") {
					status = "Bereits Freunde";
					statusClass = "text-green-400";
				} else if (s === "declined") {
					// ✅ Du hast abgelehnt → darf erneut senden
					status = "Du hast diese Anfrage abgelehnt";
					statusClass = "text-gray-400 italic";

					actionBtn = document.createElement("button");
					actionBtn.textContent = "🔁 Anfrage erneut senden";
					actionBtn.className =
						"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded ml-3";
					actionBtn.addEventListener("click", async e => {
						e.stopPropagation();
						sendFriendRequest(user.id);
					});
				}
			}
			// 🔹 Gesendete Anfragen
			else if (sendMap.has(user.username)) {
				const s = sendMap.get(user.username);
				if (s === "nothandled") {
					status = "Anfrage gesendet";
					statusClass = "text-yellow-400 italic";
					// ⛔ kein Button, weil aktive Anfrage besteht
				} else if (s === "accepted") {
					status = "Bereits Freunde";
					statusClass = "text-green-400";
				} else if (s === "declined") {
					// ✅ Abgelehnt → darf erneut senden
					actionBtn = document.createElement("button");
					actionBtn.textContent = "🔁 Anfrage erneut senden";
					actionBtn.className =
						"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
					actionBtn.addEventListener("click", async e => {
						e.stopPropagation();
						sendFriendRequest(user.id);
					});
				}
			}
			// 🔹 Noch keine Anfrage vorhanden
			else {
				actionBtn = document.createElement("button");
				actionBtn.textContent = "➕ Freund hinzufügen";
				actionBtn.className =
					"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
				actionBtn.addEventListener("click", async e => {
					e.stopPropagation();
					sendFriendRequest(user.id);
				});
			}

			row.appendChild(left);

			const rightSide = document.createElement("div");
			rightSide.className = "flex items-center gap-2";

			if (status) {
				const statusSpan = document.createElement("span");
				statusSpan.textContent = status;
				statusSpan.className = statusClass;
				rightSide.appendChild(statusSpan);
			}

			if (actionBtn) {
				rightSide.appendChild(actionBtn);
			}

			row.appendChild(rightSide);
			list.appendChild(row);
		});
	}

	// 🔍 Suchlogik
	searchInput.addEventListener("input", () => {
		const query = searchInput.value.toLowerCase();
		const filtered = notFriends.filter(user =>
			user.username.toLowerCase().includes(query)
		);
		renderList(filtered);
	});

	renderList(notFriends);
}




export function renderFriendRequests(recvRequests: RequestInfo[], sendRequests: RequestInfo[]): void {
	const container = document.getElementById("friends-content");
	if (!container) return;

	container.innerHTML = "";

	const title = document.createElement("h2");
	title.textContent = "Freundschaftsanfragen";
	title.className = "text-xl font-semibold mb-6 text-white";
	container.appendChild(title);

	const recvSection = document.createElement("div");
	const recvTitle = document.createElement("h3");
	recvTitle.textContent = "📥 Empfangene Anfragen";
	recvTitle.className = "font-semibold text-lg mb-3 text-blue-300";
	recvSection.appendChild(recvTitle);

	if (recvRequests.length === 0) {
		const p = document.createElement("p");
		p.textContent = "Keine empfangenen Anfragen 😴";
		p.className = "text-gray-400";
		recvSection.appendChild(p);
	} else {
		const list = document.createElement("div");
		list.className = "flex flex-col gap-3";

		recvRequests.forEach(req => {
			const row = document.createElement("div");
			row.className =
				"flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition";

			const left = document.createElement("div");
			left.className = "flex items-center gap-3";

			const img = document.createElement("img");
			img.src = `/api/get/getImage?filename=${encodeURIComponent((req.sender_username || "std_user_img") + ".png")}`;
			img.alt = req.sender_username || "User";
			img.className = "w-10 h-10 rounded-full object-cover border border-gray-600";

			const name = document.createElement("span");
			name.className = "text-white font-semibold";
			name.textContent = req.sender_username || "Unbekannt";

			left.appendChild(img);
			left.appendChild(name);

			const right = document.createElement("div");

			if (req.status === "nothandled") {
				right.className = "flex gap-2";

				const acceptBtn = document.createElement("button");
				acceptBtn.textContent = "✅ Annehmen";
				acceptBtn.className = "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded";
				acceptBtn.addEventListener("click", e => {
					e.stopPropagation();
					console.log(`✅ Anfrage von ${req.sender_username} akzeptieren`);
					acceptFriendRequest(req.id);
				});

				const declineBtn = document.createElement("button");
				declineBtn.textContent = "❌ Ablehnen";
				declineBtn.className = "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded";
				declineBtn.addEventListener("click", e => {
					e.stopPropagation();
					console.log(`❌ Anfrage von ${req.sender_username} ablehnen`);
					sayNoToFriendRequest(req.id);
				});

				right.appendChild(acceptBtn);
				right.appendChild(declineBtn);
			} else {
				const status = document.createElement("span");
				status.className = "text-sm font-semibold " +
					(req.status === "accepted"
						? "text-green-500"
						: req.status === "declined"
						? "text-red-500"
						: "text-gray-400");
				status.textContent =
					req.status === "accepted"
						? "✅ Angenommen"
						: req.status === "declined"
						? "❌ Abgelehnt"
						: "⏳ Ausstehend";
				right.appendChild(status);
			}

			row.appendChild(left);
			row.appendChild(right);
			list.appendChild(row);
		});

		recvSection.appendChild(list);
	}

	container.appendChild(recvSection);

	const sendSection = document.createElement("div");
	sendSection.className = "mt-8";
	const sendTitle = document.createElement("h3");
	sendTitle.textContent = "📤 Gesendete Anfragen";
	sendTitle.className = "font-semibold text-lg mb-3 text-blue-300";
	sendSection.appendChild(sendTitle);

	if (sendRequests.length === 0) {
		const p = document.createElement("p");
		p.textContent = "Keine gesendeten Anfragen 📭";
		p.className = "text-gray-400";
		sendSection.appendChild(p);
	} else {
		const list = document.createElement("div");
		list.className = "flex flex-col gap-3";

		sendRequests.forEach(req => {
			const row = document.createElement("div");
			row.className =
				"flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition";

			const left = document.createElement("div");
			left.className = "flex items-center gap-3";

			const img = document.createElement("img");
			img.src = `/api/get/getImage?filename=${encodeURIComponent((req.receiver_username || "std_user_img") + ".png")}`;
			img.alt = req.receiver_username || "User";
			img.className = "w-10 h-10 rounded-full object-cover border border-gray-600";

			const name = document.createElement("span");
			name.className = "text-white font-semibold";
			name.textContent = req.receiver_username || "Unbekannt";

			left.appendChild(img);
			left.appendChild(name);

			const status = document.createElement("span");
			status.className =
				"text-sm font-semibold " +
				(req.status === "accepted"
					? "text-green-500"
					: req.status === "declined"
					? "text-red-500"
					: "text-gray-400");
			status.textContent =
				req.status === "nothandled"
					? "⏳ Ausstehend"
					: req.status === "accepted"
					? "✅ Angenommen"
					: "❌ Abgelehnt";

			row.appendChild(left);
			row.appendChild(status);
			list.appendChild(row);
		});

		sendSection.appendChild(list);
	}

	container.appendChild(sendSection);
}



async function removeFriend(friend: Friend) {
	const socket = getFriendSocket()

	const payload = {
		type : "removeFriend",
		data : {
			friendId : friend.id
		}
	}
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(payload));
	}
}

async function sendFriendRequest(userId: number) {
	const socket = getFriendSocket()

	const payload = {
		type : "sendFriendRequest",
		data : {
			userId : userId
		}
	}
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(payload));
	}
}

async function acceptFriendRequest(requestId: number) {
	const socket = getFriendSocket()

	const payload = {
		type : "acceptFriendRequest",
		data : {
			requestId : requestId
		}
	}
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(payload));
	}
}

async function sayNoToFriendRequest(requestId: number) {
	const socket = getFriendSocket();
	const payload = {
		type: "declineFriendRequest",
		data: {
			requestId: requestId
		}
	};
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(payload));
	}
}
