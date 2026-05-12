import { API } from "$lib/types";

export const createUser = async (data: { email: string; name: string; password: string; isVerified: boolean }) => {
  try {
    const res = await fetch(`${API}/admin/users`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
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
