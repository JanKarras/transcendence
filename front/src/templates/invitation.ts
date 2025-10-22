import { initTranslations, t } from "../constants/i18n.js";

export function renderInvitation(mode : "1v1" | "tournament", username : string) {
	return `
		<!-- Invitation Modal -->
		<div id="invitationModal" class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 hidden">
			<div class="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 text-center">
				<h4 class="text-2xl font-bold text-white">Invitation</h4>
				<p class="text-white">
					${username} invited you to a 
					${mode === '1v1' ? "1 v 1 remote game" : "tournament"}.
					Do you want to accept the invitation?
				</p>
				<div class="flex gap-6 mt-4">
					<button id="acceptInvitationBtn" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
						Accept
					</button>
					<button id="refuseInvitationBtn" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
						Refuse
					</button>
				</div>
			</div>
		</div>`
}
