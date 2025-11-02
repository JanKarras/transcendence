import { setChatEventlistenersForSocket } from "../../../events/templates/chatSideBarTemplate.js";
import { connectChat } from "../../../websocket/wsChatService.js";
import { friendId } from "./chatSidebarTemplateStore.js";
import { refreshFriendsList, sendChatWsMsg } from "./chatSidebarUtils.js";

export async function chatTemplate() {
	const socket = await connectChat();

	if (!socket) {
		return;
	}

	await setChatEventlistenersForSocket();

	sendChatWsMsg('dialog_open', { friendId, content: "4"})

	refreshFriendsList()
}

