import { is_logged_in_api } from "../remote_storage/remote_storage.js";
import { initRouter, navigateTo } from "../view/history_views.js";

document.addEventListener("DOMContentLoaded", () => {
	initRouter();
	indexInit();
})

async function indexInit() {

  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    return;
  }
  const loggedIn = await is_logged_in_api();
  if (loggedIn) {
    navigateTo('dashboard');
  } else {
    navigateTo('login');
  }
}
