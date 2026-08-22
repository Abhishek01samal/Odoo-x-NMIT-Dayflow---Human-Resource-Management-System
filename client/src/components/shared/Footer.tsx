import React from "react";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Dayflow HRMS. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link to="/employee/dashboard" className="hover:underline">
            Home
          </Link>
        </nav>
      </div>
    </footer>
  );
}


