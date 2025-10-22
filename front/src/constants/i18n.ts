import { LANGUAGE } from "./gloabal.js";
// import eng from "../locales/en.json"
// import fr from "../locales/fr.json"
// import de from "../locales/de.json"
// import ua from "../locales/ua.json"
// import bel from "../locales/bel.json"
// import nig from "../locales/nig.json"

const translations: Record<string, any> = {};

export async function initTranslations() {
    if (!translations[LANGUAGE]) {
        const res = await fetch(`./locales/${LANGUAGE}.json`);
		if (!res.ok) {
			console.warn(`Could not load translations for language: ${LANGUAGE}, falling back to English.`);
			const fallbackRes = await fetch(`./locales/eng.json`);
			translations["eng"] = await fallbackRes.json();
			return;
		}
        // const res = await fetch(`/assets/js/locales/${LANGUAGE}.json`);
        translations[LANGUAGE] = await res.json();
    }
}

// const translations: Record<string, any> = { eng, fr, de, ua, bel, nig };

export function t(keyOrObj: any): string {
    // If someone still passes the old { eng: "...", fr: "..." } object
    if (typeof keyOrObj === "object") {
        console.log('object');
        return keyOrObj[LANGUAGE as keyof typeof keyOrObj] || keyOrObj.eng;
    }

    // New style: string key ("login.title")
    if (typeof keyOrObj === "string") {
        const dict = translations[LANGUAGE] || translations["eng"];
        const keys = keyOrObj.split(".");

        // console.log(translations);
        // console.log(dict);
        let value: any = dict;
        for (const k of keys) {
            // console.log(value);
            value = value?.[k];
            // console.log(value);
            if (!value) break;
        }

        return value || keyOrObj;
    }

    return String(keyOrObj);
}
