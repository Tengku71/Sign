import { API } from "$lib/types";

export const getAdminProfile = async () => {
  try {
    const res = await fetch(`${API}/admin/me`, {
      method: "GET",
      credentials: "include",
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

export const getAllUsers = async () => {
  try {
    const res = await fetch(`${API}/admin/users`, {
      method: "GET",
      credentials: "include",
    });
    const responseData = await res.json();
    if (!res.ok) return { success: false, message: "Failed to fetch users" };
    return { success: true, data: responseData };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};
