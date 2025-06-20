import { bodyContainer } from "../constants/constants.js";
import { logIn } from "../login/login.js";
import { navigateTo } from "./history_views.js";
export function render_login() {
    if (!bodyContainer) {
        return;
    }
    bodyContainer.innerHTML = `
		<div id="loginContainer" class="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
			<form id="loginForm" class="space-y-4">
				<label class="block">
					<span class="text-gray-700">Username oder Email:</span>
					<input type="text" name="user" required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none" />
				</label>
				<label class="block">
					<span class="text-gray-700">Passwort:</span>
					<input type="password" name="password" required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none" />
				</label>
				<button type="submit"
					class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
					Einloggen
				</button>
			</form>
			<button id="registerBtn"
				class="mt-4 w-full text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none">
				Register
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
