export interface EmployeeProfile {
  id: string;
  userId: string;
  employeeId: string;
  phone: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  address: string;
  department: string;
  designation: string;
  joinedAt: string;
  avatarUrl: string | null;
  emergencyContact: string;
  bankName: string;
  bankAccountNo: string;
  ifscCode: string;
}


