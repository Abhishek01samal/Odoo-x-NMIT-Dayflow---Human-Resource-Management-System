import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useThemeToggle = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeToggle must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Optionally listen for system preference changes (optional but good practice)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        setTheme(mediaQuery.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
