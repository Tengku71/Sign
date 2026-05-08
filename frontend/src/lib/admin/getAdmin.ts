import { authToken } from "$lib/stores";
import { API } from "$lib/types";
import { get } from "svelte/store";

export const getAdminProfile = async (token: string) => {
  try {
    const res = await fetch(`${API}/admin/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await res.json();

    if (!res.ok) {
      return { success: false, message: responseData.message || "Failed to fetch profile" };
    }

    return { success: true, data: responseData };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};

export const getAllUsers = async (token: string) => {
  try {
    const token = get(authToken);
    const res = await fetch(`${API}/admin/users`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const responseData = await res.json();
    if (!res.ok) return { success: false, message: "Failed to fetch users" };
    return { success: true, data: responseData };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};
