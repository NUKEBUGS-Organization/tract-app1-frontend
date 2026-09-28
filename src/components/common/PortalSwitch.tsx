import { useMemo } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { isAllowedRole } from "../../constants/roles";

const SELLER_URL = import.meta.env.VITE_SELLER_PORTAL_URL || "https://seller.tractcorp.com";
const BUYER_URL = import.meta.env.VITE_BUYER_PORTAL_URL || "https://buyer.tractcorp.com";

export default function PortalSwitch() {
  const { user } = useAuthContext();
  const role = (user as { role?: string } | null)?.role;
  const active =
    typeof window !== "undefined" && window.location.hostname.includes("buyer")
      ? "buyer"
      : "seller";
  const show = useMemo(
    () => isAllowedRole(role, ["wholesaler", "realtor"]),
    [role],
  );

  if (!show) return null;

  return (
    <div className="hidden items-center rounded-full border border-[var(--color-border-light)] bg-white p-1 shadow-sm md:flex" aria-label="Switch portal">
      <a
        href={SELLER_URL}
        className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${active === "seller" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"}`}
      >
        Seller
      </a>
      <a
        href={BUYER_URL}
        className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${active === "buyer" ? "bg-[var(--color-secondary)] text-[var(--color-primary-dark)]" : "text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"}`}
      >
        Buyer
      </a>
    </div>
  );
}
