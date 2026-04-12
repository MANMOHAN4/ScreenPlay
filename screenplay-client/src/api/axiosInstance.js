import axios from "axios";

const TOKEN_KEY = "sp_token";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor ───────────────────────────────────────────
// Attaches token from localStorage as fallback (covers the case where
// axiosInstance is imported before AuthContext has run its useEffect)
api.interceptors.request.use(
  (config) => {
    if (!config.headers["Authorization"]) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────
// On 401 (expired / invalid token) → auto-logout and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ["/", "/login", "/signup"];
      const isPublic = publicPaths.includes(window.location.pathname);

      // Clear stale auth data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("sp_user");
      delete api.defaults.headers.common["Authorization"];

      // Redirect only if on a protected page
      if (!isPublic) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
