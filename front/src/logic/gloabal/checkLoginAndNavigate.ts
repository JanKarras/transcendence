import { is_logged_in_api } from "../../api/isLoggedIn.js";
import { navigateTo } from "../../router/navigateTo.js";

export async function checkLoginAndNavigate() {
	const hash = window.location.hash;
	if (hash && hash.length > 1) return;

	const loggedIn = await is_logged_in_api();
	navigateTo(loggedIn ? "dashboard" : "login");
}
