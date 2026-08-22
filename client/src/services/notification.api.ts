import api from "./api";
import { miscMock } from "./mocks/org.mock";
import type { NotificationItem } from "@/types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const notificationApi = {
  getAll: async (): Promise<NotificationItem[]> => {
    if (USE_MOCKS) return miscMock.getNotifications();
    const res = await api.get("/notifications");
    return res.data?.data;
  },
  markRead: async (id: string): Promise<void> => {
    if (USE_MOCKS) return miscMock.markRead(id);
    await api.patch(`/notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    if (USE_MOCKS) return miscMock.markAllRead();
    await api.patch("/notifications/read-all");
  },
};


