import { AVAILABLE_LANGUAGES } from "../../constants/language_vars.js";
import { setLanguage } from "../../logic/gloabal/setLanguage.js";
import { getOrCreateMenuContainer, MenuItem } from "../../logic/templates/menuTemplate.js";
import { reRenderCurrentView } from "../../router/routerUtils.js";
import { hideMenu } from "../../templates/menu.js";

export function renderMenu(items: MenuItem[]) {
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
