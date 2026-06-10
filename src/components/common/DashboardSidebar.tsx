import { Link, useLocation } from "react-router";
import {
  BarChart3,
  Building2,
  ClipboardList,
  FolderLock,
  Gavel,
  Handshake,
  Home,
  LifeBuoy,
  LogOut,
  MapPinned,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useAuthContext } from "../../contexts/AuthContext";
import tractLogoSidebar from "../../assets/tract-logo-sidebar.png";

interface NavItem {
  label: string;
  path: string;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  onNavigate?: () => void;
}

function getNavIcon(label: string) {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("dashboard")) return Home;
  if (lowerLabel.includes("list")) return Building2;
  if (lowerLabel.includes("document")) return FolderLock;
  if (lowerLabel.includes("bid")) return Gavel;
  if (lowerLabel.includes("deal")) return Handshake;
  if (lowerLabel.includes("score")) return BarChart3;
  if (lowerLabel.includes("profile")) return UserRound;
  if (lowerLabel.includes("state")) return MapPinned;
  if (lowerLabel.includes("user")) return Users;
  if (lowerLabel.includes("verification")) return ShieldCheck;
  if (lowerLabel.includes("chat")) return MessageSquareWarning;
  if (lowerLabel.includes("setting")) return Settings;

  return ClipboardList;
}

export default function DashboardSidebar({
  navItems,
  onNavigate,
}: DashboardSidebarProps) {
  const location = useLocation();
  const { logoutAuth } = useAuthContext();

  return (
    <>
      <div className="border-b border-white/10 px-6 py-5 flex items-center gap-3">
        <img
          src={tractLogoSidebar}
          alt="TRACT logo"
          className="h-12 w-auto object-contain"

        />


        <div>
          <div className="text-3xl font-extrabold tracking-tight text-white" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            TRACT
          </div>

          <p className="mt-0.6 text-[9px] font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Luxury Real Estate
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-5 py-6">
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));

          const Icon = getNavIcon(item.label);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${active
                ? "bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-lg"
                : "text-white/40 hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon
                className={`h-5 w-5 ${active
                  ? "text-[var(--color-secondary)]"
                  : "text-white/30 group-hover:text-white"
                  }`}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-5 pb-6">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-none border border-[var(--color-secondary)] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-secondary)] transition hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary-dark)]"
        >
          <LifeBuoy className="h-4 w-4" />
          Support
        </button>

        <button
          type="button"
          onClick={logoutAuth}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-[var(--color-danger)] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );
}
