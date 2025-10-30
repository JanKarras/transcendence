import { getMatchHistory } from "../../api/getMatchHistory.js";
import { getStats } from "../../api/getStats.js";
import { Friend } from "../../constants/structs.js";
import { t } from "../gloabal/initTranslations.js";

export async function showFriendProfileModal(friend: Friend): Promise<void> {
	const existingModal = document.getElementById("friend-profile-modal");
	if (existingModal) existingModal.remove();

	const stats = await getStats(friend.id);
	const matchesFromHistory: any[] = await getMatchHistory(friend.id) || [];
	console.log("matchhis", matchesFromHistory)
	const overlay = document.createElement("div");
	overlay.id = "friend-profile-modal";
	overlay.className =
		"fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50";

	const modal = document.createElement("div");
	modal.className =
		"bg-gray-900 text-white rounded-lg shadow-2xl w-[400px] p-6 relative border border-gray-700";

	const closeBtn = document.createElement("button");
	closeBtn.innerHTML = "✖️";
	closeBtn.className =
		"absolute top-3 right-3 text-gray-400 hover:text-white text-lg transition";
	closeBtn.addEventListener("click", () => overlay.remove());
	modal.appendChild(closeBtn);

	const header = document.createElement("div");
	header.className = "flex items-center gap-4 mb-4";

	const img = document.createElement("img");
	img.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}`;
	img.alt = friend.username;
	img.className = "w-16 h-16 rounded-full object-cover border border-gray-600";

	const nameBlock = document.createElement("div");
	const name = document.createElement("h2");
	name.className = "text-xl font-semibold";
	name.textContent = friend.username;

	const onlineDot = document.createElement("div");
	onlineDot.className = "flex items-center gap-1 text-sm text-gray-400";
	const dot = document.createElement("span");
	dot.className =
		"inline-block w-3 h-3 rounded-full " +
		(isOnline(friend.last_seen) ? "bg-green-500" : "bg-gray-500");
	const dotLabel = document.createElement("span");
	dotLabel.textContent = isOnline(friend.last_seen)
		? t("online") || "Online"
		: t("offline") || "Offline";
	onlineDot.appendChild(dot);
	onlineDot.appendChild(dotLabel);

	nameBlock.appendChild(name);
	nameBlock.appendChild(onlineDot);

	header.appendChild(img);
	header.appendChild(nameBlock);
	modal.appendChild(header);

	const info = document.createElement("p");
	info.className = "text-gray-400 mb-4";
	info.textContent = `${t('friendProfile.lastSeen')}: ${friend.last_seen || "-"}`;
	modal.appendChild(info);

	const details = document.createElement("div");
	details.className = "text-sm text-gray-300 space-y-1";

	if (friend.first_name || friend.last_name) {
		details.innerHTML += `<p><strong>${t("name") || "Name"}:</strong> ${friend.first_name || ""} ${friend.last_name || ""}</p>`;
	}
	if (friend.age) {
		details.innerHTML += `<p><strong>${t("age") || "Alter"}:</strong> ${friend.age}</p>`;
	}

	modal.appendChild(details);

	if (stats) {
		const statBox = document.createElement("div");
		statBox.className = "grid grid-cols-3 gap-3 mt-5 text-center";

		statBox.innerHTML = `
			<div class="bg-gray-800 rounded-lg p-2">
				<p class="text-green-400 font-bold text-lg">${stats.wins}</p>
				<p class="text-xs">${t("friendProfile.wonGames")}</p>
			</div>
			<div class="bg-gray-800 rounded-lg p-2">
				<p class="text-red-400 font-bold text-lg">${stats.loses}</p>
				<p class="text-xs">${t("friendProfile.lostGames")}</p>
			</div>
			<div class="bg-gray-800 rounded-lg p-2">
				<p class="text-yellow-400 font-bold text-lg">${stats.tournamentWins}</p>
				<p class="text-xs">${t("friendProfile.wonTournaments")}</p>
			</div>
		`;

		modal.appendChild(statBox);
	}

	if (matchesFromHistory && matchesFromHistory.length > 0) {
		const formatMatchType = (type: string) => {
			switch (type) {
				case "1v1_local": return t('matchType1v1Local');
				case "1v1_remote": return t('matchType1v1Remote');
				case "tournament": return t('matchTypeTournament');
				default: return type;
			}
		};

		const matchHistoryBox = document.createElement("div");
		matchHistoryBox.className = "text-white mt-6 bg-[#2c2c58] rounded-lg p-4 shadow-md";
		console.log(matchesFromHistory);
		matchHistoryBox.innerHTML = `
			<h2 class="text-lg font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent mb-3">${t('matchHistoryTitle')}</h2>
			<div class="space-y-3 max-h-[250px] overflow-y-auto pr-1">
				${matchesFromHistory.slice().reverse().map(match => `
					<div class="p-2 rounded ${
						match.match_type === 'tournament'
							? 'bg-gradient-to-r from-[#8e00a8] to-[#7c0bac] shadow-[0_0_8px_#174de1]'
							: 'bg-gradient-to-r from-[#07ae2d] to-[#0d6500] shadow-[0_0_8px_#b01ae2]'
					}">
						<p class="font-medium">
							<strong>${formatMatchType(match.match_type)}</strong>
							${match.tournament_name ? `- ${match.tournament_name} (${t('round')} ${match.round})` : ''}
						</p>
						<p class="text-xs text-gray-300 mb-1">${match.match_date}</p>
						<ul class="pl-4 list-disc text-xs">
							${match.players.map((p: any) => `
								<li>${p.username} - ${t('score')}: ${p.score} ${p.rank === 1 ? '🏆' : ''}</li>
							`).join('')}
						</ul>
					</div>
				`).join('')}
			</div>
		`;

		modal.appendChild(matchHistoryBox);
	}

	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	overlay.addEventListener("click", e => {
		if (e.target === overlay) overlay.remove();
	});
}

function isOnline(lastSeen: string | null): boolean {
	if (!lastSeen) return false;
	const last = new Date(lastSeen + " UTC").getTime();
	return Date.now() - last <= 5 * 60 * 1000;
}

