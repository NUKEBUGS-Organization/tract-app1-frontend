import type { ReactNode } from "react";
import { useState } from "react";
import { Link, Outlet } from "react-router";
import { Bell, Menu, Plus, Search, X } from "lucide-react";

import { useAuthContext } from "../contexts/AuthContext";
import DashboardSidebar from "../components/common/DashboardSidebar";

interface NavItem {
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  mode?: "light" | "dark";
  children?: ReactNode;
}

function getUserName(user: unknown) {
  const authUser = user as
    | {
        full_name?: string;
        fullName?: string;
        name?: string;
        email?: string;
      }
    | null
    | undefined;

  return (
    authUser?.full_name ||
    authUser?.fullName ||
    authUser?.name ||
    authUser?.email ||
    "Agent"
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPrimaryAction(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("admin")) {
    return {
      label: "Review Queue",
      path: "/verifications",
    };
  }

  if (normalizedTitle.includes("partner")) {
    return {
      label: "View Properties",
      path: "/properties",
    };
  }

  if (normalizedTitle.includes("licensed")) {
    return {
      label: "View Deals",
      path: "/deals",
    };
  }

  return {
    label: "Create New Listing",
    path: "/list-property",
  };
}

function DashboardLayout({
  title,
  navItems,
  mode = "light",
  children,
}: DashboardLayoutProps) {
  const { user } = useAuthContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDark = mode === "dark";
  const displayName = getUserName(user);
  const initials = getInitials(displayName) || "A";
  const primaryAction = getPrimaryAction(title);

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-[var(--color-dark-main)] text-white"
          : "min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)]"
      }
    >
      <div className="flex min-h-screen">
        {/* Left Sidebar Navbar - Desktop */}
        <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col bg-[var(--color-primary-dark)] text-white shadow-2xl lg:flex">
          <DashboardSidebar navItems={navItems} />
        </aside>

        {/* Mobile Sidebar Navbar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu overlay"
            />

            <aside className="relative z-50 flex h-full w-[280px] flex-col bg-[var(--color-primary-dark)] text-white shadow-2xl">
              <DashboardSidebar
                navItems={navItems}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Top Navbar */}
          <nav
            className={`sticky top-0 z-30 flex h-[86px] items-center justify-between border-b px-5 backdrop-blur-xl lg:px-10 ${
              isDark
                ? "border-white/10 bg-[var(--color-dark-main)]/90"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-main)]/90"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border lg:hidden ${
                  isDark
                    ? "border-white/10 bg-white/10 text-white"
                    : "border-[var(--color-border-light)] bg-white text-[var(--color-primary)]"
                }`}
                aria-label="Open menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <div
                className={`hidden h-11 w-full max-w-[280px] items-center gap-3 rounded-none px-4 xl:flex ${
                  isDark ? "bg-white/10" : "bg-white/70"
                }`}
              >
                <Search className="h-4 w-4 text-[var(--color-text-muted)]" />

                <input
                  type="text"
                  placeholder="Search properties..."
                  className={`w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)] ${
                    isDark ? "text-white" : "text-[var(--color-text-main)]"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.25em] sm:text-xs ${
                    isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {title}
                </p>

                <h2
                  className={`mt-1 truncate font-serif text-xl font-black leading-tight sm:text-2xl lg:text-3xl ${
                    isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
                >
                  Welcome back, {displayName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              <Link
                to={primaryAction.path}
                className="hidden items-center gap-2 bg-[var(--color-secondary)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-premium)] transition hover:scale-[1.02] md:flex"
              >
                <Plus className="h-4 w-4" />
                {primaryAction.label}
              </Link>

              <button
                type="button"
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition ${
                  isDark
                    ? "border-white/10 bg-white/10 hover:bg-white/15"
                    : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-secondary)]"
                }`}
              >
                <Bell
                  className={
                    isDark
                      ? "h-5 w-5 text-[var(--color-secondary)]"
                      : "h-5 w-5 text-[var(--color-primary)]"
                  }
                />

                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--color-danger)] ring-2 ring-white" />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-black text-[var(--color-secondary)] ring-2 ring-[var(--color-secondary)]/30">
                {initials}
              </div>
            </div>
          </nav>

          <main className="p-5 lg:p-10">{children ?? <Outlet />}</main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;