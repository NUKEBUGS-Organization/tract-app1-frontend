import type { ButtonHTMLAttributes, ReactNode } from "react";
import Loader from "./Loader";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-main)] hover:opacity-90 shadow-[var(--shadow-premium)]",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
  outline:
    "border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-main)] hover:bg-white",
  ghost:
    "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]",
};

function getLoaderVariant(variant: ButtonVariant) {
  if (variant === "primary" || variant === "danger") return "white";
  if (variant === "secondary") return "primary";
  return "primary";
}

function Button({
  children,
  variant = "primary",
  className = "",
  isLoading = false,
  loadingText = "Loading...",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader size="sm" variant={getLoaderVariant(variant)} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;