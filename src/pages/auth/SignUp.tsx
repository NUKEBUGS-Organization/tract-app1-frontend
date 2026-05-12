// src/pages/auth/SignUp.tsx

import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Map,
  Medal,
  Users,
  Briefcase,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import { useRegisterMutation } from "../../services/authService";
import {
  registerSchema,
  type RegisterFormValues,
} from "../../redux/auth/authSchemas";

export default function SignUp() {
  const navigate = useNavigate();

  const [registerUser, { isLoading }] = useRegisterMutation();

  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      role: "seller",
      terms: false,
    },
  });

  const selectedRole = watch("role");

  const clearApiError = () => {
    if (apiError) {
      setApiError(null);
    }
  };

  const normalizePhone = (phone: string) => {
    const phoneNumber = parsePhoneNumberFromString(phone.trim());

    if (phoneNumber?.isValid()) {
      return phoneNumber.number;
    }

    return phone.trim();
  };

  const onSubmit = async (data: RegisterFormValues) => {
    const payload = {
      full_name: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: normalizePhone(data.phone),
      password: data.password,
      role: data.role,
      state_code: data.state,
      dob: data.dob,
    };

    try {
      setApiError(null);

      await registerUser(payload).unwrap();

      navigate("/auth/verify", {
        state: {
          email: data.email.trim().toLowerCase(),
          purpose: "login",
        },
      });
    } catch (error: any) {

      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "Registration failed. Please try again.";

      setApiError(message);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] sm:py-3 2xl:py-4 2xl:text-base ${
      hasError
        ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
        : "border-transparent"
    }`;

  return (
    <AuthLayout>
      <div className="mb-6 text-center sm:mb-8 2xl:mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] sm:text-3xl xl:text-[32px] 2xl:text-4xl">
          Create your account
        </h2>

        <p className="mt-2 text-xs leading-6 text-[var(--color-text-muted)] sm:text-sm 2xl:text-base">
          Join TRACT App 1 and unlock the future of real estate.
        </p>

        <div className="my-5 flex items-center justify-center sm:my-6 2xl:my-8">
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
          <div className="mx-3 h-2 w-2 rotate-45 bg-[var(--color-secondary)] sm:mx-4" />
          <div className="h-px w-12 bg-[var(--color-border-light)] sm:w-16 2xl:w-20" />
        </div>
      </div>

      {apiError && (
        <div className="mb-5 rounded-[var(--radius-input)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-xs font-medium text-[var(--color-danger)] sm:text-sm">
          {apiError}
        </div>
      )}

      <form
        className="space-y-4 sm:space-y-5 2xl:space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Full name
          </label>

          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <input
              {...register("fullName", {
                onChange: clearApiError,
              })}
              type="text"
              placeholder="Enter your full name"
              className={`${inputClass(Boolean(errors.fullName))} pl-9 pr-3 sm:pl-10 2xl:pl-12`}
            />
          </div>

          {errors.fullName && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
              Email address
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

              <input
                {...register("email", {
                  onChange: clearApiError,
                })}
                type="email"
                placeholder="you@company.com"
                className={`${inputClass(Boolean(errors.email))} pl-9 pr-3 sm:pl-10 2xl:pl-12`}
              />
            </div>

            {errors.email && (
              <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
              Phone number
            </label>

            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

              <input
                {...register("phone", {
                  onChange: clearApiError,
                })}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+923001234567"
                className={`${inputClass(Boolean(errors.phone))} pl-9 pr-3 sm:pl-10 2xl:pl-12`}
              />
            </div>

            {errors.phone && (
              <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
                {errors.phone.message}
              </p>
            )}

            {!errors.phone && (
              <p className="mt-1 text-[10px] text-[var(--color-text-muted)] 2xl:text-xs">
                Include country code, for example +1 or +92.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Date of birth
          </label>

          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <input
              {...register("dob", {
                onChange: clearApiError,
              })}
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

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
              Password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

              <input
                {...register("password", {
                  onChange: () => {
                    clearApiError();
                    trigger("confirmPassword");
                  },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="StrongPass123!"
                className={`${inputClass(Boolean(errors.password))} pl-9 pr-10 sm:pl-10 2xl:pl-12 2xl:pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-main)] 2xl:pr-4"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
              Confirm password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

              <input
                {...register("confirmPassword", {
                  onChange: clearApiError,
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="StrongPass123!"
                className={`${inputClass(Boolean(errors.confirmPassword))} pl-9 pr-10 sm:pl-10 2xl:pl-12 2xl:pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-main)] 2xl:pr-4"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            State
          </label>

          <div className="relative">
            <Map className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] sm:h-5 sm:w-5 2xl:left-4 2xl:h-6 2xl:w-6" />

            <select
              {...register("state", {
                onChange: clearApiError,
              })}
              className={`${inputClass(Boolean(errors.state))} appearance-none pl-9 pr-3 sm:pl-10 2xl:pl-12`}
            >
              <option value="">Select your state</option>
              <option value="TX">Texas</option>
              <option value="NY">New York</option>
              <option value="CA">California</option>
              <option value="FL">Florida</option>
            </select>
          </div>

          {errors.state && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.state.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-3 block text-xs font-medium text-[var(--color-text-main)] sm:text-sm 2xl:text-base">
            Select your role
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <RoleCard
              selected={selectedRole === "seller"}
              onClick={() => {
                clearApiError();
                setValue("role", "seller", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              icon={<Medal className="h-5 w-5" />}
              title="Seller"
              description="List and manage your properties."
            />

            <RoleCard
              selected={selectedRole === "wholesaler"}
              onClick={() => {
                clearApiError();
                setValue("role", "wholesaler", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              icon={<Users className="h-5 w-5" />}
              title="Private Partner"
              description="Collaborate and manage deals."
            />

            <RoleCard
              selected={selectedRole === "realtor"}
              onClick={() => {
                clearApiError();
                setValue("role", "realtor", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
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

        <div>
          <div className="flex items-start gap-2 pt-2">
            <input
              {...register("terms", {
                onChange: clearApiError,
              })}
              type="checkbox"
              id="terms"
              className={`mt-1 h-4 w-4 rounded border-[var(--color-border-light)] text-[var(--color-secondary)] focus:ring-[var(--color-secondary)] ${
                errors.terms
                  ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                  : ""
              }`}
            />

            <label
              htmlFor="terms"
              className="text-xs leading-5 text-[var(--color-text-muted)] 2xl:text-sm"
            >
              I agree to the{" "}
              <a
                href="#"
                className="font-medium text-[var(--color-text-main)] hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-medium text-[var(--color-text-main)] hover:underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {errors.terms && (
            <p className="mt-1 text-xs text-[var(--color-danger)] 2xl:text-sm">
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText="Creating account..."
          className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-xs uppercase tracking-wide sm:py-3.5 sm:text-sm 2xl:py-4 2xl:text-base"
        >
          Create Account
          <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5" />
        </Button>

        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
          <span className="mx-4 flex-shrink-0 text-xs text-[var(--color-text-muted)]">
            OR
          </span>
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
        </div>

        <div className="text-center text-xs text-[var(--color-text-muted)] sm:text-sm 2xl:text-base">
          Already have an account?{" "}
          <Link
            to="/auth/signin"
            className="font-semibold text-[var(--color-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline"
          >
            Sign in →
          </Link>
        </div>

        <div className="mt-6 flex gap-3 rounded-[var(--radius-input)] border border-[var(--color-secondary)]/25 bg-[var(--color-secondary)]/10 p-4 sm:gap-4 2xl:p-6">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)] 2xl:h-6 2xl:w-6" />

          <div className="flex-grow text-[11px] leading-relaxed text-[var(--color-text-main)] sm:text-xs 2xl:text-sm 2xl:leading-6">
            Your identity will be securely verified to protect your account and
            ensure a trusted community.
          </div>

          <a
            href="#"
            className="self-center whitespace-nowrap text-[11px] font-semibold text-[var(--color-text-main)] sm:text-xs 2xl:text-sm"
          >
            Learn more
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}

interface RoleCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
}

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  description,
}: RoleCardProps) {
  return (
    <button
      type="button"
      className={`relative rounded-[var(--radius-input)] border p-4 text-center transition-all ${
        selected
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
        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${
          selected
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