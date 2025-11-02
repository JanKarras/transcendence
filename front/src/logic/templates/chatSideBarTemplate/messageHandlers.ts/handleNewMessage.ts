import { currentId, friendBadgeById } from "../chatSidebarTemplateStore.js";

export function handleNewMessage(msg: any) {
	const key = String(msg.userId);
	const badge = friendBadgeById.get(key);
	if (!badge || msg.friendId !== currentId) return;
	const has_unread = Number(msg.status);
	badge.textContent = has_unread ? ' 📩' : '';
}