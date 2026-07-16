import { Ban, RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react";

import Button from "../../../components/common/Button";
import StatusBadge from "../../../components/common/StatusBadge";
import { getBanReason } from "./adminUserDetails.helpers";

function AdminControlPanel({
  user,
  isUnbanning,
  onBanClick,
  onUnban,
}: {
  user: any;
  isUnbanning: boolean;
  onBanClick: () => void;
  onUnban: () => void;
}) {
  const isBanned = user?.is_banned === true;
  const banReason = getBanReason(user);

  return (
    <aside className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)] xl:sticky xl:top-6">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            isBanned
              ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
              : "bg-[var(--color-primary)]/8 text-[var(--color-primary)]"
          }`}
        >
          {isBanned ? (
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-lg font-black text-[var(--color-primary)]">
            Admin Control
          </h2>

          <p className="mt-1 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
            Manage user access.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Access
          </p>

          <div className="mt-1">
            <StatusBadge
              label={isBanned ? "Banned" : "Active"}
              variant={isBanned ? "danger" : "success"}
            />
          </div>
        </div>
      </div>

      {isBanned && banReason !== "-" && (
        <div className="mt-3 rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)]">
            Ban Reason
          </p>

          <p className="mt-1 text-sm font-semibold leading-6 text-[var(--color-text-main)]">
            {banReason}
          </p>
        </div>
      )}

      <div className="mt-4">
        {isBanned ? (
          <Button
            type="button"
            variant="outline"
            isLoading={isUnbanning}
            onClick={onUnban}
            className="w-full justify-center py-2.5 text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            Unban User
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={onBanClick}
            className="w-full justify-center py-2.5 text-xs"
          >
            <Ban className="h-4 w-4" />
            Ban User
          </Button>
        )}
      </div>
    </aside>
  );
}

export default AdminControlPanel;