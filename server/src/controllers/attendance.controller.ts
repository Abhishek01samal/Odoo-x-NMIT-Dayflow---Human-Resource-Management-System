import { prisma } from "../lib/prisma.js";
import logger from "../lib/logger.js";
import AsyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";
import type { AttendanceStatus } from "@prisma/client";
import { ensureLeaveBalance } from "../utils/hr-helper.js";

/** Truncate a Date to midnight UTC so it lines up with the @db.Date unique(userId, date) key */
const todayDateOnly = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

const roundToOneDecimal = (n: number) => Math.round(n * 10) / 10;

const toTodayAttendanceShape = (
  row: {
    checkInAt: Date | null;
    checkOutAt: Date | null;
    workedHours: number | null;
  } | null
) => {
  if (!row || !row.checkInAt) {
    return {
      status: "NOT_CHECKED_IN" as const,
      checkInTime: null,
      checkOutTime: null,
      workedHours: 0,
    };
  }
  return {
    status: (row.checkOutAt ? "CHECKED_OUT" : "CHECKED_IN") as
      | "CHECKED_IN"
      | "CHECKED_OUT",
    checkInTime: row.checkInAt.toISOString(),
    checkOutTime: row.checkOutAt ? row.checkOutAt.toISOString() : null,
    workedHours: row.workedHours ?? 0,
  };
};

/**
 * @route POST /api/v1/attendance/check-in
 * @description Employee checks in for today
 * @access private
 */
const checkIn = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  const date = todayDateOnly();

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: id, date } },
  });

  if (existing && existing.checkInAt) {
    throw new BadRequestError("Already checked in today");
  }

  const row = await prisma.attendance.upsert({
    where: { userId_date: { userId: id, date } },
    create: { userId: id, date, checkInAt: new Date(), status: "PRESENT" },
    update: { checkInAt: new Date(), status: "PRESENT" },
  });

  logger.info(`Check-in recorded for ${id} at ${row.checkInAt}`);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Checked in successfully",
        toTodayAttendanceShape(row)
      )
    );
});

/**
 * @route POST /api/v1/attendance/check-out
 * @description Employee checks out for today
 * @access private
 */
const checkOut = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  const date = todayDateOnly();

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: id, date } },
  });

  if (!existing || !existing.checkInAt) {
    throw new BadRequestError("You haven't checked in today");
  }
  if (existing.checkOutAt) {
    throw new BadRequestError("Already checked out today");
  }

  const checkOutAt = new Date();
  const workedHours = roundToOneDecimal(
    (checkOutAt.getTime() - existing.checkInAt.getTime()) / 3_600_000
  );
  const status: AttendanceStatus = workedHours < 4 ? "HALF_DAY" : "PRESENT";

  const row = await prisma.attendance.update({
    where: { userId_date: { userId: id, date } },
    data: { checkOutAt, workedHours, status },
  });

  logger.info(`Check-out recorded for ${id}, worked ${workedHours}h`);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Checked out successfully",
        toTodayAttendanceShape(row)
      )
    );
});

/**
 * @route GET /api/v1/attendance/my-dashboard
 * @description Aggregate stats + today's status + recent activity for the employee dashboard
 * @access private
 */
