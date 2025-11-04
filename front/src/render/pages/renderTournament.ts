import { getUser } from "../../api/getUser.js";
import { bodyContainer } from "../../constants/constants.js";
import { Friend } from "../../constants/structs.js";
import { t } from "../../logic/global/initTranslations.js";
import { getTournamentSocket } from "../../websocket/wsTournamentService.js";

export async function renderTournamentPage(): Promise<void> {
	if (!bodyContainer) return;

	bodyContainer.innerHTML = `
		<div class="flex flex-col items-center gap-8 p-8" id="tournamentWrapper">
			<h1 class="text-5xl font-bold bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-text text-transparent mb-6">
				${t("game.tournament.create")}
			</h1>

			<div id="tournamentContent" class="w-full max-w-5xl"></div>

			<button
				id="startTournamentBtn"
				disabled
				class="mt-8 px-6 py-3 font-bold rounded-lg transition
					bg-green-600 hover:bg-green-700 text-white
					disabled:bg-gray-400 disabled:text-gray-200
					disabled:cursor-not-allowed disabled:hover:bg-gray-400"
			>
				${t("game.tournament.start")}
			</button>

			<div id="chatContainer" class="w-full max-w-3xl bg-gray-900 rounded-lg mt-8 p-4 flex flex-col h-80">
				<div id="chatMessages" class="flex-1 overflow-y-auto text-sm text-white space-y-2 mb-2"></div>
				<div class="flex gap-2">
					<input id="chatInput"
						class="flex-1 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
						placeholder="${t("typeMessage")}" />
					<button id="chatSend"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold">
						${t("send")}
					</button>
				</div>
			</div>
		</div>

		<!-- Invite Modal -->
		<div id="inviteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
			<div class="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
				<h2 class="text-xl font-bold mb-4 text-white">${t("game.tournament.selectFriend")}</h2>
				<div id="friendList" class="flex flex-col gap-2 mb-4"></div>
				<div class="flex justify-end">
					<button id="cancelInvite"
						class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded">
						${t("game.cancel")}
					</button>
				</div>
			</div>
		</div>
	`;
}

export async function renderRemoteTournament(
	players: {
		id: number | null;
		username: string | null;
		path: string | null;
		slot: number;
		status: "joined" | "invited" | "left" | null;
	}[],
	messages: { text: string; type: "system" | "user" }[],
	ready?: boolean
) {
	const userData = await getUser();
	if (!userData) return;

	const friends: Friend[] = userData.friends || [];
	const content = document.getElementById("tournamentContent");
	if (!content) return;

	const playerCards = players.map((p) => {
		if (p.id && p.status !== "left") {
			const statusText =
				p.status === "joined" ? "Joined" :
				p.status === "invited" ? "Invited..." : "";
			const statusColor =
				p.status === "joined" ? "text-green-400" :
				p.status === "invited" ? "text-yellow-400 animate-pulse" : "text-gray-400";

			return `
				<div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white">
					<span class="font-bold text-xl">${p.username}</span>
					<img src="/api/get/getImage?filename=${encodeURIComponent(p.path || "std_user_img.png")}"
						 class="w-24 h-24 rounded-full object-cover">
					<span class="text-sm ${statusColor}">${statusText}</span>
				</div>
			`;
		} else {
			return `
				<div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white
							hover:bg-gray-700 cursor-pointer" id="player${p.slot}Card">
					<span class="font-bold text-xl">${t("game.tournament.invite")}</span>
					<div class="w-24 h-24 bg-gray-700 rounded-full flex justify-center items-center text-gray-400 text-3xl">+</div>
					<span class="text-sm text-gray-400">Player ${p.slot}</span>
				</div>
			`;
		}
	}).join("");

	content.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">${playerCards}</div>`;
	renderChat(messages);

	const startBtn = document.getElementById("startTournamentBtn") as HTMLButtonElement;
	if (startBtn) startBtn.disabled = !ready;

	players.forEach((p) => {
		if (!p.id || p.status === "left") {
			document.getElementById(`player${p.slot}Card`)?.addEventListener("click", () =>
				openInviteModal(p.slot, players)
			);
		}
	});
}

export function renderChat(messages: { text: string; type: "system" | "user" }[]) {
	const chat = document.getElementById("chatMessages");
	if (!chat) return;
	chat.innerHTML = messages
		.map(
			(m) =>
				`<div class="${m.type === "system" ? "text-gray-400 italic" : "text-white"}">${m.text}</div>`
		)
		.join("");
	chat.scrollTop = chat.scrollHeight;
}

export async function openInviteModal(slot: number, players: any[]): Promise<void> {
	const userData = await getUser();
	if (!userData) return ;

	const friends: Friend[] = userData.friends || [];
	const modal = document.getElementById("inviteModal");
	if (!modal) return;
	modal.classList.remove("hidden");

	const takenIds = players.filter((p) => p.id && p.status !== "left").map((p) => p.id);
	const available = friends.filter((f) => isOnline(f) && !takenIds.includes(f.id));

	const friendList = document.getElementById("friendList")!;
	friendList.innerHTML = available.length
		? available.map(
				(f) => `
				<div class="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
					 data-id="${f.id}">
					<img src="/api/get/getImage?filename=${encodeURIComponent(f.path || "std_user_img.png")}"
						 class="w-10 h-10 rounded-full object-cover">
					<span class="text-white">${f.username}</span>
				</div>`
		  ).join("")
		: `<p class="text-gray-400">${t("game.tournament.noOnlineFriends")}</p>`;

	friendList.querySelectorAll<HTMLDivElement>("[data-id]").forEach((el) =>
		el.addEventListener("click", () => {
			const id = Number(el.dataset.id);
			const socket = getTournamentSocket();
			socket?.send(JSON.stringify({ type: "inviteToTournament", data: { guestId: id, slot } }));
			modal.classList.add("hidden");
		})
	);
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;
function isOnline(friend: Friend): boolean {
	if (!friend.last_seen) return false;
	const lastSeen = new Date(friend.last_seen + " UTC").getTime();
	return Date.now() - lastSeen <= FIVE_MINUTES_MS;
}
