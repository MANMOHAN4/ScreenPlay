import api from "./axiosInstance";

const BASE = "http://localhost:8080";

export const fileApi = {
  uploadVideo: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/api/files/upload/video", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/api/files/upload/image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const imageUrl = (uuid, token) => {
  if (!uuid || !token) return null;
  if (uuid.startsWith("http")) return uuid; // ← already a full URL, use as-is
  return `${BASE}/api/files/image/${uuid}?token=${token}`;
};

export const videoUrl = (uuid, token) => {
  if (!uuid || !token) return null;
  if (uuid.startsWith("http")) return uuid; // ← already a full URL, use as-is
  return `${BASE}/api/files/video/${uuid}?token=${token}`;
};
