import { goto } from "$app/navigation";
import { API } from "$lib/types";

export const logoutAdmin = async () => {
  try {
    const res = await fetch(`${API}/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    goto("/admin/login");
    if (!res.ok) return { success: false };
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};
