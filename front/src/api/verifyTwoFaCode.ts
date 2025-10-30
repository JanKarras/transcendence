import { VerifyTwoFaResponse } from "../constants/structs.js";

export async function verifyTwoFaCode(code: string): Promise<VerifyTwoFaResponse> {
	try {
		const res = await fetch("/api/set/verifyTwoFaCode", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code }),
		});

		if (!res.ok) {
			return { success: false, error: `Server returned ${res.status}` };
		}

		const data = (await res.json()) as VerifyTwoFaResponse;
		return data;
	} catch (err: any) {
		return { success: false, error: "Network or server error" };
	}
}
