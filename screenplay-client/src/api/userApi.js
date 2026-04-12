import axiosInstance from "./axiosInstance";

export const userApi = {
  createUser: (data) => axiosInstance.post("/api/users", data),

  getAllUsers: (page = 0, size = 10, search = "") =>
    axiosInstance.get("/api/users", { params: { page, size, search } }),

  updateUser: (id, data) => axiosInstance.put(`/api/users/${id}`, data),

  deleteUser: (id) => axiosInstance.delete(`/api/users/${id}`),

  toggleUserStatus: (id) => axiosInstance.put(`/api/users/${id}/toggle-status`),

  changeUserRole: (id, role) =>
    axiosInstance.put(`/api/users/${id}/change-role`, { role }),
};
