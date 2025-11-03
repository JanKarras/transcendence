import { bodyContainer } from "../../constants/constants.js";
import { t } from "../../logic/global/initTranslations.js";

export async function renderLoginPages(params: URLSearchParams | null) {
	if (!bodyContainer) {
		console.error("Body container not found");
		return;
	}

	bodyContainer.innerHTML = `
		<div id="loginContainer" class="max-w-md p-6 bg-white rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-6 text-center text-gray-800">${t('loginTitle')}</h2>
			<form id="loginForm" class="space-y-4">
				<label class="block">
					<span class="text-gray-700">${t('loginUserField')}</span>
					<input id="usernameInput" type="text" name="user" required
						class="text-gray-900 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none" autofocus/>
				</label>
				<label class="block">
					<span class="text-gray-700">${t('loginPasswordField')}</span>
					<input type="password" name="password" required
						class="text-gray-900 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none" />
				</label>
				<button type="submit"
					class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
					${t('loginBtn')}
				</button>
			</form>
			<button id="registerBtn"
				class="mt-4 w-full text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none">
				${t('loginToRegisterBtn')}
			</button>
		</div>
	`;
}
