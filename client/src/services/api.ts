import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
  withCredentials: true,
});

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    if (error?.response?.status !== 401 || isPublicAuthEndpoint) {
      return Promise.reject(error);
    }

    if (
      error?.response?.data?.message ===
      "Session expired. You logged in from another device."
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      await api.post("/auth/refresh-token");
      return api(originalRequest);
    } catch (refreshError) {
      window.location.href = "/sign-in";
      return Promise.reject(refreshError);
    }
  }
);

export default api;


