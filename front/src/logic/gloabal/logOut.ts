import { logOutApi } from "../../api/logOut.js";
import { showErrorMessage } from "../../templates/popup_message.js";
import { renderWithDelay } from "./renderWithDelay.js";

export function logOut(msg : string) {
	showErrorMessage(msg);
	logOutApi()
	renderWithDelay('login')
}
