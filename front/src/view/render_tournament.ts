import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { renderFrame } from "../game/Renderer.js";
import { getFreshToken, getUser } from "../remote_storage/remote_storage.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { GameInfo } from "../game/GameInfo.js"
import { Friend, UserInfo } from "../constants/structs.js";
import { showErrorMessage } from "../templates/popup_message.js";

let currentMode: "local" | "remote" = "local";

export async function render_tournament(params: URLSearchParams | null, mode: "remote" | "local" = "local") {
    if (!bodyContainer) return;

    render_header();
    await connect();

    currentMode = mode;

    const toggleHtml = `
  <div id="toggleBtn" class="absolute top-24 right-4 flex items-center gap-2">
    <span class="text-sm text-gray-400">Remote</span>
    <button id="modeToggle" class="w-14 h-8 bg-gray-700 rounded-full relative transition">
      <div id="modeThumb" class="w-6 h-6 bg-white rounded-full shadow absolute top-1 ${mode === "local" ? "left-7" : "left-1"} transition"></div>
    </button>
    <span class="text-sm text-gray-400">Local</span>
  </div>
  <div id="tournamentContent"></div> <!-- <- neuer Container -->
`;
bodyContainer.innerHTML = toggleHtml;


	const gameId = params?.get("gameId");

	if (gameId) {
		socket?.send(JSON.stringify({
			type: "joinGame",
			data: { gameId: Number(gameId) }
		}));
		const btn = document.getElementById("toggleBtn");
		if (btn) btn.style.display = "none";
	}
    const toggle = document.getElementById("modeToggle");
    const thumb = document.getElementById("modeThumb");
    toggle?.addEventListener("click", () => {
        currentMode = currentMode === "local" ? "remote" : "local";

        if (thumb) {
            thumb.classList.toggle("left-1");
            thumb.classList.toggle("left-7");
        }

        if (currentMode === "local") {
			socket?.send(JSON.stringify({ type: "createLocalTournament" }));
        } else {
			socket?.send(JSON.stringify({ type: "createRemoteTournament" }));
        }
    });
	socket?.send(JSON.stringify({ type: "createLocalTournament" }));
}

function renderLocalTournamentFrontend(tournament: any) {


  const html = `
    <div class="flex flex-col items-center gap-8 p-8">
      <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500 mb-6">
        Local Tournament
      </h1>
      <p class="text-gray-300 mb-4">Enter aliases for up to 3 local players. You are Player 1.</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        ${tournament.players.map((p: any, i: number) => {
          if (i === 0) {
            return `
              <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white">
                <span class="font-bold text-xl">${p.username}</span>
                <img src="/api/get/getImage?filename=${encodeURIComponent(p.path || "std_user_img.png")}"
                     class="w-24 h-24 rounded-full object-cover">
                <span class="text-sm text-gray-400">Player 1</span>
              </div>`;
          } else {
            return `
              <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white">
                <span class="font-bold text-xl">${p.username || `Player ${i+1}`}</span>
                <img src="/api/get/getImage?filename=${encodeURIComponent(p.path || "std_user_img.png")}"
                     class="w-24 h-24 rounded-full object-cover">
                <input type="text" placeholder="Alias" class="mt-2 px-2 py-1 rounded bg-gray-600 text-white w-24 text-center"
                       id="player${i+1}Input" value="${p.username && p.username !== `Player ${i+1}` ? p.username : ''}">
                <span class="text-sm text-gray-400">Player ${i+1}</span>
              </div>`;
          }
        }).join("")}
      </div>

      <button id="startLocalTournamentBtn" disabled class="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">
        Start Tournament
      </button>
    </div>
  `;

  const contentContainer = document.getElementById("tournamentContent")!;
  contentContainer.innerHTML = ""; // reset beim Re-Rendern
  contentContainer.insertAdjacentHTML('afterbegin', html);

  // Input-Event Listener
  // Input-Event Listener: sofort beim Fokusverlust senden
for (let i = 2; i <= 4; i++) {
  const input = document.getElementById(`player${i}Input`) as HTMLInputElement;
  if (!input) continue;

  input.addEventListener("blur", () => {
    const alias = input.value.trim() || `Player ${i}`;

    // Update UI direkt
    const playerNameSpan = input.parentElement?.querySelector("span.font-bold");
    if (playerNameSpan) playerNameSpan.textContent = alias;

    // Nachricht an Backend senden
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "updateLocalPlayerName",
        data: { slot: i, name: alias }
      }));
    }
  });

  // Optional: Enter-Taste zusätzlich blur auslösen
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });
}


  // Start-Tournament Button
  document.getElementById("startLocalTournamentBtn")?.addEventListener("click", () => {
    const aliases: string[] = [];
    for (let i = 2; i <= 4; i++) {
      const input = document.getElementById(`player${i}Input`) as HTMLInputElement;
      aliases.push(input?.value.trim() || `Player ${i}`);
    }
    //startLocalTournament(tournament.players[0].username, aliases);
  });
}



