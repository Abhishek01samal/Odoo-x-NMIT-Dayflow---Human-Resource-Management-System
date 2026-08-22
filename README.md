# Dayflow — Human Resource Management System

Dayflow is a highly scalable, enterprise-grade Human Resource Management System (HRMS) engineered to act as the central nervous system for organizational operations. It provides an end-to-end digital workspace for tracking employee data, automating attendance workflows, streamlining leave approvals, and governing system administration.

This repository is structured as a **Full-Stack Monorepo**, maintaining a strict separation of concerns between the Frontend client (React/Vite) and the Backend API (Node.js/Express) while enabling seamless full-stack developer workflows.

---

## 🏗️ Architectural Blueprint

### The "Skeleton Shell" & SPA Architecture
The Frontend of Dayflow is built on a **Single Page Application (SPA) Skeleton/Shell Architecture**. This prevents the destructive behavior of monolithic, multi-page applications (MPAs) that reload the entire Document Object Model (DOM) on every navigation event.

1. **The Core Layout Shell (`Layout.tsx`)**
   - **AppHeader (`AppHeader.tsx`):** A persistent top navigation bar that displays contextual user information (Avatar, Name, Email, and Role Badge). It mounts once and never unmounts during navigation, ensuring instantaneous dropdown interactions and a flicker-free user experience.
   - **Dynamic Sidebar (`Sidebar.tsx`):** A highly dynamic, context-aware navigation pane. It categorizes routes logically (*Self Service*, *HR Management*, *Administration*). 
     - **Role-Aware Rendering:** It parses the `AuthContext` to determine visibility. An Employee only sees their own dashboard and requests. An HR Manager sees employee lists and approval queues. An Administrator sees system configuration panels.
   - **Content Outlet (`main` wrapper):** Utilizing React Router's `<Outlet>`, this is the *only* part of the DOM that reconciles and re-renders when navigating. This guarantees sub-100ms page transitions.
   - **Footer (`Footer.tsx`):** Persistent lower branding and tertiary navigation links.

2. **Strict Role-Based Routing (`Protected.tsx` & `App.tsx`)**
   - Security is not merely UI-deep (hiding buttons). It is strictly enforced via route guards.
   - The `<Protected>` Higher-Order Component (HOC) wraps sensitive route groups. 
   - **Logic Flow:** When a route is requested, `<Protected>` checks `isInitialized`. If `false`, it mounts a `<Spinner>`. Once initialized, it verifies the user object. If `user` is null, it forcefully redirects to `/sign-in`. If the user lacks the roles specified in `allowedRoles={["ADMIN", "HR"]}`, it intercepts the navigation and bounces the user to their designated safe zone (e.g., `/employee/dashboard`).

3. **Perceived Performance via Skeleton Screens**
   - Instead of jarring loading spinners, the application utilizes `Skeleton` components. Before data resolves from the Backend API, the UI renders pulsing gray placeholders matching the exact dimensions of the expected data (tables, pie charts, stat cards). This provides the psychological illusion of instant load times.

---

## 🧩 Detailed Technology Stack & "Why We Chose It"

### Frontend (Client-Side Interface)
- **Vite:** Replaces Webpack as the build tool. Vite uses native ES modules, providing instantaneous cold server starts and near-instant Hot Module Replacement (HMR) regardless of the app's size.
- **React 19:** Utilizes the absolute latest React concurrent rendering engine for fluid state updates.
- **TypeScript:** Enforces strict interface typing across the entire monorepo. This eliminates runtime `undefined` errors when mapping complex API JSON payloads to React components.
- **React Router v7:** The industry standard for handling complex nested routing and URL-parameter synchronization without page reloads.
- **Tailwind CSS v4 & CSS Variables:** A utility-first styling paradigm. We mapped standard Tailwind colors to `oklch` CSS variables. 
  - *Why?* This allowed us to build a flawless, natively integrated **Dark/Light Theme** system with zero JavaScript style-swapping. The `class="dark"` attribute simply shifts the `oklch` variables globally.
- **shadcn/ui & Radix UI:** 
  - *Radix UI* provides unstyled, highly accessible (WAI-ARIA compliant) behavioral logic for complex components (Dialogs, Selects, Dropdowns).
  - *shadcn/ui* wraps Radix primitives in our Tailwind design system. Unlike traditional component libraries (MUI, Bootstrap), shadcn injects the component source code directly into our repository, giving us 100% control over the DOM output and styling.
