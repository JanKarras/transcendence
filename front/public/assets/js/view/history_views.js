import { render_dashboard } from "../view/render_dashboard.js";
import { render_login } from "../view/render_login.js";
import { render_register } from "../view/render_register.js";
const renderers = {
    login: render_login,
    dashboard: render_dashboard,
    register: render_register
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
export function initRouter() {
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.view) {
            renderView(state.view);
        }
        else {
            renderView('login');
        }
    });
}
export function navigateTo(view) {
    renderView(view);
    history.pushState({ view }, '', `#${view}`);
}
