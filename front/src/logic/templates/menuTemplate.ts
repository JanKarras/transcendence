import { MENU_CONTAINER_ID } from "../../constants/constants.js";
import { LANGUAGE } from "../../constants/gloabal.js";
import { renderMenu } from "../../render/templates/renderMenuTemplate.js";
import { navigateTo } from "../../router/navigateTo.js";
import { t } from "../gloabal/initTranslations.js";
import { logOut } from "../gloabal/logOut.js";

export interface MenuItem {
	id?: string;
	label: string;
	onClick: () => void;
}

/** Gibt Menüeinträge je nach aktueller Seite zurück */
export function getMenuEntries(currentPos: string): MenuItem[] {
	const entries: MenuItem[] = [];
	const basePos = currentPos.split("?")[0];

	switch (basePos) {
		case "dashboard":
			entries.push({ id: "menu-profile", label: `👤 ${t("profile")}`, onClick: () => navigateTo("profile") });
			entries.push({ id: "menu-friends", label: `👥 ${t("friends")}`, onClick: () => navigateTo("friends") });
			break;

		case "profile":
			entries.push({ id: "menu-dashboard", label: `🏠 ${t("dashboard2")}`, onClick: () => navigateTo("dashboard") });
			entries.push({ id: "menu-friends", label: `👥 ${t("friends")}`, onClick: () => navigateTo("friends") });
			break;

		case "friends":
			entries.push({ id: "menu-dashboard", label: `🏠 ${t("dashboard2")}`, onClick: () => navigateTo("dashboard") });
			entries.push({ id: "menu-profile", label: `👤 ${t("profile")}`, onClick: () => navigateTo("profile") });
			break;

		case "chat":
			entries.push({ id: "menu-profile", label: `👤 ${t("profile")}`, onClick: () => navigateTo("profile") });
			entries.push({ id: "menu-friends", label: `👥 ${t("friends")}`, onClick: () => navigateTo("friends") });
			break;

		case "friend_profile":
			entries.push({ id: "menu-dashboard", label: `🏠 ${t("dashboard2")}`, onClick: () => navigateTo("dashboard") });
			entries.push({ id: "menu-profile", label: `👤 ${t("profile")}`, onClick: () => navigateTo("profile") });
			entries.push({ id: "menu-friends", label: `👥 ${t("friends")}`, onClick: () => navigateTo("friends") });
			break;
	}

	return entries;
}

export function buildMenuItems(baseItems: MenuItem[]): MenuItem[] {
	const langEntry: MenuItem = {
		id: "menu-language",
		label: `${t("languageLabel")} ${LANGUAGE.toUpperCase()}`,
		onClick: () => {}, // Sprache wird über Submenu gehandhabt
	};

	const logoutEntry: MenuItem = {
		id: "menu-logout",
		label: `🚪 ${t("logout")}`,
		onClick: () => logOut("You logged out"),
	};

	return [...baseItems, langEntry, logoutEntry];
}

export function getOrCreateMenuContainer(): HTMLElement {
	let container = document.getElementById(MENU_CONTAINER_ID);
	if (!container) {
		container = document.createElement("div");
		container.id = MENU_CONTAINER_ID;
		container.className = "fixed top-16 right-6 z-50 bg-[#0e0e25] shadow-lg rounded w-[266px] opacity-0 translate-y-2 pointer-events-none transition-all duration-300";
		document.body.appendChild(container);
	}
	return container;
}

export function showMenu(items: MenuItem[]) {
	const container = getOrCreateMenuContainer();
	renderMenu(items);

	container.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
	container.classList.add("opacity-100", "translate-y-0");

	function onClickOutside(event: MouseEvent) {
	if (!container.contains(event.target as Node)) {
		hideMenu();
		document.removeEventListener("click", onClickOutside);
	}
	}

	setTimeout(() => {
	document.addEventListener("click", onClickOutside);
	}, 0);
}

export function hideMenu() {
	const container = getOrCreateMenuContainer();
	container.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
	container.classList.remove("opacity-100", "translate-y-0");
}
