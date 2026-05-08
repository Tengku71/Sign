import { API } from "$lib/types";

export const updateUser = async (token: string, id: number, data: any) => {
  try {
    const res = await fetch(`${API}/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!res.ok) return { success: false, message: responseData.message || "Update failed" };
    return { success: true, data: responseData };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};
