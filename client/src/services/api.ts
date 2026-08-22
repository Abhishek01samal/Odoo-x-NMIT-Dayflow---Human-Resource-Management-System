import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    if (
      error?.response?.status === 401 &&
      !originalRequest._retry // to avoid infinite loop
    ) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh-token");
        return api(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        window.location.href = "/sign-in";
      }
    } else if (
      error?.response?.status === 401 &&
      error?.response?.data?.message ===
        "Session expired. You logged in from another device."
    ) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
