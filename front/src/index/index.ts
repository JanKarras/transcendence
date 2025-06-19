import { is_logged_in_api } from "../remote_storage/remote_storage.js";
import { render_dashboard } from "../view/render_dashboard.js";
import { render_login } from "../view/render_login.js";

document.addEventListener("DOMContentLoaded", () => {
	indexInit();
})

async function indexInit() {
	const flag = await is_logged_in_api();
	if (flag) {
		render_dashboard();
	} else {
		render_login();
	}
}
