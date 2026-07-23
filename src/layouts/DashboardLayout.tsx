import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, Outlet, useSearchParams } from "react-router";
import {
  ChevronDown,
  FileText,
  Menu,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  UserCircle,
  X,
} from "lucide-react";

import { useAuthContext } from "../contexts/AuthContext";
import DashboardSidebar from "../components/common/DashboardSidebar";
import NotificationDropdown from "../components/common/NotificationDropdown";
import { useGetMeQuery } from "../services/userService";
import { useGetListingsDashboardQuery } from "../services/listingService";
import {
  PARTNER_ROLES,
  REALTOR_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../constants/roles";
import { PartnerThemeContext } from "../contexts/PartnerThemeContext";

interface NavItem {
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  mode?: "light" | "dark";
  showThemeToggle?: boolean;
  onToggleTheme?: () => void;
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
    authUser?.fullName || authUser?.full_name ||
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
    return null;
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

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getListingsFromResponse(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload)) return payload;

  return [];
}

function getListingLabel(listing: any) {
  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function formatMoney(value: any) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return "-";

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatStatus(status?: string) {
  if (!status) return "Draft";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getListingSearchText(listing: any) {
  return [
    listing?.address,
    listing?.state_code,
    listing?.zip_code,
    listing?.property_type,
    listing?.status,
    listing?.zoning,
    listing?.market_price,
    listing?.condition_report?.overall,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterListings(listings: any[], searchValue: string) {
  const normalizedSearch = searchValue.trim().toLowerCase();

  if (!normalizedSearch) return [];

  return listings
    .filter((listing) =>
      getListingSearchText(listing).includes(normalizedSearch)
    )
    .slice(0, 6);
}

function DashboardLayout({
  title,
  navItems,
  mode = "light",
  showThemeToggle = false,
  onToggleTheme,
  children,
}: DashboardLayoutProps) {
  const { user, accessToken } = useAuthContext();
  const authUser = user as any;

  const hasAuthSession = Boolean(authUser || accessToken);

  const { data: profile, refetch: refetchProfile } = useGetMeQuery(undefined, {
    skip: !hasAuthSession,
    refetchOnMountOrArgChange: true,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isDark = mode === "dark";
  const isLight = mode === "light";

  const profileUser = (profile as any)?.data ?? profile;

  const profileMatchesCurrentUser =
    !profileUser ||
    !authUser ||
    (authUser?._id && profileUser?._id && authUser._id === profileUser._id) ||
    (authUser?.email &&
      profileUser?.email &&
      authUser.email === profileUser.email);

  const displayUser = profileMatchesCurrentUser
    ? profileUser || authUser
    : authUser;

  useEffect(() => {
    if (hasAuthSession) {
      refetchProfile();
    }
  }, [hasAuthSession, authUser?._id, authUser?.email, refetchProfile]);

  const displayName = getUserName(displayUser);
  const initials = getInitials(displayName) || "A";

  const userRole = normalizeRole(
    displayUser?.role || authUser?.role || profileUser?.role
  );

  const isAdmin = userRole === "admin";
  const isPartner = isAllowedRole(userRole, PARTNER_ROLES);
  const isRealtor = isAllowedRole(userRole, REALTOR_ROLES);

  const primaryAction = getPrimaryAction(title);
  const searchValue = searchParams.get("search") || "";
  const showPropertySearch = false;

  const { data: dashboardData, isFetching: isFetchingListings } =
    useGetListingsDashboardQuery(undefined, {
      skip: !showPropertySearch,
    });

  const listings = getListingsFromResponse(dashboardData);
  const searchResults = filterListings(listings, searchValue);

  const shouldShowDropdown =
    showPropertySearch && isSearchFocused && searchValue.trim().length > 0;

  function handleSearchChange(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    setSearchParams(nextParams, { replace: true });
  }

  function handleClearSearch() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    setSearchParams(nextParams, { replace: true });
  }

  function closeSearchDropdown() {
    setIsSearchFocused(false);
  }

  const rootBg = isDark
    ? "min-h-screen bg-[var(--color-dark-main)] text-white"
    : "min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)]";

  const navBg = isDark
    ? "border-white/10 bg-[var(--color-dark-main)]/90"
    : "border-[var(--color-border-light)] bg-[var(--color-bg-main)]/90";

  const mobileMenuBtn = isDark
    ? "border-white/10 bg-white/10 text-white"
    : "border-[var(--color-border-light)] bg-white text-[var(--color-primary)]";

  const titleLabel = isDark
    ? "text-white/40"
    : "text-[var(--color-text-muted)]";

  const titleHeading = isDark
    ? "text-white"
    : "text-[var(--color-primary)]";

  const chevronColor = isDark
    ? "text-white/50"
    : "text-[var(--color-text-muted)]";

  const profileDropdownBg = isDark
    ? "bg-[var(--color-dark-card)] border-white/10"
    : "bg-white border-[var(--color-border-light)]";

  const profileDropdownNameColor = isDark
    ? "text-white"
    : "text-[var(--color-primary)]";

  const profileDropdownSubColor = isDark
    ? "text-white/40"
    : "text-[var(--color-text-muted)]";

  const profileDropdownItemColor = isDark
    ? "text-white/80 hover:bg-white/10"
    : "text-[var(--color-text-main)] hover:bg-[var(--color-bg-soft)]";

  const profileDropdownIconColor = isDark
    ? "text-[var(--color-secondary)]"
    : "text-[var(--color-primary)]";

  const profileDropdownBorderColor = isDark
    ? "border-white/10"
    : "border-[var(--color-border-light)]";

  return (
    <PartnerThemeContext.Provider value={mode as "light" | "dark"}>
      <div className={rootBg}>
        <div className="flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col bg-[var(--color-primary-dark)] text-white shadow-2xl lg:flex">
            <DashboardSidebar navItems={navItems} />
          </aside>

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
            <nav
              className={`sticky top-0 z-30 flex h-[86px] items-center justify-between border-b px-5 backdrop-blur-xl lg:px-10 ${navBg}`}
            >
              <div className="flex min-w-0 items-center gap-4 lg:gap-6">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border lg:hidden ${mobileMenuBtn}`}
                  aria-label="Open menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                {!isMobileMenuOpen && (
                  <div className="flex shrink-0 items-center gap-2 lg:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-secondary)]/30 bg-white/90 shadow-sm">
                      <img
                        src="/tract-logo.png"
                        alt="TRACT logo"
                        className="h-6 w-6 object-contain"
                      />
                    </div>

                    <span
                      className={`text-base font-extrabold tracking-tight ${isDark ? "text-white" : "text-[var(--color-primary)]"
                        }`}
                    >
                      TRACT
                    </span>
                  </div>
                )}

                <div className="hidden min-w-0 lg:block">
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-[0.25em] sm:text-xs ${titleLabel}`}
                  >
                    {title}
                  </p>

                  <h2
                    className={`mt-1 truncate font-serif text-xl font-black leading-tight sm:text-2xl lg:text-3xl ${titleHeading}`}
                  >
                    Welcome back, {displayName}
                  </h2>
                </div>
              </div>

              <div className="flex-grow" />

              <div className="flex shrink-0 items-center gap-4 lg:gap-6">
                {showPropertySearch && (
                  <div className="relative hidden w-[280px] md:block xl:w-[320px]">
                    <div
                      className={`flex h-11 items-center gap-3 rounded-none px-4 ${isDark ? "bg-white/10" : "bg-white/70"
                        }`}
                    >
                      <Search className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />

                      <input
                        type="text"
                        value={searchValue}
                        onChange={(event) =>
                          handleSearchChange(event.target.value)
                        }
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setIsSearchFocused(false);
                          }, 150);
                        }}
                        placeholder="Search properties..."
                        aria-label="Search properties"
                        className={`w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)] ${isDark
                            ? "text-white"
                            : "text-[var(--color-text-main)]"
                          }`}
                      />

                      {searchValue && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="shrink-0 rounded-full p-1 text-[var(--color-text-muted)] transition hover:bg-black/5 hover:text-[var(--color-primary)]"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {shouldShowDropdown && (
                      <div className="absolute left-0 top-[52px] z-50 w-full overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-2xl">
                        <div className="border-b border-[var(--color-border-light)] px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                            Matching Listings
                          </p>
                        </div>

                        {isFetchingListings ? (
                          <div className="px-4 py-5 text-center text-xs font-semibold text-[var(--color-text-muted)]">
                            Searching listings...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="px-4 py-5 text-center">
                            <p className="text-sm font-bold text-[var(--color-text-main)]">
                              No matching listing found.
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                              Try address, state, ZIP code, property type, or
                              status.
                            </p>
                          </div>
                        ) : (
                          <div className="max-h-[360px] overflow-y-auto py-2">
                            {searchResults.map((listing: any) => {
                              const id = String(listing?._id || "");
                              const label = getListingLabel(listing);

                              return (
                                <Link
                                  key={id}
                                  to={`/listings/${id}`}
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={closeSearchDropdown}
                                  className="block px-4 py-3 transition hover:bg-[var(--color-bg-soft)]"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-black text-[var(--color-primary)]">
                                        {label}
                                      </p>

                                      <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                                        {listing?.property_type || "Property"} ·{" "}
                                        {formatMoney(listing?.market_price)}
                                      </p>
                                    </div>

                                    <span className="shrink-0 rounded-full border border-[var(--color-border-light)] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                                      {formatStatus(listing?.status)}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {searchResults.length > 0 && (
                          <div className="border-t border-[var(--color-border-light)] px-4 py-3">
                            <p className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                              Click a listing to open its details page.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {primaryAction && (
                  <Link
                    to={primaryAction.path}
                    className="hidden h-11 items-center justify-center gap-2 rounded-none bg-[var(--color-secondary)] px-6 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:brightness-95 md:inline-flex"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {primaryAction.label}
                  </Link>
                )}

                {showThemeToggle && onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    aria-label={
                      isDark ? "Switch to light mode" : "Switch to dark mode"
                    }
                    title={
                      isDark ? "Switch to light mode" : "Switch to dark mode"
                    }
                    className={`relative flex h-11 w-[88px] items-center rounded-full border transition-all duration-300 ${isDark
                        ? "border-white/15 bg-white/10 hover:bg-white/15"
                        : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-secondary)]"
                      }`}
                  >
                    <span
                      className={`absolute inset-[3px] rounded-full transition-all duration-300 ${isDark
                          ? "bg-[var(--color-dark-card)]"
                          : "bg-[var(--color-bg-soft)]"
                        }`}
                    />

                    <span
                      className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-300 ${isDark
                          ? "left-[5px] bg-[var(--color-primary)] text-[var(--color-secondary)]"
                          : "left-[49px] bg-[var(--color-secondary)] text-[var(--color-primary-dark)]"
                        }`}
                    >
                      {isDark ? (
                        <Moon className="h-3.5 w-3.5" />
                      ) : (
                        <Sun className="h-3.5 w-3.5" />
                      )}
                    </span>

                    <span
                      className={`absolute left-[40px] z-10 text-[9px] font-black uppercase tracking-widest transition-opacity duration-200 ${isDark ? "opacity-100 text-white/30" : "opacity-0"
                        }`}
                    >
                      Day
                    </span>

                    <span
                      className={`absolute left-[12px] z-10 text-[9px] font-black uppercase tracking-widest transition-opacity duration-200 ${isLight
                          ? "opacity-100 text-[var(--color-text-muted)]"
                          : "opacity-0"
                        }`}
                    >
                      Ngt
                    </span>
                  </button>
                )}

                <NotificationDropdown
                  isDark={isDark}
                  hasAuthSession={hasAuthSession}
                  userRole={userRole}
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((value) => !value)}
                    className="flex items-center gap-2 rounded-full"
                    aria-label="Open profile menu"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-black text-[var(--color-secondary)] ring-2 ring-[var(--color-secondary)]/30">
                      {initials}
                    </div>

                    <ChevronDown
                      className={`hidden h-4 w-4 transition md:block ${chevronColor} ${isProfileMenuOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className={`absolute right-0 top-[56px] z-50 w-72 overflow-hidden rounded-2xl border shadow-2xl ${profileDropdownBg}`}
                    >
                      <div
                        className={`border-b px-5 py-4 ${profileDropdownBorderColor}`}
                      >
                        <p
                          className={`truncate text-sm font-black ${profileDropdownNameColor}`}
                        >
                          {displayName}
                        </p>

                        <p
                          className={`mt-0.5 truncate text-xs ${profileDropdownSubColor}`}
                        >
                          Profile & account settings
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`flex items-center gap-3 px-5 py-3 text-sm font-bold transition ${profileDropdownItemColor}`}
                        >
                          <UserCircle
                            className={`h-4 w-4 ${profileDropdownIconColor}`}
                          />
                          Profile & Settings
                        </Link>

                        {!isAdmin && (
                          <Link
                            to="/kyc"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-3 text-sm font-bold transition ${profileDropdownItemColor}`}
                          >
                            <ShieldCheck
                              className={`h-4 w-4 ${profileDropdownIconColor}`}
                            />
                            KYC Verification
                          </Link>
                        )}

                        {isPartner && (
                          <Link
                            to="/proof-of-activity"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-3 text-sm font-bold transition ${profileDropdownItemColor}`}
                          >
                            <FileText
                              className={`h-4 w-4 ${profileDropdownIconColor}`}
                            />
                            Proof of Activity
                          </Link>
                        )}

                        {isRealtor && (
                          <Link
                            to="/realtor-verification"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-3 text-sm font-bold transition ${profileDropdownItemColor}`}
                          >
                            <ShieldCheck
                              className={`h-4 w-4 ${profileDropdownIconColor}`}
                            />
                            Professional Verification
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            <main className="p-5 lg:p-10">{children ?? <Outlet />}</main>
          </div>
        </div>
      </div>
    </PartnerThemeContext.Provider>
  );
}

export default DashboardLayout;