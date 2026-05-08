import { Link, Outlet, useLocation } from "react-router";

interface NavItem {
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  mode?: "light" | "dark";
}

function DashboardLayout({
  title,
  navItems,
  mode = "light",
}: DashboardLayoutProps) {
  const location = useLocation();
  const isDark = mode === "dark";

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-[#111827] text-white"
          : "min-h-screen bg-[var(--color-cream)] text-[var(--color-charcoal)]"
      }
    >
      <div className="flex min-h-screen">
        <aside
          className={
            isDark
              ? "w-64 border-r border-gray-800 bg-[#0b1220] p-5"
              : "w-64 border-r border-black/10 bg-white p-5"
          }
        >
          <h1 className="text-xl font-bold text-[var(--color-forest)]">
            TRACT
          </h1>

          <p className={isDark ? "mt-1 text-sm text-gray-400" : "mt-1 text-sm text-gray-500"}>
            {title}
          </p>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    active
                      ? "block rounded-xl bg-[var(--color-forest)] px-4 py-3 text-sm font-semibold text-white"
                      : isDark
                      ? "block rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/10"
                      : "block rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-black/5"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;