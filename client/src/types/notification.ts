export type NotificationType =
  | "INFO"
  | "LEAVE_UPDATE"
  | "PAYROLL"
  | "ATTENDANCE"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}


