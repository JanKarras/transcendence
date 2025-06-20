import { is_logged_in_api } from "../remote_storage/remote_storage.js";
import { initRouter, navigateTo } from "../view/history_views.js";

document.addEventListener("DOMContentLoaded", () => {
	initRouter();
	indexInit();
})

async function indexInit() {
	const flag = await is_logged_in_api();
	if (flag) {
		navigateTo("dashboard");
	} else {
		navigateTo("login")
	}
}
