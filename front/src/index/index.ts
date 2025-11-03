import { checkLoginAndNavigate } from "../logic/global/checkLoginAndNavigate.js";
import { initRouter } from "../router/initRouter.js";

document.addEventListener("DOMContentLoaded", () => {
	initRouter();
	checkLoginAndNavigate()
})


