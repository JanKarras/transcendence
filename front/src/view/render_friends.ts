import { bodyContainer } from "../constants/constants.js";
import { initTranslations, t } from "../constants/i18n.js";
import { Friend } from "../constants/structs";
import { connectFriend, getFriendSocket } from "../websocket/wsFriendsService.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";

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
	contentContainer.textContent = "👋 Willkommen bei deinen Freunden!";
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
		btn.className =
			"py-2 px-4 border-b-2 border-transparent hover:border-blue-400 text-white transition";

		if (index === 0) {
			btn.classList.add("border-blue-500", "font-semibold");
			contentContainer.textContent = `${tab.icon} ${tab.label}`;
		}

		btn.addEventListener("click", () => {
			Array.from(tabNav.children).forEach(child =>
				child.classList.remove("border-blue-500", "font-semibold")
			);

			btn.classList.add("border-blue-500", "font-semibold");

			contentContainer.innerHTML = `<p class="text-lg">${tab.icon} ${tab.label}</p>`;
			contentContainer.setAttribute("data-active-tab", tab.id);
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
				renderFriendsOnline(message.data.onlineFriends);
				break;
		}
	};

	socket.onclose = () => {
		console.log("🔴 Tournament WebSocket disconnected");
		navigateTo('dashboard');
	};

	setInterval(() => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: "ping" }));
		}
	}, 30000);
}

export function renderFriendsOnline(friends: Friend[]): void {
	console.log(friends)
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
		info.textContent = `${t("lastSeen") || "Zuletzt online"}: ${
			friend.last_seen || "-"
		}`;

		const actions = document.createElement("div");
		actions.className = "flex gap-3 mt-3";

		const chatBtn = document.createElement("button");
		chatBtn.textContent = "💬 Chat";
		chatBtn.className =
			"bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
		chatBtn.addEventListener("click", e => {
			e.stopPropagation();
			console.log(`Chat mit ${friend.username} öffnen`);
		});

		const playBtn = document.createElement("button");
		playBtn.textContent = "🎮 Spiel starten";
		playBtn.className =
			"bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded";
		playBtn.addEventListener("click", e => {
			e.stopPropagation();
			console.log(`Spiel mit ${friend.username} starten`);
		});

		actions.appendChild(chatBtn);
		actions.appendChild(playBtn);

		card.appendChild(header);
		card.appendChild(info);
		card.appendChild(actions);

		list.appendChild(card);
	});

	container.appendChild(list);
}