import { logOutApi } from "../../api/logOut.js";
import { showErrorMessage } from "../templates/popupMessage.js";
import { renderWithDelay } from "./renderWithDelay.js";

export function logOut(msg : string) {
	showErrorMessage(msg);
	logOutApi()
	renderWithDelay('login')
}