const FIVE_MINUTES_MS = 5 * 60 * 1000;

function isOnline(friend: Friend): boolean {
    if (!friend.last_seen) return false;

    const lastSeen = new Date(friend.last_seen + " UTC").getTime();
    if (isNaN(lastSeen)) return false;

    const now = Date.now();
    return now - lastSeen <= FIVE_MINUTES_MS;
}



async function renderRemoteTournament(players: {
  id: number | null,
  username: string | null,
  path: string | null,
  slot: number,
  status: string | null
}[], messages: { text: string, type: "system" | "user" }[]) {

  	const userData = await getUser();
    if (!userData) {
        console.error("User data not found.");
        return;
    }

    const friends : Friend[] = userData.friends || [];

  // HTML für alle Slots generieren
  const html = `
    <div class="flex flex-col items-center gap-8 p-8">
      <h1 class="text-5xl font-bold bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-text text-transparent mb-6">
        Create Tournament
      </h1>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        ${players.map(player => {
  if (player.id && player.status !== "left") {
    // Spieler ist aktiv
    const statusText = player.status === "joined" ? "Joined" :
                       player.status === "invited" ? "Waiting for acceptance..." : "";
    const statusClass = player.status === "invited" ? "text-yellow-400 animate-pulse" :
                        player.status === "joined" ? "text-green-400" : "text-gray-400";
    return `
      <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white" id="player${player.slot}Card">
        <span class="font-bold text-xl">${player.username}</span>
        <img src="/api/get/getImage?filename=${encodeURIComponent(player.path || "std_user_img.png")}"
             alt="Avatar" class="w-24 h-24 rounded-full object-cover">
        <span class="text-sm ${statusClass}">${statusText}</span>
      </div>
    `;
  } else {
    // Slot leer → Einladung möglich oder Spieler hat verlassen
    return `
      <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white hover:bg-gray-700 cursor-pointer" id="player${player.slot}Card">
        <span class="font-bold text-xl">Invite Player</span>
        <div class="w-24 h-24 bg-gray-700 rounded-full flex justify-center items-center text-gray-400">+</div>
        <span class="text-sm text-gray-400">Player ${player.slot}</span>
      </div>
    `;
  }
}).join("")}

      </div>

      <button
  id="startTournamentBtn"
  disabled
  class="mt-8 px-6 py-3 font-bold rounded-lg transition
         bg-green-600 hover:bg-green-700 text-white
         disabled:bg-gray-400 disabled:text-gray-200
         disabled:cursor-not-allowed disabled:hover:bg-gray-400"
>
  Start Tournament
</button>


	  <div id="chatContainer" class="w-full max-w-3xl bg-gray-900 rounded-lg mt-8 p-4 flex flex-col h-80">
      <div id="chatMessages" class="flex-1 overflow-y-auto text-sm text-white space-y-2 mb-2"></div>
      <div class="flex gap-2">
        <input id="chatInput"
               class="flex-1 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
               placeholder="Type a message..." />
        <button id="chatSend"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold">Send</button>
      </div>
    </div>
    </div>

    <!-- Modal -->
    <div id="inviteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
      <div class="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-white">Select Friend to Invite</h2>
        <div id="friendList" class="flex flex-col gap-2 mb-4"></div>
        <div class="flex justify-end">
          <button id="cancelInvite" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded">Cancel</button>
        </div>
      </div>
    </div>
  `;

	const contentContainer = document.getElementById("tournamentContent")!;
	contentContainer.innerHTML = ""; // reset beim Re-Rendern
	contentContainer.insertAdjacentHTML('afterbegin', html);



  renderChat(messages);

  // Modal-Logik für leere Slots
  let currentSlot: number | null = null;
  const modal = document.getElementById("inviteModal")!;
  const friendList = document.getElementById("friendList")!;

  players.forEach(player => {
  if (!player.id || player.status === "left") { // leer oder verlassen
    const card = document.getElementById(`player${player.slot}Card`);
    card?.addEventListener("click", () => {
      currentSlot = player.slot;
      modal.classList.remove("hidden");

      // IDs aller Spieler, die bereits eingeladen oder gesetzt sind
      const takenIds = players
        .filter(p => p.id && p.status !== "left")
        .map(p => p.id);

      // Nur Freunde anzeigen, die online sind UND noch nicht in einem Slot sind
      const availableFriends = friends
        .filter(f => isOnline(f) && !takenIds.includes(f.id));

      friendList.innerHTML = availableFriends.length === 0
        ? `<p class="text-gray-400">No friends available to invite</p>`
        : availableFriends.map(f => `
            <div class="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600" data-id="${f.id}">
              <img src="/api/get/getImage?filename=${encodeURIComponent(f.path || "std_user_img.png")}"
                   class="w-10 h-10 rounded-full object-cover" alt="Avatar">
              <span class="text-white">${f.username}</span>
            </div>
          `).join("");

      friendList.querySelectorAll<HTMLDivElement>("[data-id]").forEach(el => {
        el.addEventListener("click", () => {
          const friendId = Number(el.getAttribute("data-id"));
          if (!friendId || !currentSlot) return;

          invitePlayerToTournament(friendId, currentSlot);
          modal.classList.add("hidden");
        });
      });
    });
  }
});



	document.getElementById("cancelInvite")?.addEventListener("click", () => {
		modal.classList.add("hidden");
	});

	document.getElementById("startTournamentBtn")?.addEventListener("click", () => {
		socket?.send(JSON.stringify({ type: "startTournament" }));
	});

	const chatInput = document.getElementById("chatInput") as HTMLInputElement;
	const chatSend = document.getElementById("chatSend");

	chatSend?.addEventListener("click", () => {
	  if (chatInput.value.trim() === "") return;
	  const msg = chatInput.value.trim();

	  socket?.send(JSON.stringify({
	    type: "tournamentChat",
	    data: { message: msg }
	  }));

	  addChatMessage(`You: ${msg}`, "user");
	  chatInput.value = "";
	});

	chatInput?.addEventListener("keydown", (e) => {
	  if (e.key === "Enter") chatSend?.click();
	});

}



