import { getUser } from "../../api/getUser.js";
import { initTranslations } from "../global/initTranslations.js";
import { renderHeader } from "../../render/templates/renderHeaderTemplate.js";

export function getPos() {
	const windowHash = window.location.hash.replace(/^#/, '');
	const pos = windowHash.split('?')[0];
	return pos;
}

export async function headerTemplate() {
	const pos = getPos();

	const userData = await getUser();

	await initTranslations();

	await renderHeader(pos, userData)
}
