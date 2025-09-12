import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { renderFrame } from "../game/Renderer.js";
import { getFreshToken, getUser } from "../remote_storage/remote_storage.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { GameInfo } from "../game/GameInfo.js"
import { Friend, UserInfo } from "../constants/structs.js";

export async function render_tournament(params: URLSearchParams | null, mode: "remote" | "local" = "local") {
  if (!bodyContainer) return;

  render_header();
	connect()
	const userData = await getUser();
	if (!userData) {
		console.error("User data not found.");
		return;
	}
	const user: UserInfo = userData.user;
  const toggleHtml = `
    <div class="absolute top-24 right-4 flex items-center gap-2">
      <span class="text-sm text-gray-400">Remote</span>
      <button id="modeToggle"
        class="w-14 h-8 bg-gray-700 rounded-full relative transition">
        <div id="modeThumb"
          class="w-6 h-6 bg-white rounded-full shadow absolute top-1 ${mode === "local" ? "left-7" : "left-1"} transition"></div>
      </button>
      <span class="text-sm text-gray-400">Local</span>
    </div>
  `;

  bodyContainer.innerHTML = toggleHtml;

  const toggle = document.getElementById("modeToggle");
  toggle?.addEventListener("click", () => {
    render_tournament(null, mode === "local" ? "remote" : "local");
  });

  if (mode === "local") {
    renderLocalTournament(user);
  } else {
    renderRemoteTournament(user, userData.friends || []);
  }
}

function renderLocalTournament(user: UserInfo) {
  if (!bodyContainer) return;

  const html = `
    <div class="flex flex-col items-center gap-8 p-8">
      <h1 class="text-5xl font-bold bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-text text-transparent mb-6">
        Local Tournament
      </h1>
      <p class="text-gray-300 mb-4">Enter aliases for up to 3 local players. You are immer Player 1.</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        <!-- Player 1 -->
        <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white">
          <span class="font-bold text-xl">${user.username}</span>
          <img src="/api/get/getImage?filename=${encodeURIComponent(user.path || "std_user_img.png")}"
               alt="Your Avatar" class="w-24 h-24 rounded-full object-cover">
          <span class="text-sm text-gray-400">Player 1</span>
        </div>

        ${[2,3,4].map(i => `
          <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white">
            <span class="font-bold text-xl">Player ${i}</span>
            <img src="/api/get/getImage?filename=std_user_img.png"
                 class="w-24 h-24 rounded-full object-cover" alt="Alias Avatar">
            <input type="text" placeholder="Alias" class="mt-2 px-2 py-1 rounded bg-gray-600 text-white w-24 text-center" id="player${i}Input">
            <span class="text-sm text-gray-400">Player ${i}</span>
          </div>
        `).join("")}
      </div>

      <button id="startTournamentBtn" class="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">
        Start Tournament
      </button>
    </div>
  `;

  bodyContainer.insertAdjacentHTML('beforeend', html);

  // Event Listener: Enter-Taste für jedes Input
  for (let i = 2; i <= 4; i++) {
    const input = document.getElementById(`player${i}Input`) as HTMLInputElement;
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim() !== "") {
        input.blur(); // Input wird verlassen, Name bleibt sichtbar
      }
    });
  }

  // Start-Tournament Button
  document.getElementById("startTournamentBtn")?.addEventListener("click", () => {
    const aliases: string[] = [];
    for (let i = 2; i <= 4; i++) {
      const input = document.getElementById(`player${i}Input`) as HTMLInputElement;
      if (input && input.value.trim() !== "") {
        aliases.push(input.value.trim());
      } else {
        aliases.push(`Player ${i}`);
      }
    }
    startLocalTournament(user.username, aliases);
  });
}




