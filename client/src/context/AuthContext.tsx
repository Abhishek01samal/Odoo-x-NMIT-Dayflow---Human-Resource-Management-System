import { createContext, useContext, useState, type ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isInitialized: boolean;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider"
    );
  }
  return context;
};

function AuthContextProvider({ children }: { children: ReactNode }) {
  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
  const [user, setUser] = useState<User | null>(
    DEMO_MODE
      ? {
          id: "demo-user-001",
          name: "Abhishek Kumar",
          email: "abhishek@dayflow.dev",
          role: "EMPLOYEE",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(DEMO_MODE);
  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          isLoading,
          setIsLoading,
          isInitialized,
          setIsInitialized,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
}

export default AuthContextProvider;
