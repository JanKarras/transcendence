import { getUser } from "../../api/getUser.js";
import { bodyContainer } from "../../constants/constants.js";
import { UserInfo } from "../../constants/structs.js";
import { setEventListenerProfilePage, setEventListenerTwoFaSettings } from "../../events/pages/profilePage.js";
import { t } from "../../logic/gloabal/initTranslations.js";

export async function renderProfile(params: URLSearchParams | null) {
	if (!bodyContainer) return;

	const userData = await getUser();
	if (!userData) {
		return;
	}
	const user = userData.user;
	const safePath = user.path
		? `/api/get/getImage?filename=${encodeURIComponent(user.path)}`
		: `/api/get/getImage?filename=${encodeURIComponent("std_user_img.png")}`;

	bodyContainer.innerHTML = `
	<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
		<button id="editBtn" class="absolute top-4 right-6 text-gray-500 hover:text-black transition transform hover:scale-125">✏️</button>

		<div id="profileView">
			<div class="flex flex-col items-center space-y-4">
				<label class="relative group">
					<img src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
				</label>

				${renderReadonlyField("username", user.username)}
				${renderReadonlyField("firstName", user.first_name || t("unknown"))}
				${renderReadonlyField("lastName", user.last_name || t("unknown"))}
				${renderReadonlyField("age", user.age !== null ? user.age : t("profileAgeUnknown"))}

				<div class="min-h-[40px] mt-4"></div>
			</div>
		</div>

		<div class="flex space-x-4 mt-4" id="matchHistoryContainer">
			<button id="twofaSettingsBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
				${t("twofaSettings")}
			</button>
		</div>

		<div id="profileEdit" class="hidden">
			<form id="editProfileForm" class="flex flex-col items-center space-y-4">
				<label for="fileInput" class="cursor-pointer relative group">
					<img id="profileImagePreview" src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
					<div class="absolute inset-0 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
						${t("profileChangePhoto")}
					</div>
				</label>
				<input type="file" name="profileImage" id="fileInput" accept="image/*" class="hidden">

				${renderEditableField("username", user.username)}
				${renderEditableField("firstName", user.first_name || "")}
				${renderEditableField("lastName", user.last_name || "")}
				${renderEditableField("age", user.age || "", "number")}

				<div class="flex space-x-4 mt-4">
					<button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
						${t("profileSaveBtn")}
					</button>
					<button type="button" id="cancelBtn" class="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
						${t("profileCancelBtn")}
					</button>
				</div>
			</form>
		</div>
	</div>
	`;

	await setEventListenerProfilePage(user);
}


function renderEditableField(field: string, value: string | number, type = "text") {
	const backendFieldMap: Record<string, string> = {
		username: "username",
		firstName: "first_name",
		lastName: "last_name",
		age: "age"
	};

	const backendName = backendFieldMap[field] || field;
	const label = t("profileLabel." + field) || field;

	const isUsername = field === "username";
	const disabledAttr = isUsername ? "disabled" : "";

	const isAge = field === "age";
	const extraAttrs = isAge ? 'min="0" max="99"' : "";

	const extraClasses = isUsername
		? "bg-gray-200 text-gray-500 cursor-not-allowed"
		: "bg-gray-100 text-gray-700 transition hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";

	return `
	<div class="w-full">
		<label class="block text-sm font-medium text-gray-600 mb-1">${label}</label>
		<input name="${backendName}" placeholder="${label}" value="${value}" type="${type}" ${disabledAttr} ${extraAttrs}
			class="w-full px-4 py-3 border border-gray-300 rounded-md ${extraClasses}" />
	</div>`;
}

function renderReadonlyField(field: string, value: string | number) {
	const key = "profileLabel." + field;
	const label = t(key) !== key ? t(key) : field;

	return `
		<div class="w-full">
			<label class="block text-sm font-medium text-gray-600 mb-1">${label}</label>
			<input value="${value}" disabled
				class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700" />
		</div>`;

}

export function renderTwoFaSettings(user: UserInfo, backToProfile: () => void) : void {
	if (!bodyContainer) return;

	const active = !!user.twofa_active;
	const method = user.twofa_method || "email";

	bodyContainer.innerHTML = `
	<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
		<h2 class="text-2xl font-semibold mb-6 text-center">${t("twofaTitle")}</h2>

		<div class="flex items-center justify-between mb-6">
			<span class="text-gray-700 font-medium">${t("twofaEnable")}</span>
			<label class="relative inline-flex items-center cursor-pointer select-none">
				<input type="checkbox" id="toggle2FA" class="sr-only peer" ${active ? "checked" : ""}>
				<div class="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all duration-300"></div>
				<div class="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 peer-checked:translate-x-7"></div>
			</label>
		</div>

		<div id="twofaMethods" class="transition-all duration-300 ${active ? "" : "opacity-50 pointer-events-none"}">
			<p class="text-gray-600 mb-3">${t("twofaSelectMethod")}</p>
			<div class="flex flex-col space-y-3">
				<label id="methodEmailLabel" class="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
					<input type="radio" name="twofaMethod" value="email" ${method === "email" ? "checked" : ""} class="w-4 h-4 accent-indigo-600">
					<span class="emailText text-gray-800 font-medium">${t("twofaEmail")}</span>
				</label>
				<label id="methodAppLabel" class="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
					<input type="radio" name="twofaMethod" value="authapp" ${method === "authapp" ? "checked" : ""} class="w-4 h-4 accent-indigo-600">
					<span class="appText text-gray-800 font-medium">${t("twofaAuthApp")}</span>
				</label>
			</div>
		</div>

		<div id="authAppQRContainer" class="mt-4 hidden text-center">
			<p class="text-gray-600 mb-2">${t("twofaScanQR")}</p>
			<img id="authAppQR" src="" class="mx-auto w-48 h-48 border rounded" />
			<div class="mt-2 flex flex-col items-center space-y-2">
				<input id="twoFaCodeInput" type="text" maxlength="6" placeholder="Enter 6-digit code"
					class="text-center border border-gray-300 rounded px-3 py-2 w-40 tracking-widest text-lg" />
				<button id="verifyTwoFaCodeBtn" class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600">
					${t("verify")}
				</button>
				<p id="twoFaVerifyMessage" class="text-sm text-gray-600 mt-1"></p>
			</div>
		</div>

		<div class="flex justify-between space-x-4 mt-8">
			<button id="saveTwoFA" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
				${t("save")}
			</button>
			<button id="cancelTwoFA" class="flex-1 px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition">
				${t("cancel")}
			</button>
		</div>
	</div>
	`;
	setEventListenerTwoFaSettings(async () => {
		await renderProfile(null);
	});
}
