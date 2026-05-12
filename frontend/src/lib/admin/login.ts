import { API } from "$lib/types";

export const loginAdmin = async (data: { email: string; password: string }) => {
  try {
    const res = await fetch(`${API}/admin/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
      return { success: false, message: responseData.message || "Login failed" };
    }

    return { success: true, ...responseData };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};
