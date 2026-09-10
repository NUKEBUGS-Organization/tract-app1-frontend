import {
  CircleHelp,
} from "lucide-react";

import {
  useAuthContext,
} from "../contexts/AuthContext";

import {
  getRoleFromToken,
} from "../redux/auth/jwtUtils";

import {
  PARTNER_ROLES,
  REALTOR_ROLES,
  SELLER_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../constants/roles";

interface Props {
  onStart?: () => void;
}

export default function ProductTourSidebarButton({
  onStart,
}: Props) {
  const {
    role,
    accessToken,
  } = useAuthContext();

  const userRole =
    normalizeRole(
      role ||
        getRoleFromToken(
          accessToken
        )
    );

  const isSeller =
    isAllowedRole(
      userRole,
      SELLER_ROLES
    );

  const isPartner =
    isAllowedRole(
      userRole,
      PARTNER_ROLES
    );

  const isRealtor =
    isAllowedRole(
      userRole,
      REALTOR_ROLES
    );

  /*
   * No product tour for admin.
   */
  if (
    !isSeller &&
    !isPartner &&
    !isRealtor
  ) {
    return null;
  }

  function handleClick() {
    if (isSeller) {
      window.dispatchEvent(
        new Event(
          "tract:start-seller-tour"
        )
      );
    } else {
      window.dispatchEvent(
        new Event(
          "tract:start-buyer-tour"
        )
      );
    }

    /*
     * Useful for mobile:
     * close sidebar after clicking.
     */
    onStart?.();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        flex
        w-full
        items-center
        justify-center
        gap-2.5
        rounded-xl
        border
        border-white/15
        bg-white/[0.06]
        px-4
        py-3.5
        text-[10px]
        font-black
        uppercase
        tracking-[0.18em]
        text-white/80
        shadow-lg
        backdrop-blur
        transition-all
        duration-200
        hover:border-[var(--color-secondary)]/50
        hover:bg-[var(--color-secondary)]/10
        hover:text-[var(--color-secondary)]
      "
      aria-label="Get product walkthrough"
    >
      <CircleHelp
        className="h-4 w-4"
      />

      Get Walkthrough
    </button>
  );
}