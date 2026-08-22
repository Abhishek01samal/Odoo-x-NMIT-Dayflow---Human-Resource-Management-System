import { z } from "zod";

const regularizeAttendanceSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]),
  note: z.string().max(300).optional(),
  checkInAt: z.string().datetime().optional(),
  checkOutAt: z.string().datetime().optional(),
});

export { regularizeAttendanceSchema };