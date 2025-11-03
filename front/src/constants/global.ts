export let LANGUAGE = localStorage.getItem("lang") || "eng";

export function setLanguage(code: string) {
	localStorage.setItem("lang", code);
	LANGUAGE = code;
}

export function getLanguage() {
	return localStorage.getItem("lang") || "eng";
}
