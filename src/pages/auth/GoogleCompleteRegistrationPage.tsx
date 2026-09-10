import {
  ShieldCheck,
  Phone,
  Map,
  Medal,
  Users,
  Briefcase,
  ArrowRight,
  Calendar,
  ChevronDown,
  Mail,
  User,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import * as z from "zod";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import tractLogo from "../../assets/tract-logo.png";
import { useAuthContext } from "../../contexts/AuthContext";
import { allowAuthRefresh } from "../../services/baseApi";
import { getApiOrigin } from "../../utils/apiBaseUrl";

const API_BASE = getApiOrigin();

// Same hand-off as SignIn/SignUp — let the backend build the real Google
// authorize URL from its own GOOGLE_CLIENT_ID/GOOGLE_CALLBACK_URL, rather
// than reconstructing it here with a VITE_GOOGLE_CLIENT_ID that never
// existed (was being sent to Google as the literal string "undefined").
const GOOGLE_REAUTH_URL = `${API_BASE}/api/v1/auth/google`;

// ── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  role: z.enum(["seller", "wholesaler", "realtor"], {
    message: "Please select a role.",
  }),
  phone: z.string().min(7, "Phone number is required."),
  dob: z.string().min(1, "Date of birth is required."),
  stateCode: z.string().min(2, "Please select your state."),
});

type FormValues = z.infer<typeof schema>;

// ── State list (same as SignUp) ───────────────────────────────────────────────

