import { renderProfile } from "../../render/pages/renderProfilePage.js";
import { initTranslations } from "../global/initTranslations.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export async function profilePage(params: URLSearchParams | null) {
	await headerTemplate();

	await initTranslations();

	await renderProfile(params);
}
