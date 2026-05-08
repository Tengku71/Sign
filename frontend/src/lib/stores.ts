import { writable } from "svelte/store";
import { browser } from "$app/environment";
import type { User } from "./types";

export const regToken = writable<string | null>(null);

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getInitialToken(key: string): string | null {
  if (browser) {
    const token = localStorage.getItem(key);
    if (token && isTokenExpired(token)) {
      localStorage.removeItem(key);
      return null;
    }
    return token;
  }
  return null;
}

export const authToken = writable<string | null>(getInitialToken("auth_token"));

authToken.subscribe((value) => {
  if (browser) {
    if (value) {
      localStorage.setItem("auth_token", value);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
});

export const refreshUsers = writable(0);
export const usersStore = writable<User[]>([]);
