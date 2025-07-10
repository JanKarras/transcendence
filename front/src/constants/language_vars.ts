import { trans } from "./structs.js";

const playNowBtn: trans = {
  ger: "Jetzt spielen",
  eng: "Play Now",
  nig: "Kwashe Ugbu a" // Assuming this is the Nigerian translation
};

export const lang = {
	playNowBtn,
};

export function t(obj: trans, langCode: string): string {
  return obj[langCode as keyof trans] || obj.eng;
}