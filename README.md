# Dayflow — Human Resource Management System

Dayflow is a modern, enterprise-grade Human Resource Management System (HRMS). It is designed to act as the central nervous system for organizational operations, handling employee data, attendance workflows, leave approvals, and system administration. 

This repository acts as a comprehensive monorepo containing both the Frontend (React/Vite) and Backend (Node.js/Express) architectures.

---

## 🏗️ Architectural Blueprint

### The "Skeleton" Model Architecture
The Frontend of Dayflow is built on a **Skeleton/Shell Model Architecture**. Instead of loading full monolithic pages on every route change, the application relies on a unified, persistent "Shell". 

1. **The Core Layout (`Layout.tsx`)**
   - **AppHeader:** Persistent top navigation that displays user context (Name, Role, Avatar) and authentication controls (Logout). It is aware of the user's role and adjusts routing dynamically.
   - **Sidebar:** A highly dynamic, role-aware navigation pane. It categorizes routes logically (e.g., *Self Service*, *HR Management*, *Administration*). If an Employee logs in, they only see *Self Service*. If an Admin logs in, the sidebar expands to include *HR* and *Admin* panels.
   - **Content Outlet (`main` wrapper):** The only part of the DOM that actually re-renders when navigating between pages. This ensures instantaneous page transitions and prevents UI flashing.
   - **Footer:** Persistent branding and bottom navigation.

2. **Role-Based Routing (`Protected.tsx` & `App.tsx`)**
   - We do not rely on UI hiding alone. Security is enforced via hard route guards.
   - The `<Protected allowedRoles={["ADMIN", "HR"]} />` component wraps route groups. If an unauthorized user attempts to access `/admin/dashboard`, the router intercepts the request and force-redirects them to their designated landing page.

3. **Perceived Performance (Skeleton Screens)**
   - Before data is fetched from the API, pages render `Skeleton` components. This provides the illusion of instant load times, keeping the structural layout of the page visible while the exact data (tables, charts) resolves in the background.

---

## 🧩 Detailed Technology Stack & "Why We Chose It"

### Frontend (Client-Side)
- **Vite & React 19:** We use Vite as the bundler instead of Webpack for near-instant Hot Module Replacement (HMR). React 19 provides the latest concurrent rendering features.
- **TypeScript:** Enforces strict typing across the entire monorepo. This eliminates runtime type errors, especially when passing user objects from the Auth Context to various UI components.
- **React Router v7:** Handles complex nested routing. We use the `<Routes>` and `<Route>` structure to easily wrap entire sections of the app inside our `<Protected>` guard.
- **Tailwind CSS v4 & CSS Variables:** All styling is utility-first. By using CSS variables mapped to `oklch` color spaces, we easily achieved a flawless, unified **Dark/Light Theme** system without writing separate stylesheets.
- **shadcn/ui & Radix UI:** Radix provides the unstyled, fully accessible functionality (dropdowns, dialogs). `shadcn/ui` provides the beautifully designed wrappers. We use these for our Inputs, Cards, Avatars, and Buttons to guarantee a premium, consistent feel.
- **Recharts:** Used on the Admin and HR dashboards for beautiful, responsive SVG charting (e.g., Role Distributions, Attendance Trends).
- **React Hot Toast:** For global, unobtrusive notifications (success, error) that pop up at the top center.

### Backend (Server-Side)
- **Node.js & Express 5:** The backbone of our RESTful API. Express 5 provides native Promise support, meaning we don't need `try/catch` wrapper utilities for every asynchronous controller.
- **PostgreSQL:** The primary relational database. Chosen for its strict ACID compliance, which is absolutely critical for an HR system handling sensitive payroll and user access data.
- **Prisma ORM:** Provides type-safe database querying. Instead of writing raw SQL, Prisma generates a strict TypeScript client based on our `schema.prisma` file, ensuring our backend never asks for columns that don't exist.
- **Redis:** An in-memory data store used for **Session Management**. While JWTs are used for authentication, Redis tracks which tokens are active, allowing Administrators to instantly revoke sessions (e.g., if an employee is terminated).
- **JWT (JSON Web Tokens) via httpOnly Cookies:** 
  - *Why?* Storing tokens in `localStorage` is vulnerable to Cross-Site Scripting (XSS). 
  - *Solution:* Our backend sends tokens as `httpOnly` cookies, meaning malicious JavaScript cannot access them. The browser automatically includes these cookies in API requests.
