var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { is_logged_in_api } from "../remote_storage/remote_storage.js";
import { initRouter, navigateTo } from "../view/history_views.js";
document.addEventListener("DOMContentLoaded", () => {
    initRouter();
    indexInit();
});
function indexInit() {
    return __awaiter(this, void 0, void 0, function* () {
        // Wenn Hash im URL schon eine View vorgibt, soll initRouter das gerendert haben.
        // Also hier nur noch entscheiden, falls keine View im Hash ist.
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            // Hash ist da, nix tun, View wurde bereits gerendert
            return;
        }
        // Ansonsten Login-Status prüfen und auf dashboard/login navigieren
        const loggedIn = yield is_logged_in_api();
        if (loggedIn) {
            navigateTo('dashboard');
        }
        else {
            navigateTo('login');
        }
    });
}
