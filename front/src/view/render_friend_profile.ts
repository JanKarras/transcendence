import { bodyContainer } from "../constants/constants.js";
import { LANGUAGE } from "../constants/gloabal.js";
import { lang, t } from "../constants/language_vars.js";
import { UserInfo } from "../constants/structs.js";
import { getMatchHistory, getUserForProfile, logOutApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { connectWebSocket } from "../websocket/ws.js";
import { render_header } from "./render_header.js";

async function renderProfile(user: UserInfo, id: number) {
	const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : './assets/img/default-user.png';

	const profileHTML = `
		<div id="profileView" class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<div id="profileInner" class="flex flex-col items-center space-y-4">
				<img src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
				${renderReadonlyField("username", user.username)}
				${renderReadonlyField("first_name", user.first_name || t(lang.unknown, LANGUAGE))}
				${renderReadonlyField("last_name", user.last_name || t(lang.unknown, LANGUAGE))}
				${renderReadonlyField("age", user.age !== null ? user.age : t(lang.profileAgeUnknown, LANGUAGE))}
				${renderReadonlyField("last_seen", user.last_seen || t(lang.profileAgeUnknown, LANGUAGE))}
				<div class="flex space-x-4 mt-4">
					<button id="showHistoryBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Match History</button>
				</div>
			</div>
		</div>
	`;

	if (!bodyContainer) return;
	bodyContainer.innerHTML = profileHTML;

	// Höhe merken
	const profileInner = document.getElementById("profileInner");
	const containerHeight = profileInner?.offsetHeight || 400; // fallback 400px

	// Listener **immer neu binden**
	const showHistoryBtn = document.getElementById("showHistoryBtn");
	showHistoryBtn?.addEventListener("click", async () => {
		const matchHistory = await getMatchHistory(Number(id));
		renderMatchHistory(matchHistory || [], () => renderProfile(user, id), containerHeight);
	});
}

function renderMatchHistory(matches: any[], backToProfile: () => void, fixedHeight: number) {
	if (!bodyContainer) return;

	// Hilfsfunktion für lesbaren Match-Typ
	const formatMatchType = (type: string) => {
		switch(type) {
			case "1v1_local": return "1v1 (Local)";
			case "1v1_remote": return "1v1 (Remote)";
			case "tournament": return "Tournament";
			default: return type;
		}
	};

	bodyContainer.innerHTML = `
		<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<h2 class="text-xl font-semibold mb-4">Match History</h2>
			<div class="space-y-4 overflow-y-auto" style="min-height: ${fixedHeight - 28 - 40 - 16 - 16}px; max-height: ${fixedHeight - 28 - 40 - 16 - 16}px;">
				${matches.map(match => {
					const maxRank = Math.min(...match.players.map((p: any) => p.rank)); // Gewinner rank=1
					return `
						<div class="border p-3 rounded bg-gray-50">
							<p class="font-medium"><strong>${formatMatchType(match.match_type)}</strong> ${match.tournament_name ? `- ${match.tournament_name} (Runde ${match.round})` : ''}</p>
							<p class="text-sm text-gray-600 mb-2">${match.match_date}</p>
							<ul class="pl-4 list-disc">
								${match.players.map((p: any) => `
									<li>
										${p.username} - Score: ${p.score} ${p.rank === 1 ? '🏆' : ''}
									</li>`).join('')}
							</ul>
						</div>
					`;
				}).join('')}
			</div>
			<div class="mt-4">
				<button id="backToProfileBtn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Zurück zum Profil</button>
			</div>
		</div>
	`;

	const backBtn = document.getElementById("backToProfileBtn");
	backBtn?.addEventListener("click", backToProfile);
}


export async function render_friend_profile(params: URLSearchParams | null) {
	const id = params?.get("id");
	if (!id) return;

	render_header();

	const user = await getUserForProfile(id);
	if ('error' in user) return;

	await renderProfile(user, Number(id));
}

function renderReadonlyField(field: string, value: string | number) {
	const key = "profileLabel_" + field;
	const translationObj = lang[key as keyof typeof lang] as any;
	const label = translationObj ? t(translationObj, LANGUAGE) : field;

	return `
		<div class="w-full">
			<label class="block text-sm font-medium text-gray-600 mb-1">${label}</label>
			<input value="${value}" disabled
				class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700" />
		</div>`;
}
