# Dayflow — Human Resource Management System

Dayflow is a modern, enterprise-grade Human Resource Management System (HRMS) built to streamline organizational workflows. It features a robust Role-Based Access Control (RBAC) architecture, separating concerns across Employees, HR Managers, and Administrators, ensuring secure and efficient management of profiles, attendance, leaves, payroll, and system configurations.

---

## 🏗️ Architecture Overview

Dayflow is built on a modern **Full-Stack Monorepo Architecture**, separating the frontend client and backend API while maintaining unified typings and cohesive development workflows.

### 🛡️ Role-Based Access Control (RBAC)
The application is structurally divided by roles. Access is enforced both on the client-side (via React Router guards and unified Layouts) and server-side (via JWT validation and route middleware).
- **EMPLOYEE**: Access to self-service portals (Dashboard, Profile, Attendance tracking, Leave requests).
- **HR**: Access to organizational management (Employee directories, Attendance management, Leave approvals).
- **ADMIN**: Access to system-wide settings (User management, Department configs, System reports).

### 🔐 Authentication Flow
- **Stateless & Secure**: Utilizes JWTs stored in `httpOnly` cookies, preventing XSS attacks.
- **Session Management**: Redis is used to manage active sessions, allowing for immediate invalidation of compromised tokens.
- **Auto-Refresh**: Axios interceptors automatically catch `401 Unauthorized` responses and attempt token refreshes transparently before prompting re-authentication.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Core**: React 19, TypeScript, Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4, custom utility classes, CSS Variables
- **UI Components**: shadcn/ui, Radix UI primitives, Lucide React (icons)
- **State & Data Fetching**: Context API, Axios, custom React hooks
- **Data Visualization**: Recharts

### Backend (`/server`)
- **Core**: Node.js, Express 5, TypeScript
- **Database**: PostgreSQL (Relational Data)
- **ORM**: Prisma (Type-safe database access)
- **Caching & Sessions**: Redis
- **Security**: bcrypt (password hashing), jsonwebtoken (auth)
- **API Documentation**: Swagger UI

---

## 📂 Project Structure

```text
Dayflow-HRMS/
│
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets (images, icons)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── shared/         # Global layout components (AppHeader, Sidebar, Footer, Layout)
│   │   │   └── ui/             # Primitive UI components (shadcn/ui - Buttons, Inputs, Cards)
│   │   ├── context/            # React Context providers (AuthContext, ThemeContext)
│   │   ├── hooks/              # Custom React hooks (useAuth, useAdminUsers)
│   │   ├── lib/                # Utility functions and helpers
│   │   ├── pages/              # Route components mapped to URLs
│   │   │   ├── admin/          # Admin-only views (Users, Departments, Reports)
│   │   │   ├── employee/       # Employee self-service views
│   │   │   ├── hr/             # HR management views
│   │   │   └── SignIn.tsx      # Unified authentication portal
│   │   ├── services/           # Axios API instances and request methods
│   │   ├── types/              # TypeScript interfaces and type definitions
│   │   ├── App.tsx             # Main application router and Protected route definitions
│   │   └── main.tsx            # React application entry point
│   ├── index.css               # Global stylesheets and Tailwind configurations
│   └── package.json            # Client dependencies
│
├── server/                     # Backend API Application
│   ├── prisma/                 # Prisma schema definitions and migrations
│   ├── src/
│   │   ├── controllers/        # Request handlers (Auth, Users, Attendance)
│   │   ├── middlewares/        # Express middlewares (Auth guard, Role guard, Error handler)
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic and database operations
│   │   └── server.ts           # Express application entry point
│   ├── .env.sample             # Example environment variables
│   └── package.json            # Server dependencies
│
├── docker-compose.yml          # Infrastructure setup (Postgres, Redis)
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker & Docker Compose (for database and cache)

### 1. Infrastructure Setup
Start the local PostgreSQL database and Redis server using Docker Compose:
```bash
docker-compose up -d
```

### 2. Backend Setup
Navigate to the server directory, install dependencies, and configure the environment:
```bash
cd server
npm install

# Copy the sample environment file and configure it
cp .env.sample .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Start the development server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
In a new terminal window, navigate to the client directory:
```bash
cd client
npm install

# Start the Vite development server (runs on http://localhost:5173 or 5174)
npm run dev
```

---

## 🧪 Developer Features

### Frontend Dev Mode (Bypass Backend)
When the backend is offline or you want to rapidly prototype UI changes without managing database states, the `/sign-in` page features a **Dev Mode** section. 
Clicking the `Admin`, `HR`, or `Employee` dev buttons will automatically generate a mock JWT session in `localStorage`, bypass Axios API interceptors, and route you directly to the respective dashboards with simulated role access.

---

## 🤝 Contribution Guidelines
1. Ensure components use the centralized `Layout.tsx` to maintain UI consistency.
2. Add new routes to `App.tsx` and ensure they are wrapped in `<Protected allowedRoles={[...]} />` based on the RBAC architecture.
3. Update `Sidebar.tsx` navigation items by adding them to the `navItems` array with the correct `roles` assigned.

## 📄 License
This project is proprietary and confidential.
