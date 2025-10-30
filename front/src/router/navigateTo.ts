import { is_logged_in_api } from "../api/isLoggedIn.js";
import { initTranslations } from "../constants/i18n.js";
import { t } from "../logic/gloabal/initTranslations.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { getDashboardSocket } from "../websocket/wsDashboardServce.js";
import { getFriendSocket } from "../websocket/wsFriendsService.js";
import { getSocket } from "../websocket/wsService.js";
import { getTournamentSocket } from "../websocket/wsTournamentService.js";
import { protectedViews, View } from "./routerStore.js";
import { renderView } from "./routerUtils.js";

export async function navigateTo(view: View, params: URLSearchParams | null = null) {
	if (view !== "game" && view !== "matchmaking") {
		const socket = getSocket();
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.close(1000, "Navigated away from game");
		}
	}
	if (view !== "tournament" && view !== "remote_tournament_game") {
		const tournamentSocket = getTournamentSocket();
		if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
			tournamentSocket.close(1000, "Navigated away from tournament");
		}
	}
	if (view !== "friends") {
		const friendSocket = getFriendSocket();
		if (friendSocket && friendSocket.readyState === WebSocket.OPEN) {
			friendSocket.close(1000, "Navigated away from friends");
		}
	}

	if (view !== 'dashboard') {
		const dashboardSocket = getDashboardSocket();
		if (dashboardSocket && dashboardSocket.readyState === WebSocket.OPEN) {
			dashboardSocket.close(1000, "Navigated away from Dashboard");
		}
	}

	await initTranslations();
	if (protectedViews.includes(view)) {
	const isLoggedIn = await is_logged_in_api();
	if (!isLoggedIn) {
		showErrorMessage(t('loginRequired'));
			history.pushState({ view: 'login', paramString: '' }, '', `#login`);
			return;
		}
	}

	renderView(view, params);
	const paramString = params ? `?${params.toString()}` : '';

	history.pushState({ view, paramString }, '', `#${view}${paramString}`);
}
