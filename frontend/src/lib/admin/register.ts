import { API } from "$lib/types";

export const verifyCode = async (code: string) => {
  try {
    const res = await fetch(`${API}/admin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Invalid code" };
    }

    return { success: true, ...data };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend. Is it running?" };
  }
};

export const registerAdmin = async (token: string, data: any) => {
  try {
    const res = await fetch(`${API}/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
      return { success: false, message: responseData.message || "Registration failed" };
    }

    return { success: true, ...responseData };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend. Is it running?" };
  }
};
