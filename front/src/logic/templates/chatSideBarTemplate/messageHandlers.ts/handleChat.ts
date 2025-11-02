import { currentId, friendId, friendStatus } from "../chatSidebarTemplateStore.js";
import { addMessageToChat } from "../chatSidebarUtils.js";

export function handleChat(msg: any) {
	const { friendId: userId, senderName: name, content } = msg;
	if (userId === currentId && friendId) {
		addMessageToChat(name, content, friendStatus);
	}
}