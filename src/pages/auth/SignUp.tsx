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
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import AuthLayout from "../../layouts/AuthLayout";
import AppButton from "../../components/common/Button";

const schema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    state: z.string().min(1, "Please select a state"),
    role: z.enum(["seller", "partner", "licensed"]),
    terms: z
      .boolean()
      .refine((value) => value === true, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function EntryPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "seller",
      terms: false,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);

    if (data.role === "seller") navigate("/seller/dashboard");
    else if (data.role === "partner") navigate("/partner/dashboard");
    else if (data.role === "licensed") navigate("/realtor/dashboard");
  };

  const inputClass = (hasError?: boolean) =>
    `block w-full rounded-[var(--radius-input)] border bg-[var(--color-bg-soft)] py-2.5 text-sm text-[var(--color-text-main)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)] ${hasError
      ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
      : "border-transparent"
    }`;

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-[var(--color-text-main)]">
          Create your account
        </h2>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Join TRACT and unlock the future of real estate.
        </p>

        <div className="my-6 flex items-center justify-center">
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
          <div className="mx-4 h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
          <div className="h-px w-16 bg-[var(--color-border-light)]" />
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]">
            Full name
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
              <User className="h-5 w-5" />
            </div>

            <input
              {...register("fullName")}
              type="text"
              placeholder="Enter your full name"
              className={`${inputClass(Boolean(errors.fullName))} pl-10 pr-3`}
            />
          </div>

          {errors.fullName && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]">
              Email address
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                <Mail className="h-5 w-5" />
              </div>

              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className={`${inputClass(Boolean(errors.email))} pl-10 pr-3`}
              />
            </div>

            {errors.email && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]">
              Phone number
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                <Phone className="h-5 w-5" />
              </div>

              <input
                {...register("phone")}
                type="tel"
                placeholder="(555) 123-4567"
                className={`${inputClass(Boolean(errors.phone))} pl-10 pr-3`}
              />
            </div>

            {errors.phone && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]">
              Password
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                <Lock className="h-5 w-5" />
              </div>

              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputClass(Boolean(errors.password))} pl-10 pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]">
              Confirm password
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                <Lock className="h-5 w-5" />
              </div>

              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputClass(Boolean(errors.confirmPassword))} pl-10 pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]">
            State
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
              <Map className="h-5 w-5" />
            </div>

            <select
              {...register("state")}
              className={`${inputClass(Boolean(errors.state))} appearance-none pl-10 pr-3`}
            >
              <option value="">Select your state</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="NY">New York</option>
              <option value="FL">Florida</option>
            </select>
          </div>

          {errors.state && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.state.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-[var(--color-text-main)]">
            Select your role
            <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-[var(--color-border-light)] text-xs text-[var(--color-text-muted)]">
              i
            </span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <RoleCard
              selected={selectedRole === "seller"}
              onClick={() => setValue("role", "seller", { shouldValidate: true })}
              icon={<Medal className="h-5 w-5" />}
              title="Seller"
              description="List and manage your properties."
            />

            <RoleCard
              selected={selectedRole === "partner"}
              onClick={() => setValue("role", "partner", { shouldValidate: true })}
              icon={<Users className="h-5 w-5" />}
              title={
                <>
                  Private
                  <br />
                  Partner
                </>
              }
              description="Collaborate and manage deals."
            />

            <RoleCard
              selected={selectedRole === "licensed"}
              onClick={() =>
                setValue("role", "licensed", { shouldValidate: true })
              }
              icon={<Briefcase className="h-5 w-5" />}
              title={
                <>
                  Licensed
                  <br />
                  Partner
                </>
              }
              description="Represent clients and close deals."
            />
          </div>

          {errors.role && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.role.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-start gap-2 pt-2">
            <input
              {...register("terms")}
              type="checkbox"
              id="terms"
              className={`mt-1 h-4 w-4 rounded border-[var(--color-border-light)] text-[var(--color-secondary)] focus:ring-[var(--color-secondary)] ${errors.terms
                ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
                : ""
                }`}
            />

            <label htmlFor="terms" className="text-xs text-[var(--color-text-muted)]">
              I agree to the{" "}
              <a href="#" className="font-medium text-[var(--color-text-main)] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-medium text-[var(--color-text-main)] hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {errors.terms && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.terms.message}
            </p>
          )}
        </div>

        <AppButton
          type="submit"
          variant="primary"
          className="mt-4 flex w-full items-center justify-center gap-2 py-3.5 uppercase"
        >
          Create Account
          <ArrowRight className="h-4 w-4" />
        </AppButton>

        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
          <span className="mx-4 flex-shrink-0 text-xs text-[var(--color-text-muted)]">
            OR
          </span>
          <div className="flex-grow border-t border-[var(--color-border-light)]" />
        </div>

        <div className="text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{" "}
          <Link
            to="/auth/signin"
            className="font-semibold text-[var(--color-secondary)] hover:underline"
          >
            Sign in →
          </Link>
        </div>

        <div className="mt-6 flex gap-3 rounded-[var(--radius-input)] border border-[var(--color-secondary)]/25 bg-[var(--color-secondary)]/10 p-4">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)]" />

          <div className="flex-grow text-xs leading-relaxed text-[var(--color-text-main)]">
            Your identity will be securely verified to protect your account and
            ensure a trusted community.
          </div>

          <a
            href="#"
            className="self-center whitespace-nowrap text-xs font-semibold text-[var(--color-text-main)]"
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

function RoleCard({ selected, onClick, icon, title, description }: RoleCardProps) {
  return (
    <div
      className={`relative cursor-pointer rounded-[var(--radius-input)] border p-4 text-center transition-all ${selected
        ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10"
        : "border-[var(--color-border-light)] hover:border-[var(--color-secondary)]/50"
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

      <div className="mt-1 text-[10px] leading-tight text-[var(--color-text-muted)]">
        {description}
      </div>
    </div>
  );
}