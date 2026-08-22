import { prisma } from "../lib/prisma.js";

/**
 * Every User should have exactly one EmployeeProfile. Since registration
 * (local + OAuth) only creates the User row, we lazily provision the
 * profile the first time it's needed so nothing 404s for existing users.
 */
const ensureEmployeeProfile = async (userId: string) => {
  const existing = await prisma.employeeProfile.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  const count = await prisma.employeeProfile.count();
  const employeeId = `DF-${String(count + 1).padStart(4, "0")}`;

  return prisma.employeeProfile.create({
    data: {
      userId,
      employeeId,
      joinedAt: new Date(),
    },
  });
};

/**
 * Leave balances are tracked per calendar year. Auto-create the current
 * year's balance row with default allotments (12 paid / 6 sick) the first
 * time it's needed.
 */
const ensureLeaveBalance = async (userId: string, year: number) => {
  const existing = await prisma.leaveBalance.findUnique({
    where: { userId_year: { userId, year } },
  });
  if (existing) return existing;

  return prisma.leaveBalance.create({
    data: { userId, year },
  });
};

export { ensureEmployeeProfile, ensureLeaveBalance };