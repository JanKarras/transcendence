import { friendElById, friends } from "../chatSidebarTemplateStore.js";

export function handleFriendStatus(msg: any) {
	const key = String(msg.userId);
	const li = friendElById.get(key);
	const friend = friends.find(f => f.id === msg.userId);

	if (!li) return;

	const avatarWrapper = li.querySelector<HTMLDivElement>('.relative');
	if (!avatarWrapper) return;

	const statusDot = avatarWrapper.querySelector<HTMLSpanElement>('span');
	if (!statusDot) return;

	const online = Number(msg.status);

	if (friend) friend.online = online === 1;

	statusDot.className = `w-3 h-3 rounded-full border-2 border-[#0f0f2a] absolute bottom-0 right-0 ${
		online === 1 ? 'bg-green-400' : 'bg-green-900'
	}`;
}