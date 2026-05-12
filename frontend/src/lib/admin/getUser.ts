import { API } from "$lib/types";

export const getUserById = async (id: number) => {
  try {
    const res = await fetch(`${API}/admin/users/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    console.log(data);
    if (!res.ok) return { success: false };
    return { success: true, data };
  } catch (err) {
    return { success: false };
  }
};
