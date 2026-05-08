import { goto } from "$app/navigation";
import { authToken } from "$lib/stores";

export const logoutAdmin = async () => {
  try {
    await fetch("/admin/logout", { method: "POST" });
  } catch (e) {
    console.error("Logout error:", e);
  }

  authToken.set(null);

  goto("/admin/login");
};
