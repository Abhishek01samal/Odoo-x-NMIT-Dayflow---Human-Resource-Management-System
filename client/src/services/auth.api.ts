import api from "./api";
import { authMock } from "./mocks/auth.mock";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string };

// Mock-aware auth calls — demo mode resolves against seeded accounts,
// otherwise they hit the real backend.
export const loginRequest = async (payload: LoginPayload) => {
  if (DEMO_MODE) return authMock.login(payload);
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const registerRequest = async (payload: RegisterPayload) => {
  if (DEMO_MODE) return authMock.register(payload);
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const logoutRequest = async () => {
  if (DEMO_MODE) return authMock.logout();
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getProfileRequest = async () => {
  if (DEMO_MODE) return authMock.getProfile();
  const res = await api.get("/users/profile");
  return res.data;
};

// Default export stays the raw axios instance — other pages depend on it
export default api;


