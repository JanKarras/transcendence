import { getUser } from "../../api/getUser.js";
import { initTranslations } from "../global/initTranslations.js";
import { pagesWithHiddenHeader, renderHeader } from "../../render/templates/renderHeaderTemplate.js";
import { UserResponse } from "../../constants/structs.js";

export function getPos() {
	const windowHash = window.location.hash.replace(/^#/, '');
	const pos = windowHash.split('?')[0];
	return pos;
}

export async function headerTemplate() {
	const pos = getPos();
	let userData: UserResponse | false = false;
	if (!pagesWithHiddenHeader.includes(pos)) {
		userData = await getUser();
	}

	await initTranslations();

	await renderHeader(pos, userData)
}
