export let LANGUAGE = localStorage.getItem("lang") || "eng";
export function setLanguage(code) {
    localStorage.setItem("lang", code);
    LANGUAGE = code;
}
