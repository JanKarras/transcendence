import { bodyContainer } from "../constants/constants.js";
import { LANGUAGE } from "../constants/gloabal.js";
import { lang, t } from "../constants/language_vars.js";
import { UserInfo } from "../constants/structs.js";
import { getUserForProfile, logOutApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { render_header } from "./render_header.js";

export async function render_friend_profile(params: URLSearchParams | null) {


	const id = params?.get("id");

	if (!id) {
		showErrorMessage(t(lang.no_id_msg, LANGUAGE));
		await logOutApi();
		render_with_delay("login");
		return;
	}

	render_header();

	if (!bodyContainer) {
		showErrorMessage(t(lang.missing_req_dom_elem, LANGUAGE));
		await logOutApi();
		render_with_delay("login");
		return;
	}

	const user = await getUserForProfile(id);

	if('error' in user) {
		showErrorMessage(t(lang.no_id_msg, LANGUAGE));
		await logOutApi();
		render_with_delay("login");
		return;
	}

	console.log(user);

		const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : './assets/img/default-user.png';

	bodyContainer.innerHTML = `
		<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<div id="profileView">
				<div class="flex flex-col items-center space-y-4">
					<img src="${safePath}" class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">

					${renderReadonlyField("username", user.username)}
					${renderReadonlyField("first_name", user.first_name || 'Unknown')}
					${renderReadonlyField("last_name", user.last_name || 'Unknown')}
					${renderReadonlyField("age", user.age !== null ? user.age : t(lang.profileAgeUnknown, LANGUAGE))}
					${renderReadonlyField("last_seen", user.last_seen || t(lang.profileLastSeenUnknown, LANGUAGE))}

					<div class="min-h-[40px] mt-4"> </div>
				</div>
			</div>
		</div>
	`;
}

function renderReadonlyField(field: string, value: string | number) {
	const key = "profileLabel_" + field;
	const translationObj = lang[key as keyof typeof lang];
	const label = translationObj ? t(translationObj, LANGUAGE) : field;

	return `
		<div class="w-full">
			<label class="block text-sm font-medium text-gray-600 mb-1">${label}</label>
			<input value="${value}" disabled
				class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700" />
		</div>`;
}
