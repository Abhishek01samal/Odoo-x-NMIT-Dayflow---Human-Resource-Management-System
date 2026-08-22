import { prisma } from "../lib/prisma.js";
import AsyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";

const todayDateOnly = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

/**
 * @route GET /api/v1/admin/dashboard
 * @description Admin/HR overview: employee counts, today's attendance snapshot, pending approvals
 * @access private (Admin/HR)
 */
const getAdminDashboard = AsyncHandler(async (req: any, res: any) => {
  const today = todayDateOnly();

  const [
    totalEmployees,
    activeEmployees,
    todayAttendance,
    pendingLeaves,
    recentPendingLeaves,
    draftPayrollCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: { date: today },
      _count: { _all: true },
    }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.payrollRecord.count({ where: { status: "DRAFT" } }),
  ]);

  const attendanceToday = {
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  };
  for (const row of todayAttendance) {
    if (row.status === "PRESENT") attendanceToday.present = row._count._all;
    if (row.status === "ABSENT") attendanceToday.absent = row._count._all;
    if (row.status === "HALF_DAY") attendanceToday.halfDay = row._count._all;
    if (row.status === "LEAVE") attendanceToday.leave = row._count._all;
  }
  const notMarked =
    totalEmployees -
    (attendanceToday.present +
      attendanceToday.absent +
      attendanceToday.halfDay +
      attendanceToday.leave);

  return res.status(200).json(
    new ApiResponse(200, "Admin dashboard fetched successfully", {
      totalEmployees,
      activeEmployees,
      attendanceToday: { ...attendanceToday, notMarked: Math.max(0, notMarked) },
      pendingLeaves,
      recentPendingLeaves,
      draftPayrollCount,
    })
  );
});

export { getAdminDashboard };