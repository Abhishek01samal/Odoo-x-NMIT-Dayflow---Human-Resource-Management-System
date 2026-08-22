import type { EmployeeProfile } from "@/types";

const delay = (ms: number = 400) => new Promise((r) => setTimeout(r, ms));

let profile: EmployeeProfile = {
  id: "prof-001",
  userId: "demo-user-001",
  employeeId: "DF-0001",
  phone: "+91 98765 43210",
  dateOfBirth: "2001-03-14",
  gender: "MALE",
  address: "12, 3rd Cross, Vidyaranyapura, Bengaluru 560097",
  department: "Engineering",
  designation: "Full Stack Developer",
  joinedAt: "2025-06-02",
  avatarUrl: null,
  emergencyContact: "+91 91234 56780",
  bankName: "HDFC Bank",
  bankAccountNo: "xxxx-xxxx-4821",
  ifscCode: "HDFC0001234",
};

export const profileMock = {
  async getMyProfile(): Promise<EmployeeProfile> {
    await delay();
    return { ...profile };
  },

  async updateMyProfile(
    patch: Partial<EmployeeProfile>
  ): Promise<EmployeeProfile> {
    await delay(600);
    profile = { ...profile, ...patch };
    return { ...profile };
  },
};