function renderRemoteTournament(user: UserInfo, friends: Friend[]) {
  if (!bodyContainer) return;

  const html = `
    <div class="flex flex-col items-center gap-8 p-8">
      <h1 class="text-5xl font-bold bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-text text-transparent mb-6">
        Create Tournament
      </h1>
      <p class="text-gray-300 mb-4">Invite up to 3 players. You are always Player 1.</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        <!-- Player 1 -->
        <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white">
          <span class="font-bold text-xl">${user.username}</span>
          <img src="/api/get/getImage?filename=${encodeURIComponent(user.path || "std_user_img.png")}"
               alt="Your Avatar" class="w-24 h-24 rounded-full object-cover">
          <span class="text-sm text-gray-400">Player 1</span>
        </div>

        ${[2,3,4].map(i => `
          <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white hover:bg-gray-700 cursor-pointer" id="player${i}Card">
            <span class="font-bold text-xl">Invite Player</span>
            <div class="w-24 h-24 bg-gray-700 rounded-full flex justify-center items-center text-gray-400">+</div>
            <span class="text-sm text-gray-400">Player ${i}</span>
          </div>
        `).join("")}
      </div>

      <button id="startTournamentBtn" class="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">
        Start Tournament
      </button>
    </div>

    <!-- Modal -->
    <div id="inviteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
      <div class="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-white">Select Friends to Invite</h2>
        <div id="friendList" class="flex flex-col gap-2 mb-4">
          ${friends.map(f => `
            <div class="flex items-center justify-between p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600" data-id="${f.id}">
              <span class="text-white">${f.username}</span>
              <input type="checkbox" class="inviteCheckbox">
            </div>
          `).join("")}
        </div>
        <div class="flex justify-end gap-2">
          <button id="cancelInvite" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded">Cancel</button>
          <button id="confirmInvite" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Invite</button>
        </div>
      </div>
    </div>
  `;

  bodyContainer.insertAdjacentHTML('beforeend', html);

  // Invite Modal Logik
  let currentCardId: string | null = null;

  for (let i = 2; i <= 4; i++) {
    const card = document.getElementById(`player${i}Card`);
    card?.addEventListener("click", () => {
      currentCardId = `player${i}Card`;
      const modal = document.getElementById("inviteModal");
      modal?.classList.remove("hidden");

      // Checkbox-Auswahl auf max 3 limitieren
      const checkboxes = Array.from(document.querySelectorAll<HTMLInputElement>("#friendList .inviteCheckbox"));
      checkboxes.forEach(cb => {
        cb.checked = false;
        cb.addEventListener("change", () => {
          const selected = checkboxes.filter(c => c.checked);
          if (selected.length > 3) cb.checked = false; // max 3
        });
      });
    });
  }

  document.getElementById("cancelInvite")?.addEventListener("click", () => {
    document.getElementById("inviteModal")?.classList.add("hidden");
  });

  document.getElementById("confirmInvite")?.addEventListener("click", () => {
    const selected = Array.from(document.querySelectorAll<HTMLInputElement>("#friendList .inviteCheckbox:checked"));
    if (!currentCardId || selected.length === 0) return;

    const card = document.getElementById(currentCardId);
    selected.forEach((cb, idx) => {
      const friendId = cb.parentElement?.getAttribute("data-id");
      const friend = friends.find(f => f.id.toString() === friendId);
      if (!friend) return;
      if (currentCardId && idx === 0) {
  	card!.innerHTML = `
  	  <span class="font-bold text-xl">${friend.username}</span>
  	  <img src="/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}"
  	       class="w-24 h-24 rounded-full object-cover" alt="Avatar">
  	  <span class="text-sm text-gray-400">${currentCardId.replace("player","Player ")}</span>
  	`;
	}

    });

    document.getElementById("inviteModal")?.classList.add("hidden");
  });

  // Start-Tournament Button
  document.getElementById("startTournamentBtn")?.addEventListener("click", () => {
    const invited: string[] = [];
    for (let i = 2; i <= 4; i++) {
      const card = document.getElementById(`player${i}Card`);
      const nameSpan = card?.querySelector("span.font-bold")?.textContent;
      if (nameSpan) invited.push(nameSpan);
    }
    console.log("Remote Tournament started with:", invited);
  });
}

let socket: WebSocket | null = null;

const wsUrl = `wss://${location.host}/ws/tournament?token=${localStorage.getItem('auth_token')}`;

async function connect() {
	socket = new WebSocket(wsUrl);
	await new Promise<void>((resolve, reject) => {
		if (!socket) return reject("Socket not created");
		socket.onopen = () => {
			console.log(`✅ WebSocket connected to ${wsUrl}`);
			resolve();
		};
		socket.onerror = (err) => {
			console.error(`⚠️ WebSocket error:`, err);
			reject(err);
		};
	});
}

async function startLocalTournament(username: string, aliases: string[]) {
	const data = {
		player1: username,
		player2: aliases[0],
		player3: aliases[1],
		player4: aliases[2],
	}
	socket?.send(JSON.stringify({ type: "createLocalTournament", data }));
	navigateTo('local_tournament_game');
}
