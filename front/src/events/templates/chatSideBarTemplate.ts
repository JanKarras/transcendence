import { closeDialog } from "../../logic/templates/chatSideBarTemplate/chatSidebarUtils.js";
import { handleChat } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handleChat.js";
import { handleChatBlock } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handleChatBlock.js";
import { handleFriendStatus } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handleFriendStatus.js";
import { handleInit } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handleInit.js";
import { handleInviteMessage } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handleInviteMessage.js";
import { handleNewMessage } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handleNewMessage.js";
import { handlePeerDialogOpen } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handlePeerDialogOpen.js";
import { handleReadReceipt } from "../../logic/templates/chatSideBarTemplate/messageHandlers.ts/handleReadReceipt.js";
import { closeChatSocket, getChatSocket } from "../../websocket/wsChatService.js";

export async function setChatEventlistenersForSocket() {
	const socket = await getChatSocket()

	if (!socket) {
		return;
	}

	socket.onmessage = (event: MessageEvent) => {
		const msg = JSON.parse(event.data.toString());
		switch (msg.type) {
			case 'init':
				handleInit(msg);
				break;

			case 'chat':
				handleChat(msg);
				break;

			case 'chat-block':
				handleChatBlock(msg);
				break;

			case 'read_receipt':
				handleReadReceipt(msg);
				break;

			case 'peer_dialog_open':
				handlePeerDialogOpen(msg);
				break;

			case 'friend_status':
				handleFriendStatus(msg);
				break;

			case 'new_message':
				handleNewMessage(msg);
				break;

			case 'invite_message':
				handleInviteMessage(msg);
				break;
		}
	}

	socket.onclose = () => {
		closeChatSocket();
		closeDialog()
	}

	socket.onerror = (error) => {
		console.error('⚠️ WebSocket error:', error);
	}

	setInterval(() => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: "ping" }));
		}
	}, 30000);
}