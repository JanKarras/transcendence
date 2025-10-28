import { registerUser } from "../../logic/pages/registerPage.js";
import { navigateTo } from "../../router/navigateTo.js";

export function setEventListenersForRegisterPage() {
	const backToLoginBtn = document.getElementById("backToLoginBtn");

	if (backToLoginBtn) {
		backToLoginBtn.addEventListener("click", () => {
			navigateTo("login");
		});
	}

	const registerForm = document.getElementById("registerForm");

	if (registerForm) {
		registerForm.addEventListener("submit", (event) => {
			registerUser(event);
		});
	}
}
