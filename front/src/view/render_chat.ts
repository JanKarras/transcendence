import { bodyContainer } from "../constants/constants.js";
import { connectWebSocket, friendChat, refreshFriendsList, connectDialog } from "../websocket/ws.js";
import { render_header } from "./render_header.js";

export async function render_chat(params: URLSearchParams | null) {
    if (!bodyContainer) {
        console.error('bodyContainer container missing');
        return;
    }

    render_header();

    bodyContainer.innerHTML = `
  <div class="chat flex gap-6 w-full h-full max-h-[calc(100vh-8rem)] bg-gradient-to-br from-[#1a1a3d] to-[#252565] rounded-xl shadow-xl p-4">
    <!-- Sidebar -->
    <div class="sidebar w-64 bg-[#0f0f2a] rounded-lg p-3 flex flex-col">
      <h3 class="text-white font-bold text-lg mb-3">Friends</h3>
      <ul id="friendsList" class="list-none p-0 flex-1 overflow-y-auto"></ul>
    </div>

    <!-- Chat Window -->
    <div class="chat-window flex-1 flex flex-col bg-[#0f0f2a] rounded-lg p-3 overflow-hidden">
      <div class="flex justify-between items-center mb-3">
        <div id="chatHeader" class="font-bold text-white text-lg">Select a chat partner</div>
        <!-- Leerer Container für Buttons -->
        <div id="chatControls" class="flex gap-2"></div>
      </div>

      <div id="chatMessages" class="flex-1 overflow-y-auto p-3 bg-[#1a1a3d] rounded-lg border border-[#333366]"></div>
      <div class="mt-3 flex gap-2">
        <input id="chatInput" type="text" placeholder="Enter message" class="flex-1 p-2 rounded-lg border border-gray-600 bg-[#2c2c58] text-white focus:outline-none focus:ring-2 focus:ring-[#5656aa]">
        <button id="sendBtn" class="px-4 py-2 rounded-lg bg-[#5656aa] text-white font-semibold hover:bg-[#7878cc] transition">Send</button>
      </div>
    </div>
  </div>
`;

    refreshFriendsList();
    connectWebSocket();

	const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
	const chatInput = document.getElementById('chatInput') as HTMLInputElement;

	function sendMessageHandler() {
	    const content: string = chatInput.value.trim();
	    if (content) {
	        friendChat(content);
	        chatInput.value = '';
	    }
	}

	sendBtn.addEventListener('click', sendMessageHandler);

	chatInput.addEventListener('keydown', (e) => {
	    if (e.key === 'Enter') {
	        e.preventDefault();
	        sendMessageHandler();
	    }
	});
}
