import { is_logged_in_api } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_dashboard } from "../view/render_dashboard.js";
import { render_login } from "../view/render_login.js";
import { render_register } from "../view/render_register.js";
import { render_email_validation } from "./render_email_validation.js";
import { render_profile_settings } from "./render_profile_seetings.js";
import { render_two_fa } from "./render_two_fa.js";
const protectedViews = ['dashboard', 'profile'];
const renderers = {
    login: render_login,
    dashboard: render_dashboard,
    register: render_register,
    email_validation: render_email_validation,
    two_fa: render_two_fa,
    profile: render_profile_settings
};
function renderView(view, params = null) {
    const renderer = renderers[view];
    if (renderer) {
        renderer(params);
    }
    else {
        render_login(null);
    }
}
function getViewAndParamsFromHash() {
    const hash = window.location.hash;
    if (!hash)
        return null;
    const [viewPart, paramPart] = hash.substring(1).split('?'); // z.B. ['login', 'foo=bar']
    if (viewPart in renderers) {
        const params = paramPart ? new URLSearchParams(paramPart) : null;
        return { view: viewPart, params };
    }
    return null;
}
export function initRouter() {
    window.addEventListener('popstate', async (event) => {
        const state = event.state;
        if (state && state.view) {
            if (protectedViews.includes(state.view)) {
                const isLoggedIn = await is_logged_in_api();
                if (!isLoggedIn) {
                    showErrorMessage('You must be logged in to access this page.');
                    renderView('login', null);
                    history.replaceState({ view: 'login', paramString: '' }, '', `#login`);
                    return;
                }
            }
            const params = state.paramString ? new URLSearchParams(state.paramString) : null;
            renderView(state.view, params);
        }
        else {
            const viewData = getViewAndParamsFromHash();
            if (viewData) {
                if (protectedViews.includes(viewData.view)) {
                    const isLoggedIn = await is_logged_in_api();
                    if (!isLoggedIn) {
                        showErrorMessage('You must be logged in to access this page.');
                        renderView('login', null);
                        history.replaceState({ view: 'login', paramString: '' }, '', `#login`);
                        return;
                    }
                }
                renderView(viewData.view, viewData.params);
            }
            else {
                renderView('login', null);
            }
        }
    });
    const viewData = getViewAndParamsFromHash();
    if (viewData) {
        navigateTo(viewData.view, viewData.params); // <-- hier auch Login-Check nutzen
    }
    else {
        renderView('login', null);
    }
}
export async function navigateTo(view, params = null) {
    if (protectedViews.includes(view)) {
        const isLoggedIn = await is_logged_in_api();
        if (!isLoggedIn) {
            history.pushState({ view: 'login', paramString: '' }, '', `#login`);
            return;
        }
    }
    renderView(view, params);
    const paramString = params ? `?${params.toString()}` : '';
    history.pushState({ view, paramString }, '', `#${view}${paramString}`);
}