const allowedStates = [
  { code: "NY", name: "New York" },
  { code: "NJ", name: "New Jersey" },
  { code: "MD", name: "Maryland" },
  { code: "TX", name: "Texas" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "PA", name: "Pennsylvania" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizePhone(phone: string) {
  const phoneNumber = parsePhoneNumberFromString(phone.trim());
  return phoneNumber?.isValid() ? phoneNumber.number : phone.trim();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GoogleCompleteRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthContext();

  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";
  const fullName = searchParams.get("fullName") ?? "";

  const [apiError, setApiError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { role: "seller" },
  });

  const selectedRole = watch("role");
  const selectedState = watch("stateCode");

  const filteredStates = allowedStates.filter((s) => {
    const q = stateSearch.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  // Guard: if token is missing, this page was reached directly — bounce to login.
  useEffect(() => {
    if (!token) {
      navigate("/auth/signin", { replace: true });
    }
  }, [token, navigate]);

  const inputClass = (hasError?: boolean) =>
    `block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] sm:py-3 2xl:py-4 2xl:text-base ${hasError
      ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
      : "border-transparent"
    }`;

  const onSubmit = async (values: FormValues) => {
    if (!token) return;

    setApiError(null);
    setIsExpired(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/google/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // response sets the httpOnly refreshToken cookie
        body: JSON.stringify({
          token,
          role: values.role,
          phone: normalizePhone(values.phone),
          dob: values.dob,
          stateCode: values.stateCode,
        }),
      });

      if (res.status === 401) {
        const body = await res.json().catch(() => null);
        const msg =
          body?.message ??
          "Signup session expired. Please sign in with Google again.";
        setIsExpired(true);
        setApiError(msg);
        return;
      }

      if (res.status === 409) {
        setApiError(
          "An account already exists for this email. Please sign in instead."
        );
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setApiError(body?.message ?? "Something went wrong. Please try again.");
        return;
      }

      const raw = await res.json();
      const data = raw?.data ?? raw;
      const accessToken = data?.accessToken ?? data?.access_token ?? null;
      const user = data?.user ?? null;

      if (!accessToken) {
        setApiError("Registration succeeded but no session was returned. Please sign in.");
        return;
      }

      allowAuthRefresh();
      setAuth({ user, accessToken });
      navigate("/dashboard", { replace: true });
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-6 text-center sm:mb-8 2xl:mb-10">
        <div className="mx-auto mb-4 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-secondary)]/30 bg-white shadow-[var(--shadow-card)]">
            <img src={tractLogo} alt="TRACT logo" className="h-9 w-9 object-contain" />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold tracking-tight text-[var(--color-primary)]">
              TRACT
            </div>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)]">
              Buy the best
              <br />
              skip the Rest
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-3xl xl:text-[32px] 2xl:text-4xl">
          Almost there!
        </h2>

        <p className="mt-2 text-xs leading-6 text-[var(--color-text-muted)] sm:text-sm 2xl:text-base">
          We just need a few more details to finish setting up your account.
        </p>

        {/* Google identity pill */}
        {(email || fullName) && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-2 text-xs text-[var(--color-text-muted)] sm:text-sm">
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium text-[var(--color-text-main)]">
              {fullName || email}
            </span>
            {fullName && email && (
              <span className="truncate">· {email}</span>
            )}
          </div>
        )}

        <div className="my-5 flex items-center justify-center sm:my-6 2xl:my-8">
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
          <div className="mx-3 h-2 w-2 rotate-45 bg-[var(--color-secondary)] sm:mx-4" />
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
        </div>
      </div>

      {/* Error banner */}
      {apiError && (
        <div className="mb-5 rounded-[var(--radius-input)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-xs font-medium text-[var(--color-danger)] sm:text-sm">
          {apiError}

          {/* If expired, offer a retry button */}
          {isExpired && (
            <a
              href={GOOGLE_REAUTH_URL}
              className="mt-3 flex items-center gap-2 font-semibold text-[var(--color-danger)] underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Continue with Google again
            </a>
          )}
        </div>
      )}

      {/* Read-only Google info */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />
            <input
              type="text"
              readOnly
              value={fullName}
              className="block w-full cursor-not-allowed rounded-[var(--radius-input)] border border-transparent bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text-muted)] opacity-70 sm:py-3 sm:pl-10 2xl:py-4 2xl:pl-12 2xl:text-base"
            />
          </div>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)] 2xl:text-xs">
            Verified by Google — cannot be edited.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />
            <input
              type="email"
              readOnly
              value={email}
              className="block w-full cursor-not-allowed rounded-[var(--radius-input)] border border-transparent bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text-muted)] opacity-70 sm:py-3 sm:pl-10 2xl:py-4 2xl:pl-12 2xl:text-base"
            />
          </div>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)] 2xl:text-xs">
            Verified by Google — cannot be edited.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        className="space-y-4 sm:space-y-5 2xl:space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Phone number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />
            <input
              {...register("phone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+12025550143"
              className={`${inputClass(Boolean(errors.phone))} pl-9 pr-3 sm:pl-10 2xl:pl-12`}
            />
          </div>
          {errors.phone ? (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.phone.message}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)] 2xl:text-xs">
              Include country code, for example +1 202 555 0143.
            </p>
          )}
        </div>

        {/* Date of birth */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Date of birth
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />
            <input
              {...register("dob")}
              type="date"
              className={`${inputClass(Boolean(errors.dob))} pl-9 pr-3 sm:pl-10 2xl:pl-12`}
            />
          </div>
          {errors.dob && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.dob.message}
            </p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            State
          </label>

          <input type="hidden" {...register("stateCode")} />

          <div className="relative">
            <Map className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />
            <input
              type="text"
              value={stateSearch}
              placeholder="Select your state"
              autoComplete="off"
              onFocus={() => setIsStateDropdownOpen(true)}
              onBlur={() =>
                setTimeout(() => setIsStateDropdownOpen(false), 150)
              }
              onChange={(e) => {
                setStateSearch(e.target.value);
                setIsStateDropdownOpen(true);
                setValue("stateCode", "", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              className={`${inputClass(Boolean(errors.stateCode))} pl-9 pr-10 sm:pl-10 2xl:pl-12`}
            />
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:right-4" />

            {isStateDropdownOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[var(--radius-input)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => {
                    const isSelected = selectedState === state.code;
                    return (
                      <button
                        key={state.code}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setValue("stateCode", state.code, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                          setStateSearch(state.name);
                          setIsStateDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-[var(--color-bg-soft)] ${isSelected
                            ? "bg-[var(--color-secondary)]/10 font-semibold text-[var(--color-primary)]"
                            : "text-[var(--color-text-main)]"
                          }`}
                      >
                        <span>{state.name}</span>
                        <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                          {state.code}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                    State not found.
                  </div>
                )}
              </div>
            )}
          </div>

          {errors.stateCode && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.stateCode.message}
            </p>
          )}
        </div>

        {/* Role picker */}
        <div>
          <label className="mb-3 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Select your role
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <RoleCard
              selected={selectedRole === "seller"}
              onClick={() =>
                setValue("role", "seller", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              icon={<Medal className="h-5 w-5" />}
              title="Seller"
              description="List and manage your properties."
            />
            <RoleCard
              selected={selectedRole === "wholesaler"}
              onClick={() =>
                setValue("role", "wholesaler", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              icon={<Users className="h-5 w-5" />}
              title="Private Partner"
              description="Collaborate and manage deals."
            />
            <RoleCard
              selected={selectedRole === "realtor"}
              onClick={() =>
                setValue("role", "realtor", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              icon={<Briefcase className="h-5 w-5" />}
              title="Licensed Partner"
              description="Represent clients and close deals."
            />
          </div>

          {errors.role && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Creating account…"
          className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-xs uppercase tracking-wide sm:py-3.5 sm:text-sm 2xl:py-4 2xl:text-base"
        >
          Complete sign-up
          <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5" />
        </Button>

        {/* Security note */}
        <div className="mt-6 flex gap-3 rounded-[var(--radius-input)] border border-[var(--color-secondary)]/25 bg-[var(--color-secondary)]/10 p-4 sm:gap-4 2xl:p-6">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)] 2xl:h-6 2xl:w-6" />
          <div className="flex-grow text-[11px] leading-relaxed text-[var(--color-text-main)] sm:text-xs 2xl:text-sm 2xl:leading-6">
            Your identity will be securely verified to protect your account and
            ensure a trusted community.
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}

// ── RoleCard (same as SignUp.tsx) ─────────────────────────────────────────────

interface RoleCardProps {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: ReactNode;
  description: string;
}

function RoleCard({ selected, onClick, icon, title, description }: RoleCardProps) {
  return (
    <button
      type="button"
      className={`relative rounded-[var(--radius-input)] border p-4 text-center transition-all ${selected
          ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10"
          : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-secondary)]/50"
        }`}
      onClick={onClick}
    >
      {selected && (
        <div className="absolute right-2 top-2 rounded-full bg-[var(--color-secondary)] p-0.5">
          <ShieldCheck className="h-3 w-3 text-white" />
        </div>
      )}
      <div
        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${selected
            ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
            : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
          }`}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold text-[var(--color-text-main)]">
        {title}
      </div>
      <div className="mt-1 text-[10px] leading-tight text-[var(--color-text-muted)] 2xl:text-xs">
        {description}
      </div>
    </button>
  );
}
