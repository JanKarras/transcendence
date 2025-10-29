import { dashboarPage } from "../logic/pages/dashboardPage.js";
import { loginPage } from "../logic/pages/loginPage.js";
import { profilePage } from "../logic/pages/profilePage.js";
import { registerPage } from "../logic/pages/registerPage.js";

export type View = 'login' | 'dashboard' | 'register' | 'email_validation' | 'two_fa' | 'profile' | 'friends' | 'chat' | 'friend_profile' | 'matchmaking' | 'game' | 'tournament' | 'local_tournament_game' | 'remote_tournament_game';

export const protectedViews: View[] = ['dashboard', 'profile', 'friends', 'chat', 'friend_profile', 'matchmaking', 'game', 'tournament', 'local_tournament_game', 'remote_tournament_game'];

export type ViewRenderFunction = (params: URLSearchParams | null) => void;

export const renderers: Record<View, ViewRenderFunction> = {
	login: loginPage,
	dashboard: dashboarPage,
	register: registerPage,
	email_validation: loginPage,
	two_fa : loginPage,
	profile : profilePage,
	friends : loginPage,
	chat : loginPage,
	friend_profile : loginPage,
	matchmaking : loginPage,
	game : loginPage,
	tournament : loginPage,
	local_tournament_game : loginPage,
	remote_tournament_game : loginPage,
};

export let currentView: View | null = null;
export let currentParams: URLSearchParams | null = null;

export function setCurrentView(view: View | null) {
	currentView = view;
}

export function setCurrentParams(params: URLSearchParams | null) {
	currentParams = params;
}
