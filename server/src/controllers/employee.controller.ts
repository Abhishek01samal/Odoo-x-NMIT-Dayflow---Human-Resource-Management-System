import { prisma } from "../lib/prisma.js";
import logger from "../lib/logger.js";
import AsyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";
import { ensureEmployeeProfile } from "../utils/hr-helper.js";

const profileSelect = {
  id: true,
  userId: true,
  employeeId: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  department: true,
  designation: true,
  joinedAt: true,
  avatarUrl: true,
  emergencyContact: true,
  bankName: true,
  bankAccountNo: true,
  ifscCode: true,
};

/**
 * @route GET /api/v1/employees/me
 * @description Get the logged-in employee's own profile (auto-provisioned if missing)
 * @access private
 */
const getMyProfile = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  await ensureEmployeeProfile(id);

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: id },
    select: profileSelect,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched successfully", profile));
});

/**
 * @route PATCH /api/v1/employees/me
 * @description Update limited, self-editable fields on own profile
 * @access private
 */
const updateMyProfile = AsyncHandler(async (req: any, res: any) => {
  const { id } = req.user;
  await ensureEmployeeProfile(id);

  const { dateOfBirth, ...rest } = req.body;

  const profile = await prisma.employeeProfile.update({
    where: { userId: id },
    data: {
      ...rest,
      ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
    },
    select: profileSelect,
  });

  logger.info(`Profile updated by employee ${id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", profile));
});

/**
 * @route GET /api/v1/employees
 * @description Admin/HR: list all employees with basic profile info
 * @access private (Admin/HR)
 */
const listEmployees = AsyncHandler(async (req: any, res: any) => {
  const { search, department, role } = req.query;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(department ? { profile: { department } } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      profile: { select: profileSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Employees fetched successfully", users));
});

/**
 * @route GET /api/v1/employees/:userId
 * @description Admin/HR: get a specific employee's full profile
 * @access private (Admin/HR)
 */
const getEmployeeById = AsyncHandler(async (req: any, res: any) => {
  const { userId } = req.params;
  await ensureEmployeeProfile(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      profile: { select: profileSelect },
    },
  });

  if (!user) {
    throw new NotFoundError("Employee not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee fetched successfully", user));
});

/**
 * @route PATCH /api/v1/employees/:userId
 * @description Admin/HR: edit any field on an employee's profile, role, or active status
 * @access private (Admin/HR)
 */
const updateEmployee = AsyncHandler(async (req: any, res: any) => {
  const { userId } = req.params;
  await ensureEmployeeProfile(userId);

  const { dateOfBirth, department, designation, role, isActive, ...rest } =
    req.body;

  if (!Object.keys(req.body).length) {
    throw new BadRequestError("No fields provided to update");
  }

  const [profile] = await prisma.$transaction([
    prisma.employeeProfile.update({
      where: { userId },
      data: {
        ...rest,
        ...(department ? { department } : {}),
        ...(designation ? { designation } : {}),
        ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
      },
      select: profileSelect,
    }),
    ...(role !== undefined || isActive !== undefined
      ? [
          prisma.user.update({
            where: { id: userId },
            data: {
              ...(role !== undefined ? { role } : {}),
              ...(isActive !== undefined ? { isActive } : {}),
            },
          }),
        ]
      : []),
  ]);

  logger.info(`Employee ${userId} updated by admin/HR ${req.user.id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee updated successfully", profile));
});

export {
  getMyProfile,
  updateMyProfile,
  listEmployees,
  getEmployeeById,
  updateEmployee,
};