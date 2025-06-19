import { bodyContainer } from "../constants/constants.js";

export async function render_dashboard() {
	if (!bodyContainer) {
		return;
	}
	bodyContainer.innerHTML = 'Dash';
}
