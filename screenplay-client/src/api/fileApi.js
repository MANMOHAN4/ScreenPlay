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

// Backend reads ?token= for <img> and <video> tags (JwtAuthenticationFilter)
export const imageUrl = (uuid, token) =>
  uuid && token ? `${BASE}/api/files/image/${uuid}?token=${token}` : null;

export const videoUrl = (uuid, token) =>
  uuid && token ? `${BASE}/api/files/video/${uuid}?token=${token}` : null;
