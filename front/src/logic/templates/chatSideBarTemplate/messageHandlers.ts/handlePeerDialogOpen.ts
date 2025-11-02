import { getChatSocket } from "../../../../websocket/wsChatService.js";
import { friendId } from "../chatSidebarTemplateStore.js";
import { refreshDialog } from "../chatSidebarUtils.js";

export function handlePeerDialogOpen(msg: any) {
	if (friendId && msg.peerId === friendId) {
		const socket = getChatSocket();
		if (socket && socket.readyState === WebSocket.OPEN) {
			refreshDialog(friendId);
		}
	}
}