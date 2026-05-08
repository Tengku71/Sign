import { API } from "$lib/types";

export const deleteUser = async (token: string, id: number) => {
  try {
    const res = await fetch(`${API}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || "Failed to delete" };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};
