import { checkLoginAndNavigate } from "../logic/gloabal/checkLoginAndNavigate.js";
import { initRouter } from "../router/initRouter.js";

document.addEventListener("DOMContentLoaded", () => {
	initRouter();
	checkLoginAndNavigate()
})


