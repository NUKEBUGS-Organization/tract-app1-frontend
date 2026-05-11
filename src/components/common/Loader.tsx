type LoaderSize = "xs" | "sm" | "md" | "lg";
type LoaderVariant = "primary" | "secondary" | "white" | "danger" | "muted";

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses: Record<LoaderSize, string> = {
  xs: "h-3 w-3 border-[2px]",
  sm: "h-4 w-4 border-[2px]",
  md: "h-6 w-6 border-[3px]",
  lg: "h-9 w-9 border-[3px]",
};

const variantClasses: Record<LoaderVariant, string> = {
  primary:
    "border-[var(--color-primary)]/25 border-t-[var(--color-primary)]",
  secondary:
    "border-[var(--color-secondary)]/25 border-t-[var(--color-secondary)]",
  white: "border-white/30 border-t-white",
  danger: "border-[var(--color-danger)]/25 border-t-[var(--color-danger)]",
  muted:
    "border-[var(--color-text-muted)]/25 border-t-[var(--color-text-muted)]",
};

function Loader({
  size = "md",
  variant = "primary",
  label,
  fullScreen = false,
}: LoaderProps) {
  const spinner = (
    <div className="flex items-center justify-center gap-3">
      <span
        className={`inline-block animate-spin rounded-full border-solid ${sizeClasses[size]} ${variantClasses[variant]}`}
        aria-hidden="true"
      />

      {label && (
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-main)]">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default Loader;