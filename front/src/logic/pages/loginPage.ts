import { logInApi } from "../../api/logIn.js";
import { setEventListenersForLoginPage } from "../../events/pages/loginPage.js";
import { renderLoginPages } from "../../render/pages/renderLoginPage.js";
import { navigateTo } from "../../router/navigateTo.js";
import { initTranslations, t } from "../gloabal/initTranslations.js";
import { headerTemplate } from "../templates/headerTemplate.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popupMessage.js";

export async function loginPage(params: URLSearchParams | null) {
	window.location.hash = "#login";

	await initTranslations();

	await headerTemplate()

	await renderLoginPages(params);

	await setEventListenersForLoginPage();

	document.getElementById("usernameInput")?.focus();
}

export async function tryToLogIn(event: Event) {
	event.preventDefault();

	const form = event.target as HTMLFormElement;
	const username = (form.elements.namedItem("user") as HTMLInputElement).value;
	const password = (form.elements.namedItem("password") as HTMLInputElement).value;
	const res = await logInApi(username, password);

	await initTranslations();
	if (res.success) {
	if (res.requires2fa) {
		if (res.method === 'email') {
			showSuccessMessage(t('loginSuccess'));
			const params = new URLSearchParams({ email: username, method: 'email' });
			setTimeout(() => {
				navigateTo('two_fa', params);
			}, 1500);
		} else if (res.method === 'authapp') {
			showErrorMessage(t('loginSuccess'));
			const params = new URLSearchParams({ email: username, method: 'authapp' });
			setTimeout(() => {
				navigateTo('two_fa', params);
			}, 1500);
		}
	} else {
		showSuccessMessage(t('loginSuccess').replace("{username}", username));
		setTimeout(() => {
		navigateTo('dashboard');
		}, 1500);
	}
	} else {
		console.error('Login failed:', res.error);
		showErrorMessage(t('loginFailed').replace("{error}", res.error));
	}
}
