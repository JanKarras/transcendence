import { bodyContainer } from "../constants/constants.js";
import { render_header } from "./render_header.js";

export async function render_chat(params: URLSearchParams | null) {
	if (!bodyContainer) {
			console.error("bodyContainer Container missing")
			return;
	}

	render_header();

	bodyContainer.innerHTML = 'chat'
}