const getMyDashboard = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  const now = new Date();
  const year = now.getFullYear();
  const monthStart = new Date(Date.UTC(year, now.getMonth(), 1));
  const today = todayDateOnly();

  // working days = weekdays (Mon-Fri) from the 1st of the month through today
  let workingDays = 0;
  for (
    let d = new Date(monthStart);
    d.getTime() <= today.getTime();
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) workingDays += 1;
  }

  const [
    presentDays,
    todayRow,
    balance,
    activeSalary,
    pendingRequests,
    recentLeaves,
    recentPayroll,
    recentRegularized,
    profile,
  ] = await Promise.all([
    prisma.attendance.count({
      where: {
        userId: id,
        date: { gte: monthStart, lte: today },
        status: { in: ["PRESENT", "HALF_DAY"] },
      },
    }),
    prisma.attendance.findUnique({
      where: { userId_date: { userId: id, date: today } },
    }),
    ensureLeaveBalance(id, year),
    prisma.salaryStructure.findFirst({
      where: { userId: id, isActive: true },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.leaveRequest.count({ where: { userId: id, status: "PENDING" } }),
    prisma.leaveRequest.findMany({
      where: { userId: id, status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 2,
    }),
    prisma.payrollRecord.findFirst({
      where: { userId: id, status: { in: ["PROCESSED", "PAID"] } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.attendance.findFirst({
      where: { userId: id, regularizedById: { not: null } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.employeeProfile.findUnique({ where: { userId: id } }),
  ]);

  const leaveBalance =
    balance.paidTotal -
    balance.paidUsed +
    (balance.sickTotal - balance.sickUsed);

  const netSalary = activeSalary
    ? Number(activeSalary.basic) +
      Number(activeSalary.hra) +
      Number(activeSalary.allowances) -
      Number(activeSalary.deductions)
    : 0;

  const attendanceRate =
    workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

  const recentActivity: {
    id: string;
    type: "LEAVE" | "ATTENDANCE" | "PAYROLL" | "PROFILE";
    title: string;
    description: string;
    createdAt: string;
  }[] = [];

  for (const lr of recentLeaves) {
    recentActivity.push({
      id: `leave-${lr.id}`,
      type: "LEAVE",
      title:
        lr.status === "APPROVED"
          ? "Leave request approved"
          : "Leave request rejected",
      description: `${lr.type} Leave · ${lr.days} day(s)`,
      createdAt: (lr.reviewedAt ?? lr.updatedAt).toISOString(),
    });
  }

  if (recentPayroll) {
    recentActivity.push({
      id: `payroll-${recentPayroll.id}`,
      type: "PAYROLL",
      title: "Salary credited",
      description: `Payroll processed · ₹${Number(recentPayroll.finalPay).toLocaleString("en-IN")}`,
      createdAt: (
        recentPayroll.processedAt ?? recentPayroll.updatedAt
      ).toISOString(),
    });
  }

  if (recentRegularized) {
    recentActivity.push({
      id: `attendance-${recentRegularized.id}`,
      type: "ATTENDANCE",
      title: "Attendance regularized",
      description: `${recentRegularized.date.toISOString().slice(0, 10)} marked as ${recentRegularized.status}`,
      createdAt: recentRegularized.updatedAt.toISOString(),
    });
  }

  if (profile) {
    recentActivity.push({
      id: `profile-${profile.id}`,
      type: "PROFILE",
      title: "Profile updated",
      description: "Profile details changed successfully",
      createdAt: profile.updatedAt.toISOString(),
    });
  }

  recentActivity.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.status(200).json(
    new ApiResponse(200, "Dashboard fetched successfully", {
      stats: {
        presentDays,
        workingDays,
        attendanceRate,
        leaveBalance,
        netSalary,
        pendingRequests,
      },
      today: toTodayAttendanceShape(todayRow),
      recentActivity: recentActivity.slice(0, 5),
    })
  );
});

/**
 * @route GET /api/v1/attendance/me
 * @description Employee views own attendance history (daily/weekly view)
 * @access private
 * @query from, to (ISO dates)
 */
const getMyAttendance = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  const { from, to } = req.query;

  const now = new Date();
  const defaultFrom = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

  const rows = await prisma.attendance.findMany({
    where: {
      userId: id,
      date: {
        gte: from ? new Date(from) : defaultFrom,
        lte: to ? new Date(to) : todayDateOnly(),
      },
    },
    orderBy: { date: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Attendance fetched successfully", rows));
});

/**
 * @route GET /api/v1/attendance
 * @description Admin/HR views attendance of all employees, optionally filtered
 * @access private (Admin/HR)
 * @query userId, from, to, status
 */
const listAllAttendance = AsyncHandler(async (req: any, res: any) => {
  const { userId, from, to, status } = req.query;

  const rows = await prisma.attendance.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
    take: 200,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Attendance records fetched successfully", rows)
    );
});

/**
 * @route PATCH /api/v1/attendance/:id/regularize
 * @description Admin/HR corrects/regularizes an attendance entry
 * @access private (Admin/HR)
 */
const regularizeAttendance = AsyncHandler(async (req: any, res: any) => {
  const { id: attendanceId } = req.params;
  const { status, note, checkInAt, checkOutAt } = req.body;

  const existing = await prisma.attendance.findUnique({
    where: { id: attendanceId },
  });
  if (!existing) {
    throw new NotFoundError("Attendance record not found");
  }

  let workedHours = existing.workedHours;
  const nextCheckIn = checkInAt ? new Date(checkInAt) : existing.checkInAt;
  const nextCheckOut = checkOutAt ? new Date(checkOutAt) : existing.checkOutAt;
  if (nextCheckIn && nextCheckOut) {
    workedHours = roundToOneDecimal(
      (nextCheckOut.getTime() - nextCheckIn.getTime()) / 3_600_000
    );
  }

  const row = await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      status,
      note,
      checkInAt: nextCheckIn,
      checkOutAt: nextCheckOut,
      workedHours,
      regularizedById: req.user.id,
    },
  });

  logger.info(`Attendance ${attendanceId} regularized by ${req.user.id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, "Attendance regularized successfully", row));
});

export {
  checkIn,
  checkOut,
  getMyDashboard,
  getMyAttendance,
  listAllAttendance,
  regularizeAttendance,
};
