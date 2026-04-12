import api from "./axiosInstance";

export const authApi = {
  // POST /api/auth/signup  { fullName, email, password }
  register: ({ fullName, email, password }) =>
    api.post("/api/auth/signup", { fullName, email, password }),

  // POST /api/auth/login  { email, password }
  login: (email, password) => api.post("/api/auth/login", { email, password }),

  // GET /api/auth/validate-email?email=
  validateEmail: (email) =>
    api.get("/api/auth/validate-email", { params: { email } }),

  // GET /api/auth/verify-email?token=
  verifyEmail: (token) =>
    api.get("/api/auth/verify-email", { params: { token } }),

  // POST /api/auth/resend-verification  { email }
  resendVerification: (email) =>
    api.post("/api/auth/resend-verification", { email }),

  // POST /api/auth/forgot-password  { email }
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),

  // POST /api/auth/reset-password  { token, newPassword }
  resetPassword: (token, newPassword) =>
    api.post("/api/auth/reset-password", { token, newPassword }),

  // POST /api/auth/change-password  { currentPassword, newPassword }  ← POST not PUT!
  changePassword: (currentPassword, newPassword) =>
    api.post("/api/auth/change-password", { currentPassword, newPassword }),

  // GET /api/auth/current-user  (auth required)
  getCurrentUser: () => api.get("/api/auth/current-user"),
};
