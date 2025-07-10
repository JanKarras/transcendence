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