- **Recharts:** Powers the analytical dashboards (Admin/HR). It relies on React components to build responsive SVG charts (PieCharts, BarCharts) that automatically resize based on grid constraints.
- **React Hot Toast:** Unobtrusive, animated notification pipelines for success/error feedback.

### Backend (Server-Side Architecture)
- **Node.js & Express 5:** The backbone of our RESTful API. Express 5 introduces native Promise handling, meaning asynchronous route controllers no longer require verbose `try/catch` wrappers or third-party libraries like `express-async-handler`.
- **PostgreSQL:** The primary relational data store. 
  - *Why?* HR systems handle mission-critical, highly relational data (Users -> Attendance Logs -> Leave Requests). Postgres guarantees strict ACID (Atomicity, Consistency, Isolation, Durability) compliance, ensuring financial and operational data is never orphaned or corrupted.
- **Prisma ORM:** The database interface. Instead of writing brittle raw SQL strings, Prisma generates a strict, auto-completing TypeScript client based on our declarative `schema.prisma` file. It also handles our database migrations safely.
- **Redis:** An ultra-fast, in-memory key-value store used for **Session Governance and Caching**. 
- **Security & Authentication Flow:**
  - **Bcrypt:** Passwords are never stored in plaintext. Bcrypt applies salted hashing algorithms before committing credentials to Postgres.
  - **JWT (JSON Web Tokens) via httpOnly Cookies:** 
    - *The Problem:* Storing tokens in `localStorage` exposes them to Cross-Site Scripting (XSS) attacks where malicious scripts can steal the token.
    - *The Solution:* Our Express backend issues tokens inside `httpOnly`, `Secure` cookies. The browser is mathematically restricted from reading them via JavaScript, but will automatically attach them to subsequent API requests.
  - **Axios Interceptors:** The frontend `api.ts` file intercepts every outgoing and incoming request. If the backend responds with a `401 Unauthorized` (indicating token expiration), the interceptor automatically pauses the request queue, hits a silent `/refresh-token` endpoint, and retries the original request. If the refresh fails, it purges the local state and forces a redirect to the login screen.

---

## 📂 Deep Dive: Project Directory Structure & Data Flow

```text
Dayflow-HRMS/
│
├── client/                     # FRONTEND SPA
│   ├── public/                 # Static public assets (Favicons, splash images)
│   ├── src/
│   │   ├── components/         # Reusable Component Architecture
│   │   │   ├── shared/         # Macro-components: Layout, AppHeader, Sidebar, StatCard
│   │   │   ├── ui/             # Micro-components (shadcn/ui): Button, Input, Avatar, Dialog
│   │   │   └── Protected.tsx   # Core Route Guard parsing AuthContext roles
│   │   │
│   │   ├── context/            # React Context (Global State Management)
│   │   │   ├── AuthContext.tsx # Source of truth for `user`, `isLoading`, and `isInitialized`
│   │   │   └── ThemeContext.tsx# Injects 'dark' class into HTML root based on system preference
│   │   │
│   │   ├── hooks/              # Custom Data Fetching & Logic Abstractions
│   │   │   ├── useAuth.ts      # Wraps auth.api.ts to mutate AuthContext & handle redirects
│   │   │   └── useAdminUsers.ts# Wraps admin.api.ts to fetch/manage users for Admin views
│   │   │
│   │   ├── pages/              # Route Views (Mapped 1:1 with App.tsx Routes)
│   │   │   ├── admin/          # Highly privileged views (Dashboard, User management, Reports)
│   │   │   ├── employee/       # Unprivileged views (Self-Dashboard, Attendance clock-in, Leave requests)
│   │   │   ├── hr/             # Mid-privileged views (Dashboard, Leave Approval workflows)
│   │   │   └── SignIn.tsx      # The gateway. Includes the integrated "Dev Mode" bypass mechanism.
│   │   │
│   │   ├── services/           # Network Layer
│   │   │   ├── api.ts          # Central Axios instance configuring baseURL, credentials, and interceptors
│   │   │   ├── auth.api.ts     # Login/Register/Logout specific API definitions
│   │   │   └── admin.api.ts    # Admin-specific API definitions
│   │   │
│   │   ├── types/              # Global TypeScript Interfaces (User, Role, AttendanceRecord)
│   │   ├── lib/                # Pure utility functions (class merging, error message parsing)
│   │   ├── App.tsx             # The React Router definitions integrating `<Layout>` and `<Protected>`
│   │   └── main.tsx            # React DOM hydration and Context Provider wrapping
│   │
│   ├── index.css               # Global Tailwind directives and OKLCH color token definitions
│   ├── tailwind.config.js      # Tailwind theme extensions and custom animation definitions
│   └── package.json            # Client dependencies and build scripts
│
├── server/                     # BACKEND API
│   ├── prisma/                 
│   │   ├── schema.prisma       # The database blueprint (Tables, Relations, Enums)
│   │   └── migrations/         # SQL migration history
│   │
│   ├── src/
│   │   ├── controllers/        # Business Logic (e.g. validating inputs, querying DB, returning JSON)
│   │   ├── middlewares/        # Express request pipelines (e.g. verifyToken, roleGuard, errorHandler)
│   │   ├── routes/             # URL to Controller mapping (e.g. router.post('/login', loginController))
│   │   ├── services/           # Reusable backend functions (e.g. Email dispatch, PDF generation)
│   │   ├── lib/                # Backend utilities (e.g. Logger, Swagger Config)
│   │   └── server.ts           # Binds routes, middlewares, DB connections, and starts listening
│   │
│   ├── .env.sample             # Template for required environment variables
│   └── package.json            # Server dependencies and tsx execution scripts
│
├── docker-compose.yml          # Containerization for Postgres and Redis infrastructures
└── README.md                   # This documentation file
```

