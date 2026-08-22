import type {
  AdminUser,
  Department,
  Designation,
  EmployeeListItem,
} from "@/types";

export const EMPLOYEE_SEED: EmployeeListItem[] = [
  { userId: "demo-user-001", name: "Abhishek Kumar", email: "abhishek@dayflow.dev", employeeId: "DF-0001", department: "Engineering", designation: "Full Stack Developer", phone: "+91 98765 43210", joinedAt: "2025-06-02", isActive: true },
  { userId: "u-002", name: "Priya Sharma", email: "priya@dayflow.dev", employeeId: "DF-0002", department: "Engineering", designation: "Backend Developer", phone: "+91 98111 22334", joinedAt: "2025-01-15", isActive: true },
  { userId: "u-003", name: "Rahul Verma", email: "rahul@dayflow.dev", employeeId: "DF-0003", department: "Engineering", designation: "DevOps Engineer", phone: "+91 98222 33445", joinedAt: "2024-11-20", isActive: true },
  { userId: "u-004", name: "Sneha Reddy", email: "sneha@dayflow.dev", employeeId: "DF-0004", department: "Human Resources", designation: "HR Executive", phone: "+91 98333 44556", joinedAt: "2025-03-10", isActive: true },
  { userId: "u-005", name: "Arjun Nair", email: "arjun@dayflow.dev", employeeId: "DF-0005", department: "Sales", designation: "Sales Executive", phone: "+91 98444 55667", joinedAt: "2024-08-05", isActive: true },
  { userId: "u-006", name: "Kavya Iyer", email: "kavya@dayflow.dev", employeeId: "DF-0006", department: "Marketing", designation: "Content Strategist", phone: "+91 98555 66778", joinedAt: "2025-02-18", isActive: true },
  { userId: "u-007", name: "Vikram Singh", email: "vikram@dayflow.dev", employeeId: "DF-0007", department: "Finance", designation: "Accountant", phone: "+91 98666 77889", joinedAt: "2023-12-01", isActive: true },
  { userId: "u-008", name: "Ananya Das", email: "ananya@dayflow.dev", employeeId: "DF-0008", department: "Engineering", designation: "Frontend Developer", phone: "+91 98777 88990", joinedAt: "2025-07-21", isActive: true },
  { userId: "u-009", name: "Rohan Gupta", email: "rohan@dayflow.dev", employeeId: "DF-0009", department: "Operations", designation: "Ops Associate", phone: "+91 98888 99001", joinedAt: "2024-05-14", isActive: false },
  { userId: "u-010", name: "Meera Joshi", email: "meera@dayflow.dev", employeeId: "DF-0010", department: "Human Resources", designation: "HR Manager", phone: "+91 98999 00112", joinedAt: "2023-09-09", isActive: true },
  { userId: "u-011", name: "Karan Mehta", email: "karan@dayflow.dev", employeeId: "DF-0011", department: "Sales", designation: "Account Manager", phone: "+91 98000 11223", joinedAt: "2025-04-28", isActive: true },
  { userId: "u-012", name: "Divya Rao", email: "divya@dayflow.dev", employeeId: "DF-0012", department: "Engineering", designation: "QA Engineer", phone: "+91 98123 45670", joinedAt: "2025-08-11", isActive: true },
];

export const USERS_MOCK: AdminUser[] = [
  { id: "demo-user-001", name: "Abhishek Kumar", email: "abhishek@dayflow.dev", role: "EMPLOYEE", isActive: true, isVerified: true, createdAt: "2025-06-02T09:00:00Z" },
  { id: "u-002", name: "Priya Sharma", email: "priya@dayflow.dev", role: "EMPLOYEE", isActive: true, isVerified: true, createdAt: "2025-01-15T09:00:00Z" },
  { id: "u-003", name: "Rahul Verma", email: "rahul@dayflow.dev", role: "EMPLOYEE", isActive: true, isVerified: true, createdAt: "2024-11-20T09:00:00Z" },
  { id: "u-004", name: "Sneha Reddy", email: "sneha@dayflow.dev", role: "HR", isActive: true, isVerified: true, createdAt: "2025-03-10T09:00:00Z" },
  { id: "u-005", name: "Arjun Nair", email: "arjun@dayflow.dev", role: "EMPLOYEE", isActive: true, isVerified: false, createdAt: "2024-08-05T09:00:00Z" },
  { id: "u-007", name: "Vikram Singh", email: "vikram@dayflow.dev", role: "EMPLOYEE", isActive: true, isVerified: true, createdAt: "2023-12-01T09:00:00Z" },
  { id: "u-010", name: "Meera Joshi", email: "meera@dayflow.dev", role: "HR", isActive: true, isVerified: true, createdAt: "2023-09-09T09:00:00Z" },
  { id: "u-admin", name: "Jayant Rao", email: "admin@dayflow.dev", role: "ADMIN", isActive: true, isVerified: true, createdAt: "2023-08-01T09:00:00Z" },
];

export const DEPARTMENTS_MOCK: Department[] = [
  { id: "d-1", name: "Engineering", headCount: 5 },
  { id: "d-2", name: "Human Resources", headCount: 2 },
  { id: "d-3", name: "Sales", headCount: 2 },
  { id: "d-4", name: "Marketing", headCount: 1 },
  { id: "d-5", name: "Finance", headCount: 1 },
  { id: "d-6", name: "Operations", headCount: 1 },
];

export const DESIGNATIONS_MOCK: Designation[] = [
  { id: "g-1", name: "Intern", level: "L1" },
  { id: "g-2", name: "Associate", level: "L2" },
  { id: "g-3", name: "Developer", level: "L3" },
  { id: "g-4", name: "Senior Developer", level: "L4" },
  { id: "g-5", name: "Manager", level: "M1" },
  { id: "g-6", name: "Senior Manager", level: "M2" },
];


