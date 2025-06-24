import { MENU_CONTAINER_ID } from "../constants/constants.js";


function getOrCreateMenuContainer(): HTMLElement {
  let container = document.getElementById(MENU_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = MENU_CONTAINER_ID;
    // Hier keine display:none mehr! Sondern direkt Klassen für verstecken/zeigen:
    container.className = "fixed top-16 right-11 z-50 bg-white shadow-lg rounded border border-gray-200 w-48 opacity-0 translate-y-2 pointer-events-none transition-all duration-300";
    document.body.appendChild(container);
  }
  return container;
}

interface MenuItem {
  label: string;
  onClick: () => void;
}

function renderMenu(items: MenuItem[]) {
  const container = getOrCreateMenuContainer();
  container.innerHTML = ""; // vorherigen Inhalt löschen

  items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.className = "block w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none";
    btn.addEventListener("click", () => {
      item.onClick();
      hideMenu();
    });
    container.appendChild(btn);
  });
}

export function showMenu(items: MenuItem[]) {
  const container = getOrCreateMenuContainer();
  renderMenu(items);

  // Sichtbar machen mit Animation
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

  // Verstecken mit Animation
  container.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
  container.classList.remove("opacity-100", "translate-y-0");
}
