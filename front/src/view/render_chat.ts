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
        <div class="chat" style="display: flex; gap: 20px;">
            <div class="sidebar" style="width: 250px;">
                <h3>Friends</h3>
                <ul id="friendsList" style="list-style: none; padding: 0;"></ul>
            </div>
            <div class="chat-window" style="flex: 1;">
                <div id="chatHeader" style="font-weight: bold; margin-bottom: 10px;">Select a chat partner</div>
                <div id="chatMessages" style="border: 1px solid #ccc; height: 300px; overflow-y: auto; padding: 5px;"></div>
                <div style="margin-top: 10px;">
                    <input id="chatInput" type="text" placeholder="Enter message" style="width: 80%;">
                    <button id="sendBtn">Send</button>
                </div>
            </div>
        </div>
    `;
    refreshFriendsList();

    connectWebSocket();

    const storedId = localStorage.getItem('selectedFriendId');
    if (storedId){
        connectDialog( parseInt(storedId), '');
        localStorage.removeItem('selectedFriendId');
    }

    const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
    sendBtn.addEventListener('click', () => {
        const input = document.getElementById('chatInput') as HTMLInputElement;
        const content: string = input.value.trim();
        if (content) {
            friendChat(content);
            input.value = '';
        }
    });


}
