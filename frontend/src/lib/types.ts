export type User = {
  id: number;
  email: string;
  name: string;
  password: string;
  scores: number;
  level: number;
  isVerified: boolean;
  createdAt: string;
};

export type Admin = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export const API = import.meta.env.VITE_API_URL ?? "/api";
