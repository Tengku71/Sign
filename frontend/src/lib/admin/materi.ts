import { API } from "$lib/types";

export const createFolder = async (name: string) => {
  const res = await fetch(`${API}/folders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.message };
  return { success: true, data };
};

export const getAllFolders = async () => {
  const res = await fetch(`${API}/folders`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) return { success: false };
  return { success: true, data };
};

export const deleteFolder = async (id: number) => {
  const res = await fetch(`${API}/folders/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.message };
  return { success: true };
};

export const uploadMateri = async (label: string, file: File, folderId?: number | null, folderName?: string | null) => {
  const formData = new FormData();
  formData.append("label", label);
  if (folderId) formData.append("folderId", String(folderId));
  if (folderName) formData.append("folderName", folderName);
  formData.append("video", file);

  try {
    const res = await fetch(`${API}/materi`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || "Upload failed" };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: "Cannot connect to backend." };
  }
};

export const uploadMateriBulk = async (label: string, files: File[], folderId?: number | null, folderName?: string | null) => {
  const results = await Promise.allSettled(files.map((file) => uploadMateri(label, file, folderId, folderName)));

  const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success));

  if (failed.length === 0) return { success: true };
  if (failed.length === files.length) return { success: false, message: "All uploads failed" };
  return { success: true, message: `${failed.length} of ${files.length} files failed` };
};

export const getAllMateri = async (page: number, limit: number, folderId?: number | null, search?: string, sort?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (folderId) params.set("folderId", String(folderId));
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);

  try {
    const res = await fetch(`${API}/materi?${params}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { success: false };
    return { success: true, data: data.data, meta: data.meta };
  } catch {
    return { success: false };
  }
};

export const deleteMateri = async (id: number) => {
  try {
    const res = await fetch(`${API}/materi/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { success: false };
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};
