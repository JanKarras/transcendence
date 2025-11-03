import { navigateTo } from "../../router/navigateTo.js";
import { View } from "../../router/routerStore.js";

export async function renderWithDelay(View :View) {
	setTimeout(() => {
		navigateTo(View);
	}, 3000);
}
