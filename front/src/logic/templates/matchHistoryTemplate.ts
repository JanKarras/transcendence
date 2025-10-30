import { t } from "../gloabal/initTranslations.js";

export async function getMatchHistoryHTML(matches: any[]) {
	const formatMatchType = (type: string) => {
		switch(type) {
			case "1v1_local": return t('matchType1v1Local');
			case "1v1_remote": return t('matchType1v1Remote');
			case "tournament": return t('matchTypeTournament');
			default: return type;
		}
	};
	return (`
		<div class="text-white p-4 bg-[#2c2c58] rounded-lg shadow-md h-full">
			<h2 class="text-xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent mb-4">${t('matchHistoryTitle')}</h2>
			<div class="space-y-4">
				${matches.slice().reverse().map(match => `
					<div class="p-3 rounded ${match.match_type === 'tournament' ? `bg-gradient-to-r from-[#8e00a8] to-[#7c0bac] border border-gray-200 rounded-lg shadow-[0_0_10px_#174de1] dark:border-gray-700` :
						`bg-gradient-to-r from-[#07ae2d] to-[#0d6500] border border-gray-200 rounded-lg shadow-[0_0_10px_#b01ae2] dark:border-gray-700`} ">
						<p class="font-medium">
							<strong>${formatMatchType(match.match_type)}</strong>
							${match.tournament_name ? `- ${match.tournament_name} (${t('round')} ${match.round})` : ''}
						</p>
						<p class="text-sm text-gray-300 mb-2">${match.match_date}</p>
						<ul class="pl-4 list-disc">
							${match.players.map((p: any) => `
								<li>${p.username} - ${t('score')}: ${p.score} ${p.rank === 1 ? t('trophy') : ''}</li>
							`).join('')}
						</ul>
					</div>
				`).join('')}
			</div>
		</div>
	`)
}
