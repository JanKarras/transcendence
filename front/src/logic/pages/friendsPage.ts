import { navigateTo } from "../../router/navigateTo.js";
import { connectFriend, getFriendSocket } from "../../websocket/wsFriendsService.js";
import { initTranslations, t } from "../global/initTranslations.js";
import { headerTemplate } from "../templates/headerTemplate.js";
import { FriendsViewData } from "../../constants/structs.js";
import { renderAddFriends, renderFriendRequests, renderFriendsList, renderFriendsPage } from "../../render/pages/renderFriendsPage.js";

export let friendsData: FriendsViewData | null = null;


export async function friendsPage(params: URLSearchParams | null) {
	await headerTemplate();
	await initTranslations();

	await renderFriendsPage();
	await connect();
	const p = params?.get("tab");
	if (p === "requests")
	{
		const contentContainer = document.getElementById("friends-content");
		if (contentContainer )
			contentContainer.setAttribute("data-active-tab", "requests");
	}
}

async function connect() {
	const socket = await connectFriend();

	socket.onmessage = (msg) => {
		const message = JSON.parse(msg.data.toString());

		switch (message.type) {
			case "friendsUpdate":
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

export function renderActiveTab() {
	const container = document.getElementById("friends-content");
	if (!container) return;

	const activeTab = container.getAttribute("data-active-tab");

	if (!friendsData) {
		container.innerHTML = `<p class="text-gray-400">${t("loadingFriends") || "Freunde werden geladen..."}</p>`;
		return;
	}

	let pendingCount = 0;
	if (friendsData?.recvRequest) {
		pendingCount = friendsData.recvRequest.filter(r => r.status === "nothandled").length;
	}

	const tabNav = container.previousElementSibling;
	if (tabNav) {
		const requestTab = Array.from(tabNav.children).find(
			btn => btn.textContent?.includes(t("friendsLang.requests")) || btn.textContent?.includes("✉️")
		);

		if (requestTab) {
			const existingBadge = requestTab.querySelector(".friend-request-badge");
			if (existingBadge) existingBadge.remove();

			if (pendingCount > 0) {
				const badge = document.createElement("span");
				badge.className = "friend-request-badge absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-[1px]";
				badge.textContent = pendingCount.toString();
				requestTab.appendChild(badge);
			}
		}
	}

	switch (activeTab) {
		case "online":
			renderFriendsList(friendsData, true);
			break;
		case "all":
			renderFriendsList(friendsData, false);
			break;
		case "add":
			renderAddFriends(
				friendsData.allUsers,
				friendsData.notFriends,
				friendsData.recvRequest,
				friendsData.sendRequest
			);
			break;
		case "requests":
			renderFriendRequests(friendsData.recvRequest, friendsData.sendRequest);
			break;
	}
}

export function sendFriendSocketMessage(type: string, data: Record<string, any>) {
	const socket = getFriendSocket();
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({ type, data }));
	}
}
