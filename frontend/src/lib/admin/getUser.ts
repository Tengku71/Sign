import { API } from "$lib/types";

export const getUserById = async (token: string, id: number) => {
  try {
    const res = await fetch(`${API}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(data);
    if (!res.ok) return { success: false };
    return { success: true, data };
  } catch (err) {
    return { success: false };
  }
};
