import { currentParams, currentView, renderers, setCurrentParams, setCurrentView, View } from "./routerStore.js";

export function reRenderCurrentView() {
	if (currentView) {
		renderView(currentView, currentParams);
	}
}

export function renderView(view: View, params: URLSearchParams | null = null) {
	const renderer = renderers[view];
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
