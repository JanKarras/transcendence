import { MENU_CONTAINER_ID } from "../constants/constants.js";
import { LANGUAGE, setLanguage } from "../constants/gloabal.js";
import { AVAILABLE_LANGUAGES } from "../constants/language_vars.js";
import { logOutApi } from "../remote_storage/remote_storage.js";
import { navigateTo, reRenderCurrentView } from "../view/history_views.js";
import { hideFriendsDropdown } from "./freinds_menu.js";

export function getMenuEntries(currentPos: string): { label: string, onClick: () => void }[] {
	const entries = [];

	console.log(currentPos)

	if (currentPos === "dashboard") {
		entries.push({ label: `👤 Profil`, onClick: () => navigateTo("profile") });
	}
	if (currentPos === "profile") {
		entries.push({ label: `🏠 Dashboard`, onClick: () => navigateTo("dashboard") });
	}
	if (currentPos === "friends") {
		entries.push({ label: `🏠 Dashboard`, onClick: () => navigateTo("dashboard") });
		entries.push({ label: `👤 Profil`, onClick: () => navigateTo("profile") });
	}

	return entries;
}


export function buildMenuItems(baseItems: MenuItem[]): MenuItem[] {
	const langEntry: MenuItem = {
		label: `🌐 Language: ${LANGUAGE.toUpperCase()}`,
		onClick: () => {

		}
	};

	const logoutEntry: MenuItem = {
		label: "🚪 Logout",
		onClick: () => logOutApi()
	};

	return [...baseItems, langEntry, logoutEntry];
}

function getOrCreateMenuContainer(): HTMLElement {
  let container = document.getElementById(MENU_CONTAINER_ID);
  if (!container) {
	container = document.createElement("div");
	container.id = MENU_CONTAINER_ID;
	container.className = "fixed top-16 right-6 z-50 bg-[#0e0e25] shadow-lg rounded w-[266px] opacity-0 translate-y-2 pointer-events-none transition-all duration-300";
	document.body.appendChild(container);
  }
  return container;
}

export function updateMenuItems(items: MenuItem[]) {
  const container = getOrCreateMenuContainer();

  container.innerHTML = "";

  items.forEach(item => {
	const btn = document.createElement("button");
	btn.textContent = item.label;
	btn.className = "block w-full text-white text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none";
	btn.addEventListener("click", () => {
	  item.onClick();
	  hideMenu();
	});
	container.appendChild(btn);
  });
}


interface MenuItem {
  label: string;
  onClick: () => void;
}

function renderMenu(items: MenuItem[]) {
  const container = getOrCreateMenuContainer();
  container.innerHTML = "";

  items.forEach(item => {
	if (item.label.startsWith("🌐")) {
		const langWrapper = document.createElement("div");
		langWrapper.className = "relative group";

		const langBtn = document.createElement("div");
		langBtn.textContent = item.label;
		langBtn.className = "block w-full text-white text-left px-4 py-2 text-gray-400 cursor-default select-none";

		langWrapper.appendChild(langBtn);

		const langSubmenu = document.createElement("div");
		langSubmenu.className =
		  "absolute left-[-200px] top-0 ml-2 bg-[#0e0e25] shadow-lg rounded w-48 opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto";

		AVAILABLE_LANGUAGES.forEach(lang => {
		  const langItem = document.createElement("button");
		  langItem.className = "flex items-center gap-2 w-full text-white text-left px-4 py-2 hover:bg-gray-100 hover:text-black focus:outline-none";

		  const img = document.createElement("img");
		  img.src = lang.flag;
		  img.alt = lang.label;
		  img.className = "w-5 h-5";

		  langItem.appendChild(img);
		  langItem.appendChild(document.createTextNode(lang.label));
		  langItem.addEventListener("click", () => {
			setLanguage(lang.code);
			hideMenu();
			reRenderCurrentView();
		  });

		  langSubmenu.appendChild(langItem);
  		});

  		langWrapper.appendChild(langSubmenu);
  		container.appendChild(langWrapper);
	} else {
	  // Normale Menüeinträge
	  const btn = document.createElement("button");
	  btn.textContent = item.label;
	  btn.className = "block w-full text-white text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none";
	  btn.addEventListener("click", () => {
		item.onClick();
		hideMenu();
	  });
	  container.appendChild(btn);
	}
  });
}

export function showMenu(items: MenuItem[]) {
	hideFriendsDropdown()
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
