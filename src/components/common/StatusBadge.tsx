//src\components\common\StatusBadge.tsx

type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "gold"
  | "neutral"
  | "dark";

interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  success:
    "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
  warning:
    "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
  danger:
    "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20",
  gold:
    "bg-[var(--color-secondary)]/15 text-[#8a6a00] border-[var(--color-secondary)]/30",
  neutral:
    "bg-gray-100 text-gray-700 border-gray-200",
  dark:
    "bg-[var(--color-dark-card)] text-white border-[var(--color-dark-border)]",
};

function StatusBadge({ label, variant = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;