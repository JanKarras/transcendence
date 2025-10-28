import { is_logged_in_api } from "../api/isLoggedIn.js";
import { initTranslations, t } from "../logic/gloabal/initTranslations.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { getSocket } from "../websocket/wsService.js";
import { navigateTo } from "./navigateTo.js";
import { protectedViews, View } from "./routerStore.js";
import { getViewAndParamsFromHash, renderView } from "./routerUtils.js";

export function initRouter() {
	window.addEventListener('popstate', async (event) => {
	const currentPage = window.location.hash;

	if (currentPage !== "#game" && currentPage !== "#matchmaking") {
		try {
			const socket = getSocket();
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close(1000, "Leaving game page");
				console.log("🔴 WebSocket closed because user navigated away");
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const state = event.state as { view: View; paramString: string } | null;

	await initTranslations();
	if (state && state.view) {
		if (protectedViews.includes(state.view)) {
			const isLoggedIn = await is_logged_in_api();
			if (!isLoggedIn) {
				showErrorMessage(t('loginRequired'));
				renderView('login', null);
				history.replaceState({ view: 'login', paramString: '' }, '', `#login`);
				return;
			}
		}
		const params = state.paramString ? new URLSearchParams(state.paramString) : null;
		renderView(state.view, params);
	} else {
		const viewData = getViewAndParamsFromHash();
		if (viewData) {
			if (protectedViews.includes(viewData.view)) {
				const isLoggedIn = await is_logged_in_api();
				if (!isLoggedIn) {
					showErrorMessage(t('loginRequired'));
					renderView('login', null);
					history.replaceState({ view: 'login', paramString: '' }, '', `#login`);
					return;
				}
			}
			renderView(viewData.view, viewData.params);
		} else {
			renderView('login', null);
		}
	}
	});

	const viewData = getViewAndParamsFromHash();
	if (viewData) {
		navigateTo(viewData.view, viewData.params);
	} else {
		renderView('login', null);
	}
}
