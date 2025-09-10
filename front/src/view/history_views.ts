import { is_logged_in_api } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_dashboard } from "../view/render_dashboard.js";
import { render_login } from "../view/render_login.js";
import { render_register } from "../view/render_register.js";
import { render_email_validation } from "./render_email_validation.js";
import { render_friends } from "./render_friends.js";
import { render_profile_settings } from "./render_profile_seetings.js";
import { render_two_fa } from "./render_two_fa.js";
import { lang, t } from "../constants/language_vars.js";
import { LANGUAGE } from "../constants/gloabal.js";
import { render_chat } from "./render_chat.js";
import { render_friend_profile } from "./render_friend_profile.js";
import { render_matchmaking } from "./render_matchmaking.js";
import { render_game } from "./render_game.js";
import { render_tournament } from "./render_tournament.js";
import { render_local_tournament_game } from "./render_local_tournament_game.js";

export type View = 'login' | 'dashboard' | 'register' | 'email_validation' | 'two_fa' | 'profile' | 'friends' | 'chat' | 'friend_profile' | 'matchmaking' | 'game' | 'tournament' | 'local_tournament_game';

const protectedViews: View[] = ['dashboard', 'profile', 'friends', 'chat', 'friend_profile', 'matchmaking', 'game', 'tournament', 'local_tournament_game'];

type ViewRenderFunction = (params: URLSearchParams | null) => void;

const renderers: Record<View, ViewRenderFunction> = {
  login: render_login,
  dashboard: render_dashboard,
  register: render_register,
  email_validation: render_email_validation,
  two_fa : render_two_fa,
  profile : render_profile_settings,
  friends : render_friends,
  chat : render_chat,
  friend_profile : render_friend_profile,
  matchmaking : render_matchmaking,
  game : render_game,
  tournament : render_tournament,
  local_tournament_game : render_local_tournament_game,
};

let currentView: View | null = null;
let currentParams: URLSearchParams | null = null;

export function reRenderCurrentView() {
  if (currentView) {
    renderView(currentView, currentParams);
  }
}

function renderView(view: View, params: URLSearchParams | null = null) {
  const renderer = renderers[view];
  if (renderer) {
    renderer(params);
    currentView = view;
    currentParams = params;
  } else {
    render_login(null);
    currentView = 'login';
    currentParams = null;
  }
}

function getViewAndParamsFromHash(): { view: View; params: URLSearchParams | null } | null {
  const hash = window.location.hash;
  if (!hash) return null;

  const [viewPart, paramPart] = hash.substring(1).split('?');

  if (viewPart in renderers) {
    const params = paramPart ? new URLSearchParams(paramPart) : null;
    return { view: viewPart as View, params };
  }

  return null;
}

export function initRouter() {
  window.addEventListener('popstate', async (event) => {
    const state = event.state as { view: View; paramString: string } | null;

    if (state && state.view) {
      if (protectedViews.includes(state.view)) {
        const isLoggedIn = await is_logged_in_api();
        if (!isLoggedIn) {
          showErrorMessage(t(lang.loginRequired, LANGUAGE));
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
            showErrorMessage(t(lang.loginRequired, LANGUAGE));
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


export async function navigateTo(view: View, params: URLSearchParams | null = null) {
  if (protectedViews.includes(view)) {
    const isLoggedIn = await is_logged_in_api();
    if (!isLoggedIn) {
	showErrorMessage(t(lang.loginRequired, LANGUAGE));
      history.pushState({ view: 'login', paramString: '' }, '', `#login`);
      return;
    }
  }

  renderView(view, params);
  const paramString = params ? `?${params.toString()}` : '';

  history.pushState({ view, paramString }, '', `#${view}${paramString}`);
}
