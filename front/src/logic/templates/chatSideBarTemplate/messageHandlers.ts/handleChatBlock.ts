import { getChatSocket } from "../../../../websocket/wsChatService.js";
import { t } from "../../../gloabal/initTranslations.js";
import { currentId, friendId } from "../chatSidebarTemplateStore.js";
import { addDisappearMessage, refreshDialog, retryMessage } from "../chatSidebarUtils.js";

export function handleChatBlock(msg: any) {
	const { friendId: userId, senderName: name, content } = msg;
	if (content === 'unblock' && friendId) {
		refreshDialog(friendId);
		return;
	}

	if (content === 'block' && userId === currentId) {
		const newContent = t('cht.blockedYou');
		const socket = getChatSocket();
		if (socket && socket.readyState === WebSocket.OPEN) {
			const chat = document.getElementById('chatMessages') as HTMLElement;
			chat.innerHTML = '';
			addDisappearMessage(name + ': ' + newContent);
		} else {
			console.warn('❌ WebSocket not connected, trying to reconnect...');
			retryMessage(friendId, newContent);
		}
	}
}
