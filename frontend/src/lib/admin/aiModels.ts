import { API } from "$lib/types";

export const uploadModel = async (
  name: string,
  version: string,
  inputWidth: number,
  inputHeight: number,
  normalizeMean: number,
  normalizeStd: number,
  scoreThreshold: number,
  isActive: boolean,
  modelFile?: File | null,
  labelsFile?: File | null,
) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("version", version);
  formData.append("inputWidth", String(inputWidth));
  formData.append("inputHeight", String(inputHeight));
  formData.append("normalizeMean", String(normalizeMean));
  formData.append("normalizeStd", String(normalizeStd));
  formData.append("scoreThreshold", String(scoreThreshold));
  formData.append("isActive", String(isActive));
  if (modelFile) formData.append("model", modelFile);
  if (labelsFile) formData.append("labels", labelsFile);

  try {
    const res = await fetch(`${API}/admin/models`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || "Upload failed" };
    return { success: true, data };
  } catch {
    return { success: false, message: "Cannot connect to backend." };
  }
};

export const getAllModels = async () => {
  try {
    const res = await fetch(`${API}/admin/models`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { success: false };
    return { success: true, data };
  } catch {
    return { success: false };
  }
};

export const updateModel = async (
  id: number,
  fields: {
    name?: string;
    version?: string;
    inputWidth?: number;
    inputHeight?: number;
    normalizeMean?: number;
    normalizeStd?: number;
    scoreThreshold?: number;
    isActive?: boolean;
  },
) => {
  try {
    const res = await fetch(`${API}/admin/models/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || "Update failed" };
    return { success: true, data };
  } catch {
    return { success: false, message: "Cannot connect to backend." };
  }
};

export const activateModel = async (id: number) => {
  return updateModel(id, { isActive: true });
};

export const deleteModel = async (id: number) => {
  try {
    const res = await fetch(`${API}/admin/models/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };
    return { success: true };
  } catch {
    return { success: false, message: "Cannot connect to backend." };
  }
};
