import { render_dashboard } from "../view/render_dashboard.js";
import { render_login } from "../view/render_login.js";
import { render_register } from "../view/render_register.js";
import { render_email_validation } from "./render_email_validation.js";
const renderers = {
    login: render_login,
    dashboard: render_dashboard,
    register: render_register,
    email_validation: render_email_validation
};
function renderView(view) {
    const renderer = renderers[view];
    if (renderer) {
        renderer();
    }
    else {
        render_login();
    }
}
function getViewFromHash() {
    const hash = window.location.hash;
    if (!hash)
        return null;
    const view = hash.substring(1);
    if (view in renderers) {
        return view;
    }
    return null;
}
export function initRouter() {
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.view) {
            renderView(state.view);
        }
        else {
            const viewFromHash = getViewFromHash();
            if (viewFromHash) {
                renderView(viewFromHash);
            }
            else {
                renderView('login');
            }
        }
    });
    const initialView = getViewFromHash();
    if (initialView) {
        renderView(initialView);
    }
    else {
        renderView('login');
    }
}
export function navigateTo(view) {
    renderView(view);
    history.pushState({ view }, '', `#${view}`);
}
