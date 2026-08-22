import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import AuthContextProvider from "./context/AuthContext.tsx";
import ThemeProvider from "./context/ThemeContext.tsx";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/shared/ErrorBoundary.tsx";

function paintFatalError(message: string) {
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;inset:0;z-index:99999;padding:40px;background:#fef2f2;color:#b91c1c;font-family:monospace;white-space:pre-wrap;overflow:auto";
  el.textContent = `FATAL: ${message}`;
  document.body.appendChild(el);
}

window.addEventListener("error", (e) => {
  paintFatalError(e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  paintFatalError(String(e.reason));
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthContextProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthContextProvider>
    </ThemeProvider>
  </BrowserRouter>
);


