import { LANGUAGE } from "./global.js";

const translations: Record<string, any> = {};

export async function initTranslations() {
	if (!translations[LANGUAGE]) {
		const res = await fetch(`/locales/${LANGUAGE}.json`);
		if (!res.ok) {
			console.warn(`Could not load translations for language: ${LANGUAGE}, falling back to English.`);
			const fallbackRes = await fetch(`./locales/eng.json`);
			translations["eng"] = await fallbackRes.json();
			return;
		}
		translations[LANGUAGE] = await res.json();
	}
}


export function t(keyOrObj: any): string {
	if (typeof keyOrObj === "object") {
		return keyOrObj[LANGUAGE as keyof typeof keyOrObj] || keyOrObj.eng;
	}

	if (typeof keyOrObj === "string") {
		const dict = translations[LANGUAGE] || translations["eng"];
		const keys = keyOrObj.split(".");

		let value: any = dict;
		for (const k of keys) {
			value = value?.[k];
			if (!value) break;
		}

		return value || keyOrObj;
	}

	return String(keyOrObj);
}
