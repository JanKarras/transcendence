import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { getMatchHistory, getUser, logOutApi, saveProfileChanges } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { LANGUAGE } from "../constants/gloabal.js";
import { lang, t } from "../constants/language_vars.js";
import { render_header } from "./render_header.js";
export async function render_profile_settings(params) {
    if (!bodyContainer || !profile || !headernavs || !profileContainer || !profileImg || !friendsBtn || !friendsNumber) {
        console.error("Missing required DOM elements");
        return;
    }
    render_header();
    const userData = await getUser();
    console.log(userData);
    if (!userData) {
        showErrorMessage(t(lang.profileDbError, LANGUAGE));
        await logOutApi();
        render_with_delay("login");
        return;
    }
    const user = userData.user;
    const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : './assets/img/default-user.png';
    bodyContainer.innerHTML = `
		<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<button id="editBtn" class="absolute top-4 right-6 text-gray-500 hover:text-black transition transform hover:scale-125">✏️</button>

			<div id="profileView">
				<div class="flex flex-col items-center space-y-4">
					<label class="relative group">
						<img src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
					</label>

					${renderReadonlyField("username", user.username)}
					${renderReadonlyField("first_name", user.first_name || 'Unknown')}
					${renderReadonlyField("last_name", user.last_name || 'Unknown')}
					${renderReadonlyField("age", user.age !== null ? user.age : t(lang.profileAgeUnknown, LANGUAGE))}
					${renderReadonlyField(t(lang.twofaEmail, LANGUAGE), user.twofa_active ? t(lang.active, LANGUAGE) : t(lang.inactive, LANGUAGE))}

					<div class="min-h-[40px] mt-4"> </div>
				</div>
			</div>
			<div class="flex space-x-4 mt-4" id="matchHistoryContainer">
				<button id="matchhis" class="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
					${t(lang.matchHis, LANGUAGE)}
				</button>
			</div>
			<div id="profileEdit" class="hidden">
				<form id="editProfileForm" class="flex flex-col items-center space-y-4">
					<label for="fileInput" class="cursor-pointer relative group">
						<img id="profileImagePreview" src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
						<div class="absolute inset-0 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
							${t(lang.profileChangePhoto, LANGUAGE)}
						</div>
					</label>
					<input type="file" name="profileImage" id="fileInput" accept="image/*" class="hidden">

					${renderEditableField("username", user.username)}
					${renderEditableField("first_name", user.first_name || "")}
					${renderEditableField("last_name", user.last_name || "")}
					${renderEditableField("age", user.age || "", "number")}
					<div class="w-full">
					<label class="block text-sm font-medium text-gray-600 mb-1">${t(lang.twofaEmail, LANGUAGE)}</label>
						<button
							type="button"
							id="toggle2FA"
							data-active="${user.twofa_active ? 1 : 0}"
							class="w-full px-4 py-3 border rounded-md transition
									${user.twofa_active
        ? 'bg-green-500 text-white hover:bg-green-600'
        : 'bg-red-500 text-white hover:bg-red-600'}">
							${user.twofa_active ? t(lang.deactivate, LANGUAGE) : t(lang.activate, LANGUAGE)}
						</button>
						<input type="hidden" name="twofa_active" id="twofaInput" value="${user.twofa_active ? 1 : 0}" />
					<div>
					<div class="flex space-x-4 mt-4">
						<button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
							${t(lang.profileSaveBtn, LANGUAGE)}
						</button>
						<button type="button" id="cancelBtn" class="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
							${t(lang.profileCancelBtn, LANGUAGE)}
						</button>
					</div>
				</form>
			</div>
		</div>
	`;
    const editBtn = document.getElementById("editBtn");
    const view = document.getElementById("profileView");
    const edit = document.getElementById("profileEdit");
    const cancelBtn = document.getElementById("cancelBtn");
    const form = document.getElementById("editProfileForm");
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("profileImagePreview");
    const matchhis = document.getElementById("matchhis");
    const matchContainer = document.getElementById("matchHistoryContainer");
    editBtn?.addEventListener("click", () => {
        view?.classList.add("hidden");
        edit?.classList.remove("hidden");
        editBtn.classList.add("hidden");
        matchContainer?.classList.add("hidden");
    });
    cancelBtn?.addEventListener("click", () => {
        edit?.classList.add("hidden");
        view?.classList.remove("hidden");
        editBtn?.classList.remove("hidden");
        matchContainer?.classList.remove("hidden");
    });
    fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                preview.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const res = await saveProfileChanges(formData);
        if (res.success) {
            render_profile_settings(null);
        }
        else {
            showErrorMessage(res.error);
        }
    });
    matchhis?.addEventListener("click", async () => {
        const matches = await getMatchHistory(1);
        renderMatchHistorySettings(matches || [], () => {
            render_profile_settings(null);
        });
    });
    const toggle2FA = document.getElementById("toggle2FA");
    const twofaInput = document.getElementById("twofaInput");
    toggle2FA?.addEventListener("click", () => {
        const active = toggle2FA.getAttribute("data-active") === "1";
        if (active) {
            toggle2FA.setAttribute("data-active", "0");
            toggle2FA.textContent = "Aktivieren";
            toggle2FA.className = "w-full px-4 py-3 border rounded-md transition bg-red-500 text-white hover:bg-red-600";
            if (twofaInput) {
                twofaInput.value = "0";
            }
        }
        else {
            toggle2FA.setAttribute("data-active", "1");
            toggle2FA.textContent = "Deaktivieren";
            toggle2FA.className = "w-full px-4 py-3 border rounded-md transition bg-green-500 text-white hover:bg-green-600";
            if (twofaInput) {
                twofaInput.value = "1";
            }
        }
    });
}
function renderReadonlyField(field, value) {
    const key = "profileLabel_" + field;
    const translationObj = lang[key];
    const label = translationObj ? t(translationObj, LANGUAGE) : field;
    return `
	<div class="w-full">
	  <label class="block text-sm font-medium text-gray-600 mb-1">${label}</label>
	  <input value="${value}" disabled
		class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700" />
	</div>`;
}
function renderEditableField(field, value, type = "text") {
    const key = "profileLabel_" + field;
    const translationObj = lang[key];
    const label = translationObj ? t(translationObj, LANGUAGE) : field;
    return `
	<div class="w-full">
	  <label class="block text-sm font-medium text-gray-600 mb-1">${label}</label>
	  <input name="${field}" placeholder="${label}" value="${value}" type="${type}"
		class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 transition hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
	</div>`;
}
function renderMatchHistorySettings(matches, backToProfile) {
    if (!bodyContainer)
        return;
    const formatMatchType = (type) => {
        switch (type) {
            case "1v1_local": return t(lang.matchType1v1Local, LANGUAGE);
            case "1v1_remote": return t(lang.matchType1v1Remote, LANGUAGE);
            case "tournament": return t(lang.matchTypeTournament, LANGUAGE);
            default: return type;
        }
    };
    bodyContainer.innerHTML = `
		<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<h2 class="text-xl font-semibold mb-4">${t(lang.matchHistoryTitle, LANGUAGE)}</h2>
			<div class="space-y-4 overflow-y-auto max-h-[600px]">
				${matches.map(match => `
					<div class="border p-3 rounded bg-gray-50">
						<p class="font-medium">
							<strong>${formatMatchType(match.match_type)}</strong>
							${match.tournament_name ? `- ${match.tournament_name} (${t(lang.round, LANGUAGE)} ${match.round})` : ''}
						</p>
						<p class="text-sm text-gray-600 mb-2">${match.match_date}</p>
						<ul class="pl-4 list-disc">
							${match.players.map((p) => `
								<li>${p.username} - ${t(lang.score, LANGUAGE)}: ${p.score} ${p.rank === 1 ? t(lang.trophy, LANGUAGE) : ''}</li>
							`).join('')}
						</ul>
					</div>
				`).join('')}
			</div>
			<div class="mt-4">
				<button id="backToProfileBtn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
					${t(lang.backToProfile, LANGUAGE)}
				</button>
			</div>
		</div>
	`;
    document.getElementById("backToProfileBtn")?.addEventListener("click", backToProfile);
}
