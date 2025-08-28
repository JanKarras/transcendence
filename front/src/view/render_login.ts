import { bodyContainer, headernavs } from "../constants/constants.js";
import { logIn } from "../login/login.js";
import { navigateTo } from "./history_views.js";
import { LANGUAGE } from "../constants/gloabal.js";
import { lang, t } from "../constants/language_vars.js";
import { render_header } from "./render_header.js";

export function render_login(params: URLSearchParams | null) {
	if (!bodyContainer || !headernavs) return;

	render_header()

	bodyContainer.innerHTML = `
		<div id="loginContainer" class="max-w-md p-6 bg-white rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-6 text-center text-gray-800">${t(lang.loginTitle, LANGUAGE)}</h2>
			<form id="loginForm" class="space-y-4">
				<label class="block">
					<span class="text-gray-700">${t(lang.loginUserField, LANGUAGE)}</span>
					<input type="text" name="user" required
						class="text-gray-900 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none" />
				</label>
				<label class="block">
					<span class="text-gray-700">${t(lang.loginPasswordField, LANGUAGE)}</span>
					<input type="password" name="password" required
						class="text-gray-900 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none" />
				</label>
				<button type="submit"
					class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
					${t(lang.loginBtn, LANGUAGE)}
				</button>
			</form>
			<button id="registerBtn"
				class="mt-4 w-full text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none">
				${t(lang.loginToRegisterBtn, LANGUAGE)}
			</button>
		</div>
	`;
	const regBtn = document.getElementById("registerBtn");
	if (regBtn) {
		regBtn.addEventListener("click", () => {
			navigateTo("register");
		});
	}

	const submit = document.getElementById("loginForm");
	if (submit) {
		submit.addEventListener("submit", (event) => {
			logIn(event);
		});
	}
}
