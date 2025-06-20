import { is_logged_in_api } from "../remote_storage/remote_storage.js";
import { initRouter, navigateTo } from "../view/history_views.js";

document.addEventListener("DOMContentLoaded", () => {
	initRouter();
	indexInit();
})

async function indexInit() {
  // Wenn Hash im URL schon eine View vorgibt, soll initRouter das gerendert haben.
  // Also hier nur noch entscheiden, falls keine View im Hash ist.

  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    // Hash ist da, nix tun, View wurde bereits gerendert
    return;
  }

  // Ansonsten Login-Status prüfen und auf dashboard/login navigieren
  const loggedIn = await is_logged_in_api();
  if (loggedIn) {
    navigateTo('dashboard');
  } else {
    navigateTo('login');
  }
}
