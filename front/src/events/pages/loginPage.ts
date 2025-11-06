import { tryToLogIn } from "../../logic/pages/loginPage.js";
import { navigateTo } from "../../router/navigateTo.js";

export async function setEventListenersForLoginPage() {
	const regBtn = document.getElementById("registerBtn");
	if (regBtn) {
		regBtn.addEventListener("click", () => {
			navigateTo("register");
		});
	}

	const submit = document.getElementById("loginForm");
	if (submit) {
		submit.removeEventListener("submit", tryToLogIn)
		submit.addEventListener("submit", tryToLogIn);
	}
}
