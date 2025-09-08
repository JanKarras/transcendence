import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { renderFrame } from "../game/Renderer.js";
import { getFreshToken } from "../remote_storage/remote_storage.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { GameInfo } from "../game/GameInfo.js"

let socket: WebSocket | null = null;
let gameInfo : GameInfo;
let gameState = 0;

const wsUrl = `wss://${location.host}/ws/game?token=${localStorage.getItem('auth_token')}`;

export async function render_tournament(params: URLSearchParams | null) {
  if (!bodyContainer) {
    console.error("bodyContainer Container missing");
    return;
  }

  render_header();

  const html = `
  <div class="flex flex-col items-center gap-8 p-8">
    <h1 class="text-5xl font-bold bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-text text-transparent mb-6">
      Create Tournament
    </h1>

    <p class="text-gray-300 mb-4">Invite up to 3 players. You are always Player 1.</p>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
      <!-- Player 1: Yourself -->
      <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white">
        <span class="font-bold text-xl">You</span>
        <img src="${profileImg?.src || '/assets/img/default-profile.png'}" alt="Your Avatar" class="w-24 h-24 rounded-full object-cover">
        <span class="text-sm text-gray-400">Player 1</span>
      </div>

      <!-- Player 2 -->
      <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white hover:bg-gray-700 cursor-pointer" id="player2Card">
        <span class="font-bold text-xl">Invite Player</span>
        <div class="w-24 h-24 bg-gray-700 rounded-full flex justify-center items-center text-gray-400">+</div>
        <span class="text-sm text-gray-400">Player 2</span>
      </div>

      <!-- Player 3 -->
      <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white hover:bg-gray-700 cursor-pointer" id="player3Card">
        <span class="font-bold text-xl">Invite Player</span>
        <div class="w-24 h-24 bg-gray-700 rounded-full flex justify-center items-center text-gray-400">+</div>
        <span class="text-sm text-gray-400">Player 3</span>
      </div>

      <!-- Player 4 -->
      <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 text-white hover:bg-gray-700 cursor-pointer" id="player4Card">
        <span class="font-bold text-xl">Invite Player</span>
        <div class="w-24 h-24 bg-gray-700 rounded-full flex justify-center items-center text-gray-400">+</div>
        <span class="text-sm text-gray-400">Player 4</span>
      </div>
    </div>

    <button id="startTournamentBtn" class="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">
      Start Tournament
    </button>
  </div>
  
  `;

  bodyContainer.innerHTML = html;
  const hs = " hsws";
  // Event-Listener für die Einladungen
  for (let i = 2; i <= 4; i++) {
    const card = document.getElementById(`player${i}Card`);
    card?.addEventListener('click', () => {
      const name = prompt("Enter player's name or ID to invite:");
      if (!name) return;
      card.innerHTML = `
        <span class="font-bold text-xl">${name}</span>
        <div class="w-24 h-24 bg-gray-600 rounded-full flex justify-center items-center text-white">👤</div>
        <span class="text-sm text-gray-400">Player ${i}</span>
      `;
    });
  }

  // Start-Tournament Button
  const startBtn = document.getElementById('startTournamentBtn');
  startBtn?.addEventListener('click', () => {
    alert('Tournament started! (Hier kannst du die Logik einbauen)');
  });
}