---

## 🚀 Complete Environment Setup & Boot Sequence

### Prerequisites
1. **Node.js:** Version 18.x or higher.
2. **Docker Desktop:** Must be running to spin up the local infrastructure.

### 1. Initialize Infrastructure (Postgres & Redis)
From the root directory, leverage Docker Compose to download and boot the databases in the background.
```bash
docker-compose up -d
```
*Architecture Note: This maps Postgres to your localhost on port `5431` and Redis on port `6379`. Data is persisted locally via Docker volumes.*

### 2. Backend Boot Sequence
Open a terminal, navigate to the `server/` directory, and follow these steps:
```bash
cd server
npm install

# Create your local environment file
cp .env.sample .env
# Edit .env to ensure DATABASE_URL matches the docker-compose config

# Push the Prisma schema to the empty PostgreSQL database and generate the TS Client
npx prisma db push
npx prisma generate

# Boot the Node/Express server in development watch mode
npm run dev
```
*The API will mount at `http://localhost:5000`.*

### 3. Frontend Boot Sequence
Open a second terminal window, navigate to the `client/` directory:
```bash
cd client
npm install

# Boot the Vite development server with Hot Module Replacement
npm run dev
```
*The UI will mount at `http://localhost:5173` (or 5174).*

---

## 🛠️ The "Dev Mode" Local Authentication Bypass (Prototyping Mode)

Building UI layouts requires constantly switching between user roles. Traditionally, this means creating multiple test accounts in the database, booting the backend, and logging in repeatedly.

Dayflow eliminates this friction with a deeply integrated **Dev Mode** on the `/sign-in` screen.

**How it works architecturally:**
1. You click the `Admin`, `HR`, or `Employee` button under the amber *Dev Mode* section.
2. The application intentionally **bypasses the `api.ts` Axios instance entirely**. No network request is made.
3. It generates a complete `MockUser` object in memory and writes it directly to the browser's `localStorage` as `mock_user`.
4. It immediately injects this payload into the React `AuthContext` and fires `React Router's navigate()` function.
5. The `Protected.tsx` route guard reads the injected context, approves the role, and renders the `<Outlet>`.
6. **Persistence:** If you hard-refresh the page, `useAuth.ts` reads `localStorage` before attempting a network request, restoring your mock session instantly. This allows flawless UI development entirely disconnected from the Node.js backend.

---

## 🤝 Expansion & Contribution Architecture Guidelines

When adding new features to Dayflow, follow the established structural paradigms:

1. **New UI Views:**
   - Create your view in the appropriate `client/src/pages/{role}/` folder.
   - Map the view in `client/src/App.tsx`. Ensure it is nested beneath the correct `<Protected allowedRoles={[...]}>` wrapper.
   - If it should be accessible from the navigation pane, add the route definition to `navItems` in `client/src/components/shared/Sidebar.tsx` with the correct `roles` array.
2. **New Backend Endpoints:**
   - Define the data model in `server/prisma/schema.prisma` and run `npx prisma db push`.
   - Create a controller in `server/src/controllers/`.
   - Bind the controller in `server/src/routes/` and protect it using the `verifyToken` and `requireRole` middlewares.

## 📄 License
This architecture and source code is proprietary. All rights reserved.
