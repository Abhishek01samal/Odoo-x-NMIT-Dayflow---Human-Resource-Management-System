import { z } from "zod";

// Fields an employee may edit on their own profile (spec 3.3.2)
const updateMyProfileSchema = z.object({
  phone: z.string().min(6).max(20).optional(),
  address: z.string().min(1).max(300).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  emergencyContact: z.string().min(6).max(20).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
    .optional(),
  bankName: z.string().max(100).optional(),
  bankAccountNo: z.string().max(50).optional(),
  ifscCode: z.string().max(20).optional(),
});

// Fields Admin/HR may edit on any employee (spec 3.3.2)
const updateEmployeeSchema = updateMyProfileSchema.extend({
  department: z.string().min(1).max(100).optional(),
  designation: z.string().min(1).max(100).optional(),
  role: z.enum(["EMPLOYEE", "HR", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export { updateMyProfileSchema, updateEmployeeSchema };