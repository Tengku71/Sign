import { API } from "$lib/types";

export const getAllModes = async () => {
  const res = await fetch(`${API}/kuis/modes`, { credentials: "include" });
  const data = await res.json();
  return res.ok ? { success: true, data } : { success: false };
};

export const createMode = async (name: string, timeLimit: number) => {
  const res = await fetch(`${API}/kuis/modes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, timeLimit }),
  });
  const data = await res.json();
  return res.ok ? { success: true } : { success: false, message: data.message };
};

export const updateMode = async (id: number, name: string, timeLimit: number) => {
  const res = await fetch(`${API}/kuis/modes/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, timeLimit }),
  });
  return res.ok ? { success: true } : { success: false };
};

export const getQuestions = async (modeId: number) => {
  const res = await fetch(`${API}/kuis/questions?modeId=${modeId}`, { credentials: "include" });
  const data = await res.json();
  return res.ok ? { success: true, data } : { success: false };
};

export const createQuestion = async (options: string[], modeId: number) => {
  const res = await fetch(`${API}/kuis/questions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ options, modeId }),
  });
  const data = await res.json();
  return res.ok ? { success: true } : { success: false, message: data.message };
};

export const updateQuestion = async (id: number, options: string[], modeId?: number) => {
  const payload: any = { options };
  if (modeId) payload.modeId = modeId;

  const res = await fetch(`${API}/kuis/questions/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return res.ok ? { success: true } : { success: false, message: data.message };
};

export const deleteQuestion = async (id: number) => {
  const res = await fetch(`${API}/kuis/questions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.ok ? { success: true } : { success: false };
};
