import { UserResponse } from "../constants/structs.js";

export async function getUser(): Promise<UserResponse | false> {
	try {
		const res = await fetch("/api/get/getUser", {
			method: "GET",
			credentials: "include",
		});

		const data :UserResponse = await res.json();

		return data
	} catch (err) {
		return false;
	}
}
