import { prisma } from "../lib/prisma.js";
import logger from "../lib/logger.js";
import AsyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";
import { ensureLeaveBalance } from "../utils/hr-helper.js";

const MS_PER_DAY = 86_400_000;

const dateOnly = (d: Date | string) => {
  const date = new Date(d);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

const countDaysInclusive = (start: Date, end: Date) =>
  Math.round((dateOnly(end).getTime() - dateOnly(start).getTime()) / MS_PER_DAY) + 1;

/**
 * @route POST /api/v1/leave
 * @description Employee applies for leave
 * @access private
 */
const applyLeave = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  const { type, startDate, endDate, reason } = req.body;

  const start = dateOnly(startDate);
  const end = dateOnly(endDate);
  const days = countDaysInclusive(start, end);

  if (days <= 0) {
    throw new BadRequestError("Invalid date range");
  }

  // overlap check against pending/approved requests
  const overlapping = await prisma.leaveRequest.findFirst({
    where: {
      userId: id,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });
  if (overlapping) {
    throw new BadRequestError(
      "You already have a leave request overlapping these dates"
    );
  }

  if (type === "PAID" || type === "SICK") {
    const balance = await ensureLeaveBalance(id, start.getFullYear());
    const remaining =
      type === "PAID"
        ? balance.paidTotal - balance.paidUsed
        : balance.sickTotal - balance.sickUsed;
    if (days > remaining) {
      throw new BadRequestError(
        `Insufficient ${type.toLowerCase()} leave balance (${remaining} day(s) remaining)`
      );
    }
  }

  const leave = await prisma.leaveRequest.create({
    data: { userId: id, type, startDate: start, endDate: end, days, reason },
  });

  logger.info(`Leave request ${leave.id} created by ${id}`);

  return res
    .status(201)
    .json(new ApiResponse(201, "Leave request submitted successfully", leave));
});

/**
 * @route GET /api/v1/leave/me
 * @description Employee views own leave requests
 * @access private
 */
const getMyLeaves = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  const { status } = req.query;

  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: id, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Leave requests fetched successfully", leaves));
});

/**
 * @route GET /api/v1/leave/balance
 * @description Employee's leave balance for the current year
 * @access private
 */
const getMyLeaveBalance = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  const balance = await ensureLeaveBalance(id, new Date().getFullYear());

  return res
    .status(200)
    .json(new ApiResponse(200, "Leave balance fetched successfully", balance));
});

/**
 * @route GET /api/v1/leave
 * @description Admin/HR views all leave requests, optionally filtered by status/user
 * @access private (Admin/HR)
 */
const listAllLeaves = AsyncHandler(async (req: any, res: any) => {
  const { status, userId } = req.query;

  const leaves = await prisma.leaveRequest.findMany({
    where: { ...(status ? { status } : {}), ...(userId ? { userId } : {}) },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Leave requests fetched successfully", leaves));
});

/**
 * @route PATCH /api/v1/leave/:id/review
 * @description Admin/HR approves or rejects a leave request
 * @access private (Admin/HR)
 */
const reviewLeave = AsyncHandler(async (req: any, res: any) => {
  const { id: leaveId } = req.params;
  const { status, reviewComment } = req.body;
  const reviewerId = req.user.id;

  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
  if (!leave) {
    throw new NotFoundError("Leave request not found");
  }
  if (leave.status !== "PENDING") {
    throw new BadRequestError("This leave request has already been reviewed");
  }

  if (status === "APPROVED") {
    await prisma.$transaction(async (tx) => {
      // re-validate balance at approval time to guard against concurrent approvals
      if (leave.type === "PAID" || leave.type === "SICK") {
        const balance = await ensureLeaveBalance(
          leave.userId,
          leave.startDate.getFullYear()
        );
        const remaining =
          leave.type === "PAID"
            ? balance.paidTotal - balance.paidUsed
            : balance.sickTotal - balance.sickUsed;
        if (leave.days > remaining) {
          throw new BadRequestError(
            `Employee no longer has sufficient ${leave.type.toLowerCase()} balance`
          );
        }
        await tx.leaveBalance.update({
          where: { userId_year: { userId: leave.userId, year: leave.startDate.getFullYear() } },
          data:
            leave.type === "PAID"
              ? { paidUsed: { increment: leave.days } }
              : { sickUsed: { increment: leave.days } },
        });
      } else {
        const balance = await ensureLeaveBalance(
          leave.userId,
          leave.startDate.getFullYear()
        );
        await tx.leaveBalance.update({
          where: { userId_year: { userId: leave.userId, year: balance.year } },
          data: { unpaidUsed: { increment: leave.days } },
        });
      }

      // mark each day of the range as LEAVE in the attendance table
      for (
        let d = new Date(leave.startDate);
        d.getTime() <= leave.endDate.getTime();
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        const date = new Date(d);
        await tx.attendance.upsert({
          where: { userId_date: { userId: leave.userId, date } },
          create: { userId: leave.userId, date, status: "LEAVE" },
          update: { status: "LEAVE" },
        });
      }

      await tx.leaveRequest.update({
        where: { id: leaveId },
        data: {
          status: "APPROVED",
          reviewComment,
          reviewedAt: new Date(),
          reviewedById: reviewerId,
        },
      });
    });
  } else {
    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: "REJECTED",
        reviewComment,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
  }

  const updated = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

  logger.info(`Leave request ${leaveId} ${status.toLowerCase()} by ${reviewerId}`);

  return res
    .status(200)
    .json(new ApiResponse(200, `Leave request ${status.toLowerCase()}`, updated));
});

export { applyLeave, getMyLeaves, getMyLeaveBalance, listAllLeaves, reviewLeave };