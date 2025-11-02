import { currentId, setCurrentId } from "../chatSidebarTemplateStore.js";

export function handleInit(msg: any) {
	setCurrentId(msg.senderId);
	console.log('🔌 WebSocket connected', currentId);
}