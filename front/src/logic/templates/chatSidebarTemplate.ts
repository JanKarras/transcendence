import { t } from "../gloabal/initTranslations.js";

export async function getChatSidebarHTML(selectedFriend: string | null, friends: any[] = []) {
	return `
		<div class="flex flex-col h-full gap-3 p-4 bg-[#2c2c58] rounded-lg shadow-md ">
			<!-- Top spacing -->
			<div class="mb-2"></div>

			<!-- Selected Friend -->
			<div class="flex justify-between items-center mb-0">
				<div id="chatHeader" class="text-xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent p-0 rounded mb-0">
					${selectedFriend || t('selectChatPartner')}
				</div>
				<div id="chatControls" class="flex gap-2"></div>
			</div>

			<!-- Chat Messages -->
			<div id="chatMessages" class="overflow-y-auto p-3 bg-gradient-to-r from-[#8e00a8] to-[#7c0bac] rounded-lg shadow-[0_0_10px_#174de1] mb-2 min-h-[10rem] max-h-[300px]">
				<!-- Messages will be injected here -->
			</div>

			<!-- Input -->
			<div class="flex gap-2 mb-2">
				<textarea id="chatInput"
					placeholder="${t('enterMessage')}"
					class="flex-1 p-2 rounded-lg border border-gray-200 bg-[#2c2c58] text-white focus:outline-none focus:ring-2 focus:ring-[#174de1] resize-none overflow-y-auto"
					rows="1"

				></textarea>
				<button id="sendBtn"
					class="px-3 py-2 rounded-lg bg-[#5656aa] text-white hover:bg-[#7878cc] transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
					<img class="h-6 w-6" src="./assets/img/send-32.png" alt="Send" />
				</button>
			</div>

			<!-- Friends List -->
			<div class="overflow-y-auto max-h-[200px]">
				<h3 class="text-white font-bold text-lg mb-2">${t('friends')}</h3>
				<ul id="friendsList" class="list-none p-0 space-y-1">
					${friends.map(f => `<li class="p-1 text-white cursor-pointer hover:bg-[#3a3a7a] rounded">${f.username}</li>`).join('')}
				</ul>
			</div>
		</div>
	`;
}