function invitePlayerToTournament(guestId: number, slot: number) {
  socket?.send(JSON.stringify({
    type: "inviteToTournament",
    data: { guestId, slot }
  }));
}

function addChatMessage(text: string, type: "system" | "user" = "system") {
  const chat = document.getElementById("chatMessages");
  if (!chat) return;

  const msg = document.createElement("div");
  msg.className = type === "system"
    ? "text-gray-400 italic"
    : "text-white";
  msg.textContent = text;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight; // auto-scroll
}



let socket: WebSocket | null = null;

async function connect() {
	const token = await getFreshToken();
	const wsUrl = `wss://${location.host}/ws/tournament?token=${token}`;
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
		socket.onmessage = (msg) => {
			const msgString = msg.data.toString();
			const message = JSON.parse(msgString);
			console.log("📩 WS message:", message);
			switch (message.type) {
				case "tournamentCreated":
					renderRemoteTournament(message.data.players, message.data.messages);
					break;
				case "remoteTournamentUpdated":
					renderRemoteTournament(message.data.players, message.data.messages);
					const startBtn = document.getElementById("startTournamentBtn");
					if (startBtn instanceof HTMLButtonElement) {
						console.log("Tournament ready state:", message.data.ready);
						startBtn.disabled = !message.data.ready;
					}
					break;
				case "endTournament":
					showErrorMessage(message.data.message || "Tournament ended.");
					navigateTo('dashboard');
					break;
				case "LocalTournamentCreated":
					renderLocalTournamentFrontend(message.data);
					break;
				case "localTournamentUpdated":
					renderLocalTournamentFrontend(message.data);
					break;
				case "pong":
					console.log("Pong received");
					break;
				case "tournamentStarting":
					const params = new URLSearchParams();
    				params.set("gameId", message.data.gameId);
					navigateTo('remote_tournament_game', params);
					break;
				default:
					break;
			}
		}
		socket.onclose = () => {
			console.log("🔴 WebSocket disconnected");
			socket = null;
			navigateTo('dashboard');
		}
	});
	setInterval(() => {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: "ping" }));
		}
	}, 30000);

}

function renderChat(messages: { text: string, type: "system" | "user" }[]) {
  const chat = document.getElementById("chatMessages");
  if (!chat) return;
  chat.innerHTML = ""; // reset

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.type === "system"
      ? "text-gray-400 italic"
      : "text-white";
    div.textContent = msg.text;
    chat.appendChild(div);
  });

  chat.scrollTop = chat.scrollHeight;
}

