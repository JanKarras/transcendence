import { Friend } from "../constants/structs.js";
import { t } from "../constants/i18n.js";
import { getStats } from "../remote_storage/remote_storage.js";

export async function showFriendProfileModal(friend: Friend): Promise<void> {
	// 🧹 Vorherige Modals entfernen
	const existingModal = document.getElementById("friend-profile-modal");
	if (existingModal) existingModal.remove();

	// 📊 Statistiken vom Backend laden
	const stats = await getStats(friend.id);

	// 🌒 Overlay
	const overlay = document.createElement("div");
	overlay.id = "friend-profile-modal";
	overlay.className =
		"fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50";

	// 📦 Modal-Container
	const modal = document.createElement("div");
	modal.className =
		"bg-gray-900 text-white rounded-lg shadow-2xl w-[400px] p-6 relative border border-gray-700";

	// ❌ Schließen-Button
	const closeBtn = document.createElement("button");
	closeBtn.innerHTML = "✖️";
	closeBtn.className =
		"absolute top-3 right-3 text-gray-400 hover:text-white text-lg transition";
	closeBtn.addEventListener("click", () => overlay.remove());
	modal.appendChild(closeBtn);

	// 🧑 Header mit Profilbild & Name
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

	// 🕓 Letzter Login
	const info = document.createElement("p");
	info.className = "text-gray-400 mb-4";
	info.textContent = `${t("lastSeen") || "Zuletzt online"}: ${friend.last_seen || "-"}`;
	modal.appendChild(info);

	// 🧾 Details
	const details = document.createElement("div");
	details.className = "text-sm text-gray-300 space-y-1";

	if (friend.first_name || friend.last_name) {
		details.innerHTML += `<p><strong>${t("name") || "Name"}:</strong> ${friend.first_name || ""} ${friend.last_name || ""}</p>`;
	}
	if (friend.age) {
		details.innerHTML += `<p><strong>${t("age") || "Alter"}:</strong> ${friend.age}</p>`;
	}

	modal.appendChild(details);

	// 🏆 Statistiken
	if (stats) {
		const statBox = document.createElement("div");
		statBox.className = "grid grid-cols-3 gap-3 mt-5 text-center";

		statBox.innerHTML = `
			<div class="bg-gray-800 rounded-lg p-2">
				<p class="text-green-400 font-bold text-lg">${stats.wins}</p>
				<p class="text-xs">${t("wins") || "Siege"}</p>
			</div>
			<div class="bg-gray-800 rounded-lg p-2">
				<p class="text-red-400 font-bold text-lg">${stats.loses}</p>
				<p class="text-xs">${t("loses") || "Niederlagen"}</p>
			</div>
			<div class="bg-gray-800 rounded-lg p-2">
				<p class="text-yellow-400 font-bold text-lg">${stats.tournamentWins}</p>
				<p class="text-xs">${t("tournaments") || "Turniere"}</p>
			</div>
		`;

		modal.appendChild(statBox);
	}

	// Alles zusammen einfügen
	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	// ✨ Klick außerhalb => schließen
	overlay.addEventListener("click", e => {
		if (e.target === overlay) overlay.remove();
	});
}

/**
 * Hilfsfunktion – prüft, ob Freund "online" ist (innerhalb 5 Minuten aktiv)
 */
function isOnline(lastSeen: string | null): boolean {
	if (!lastSeen) return false;
	const last = new Date(lastSeen + " UTC").getTime();
	return Date.now() - last <= 5 * 60 * 1000;
}

