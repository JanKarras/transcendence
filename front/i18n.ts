import { LANGUAGE } from "./src/constants/gloabal.js";
import eng from "../locales/en.json";
// import fr from "../locales/fr/translation.json";

const translations: Record<string, any> = { eng };

// export function t(key: string): string {
//     const keys = key.split(".");
//     let value: any = translations[currentLang];
//     for (const k of keys) {
//         value = value[k];
//         if (!value) return key; // fallback
//     }
//     return value;
// }

export function t(keyOrObj: any): string {
    // If someone still passes the old { eng: "...", fr: "..." } object
    if (typeof keyOrObj === "object") {
        return keyOrObj[LANGUAGE as keyof typeof keyOrObj] || keyOrObj.eng;
    }

    // New style: string key ("login.title")
    if (typeof keyOrObj === "string") {
        const dict = translations[LANGUAGE] || translations["eng"];
        const keys = keyOrObj.split(".");

        let value: any = dict;
        for (const k of keys) {
            value = value?.[k];
            if (!value) break;
        }

        return value || keyOrObj; // fallback: return the key itself
    }

    return String(keyOrObj);
}
