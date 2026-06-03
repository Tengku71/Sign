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

export type AIModel = {
  id: number;
  name: string;
  version: string;

  modelPath: string;
  labelsPath: string | null;

  inputWidth: number;
  inputHeight: number;

  normalizeMean: number;
  normalizeStd: number;

  scoreThreshold: number;

  isActive: boolean;

  createdAt: string;
};

export const API = import.meta.env.VITE_API_URL ?? "/api";
