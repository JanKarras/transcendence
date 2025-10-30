import { getMatchHistory } from "../../api/getMatchHistory.js";
import { getStats } from "../../api/getStats.js";
import { getUser } from "../../api/getUser.js";
import { UserInfo } from "../../constants/structs.js";
import { setEventListenersDashboardPage } from "../../events/pages/dashboardPage.js";
import { renderDashboard } from "../../render/pages/renderDashboard.js";
import { initTranslations } from "../gloabal/initTranslations.js";
import { logOut } from "../gloabal/logOut.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export async function dashboarPage(params: URLSearchParams | null) {
	window.location.hash = "#dashboard";
	await headerTemplate();

	await initTranslations();

	const userData = await getUser();

	if (!userData) {
		logOut("Error while fetching user. Try again later");
		return;
	}

	const user : UserInfo = userData.user;

	const matchesFromHistory = await getMatchHistory(user.id);

	const stats = await getStats(user.id);

	await renderDashboard(params, stats, matchesFromHistory);

	await setEventListenersDashboardPage();
}
