import { getMatchHistory } from "../../api/getMatchHistory.js";
import { getStats } from "../../api/getStats.js";
import { getUser } from "../../api/getUser.js";
import { UserInfo } from "../../constants/structs.js";
import { setEventListenersDashboardPage, setEventListenersDashboardPageChat } from "../../events/pages/dashboardPage.js";
import { hideNewRequestBadge, renderDashboard, showNewRequestBadge } from "../../render/pages/renderDashboard.js";
import { navigateTo } from "../../router/navigateTo.js";
import { getDashboardSocket } from "../../websocket/wsDashboardServce.js";
import { initTranslations } from "../gloabal/initTranslations.js";
import { logOut } from "../gloabal/logOut.js";
import { chatTemplate } from "../templates/chatSideBarTemplate/chatSidebarTemplate.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export async function dashboarPage(params: URLSearchParams | null) {
	window.location.hash = "#dashboard";
	await headerTemplate();

	await initTranslations();

	const userData = await getUser();

	if (!userData) {
		logOut("Error while fetching user. Try again later");
		return;
	}

	const user : UserInfo = userData.user;

	console.log("User Data:", userData);

	const matchesFromHistory = await getMatchHistory(user.id);
	
	const stats = await getStats(user.id);
	
	await renderDashboard(params, stats, matchesFromHistory);
	
	await setEventListenersDashboardPage();
	
	initChat();
	
	
}

async function initChat() {
	chatTemplate()
	setEventListenersDashboardPageChat();
}

export function handleDashboardMessage(msg: MessageEvent, socket: WebSocket): void {
	const message = JSON.parse(msg.data.toString());
	console.log("Message Dashboard WS: ", message);

	switch (message.type) {
		case "invitedToTournament":
			showTournamentModal(message.data);
			break;
		case "newRequest":
			showNewRequestBadge();
			break;
		case "removedRequest":
			hideNewRequestBadge();
			break;
	}
}


async function showTournamentModal(data: { gameId: number }) {
	console.log("Tournament Invite:", data);

	const existing = document.getElementById("tournamentInviteModal");
	if (existing) existing.remove();

	const overlay = document.createElement("div");
	overlay.id = "tournamentInviteModal";
	overlay.className =
		"fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50";

	const modal = document.createElement("div");
	modal.className =
		"bg-gray-900 text-white rounded-lg shadow-2xl w-[400px] p-6 relative border border-gray-700";

	const title = document.createElement("h2");
	title.className = "text-xl font-semibold text-center mb-4";
	title.textContent = "🏆 Du wurdest zu einem Turnier eingeladen!";

	const description = document.createElement("p");
	description.className = "text-center text-gray-300 mb-6";
	description.textContent = "Möchtest du die Einladung annehmen oder ablehnen?";

	const acceptBtn = document.createElement("button");
	acceptBtn.className =
		"bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-medium mx-2";
	acceptBtn.textContent = "Annehmen";

	const declineBtn = document.createElement("button");
	declineBtn.className =
		"bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-medium mx-2";
	declineBtn.textContent = "Ablehnen";

	const btnContainer = document.createElement("div");
	btnContainer.className = "flex justify-center";
	btnContainer.appendChild(acceptBtn);
	btnContainer.appendChild(declineBtn);

	modal.appendChild(title);
	modal.appendChild(description);
	modal.appendChild(btnContainer);
	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	acceptBtn.addEventListener("click", () => {
		const p = new URLSearchParams();
		p.set("gameId", String(data.gameId));

		overlay.remove();

		console.log("✅ Tournament invite accepted → navigating with gameId", data.gameId);
		navigateTo("tournament", p);
	});

	declineBtn.addEventListener("click", () => {
		console.log("❌ Tournament invite declined");
		overlay.remove();

		const socket = getDashboardSocket();
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: "declineTournamentInvite",
				data: { gameId: data.gameId }
			}));
			console.log("📤 Decline message sent for gameId:", data.gameId);
		} else {
			console.warn("⚠️ Dashboard WebSocket not open, cannot send decline message.");
		}
	});
}
