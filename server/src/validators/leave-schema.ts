import { z } from "zod";

const applyLeaveSchema = z
  .object({
    type: z.enum(["PAID", "SICK", "UNPAID"]),
    startDate: z.string().datetime({ message: "startDate must be a valid ISO date" }),
    endDate: z.string().datetime({ message: "endDate must be a valid ISO date" }),
    reason: z.string().min(3, { message: "Reason is required" }).max(500),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "startDate must be before or equal to endDate",
    path: ["endDate"],
  });

const reviewLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewComment: z.string().max(500).optional(),
});

export { applyLeaveSchema, reviewLeaveSchema };