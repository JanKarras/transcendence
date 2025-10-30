import { dashboarPage } from "../logic/pages/dashboardPage.js";
import { emailValidationPage } from "../logic/pages/emailValidationPage.js";
import { friendsPage } from "../logic/pages/friendsPage.js";
import { gamePage } from "../logic/pages/gamePage.js";
import { loginPage } from "../logic/pages/loginPage.js";
import { matchmakingPage } from "../logic/pages/matchmakingPage.js";
import { profilePage } from "../logic/pages/profilePage.js";
import { registerPage } from "../logic/pages/registerPage.js";
import { remoteTournamentPage } from "../logic/pages/remoteTournamentPage.js";
import { tournamentPage } from "../logic/pages/tournamentPage.js";
import { twoFaPage } from "../logic/pages/twoFaPage.js";

export type View = 'login' | 'dashboard' | 'register' | 'email_validation' | 'two_fa' | 'profile' | 'friends' | 'chat' | 'friend_profile' | 'matchmaking' | 'game' | 'tournament' | 'local_tournament_game' | 'remote_tournament_game';

export const protectedViews: View[] = ['dashboard', 'profile', 'friends', 'chat', 'friend_profile', 'matchmaking', 'game', 'tournament', 'local_tournament_game', 'remote_tournament_game'];

export type ViewRenderFunction = (params: URLSearchParams | null) => void;

export const renderers: Record<View, ViewRenderFunction> = {
	login: loginPage,
	dashboard: dashboarPage,
	register: registerPage,
	email_validation: emailValidationPage,
	two_fa : twoFaPage,
	profile : profilePage,
	friends : friendsPage,
	chat : loginPage,
	friend_profile : loginPage,
	matchmaking : matchmakingPage,
	game : gamePage,
	tournament : tournamentPage,
	local_tournament_game : loginPage,
	remote_tournament_game : remoteTournamentPage,
};

export let currentView: View | null = null;
export let currentParams: URLSearchParams | null = null;

export function setCurrentView(view: View | null) {
	currentView = view;
}

export function setCurrentParams(params: URLSearchParams | null) {
	currentParams = params;
}
