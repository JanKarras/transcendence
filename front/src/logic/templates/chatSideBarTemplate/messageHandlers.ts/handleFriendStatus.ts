import { friendElById, friends } from "../chatSidebarTemplateStore.js";

export function handleFriendStatus(msg: any) {
	console.log("handleFriendStatus called")
	const key = String(msg.userId);
	console.log("Key:" , key, "friendElById", friendElById.get(key))
	const li = friendElById.get(key);
	const friend = friends.find(f => f.id === msg.userId);
	if (!li) {
		console.log("li not found");
		return;
	}

	const avatarWrapper = li.querySelector<HTMLDivElement>('.relative');
	if (!avatarWrapper) {
		console.log("Can't find avatarWrapper");
		return
	}
	const statusDot = avatarWrapper.querySelector<HTMLSpanElement>('span');

	if (!statusDot){
		console.log("Can't find statusDot");
		return;
	}

	const online = Number(msg.status);

	if (friend) friend.online = online === 1;

	statusDot.className = `w-3 h-3 rounded-full border-2 border-[#0f0f2a] absolute bottom-0 right-0 ${
		online === 1 ? 'bg-green-400' : 'bg-green-900'
	}`;
}
