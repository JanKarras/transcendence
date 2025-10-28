import { checkLoginAndNavigate } from "../logic/gloabal/checkLoginAndNavigate.js";
import { initRouter } from "../router/initRouter.js";

document.addEventListener("DOMContentLoaded", () => {
	initRouter();
	checkLoginAndNavigate()
	//indexInit();
})

// async function indexInit() {

// 	const hash = window.location.hash;
// 	if (hash && hash.length > 1) {
// 		return;
// 	}
// 	const loggedIn = await is_logged_in_api();
// 	if (loggedIn) {
// 		navigateTo('dashboard');
// 	} else {
// 		navigateTo('login');
// 	}
// }
