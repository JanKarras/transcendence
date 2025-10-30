import { bodyContainer } from "../constants/constants.js";
import { UserInfo } from "../constants/structs.js";
import { getMatchHistory, getUserForProfile } from "../remote_storage/remote_storage.js";
import { render_header } from "./render_header.js";
import { initTranslations, t } from "../constants/i18n.js"

export async function renderProfile(user: UserInfo, id: number, container: HTMLElement | null) {
	const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : './assets/img/default-user.png';

    await initTranslations();

	const profileHTML = `
		<div id="profileView" class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<div id="profileInner" class="flex flex-col items-center space-y-4">
				<img src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
				${renderReadonlyField("username", user.username)}
				${renderReadonlyField("firstName", user.first_name || t('unknown'))}
				${renderReadonlyField("lastName", user.last_name || t('unknown'))}
				${renderReadonlyField("age", user.age !== null ? user.age : t('profileAgeUnknown'))}
				${renderReadonlyField("lastSeen", user.last_seen || t('profileAgeUnknown'))}
				<div class="flex space-x-4 mt-4">
					<button id="showHistoryBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">${t('matchHis')}</button>
				</div>
			</div>
		</div>
	`;

	if (!container) return;
	container.innerHTML = profileHTML;

	const profileInner = document.getElementById("profileInner");
	const containerHeight = profileInner?.offsetHeight || 400;

	const showHistoryBtn = document.getElementById("showHistoryBtn");
	showHistoryBtn?.addEventListener("click", async () => {
		const matchHistory = await getMatchHistory(Number(id));
		renderMatchHistory(matchHistory || [], () => renderProfile(user, id, container), containerHeight);
	});
}

function renderMatchHistory(matches: any[], backToProfile: () => void, fixedHeight: number) {
	if (!bodyContainer) return;

	const formatMatchType = (type: string) => {
		switch(type) {
			case "1v1_local": return t('matchType1v1Local');
			case "1v1_remote": return t('matchType1v1Remote');
			case "tournament": return t('matchTypeTournament');
			default: return type;
		}
	};

	bodyContainer.innerHTML = `
		<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<h2 class="text-xl font-semibold mb-4">${t('matchHis')}</h2>
			<div class="space-y-4 overflow-y-auto" style="min-height: ${fixedHeight - 28 - 40 - 16 - 16}px; max-height: ${fixedHeight - 28 - 40 - 16 - 16}px;">
				${matches.map(match => {
					const maxRank = Math.min(...match.players.map((p: any) => p.rank));
					return `
						<div class="border p-3 rounded bg-gray-50">
							<p class="font-medium"><strong>${formatMatchType(match.match_type)}</strong> ${match.tournament_name ? `- ${match.tournament_name} (${t('round')} ${match.round})` : ''}</p>
							<p class="text-sm text-gray-600 mb-2">${match.match_date}</p>
							<ul class="pl-4 list-disc">
								${match.players.map((p: any) => `
									<li>
										${p.username} - ${t('score')}: ${p.score} ${p.rank === 1 ? t('trophy') : ''}
									</li>`).join('')}
							</ul>
						</div>
					`;
				}).join('')}
			</div>
			<div class="mt-4">
				<button id="backToProfileBtn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
					${t('backToProfile')}
				</button>
			</div>
		</div>
	`;

	const backBtn = document.getElementById("backToProfileBtn");
	backBtn?.addEventListener("click", backToProfile);
}


export async function render_friend_profile(params: URLSearchParams | null) {
	const id = params?.get("id");
	if (!id) return;

	await render_header();

	const user = await getUserForProfile(id);
	if ('error' in user) return;

	await renderProfile(user, Number(id), bodyContainer);
}

function renderReadonlyField(field: string, value: string | number) {
    const key = "profileLabel." + field;

    return `
        <div class="w-full">
            <label class="block text-sm font-medium text-gray-600 mb-1">${t(key)}</label>
            <input value="${value}" disabled
                class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700" />
        </div>`;
}