- **Axios Interceptors:** On the frontend, Axios intercepts every outgoing API request. If the backend responds with `401 Unauthorized` (meaning the token expired), the interceptor automatically attempts to hit a `/refresh-token` endpoint. If that fails, it force-logs the user out, ensuring extreme security.

---

## 📂 Deep Dive: Project Directory Structure

```text
Dayflow-HRMS/
│
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/         # Core Architecture (Layout, AppHeader, Sidebar, Footer)
│   │   │   ├── ui/             # Reusable UI Primitives (shadcn/ui Buttons, Inputs, Spinners)
│   │   │   └── Protected.tsx   # The Role-Based Route Guard logic
│   │   │
│   │   ├── context/            
│   │   │   ├── AuthContext.tsx # Centralized State for the User Session (who is logged in?)
│   │   │   └── ThemeContext.tsx# Manages Light/Dark mode toggling
│   │   │
│   │   ├── hooks/              
│   │   │   ├── useAuth.ts      # Wraps API calls (login, register, logout) + Context updates
│   │   │   └── useAdminUsers.ts# Custom hook to fetch user lists for the Admin dashboard
│   │   │
│   │   ├── pages/              # Mapped 1:1 with URLs
│   │   │   ├── admin/          # /admin/* (AdminDashboard, Users, Departments)
│   │   │   ├── employee/       # /employee/* (EmployeeDashboard, Attendance, Leave)
│   │   │   ├── hr/             # /hr/* (HrDashboard, Employees)
│   │   │   └── SignIn.tsx      # The gateway. Includes a "Dev Mode" to bypass the backend.
│   │   │
│   │   ├── services/           
│   │   │   ├── api.ts          # Axios instance config + 401 Interceptor logic
│   │   │   └── auth.api.ts     # The actual Axios network requests for authentication
│   │   │
│   │   └── App.tsx             # The master Router mapping URLs to Pages inside the Layout
│   │
│   └── package.json            # Client dependencies (React, Vite, Tailwind, etc.)
│
├── server/                     # Backend API Application
│   ├── prisma/                 # Database Schema (defines Users, Attendance, Leaves)
│   ├── src/
│   │   ├── controllers/        # The actual logic (e.g. loginController, createUserController)
│   │   ├── middlewares/        # Express middleware (e.g. verifyToken, requireAdminRole)
│   │   ├── routes/             # Maps URLs to Controllers (e.g. router.post('/login', loginController))
│   │   └── server.ts           # Binds everything to a port and starts Express
│   │
│   └── .env                    # Hidden environment variables (DB URLs, Secrets)
│
└── docker-compose.yml          # Containerizes Postgres and Redis for 1-click startup
```

---

## 🚀 Environment Setup & Execution

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (Critical for spinning up the PostgreSQL and Redis instances)

### 1. Database & Cache Initialization
From the root directory, start the Docker containers in the background:
```bash
docker-compose up -d
```
*This binds Postgres to port `5431` and Redis to port `6379`.*

### 2. Backend Boot Sequence
Navigate to the `server/` directory:
```bash
cd server
npm install

# Push the schema to the running Postgres container
npx prisma db push
npx prisma generate

# Start the Node/Express server (Listens on port 5000)
npm run dev
```

### 3. Frontend Boot Sequence
Open a new terminal window and navigate to the `client/` directory:
```bash
cd client
npm install

# Start the Vite development server (Listens on port 5173/5174)
npm run dev
```

---

## 🛠️ The "Dev Mode" Authentication Bypass
When doing rapid UI/UX frontend development, constantly spinning up the backend and database creates friction. 

To solve this, Dayflow includes a highly integrated **Dev Mode** on the `/sign-in` screen. 
- If you click `Admin`, `HR`, or `Employee` under the **Dev Mode** section, the application intercepts the login attempt. 
- Instead of firing an Axios request to the backend, it generates a complete `MockUser` object in memory.
- It pushes this object into `localStorage` and updates the React `AuthContext` instantly.
- The router instantly evaluates the role and drops you into the correct dashboard.
- Because it relies on `localStorage`, you can safely refresh the browser and the mock session will persist, allowing you to test layouts without ever touching the Node server.

## 📄 License
This architecture and source code is proprietary. All rights reserved.
