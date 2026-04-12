import api from "./axiosInstance";

export const watchlistApi = {
  getWatchlist: (page = 0, size = 10, search = "") =>
    api.get("/api/watchlist", {
      params: { page, size, ...(search ? { search } : {}) },
    }),

  addToWatchlist: (videoId) => api.post(`/api/watchlist/${videoId}`),

  removeFromWatchlist: (videoId) => api.delete(`/api/watchlist/${videoId}`),
};
