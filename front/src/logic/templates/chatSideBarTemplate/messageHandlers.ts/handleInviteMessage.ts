import { renderInviteButtons } from "../../../../render/templates/renderChatSideBar.js";
import { navigateTo } from "../../../../router/navigateTo.js";
import { currentId, friendId } from "../chatSidebarTemplateStore.js";

export function handleInviteMessage(msg: any) {
	const { friendId: userId, content } = msg;
	if (content === 'delete' && friendId) {
		const inviteMode = document.getElementById("inviteModeModal");
		const inviteModeCancel = document.getElementById("inviteModeModalCancel");
		inviteModeCancel?.classList.add("hidden");
		inviteMode?.classList.add("hidden");
		return;
	}
	if (content === 'accept'){

		const p = new URLSearchParams();
		p.set("mode", "remote");
		p.set("via", "invite");
		const inviteModeCancel = document.getElementById("inviteModeModalCancel");
		inviteModeCancel?.classList.add("hidden");
		navigateTo("game", p);

	}
	if (userId === currentId && content === 'sent') {
		renderInviteButtons(0);
	}
}
