import { navigateTo, View } from "../view/history_views.js";

export async function render_with_delay(View :View) {
	setTimeout(() => {
		navigateTo(View);
	}, 3000);
}
