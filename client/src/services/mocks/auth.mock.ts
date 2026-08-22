import type { User } from "@/context/AuthContext";

const SESSION_KEY = "dayflow.session";
const EXTRA_ACCOUNTS_KEY = "dayflow.extraAccounts";

type MockAccount = {
  password: string;
  user: User;
};

const seedAccount = (
  id: string,
  name: string,
  email: string,
  role: string,
  password: string
): MockAccount => ({
  password,
  user: {
    id,
    name,
    email,
    role,
    isVerified: true,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
});

const SEEDED_ACCOUNTS: MockAccount[] = [
  seedAccount(
    "usr-admin-001",
    "Arjun Mehta",
    "admin@dayflow.io",
    "ADMIN",
    "Admin@123"
  ),
  seedAccount(
    "usr-hr-001",
    "Meera Joshi",
    "hr@dayflow.io",
    "HR",
    "Hr@12345"
  ),
  seedAccount(
    "usr-emp-001",
    "Abhishek Kumar",
    "employee@dayflow.io",
    "EMPLOYEE",
    "Employee@123"
  ),
];

const loadExtraAccounts = (): MockAccount[] => {
  try {
    return JSON.parse(localStorage.getItem(EXTRA_ACCOUNTS_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const allAccounts = (): MockAccount[] => [
  ...SEEDED_ACCOUNTS,
  ...loadExtraAccounts(),
];

const loadSession = (): User | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email: string };
    const account = allAccounts().find((a) => a.user.email === parsed.email);
    return account?.user ?? null;
  } catch {
    return null;
  }
};

const saveSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

const unauthorized = () =>
  Object.assign(new Error("Not authenticated"), {
    response: { status: 401 },
  });

export const authMock = {
  async login(payload: { email: string; password: string }) {
    await new Promise((r) => setTimeout(r, 500));
    const account = allAccounts().find(
      (a) => a.user.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (!account || account.password !== payload.password) {
      throw Object.assign(new Error("Invalid email or password"), {
        response: { data: { message: "Invalid email or password" } },
      });
    }
    saveSession(account.user);
    return {
      data: {
        success: true,
        message: "Login successfully",
        data: { user: account.user },
      },
    };
  },

  async register(payload: { name: string; email: string; password: string }) {
    await new Promise((r) => setTimeout(r, 600));
    const exists = allAccounts().some(
      (a) => a.user.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (exists) {
      throw Object.assign(new Error("Email already registered"), {
        response: { data: { message: "Email already registered" } },
      });
    }
    const account: MockAccount = {
      password: payload.password,
      user: {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: "EMPLOYEE",
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    localStorage.setItem(
      EXTRA_ACCOUNTS_KEY,
      JSON.stringify([...loadExtraAccounts(), account])
    );
    saveSession(account.user);
    return {
      data: {
        success: true,
        message: "Register successfully",
        data: { user: account.user },
      },
    };
  },

  async logout() {
    await new Promise((r) => setTimeout(r, 300));
    saveSession(null);
    return { data: { success: true, message: "Logout successfully" } };
  },

  async getProfile() {
    await new Promise((r) => setTimeout(r, 200));
    const user = loadSession();
    if (!user) throw unauthorized();
    return { data: { success: true, data: user } };
  },
};
