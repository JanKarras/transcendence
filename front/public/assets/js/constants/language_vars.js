export const AVAILABLE_LANGUAGES = [
    { code: "eng", label: "English", flag: "./assets/img/lang/gb-eng.webp" },
    { code: "ger", label: "Deutsch", flag: "./assets/img/lang/de.webp" },
    { code: "nig", label: "Nigerian", flag: "./assets/img/lang/de.webp" },
];
const playNowBtn = {
    ger: "Jetzt spielen",
    eng: "Play Now",
    nig: "Kwashe Ugbu a" // Assuming this is the Nigerian translation
};
export const lang = {
    playNowBtn,
};
export function t(obj, langCode) {
    return obj[langCode] || obj.eng;
}
