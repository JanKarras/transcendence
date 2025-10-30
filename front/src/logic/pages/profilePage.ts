import { renderProfile } from "../../render/pages/renderProfilePage.js";
import { initTranslations } from "../gloabal/initTranslations.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export async function profilePage(params: URLSearchParams | null) {
	await headerTemplate();

	await initTranslations();

	await renderProfile(params);
}
