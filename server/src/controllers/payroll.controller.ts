import { prisma } from "../lib/prisma.js";
import logger from "../lib/logger.js";
import AsyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";

/**
 * @route POST /api/v1/payroll/salary-structure
 * @description Admin sets/updates an employee's salary structure (deactivates the previous one)
 * @access private (Admin)
 */
const upsertSalaryStructure = AsyncHandler(async (req: any, res: any) => {
  const { userId, basic, hra, allowances, deductions, effectiveFrom } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError("Employee not found");
  }

  const structure = await prisma.$transaction(async (tx) => {
    await tx.salaryStructure.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return tx.salaryStructure.create({
      data: {
        userId,
        basic,
        hra,
        allowances,
        deductions,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        isActive: true,
      },
    });
  });

  logger.info(`Salary structure created for ${userId} by admin ${req.user.id}`);

  return res
    .status(201)
    .json(new ApiResponse(201, "Salary structure saved successfully", structure));
});

/**
 * @route GET /api/v1/payroll/salary-structure/:userId
 * @description Admin views an employee's active salary structure
 * @access private (Admin)
 */
const getSalaryStructure = AsyncHandler(async (req: any, res: any) => {
  const { userId } = req.params;

  const structure = await prisma.salaryStructure.findFirst({
    where: { userId, isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Salary structure fetched successfully", structure)
    );
});

/**
 * @route GET /api/v1/payroll/me/salary-structure
 * @description Employee views own active salary structure (read-only)
 * @access private
 */
const getMySalaryStructure = AsyncHandler(async (req: any, res: any) => {
  const structure = await prisma.salaryStructure.findFirst({
    where: { userId: req.user.id, isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Salary structure fetched successfully", structure)
    );
});

/**
 * @route POST /api/v1/payroll/generate
 * @description Admin generates a payroll record for an employee for a given month/year,
 *              computing loss-of-pay (LOP) from ABSENT attendance days.
 * @access private (Admin)
 */
const generatePayroll = AsyncHandler(async (req: any, res: any) => {
  const { userId, month, year } = req.body;
  const adminId = req.user.id;

  const structure = await prisma.salaryStructure.findFirst({
    where: { userId, isActive: true },
  });
  if (!structure) {
    throw new BadRequestError(
      "Employee has no active salary structure. Set one before generating payroll."
    );
  }

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0)); // last day of month

  const lopDays = await prisma.attendance.count({
    where: {
      userId,
      date: { gte: monthStart, lte: monthEnd },
      status: "ABSENT",
    },
  });

  const baseNet =
    Number(structure.basic) +
    Number(structure.hra) +
    Number(structure.allowances) -
    Number(structure.deductions);

  const daysInMonth = monthEnd.getUTCDate();
  const perDayRate = baseNet / daysInMonth;
  const lopDeduction = Math.round(perDayRate * lopDays * 100) / 100;
  const finalPay = Math.max(0, Math.round((baseNet - lopDeduction) * 100) / 100);

  const record = await prisma.payrollRecord.upsert({
    where: { userId_month_year: { userId, month, year } },
    create: {
      userId,
      month,
      year,
      baseNet,
      lopDays,
      lopDeduction,
      finalPay,
      status: "DRAFT",
      processedById: adminId,
    },
    update: {
      baseNet,
      lopDays,
      lopDeduction,
      finalPay,
      status: "DRAFT",
      processedById: adminId,
    },
  });

  logger.info(`Payroll generated for ${userId} (${month}/${year}) by ${adminId}`);

  return res
    .status(201)
    .json(new ApiResponse(201, "Payroll generated successfully", record));
});

/**
 * @route GET /api/v1/payroll
 * @description Admin lists payroll records, optionally filtered by user/month/year/status
 * @access private (Admin)
 */
const listPayroll = AsyncHandler(async (req: any, res: any) => {
  const { userId, month, year, status } = req.query;

  const records = await prisma.payrollRecord.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(month ? { month: Number(month) } : {}),
      ...(year ? { year: Number(year) } : {}),
      ...(status ? { status } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Payroll records fetched successfully", records));
});

/**
 * @route PATCH /api/v1/payroll/:id/status
 * @description Admin transitions a payroll record's status (DRAFT -> PROCESSED -> PAID)
 * @access private (Admin)
 */
const updatePayrollStatus = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const { status } = req.body;

  const existing = await prisma.payrollRecord.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Payroll record not found");
  }

  const record = await prisma.payrollRecord.update({
    where: { id },
    data: {
      status,
      processedById: req.user.id,
      processedAt: status === "DRAFT" ? null : new Date(),
    },
  });

  logger.info(`Payroll ${id} status set to ${status} by ${req.user.id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, "Payroll status updated successfully", record));
});

/**
 * @route GET /api/v1/payroll/me
 * @description Employee views own payroll history (read-only)
 * @access private
 */
const getMyPayroll = AsyncHandler(async (req: any, res: any) => {
  const records = await prisma.payrollRecord.findMany({
    where: { userId: req.user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Payroll records fetched successfully", records));
});

export {
  upsertSalaryStructure,
  getSalaryStructure,
  getMySalaryStructure,
  generatePayroll,
  listPayroll,
  updatePayrollStatus,
  getMyPayroll,
};