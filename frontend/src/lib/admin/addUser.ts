import { authToken } from "$lib/stores";
import { API } from "$lib/types";
import { get } from "svelte/store";

export const createUser = async (token: string, data: { email: string; name: string; password: string; isVerified: boolean }) => {
  try {
    const token = get(authToken);
    const res = await fetch(`${API}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!res.ok) return { success: false, message: responseData.message || "Failed to create user" };
    return { success: true, data: responseData };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};
