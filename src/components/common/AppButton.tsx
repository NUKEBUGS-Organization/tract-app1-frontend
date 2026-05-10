import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: AppButtonVariant;
}

const variantClasses: Record<AppButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-main)] hover:opacity-90 shadow-[var(--shadow-premium)]",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90",
  outline:
    "border border-[var(--color-secondary)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]",
  ghost:
    "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]",
};

function AppButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: AppButtonProps) {
  return (
    <button
      className={`rounded-[var(--radius-button)] px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default AppButton;