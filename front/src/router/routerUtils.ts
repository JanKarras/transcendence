import { getChatSocket } from "../websocket/wsChatService.js";
import { getDashboardSocket } from "../websocket/wsDashboardServce.js";
import { getFriendSocket } from "../websocket/wsFriendsService.js";
import { getGameSocket } from "../websocket/wsGameService.js";
import { getTournamentSocket } from "../websocket/wsTournamentService.js";
import { currentParams, currentView, renderers, setCurrentParams, setCurrentView, View } from "./routerStore.js";

export function reRenderCurrentView() {
	if (currentView) {
		renderView(currentView, currentParams);
	}
}

export function renderView(view: View, params: URLSearchParams | null = null) {
	const renderer = renderers[view];
	if (view !== "game" && view !== "matchmaking") {
		const socket = getGameSocket();
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
	if (view != "dashboard") {
		const dashboardSocket = getDashboardSocket();
		if (dashboardSocket && dashboardSocket.readyState === WebSocket.OPEN) {
			dashboardSocket.close(1000, "Navigated away from Dashboard");
		}
		const chatSocket = getChatSocket();
		if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
			chatSocket.close(1000, "Navigated away from chat");
		}
	}

	if (renderer) {
		renderer(params);
		setCurrentView(view);
		setCurrentParams(params);
	} else {
		renderers.login(null);
		setCurrentView('login');
		setCurrentParams(null);
	}
}

export function getViewAndParamsFromHash(): { view: View; params: URLSearchParams | null } | null {
	const hash = window.location.hash;
	if (!hash) return null;

	const [viewPart, paramPart] = hash.substring(1).split('?');

	if (viewPart in renderers) {
		const params = paramPart ? new URLSearchParams(paramPart) : null;
		return { view: viewPart as View, params }
	}

	return null;
}
