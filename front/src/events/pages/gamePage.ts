import { currentMode, startLocalGame, startRemoteGame } from "../../logic/pages/gamePage.js";
import { navigateTo } from "../../router/navigateTo.js";



export function setGameEventListeners(username : string | null | undefined, params: URLSearchParams | null): void {
	const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null;
	const ctx = canvas?.getContext("2d");
	if (!ctx) return;

	const usernameModal = document.getElementById("usernameModal") as HTMLElement | null;
	const usernameInput = document.getElementById("usernameInput") as HTMLInputElement | null;
	const submitUsernameBtn = document.getElementById("submitUsernameBtn") as HTMLButtonElement | null;
	const cancelUsernameBtn = document.getElementById("cancelUsernameBtn") as HTMLButtonElement | null;

	const handleUserNameSubmit = async () => {
		const enteredName = usernameInput?.value.trim();
		if (enteredName) {
			usernameModal?.classList.add("hidden");
			username = enteredName;
			await startLocalGame(username, ctx);
		} else {
			alert("Please enter a username!");
		}
	}

	submitUsernameBtn?.addEventListener("click", handleUserNameSubmit);

	usernameInput?.focus();

	usernameInput?.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			handleUserNameSubmit();
		}
	});

	cancelUsernameBtn?.addEventListener("click", () => navigateTo("dashboard"));

	if (currentMode === "remote") {
		console.log("remotgame started", params)
		startRemoteGame(ctx, params);
	} else if (username) {
		startLocalGame(username, ctx);
	}
}
