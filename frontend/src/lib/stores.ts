import { writable } from "svelte/store";
import type { Admin, User } from "./types";

export const refreshUsers = writable(0);
export const usersStore = writable<User[]>([]);
export const adminStore = writable<Admin[]>([]);
