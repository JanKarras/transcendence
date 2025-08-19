import { bodyContainer, friendsBtn, friendsNumber, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { getUser, logOutApi, saveProfileChanges } from "../remote_storage/remote_storage.js";
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

					<div class="min-h-[40px] mt-4"> </div>
				</div>
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
    editBtn?.addEventListener("click", () => {
        view?.classList.add("hidden");
        edit?.classList.remove("hidden");
        editBtn.classList.add("hidden");
    });
    cancelBtn?.addEventListener("click", () => {
        edit?.classList.add("hidden");
        view?.classList.remove("hidden");
        editBtn?.classList.remove("hidden");
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
