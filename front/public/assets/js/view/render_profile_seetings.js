import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { createTwoFaApp, getMatchHistory, getUser, logOutApi, saveProfileChanges } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { render_header } from "./render_header.js";
import { t } from "../constants/i18n.js";
export async function render_profile_settings(params) {
    if (!bodyContainer || !profile || !headernavs || !profileContainer || !profileImg || !friendsBtn || !friendsNumber) {
        console.error("Missing required DOM elements");
        return;
    }
    await render_header();
    const userData = await getUser();
    console.log(userData);
    if (!userData) {
        showErrorMessage(t('profileDbError'));
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
				${renderReadonlyField("firstName", user.first_name || t('unknown'))}
				${renderReadonlyField("lastName", user.last_name || t('unknown'))}
				${renderReadonlyField("age", user.age !== null ? user.age : t('profileAgeUnknown'))}

				<div class="min-h-[40px] mt-4"> </div>
			</div>
		</div>

		<div class="flex space-x-4 mt-4" id="matchHistoryContainer">
			<button id="matchhis" class="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
				${t('matchHis')}
			</button>
			<button id="twofaSettingsBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
				${t('twofaSettings')}
			</button>
		</div>

		<div id="profileEdit" class="hidden">
			<form id="editProfileForm" class="flex flex-col items-center space-y-4">
				<label for="fileInput" class="cursor-pointer relative group">
					<img id="profileImagePreview" src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
					<div class="absolute inset-0 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
						${t('profileChangePhoto')}
					</div>
				</label>
				<input type="file" name="profileImage" id="fileInput" accept="image/*" class="hidden">

				${renderEditableField("username", user.username)}
				${renderEditableField("firstName", user.first_name || "")}
				${renderEditableField("lastName", user.last_name || "")}
				${renderEditableField("age", user.age || "", "number")}

				<div class="flex space-x-4 mt-4">
					<button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
						${t('profileSaveBtn')}
					</button>
					<button type="button" id="cancelBtn" class="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
						${t('profileCancelBtn')}
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
    const twofaSettingsBtn = document.getElementById("twofaSettingsBtn");
    twofaSettingsBtn?.addEventListener("click", () => {
        renderTwoFASettings(user, () => render_profile_settings(null));
    });
    editBtn?.addEventListener("click", () => {
        view?.classList.add("hidden");
        edit?.classList.remove("hidden");
        editBtn?.classList.add("hidden");
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
        const matches = await getMatchHistory(user.id);
        renderMatchHistorySettings(matches || [], () => {
            render_profile_settings(null);
        });
    });
}
export function renderTwoFASettings(user, backToProfile) {
    if (!bodyContainer)
        return;
    const active = !!user.twofa_active;
    const method = user.twofa_method || 'email';
    bodyContainer.innerHTML = `
	<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
		<h2 class="text-2xl font-semibold mb-6 text-center">${t('twofaTitle')}</h2>

		<!-- 2FA Aktivierung -->
		<div class="flex items-center justify-between mb-6">
			<span class="text-gray-700 font-medium">${t('twofaEnable')}</span>
			<label class="relative inline-flex items-center cursor-pointer select-none">
				<input type="checkbox" id="toggle2FA" class="sr-only peer" ${active ? 'checked' : ''}>
				<div class="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all duration-300"></div>
				<div class="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 peer-checked:translate-x-7"></div>
			</label>
		</div>

		<!-- Methoden Auswahl -->
		<div id="twofaMethods" class="transition-all duration-300 ${active ? '' : 'opacity-50 pointer-events-none'}">
			<p class="text-gray-600 mb-3">${t('twofaSelectMethod')}</p>
			<div class="flex flex-col space-y-3">
				<label id="methodEmailLabel" class="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
					<input type="radio" name="twofaMethod" value="email" ${method === 'email' ? 'checked' : ''} class="w-4 h-4 accent-indigo-600">
					<span class="emailText text-gray-800 font-medium">${t('twofaEmail')}</span>
				</label>

				<label id="methodAppLabel" class="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
					<input type="radio" name="twofaMethod" value="authapp" ${method === 'authapp' ? 'checked' : ''} class="w-4 h-4 accent-indigo-600">
					<span class="appText text-gray-800 font-medium">${t('twofaAuthApp')}</span>
				</label>
			</div>
		</div>

		<!-- QR-Code Container -->
		<div id="authAppQRContainer" class="mt-4 hidden text-center">
			<p class="text-gray-600 mb-2">${t('twofaScanQR')}</p>
			<img id="authAppQR" src="" class="mx-auto w-48 h-48 border rounded" />
		</div>

		<!-- Buttons -->
		<div class="flex justify-between space-x-4 mt-8">
			<button id="saveTwoFA" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
				${t('save')}
			</button>
			<button id="cancelTwoFA" class="flex-1 px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition">
				${t('cancel')}
			</button>
		</div>
	</div>
	`;
    // --- Event Handler ---
    const toggle = document.getElementById('toggle2FA');
    const methods = document.getElementById('twofaMethods');
    const emailInput = document.querySelector('input[value="email"]');
    const appInput = document.querySelector('input[value="authapp"]');
    const emailLabelText = document.querySelector('#methodEmailLabel .emailText');
    const appLabelText = document.querySelector('#methodAppLabel .appText');
    const qrContainer = document.getElementById('authAppQRContainer');
    const qrImg = document.getElementById('authAppQR');
    const saveBtn = document.getElementById('saveTwoFA');
    const cancelBtn = document.getElementById('cancelTwoFA');
    // Styles aktualisieren + QR-Code Handling
    async function updateMethodStyles() {
        const selected = document.querySelector('input[name="twofaMethod"]:checked')?.value;
        if (selected === 'email') {
            if (emailLabelText)
                emailLabelText.classList.remove('opacity-50');
            if (appLabelText)
                appLabelText.classList.add('opacity-50');
            // QR-Code verstecken
            if (qrContainer)
                qrContainer.classList.add('hidden');
        }
        else if (selected === 'authapp') {
            if (appLabelText)
                appLabelText.classList.remove('opacity-50');
            if (emailLabelText)
                emailLabelText.classList.add('opacity-50');
            // QR-Code anfordern
            if (qrContainer && qrImg) {
                qrContainer.classList.remove('hidden');
                qrImg.src = ''; // clear vorherigen QR
                const res = await createTwoFaApp();
                if (res.success && res.qrCodeDataUrl) {
                    qrImg.src = res.qrCodeDataUrl;
                }
                else {
                    console.error('QR-Code konnte nicht geladen werden', res.error);
                }
            }
        }
    }
    // --- Events ---
    toggle?.addEventListener('change', () => {
        if (toggle.checked) {
            methods?.classList.remove('opacity-50', 'pointer-events-none');
            if (emailInput)
                emailInput.checked = true;
        }
        else {
            methods?.classList.add('opacity-50', 'pointer-events-none');
            if (qrContainer)
                qrContainer.classList.add('hidden'); // QR bei Deaktivierung ausblenden
        }
        updateMethodStyles();
    });
    emailInput?.addEventListener('change', updateMethodStyles);
    appInput?.addEventListener('change', updateMethodStyles);
    // Initial
    updateMethodStyles();
    // Speichern
    saveBtn?.addEventListener('click', async () => {
        const isActive = toggle?.checked ?? false;
        const selected = document.querySelector('input[name="twofaMethod"]:checked')?.value || 'email';
        const formData = new FormData();
        formData.append('twofa_active', isActive ? '1' : '0');
        formData.append('twofa_method', isActive ? selected : '');
        const res = await saveProfileChanges(formData);
        if (res.success) {
            render_profile_settings(null);
        }
        else {
            showErrorMessage(res.error || t('twofaSaveError'));
        }
    });
    cancelBtn?.addEventListener('click', backToProfile);
}
function renderReadonlyField(field, value) {
    const key = "profileLabel." + field;
    // const translationObj = lang[key as keyof typeof lang] as Trans | undefined;
    const label = t(key) !== key ? t(key) : field;
    return `
	<div class="w-full">
	  <label class="block text-sm font-medium text-gray-600 mb-1">${label}</label>
	  <input value="${value}" disabled
		class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700" />
	</div>`;
    // const key = "profileLabel." + field;
}
function renderEditableField(field, value, type = "text") {
    const key = "profileLabel." + field;
    // const translationObj = lang[key as keyof typeof lang] as Trans | undefined;
    const label = t(key) !== '' ? t(key) : field;
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
            case "1v1_local": return t('matchType1v1Local');
            case "1v1_remote": return t('matchType1v1Remote');
            case "tournament": return t('matchTypeTournament');
            default: return type;
        }
    };
    bodyContainer.innerHTML = `
		<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<h2 class="text-xl font-semibold mb-4">${t('matchHistoryTitle')}</h2>
			<div class="space-y-4 overflow-y-auto max-h-[600px]">
				${matches.map(match => `
					<div class="border p-3 rounded bg-gray-50">
						<p class="font-medium">
							<strong>${formatMatchType(match.match_type)}</strong>
							${match.tournament_name ? `- ${match.tournament_name} (${t('round')} ${match.round})` : ''}
						</p>
						<p class="text-sm text-gray-600 mb-2">${match.match_date}</p>
						<ul class="pl-4 list-disc">
							${match.players.map((p) => `
								<li>${p.username} - ${t('score')}: ${p.score} ${p.rank === 1 ? t('trophy') : ''}</li>
							`).join('')}
						</ul>
					</div>
				`).join('')}
			</div>
			<div class="mt-4">
				<button id="backToProfileBtn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
					${t('backToProfile')}
				</button>
			</div>
		</div>
	`;
    document.getElementById("backToProfileBtn")?.addEventListener("click", backToProfile);
}
