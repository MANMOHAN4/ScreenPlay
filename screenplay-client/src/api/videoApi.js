import api from "./axiosInstance";

export const videoApi = {
  // User
  getPublished: (page = 0, size = 10, search = "") =>
    api.get("/api/videos/published", {
      params: { page, size, ...(search ? { search } : {}) },
    }),

  getFeatured: () => api.get("/api/videos/featured"),

  // Admin
  getAdminVideos: (page = 0, size = 10, search = "") =>
    api.get("/api/videos/admin", {
      params: { page, size, ...(search ? { search } : {}) },
    }),

  getAdminStats: () => api.get("/api/videos/admin/stats"),

  createVideo: (data) => api.post("/api/videos/admin", data),

  updateVideo: (id, data) => api.put(`/api/videos/admin/${id}`, data),

  deleteVideo: (id) => api.delete(`/api/videos/admin/${id}`),

  togglePublish: (id, value) =>
    api.patch(`/api/videos/admin/${id}/publish`, null, { params: { value } }),
};
