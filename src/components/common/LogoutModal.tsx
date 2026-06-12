import { AlertTriangle, LogOut } from "lucide-react";

import ConfirmModal from "./ConfirmModal";

interface LogoutModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function LogoutModal({ isOpen, onCancel, onConfirm }: LogoutModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      badgeLabel="Logout"
      title="Sign out of TRACT?"
      description="You are about to end your current session. You will need to sign in again to access your dashboard."
      icon={<LogOut className="h-6 w-6" />}
      confirmIcon={<LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      confirmLabel="Sign Out"
      cancelLabel="Stay Logged In"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />

          <p className="text-xs font-semibold leading-5 text-red-700">
            Make sure any unsaved changes are completed before signing out.
          </p>
        </div>
      </div>
    </ConfirmModal>
  );
}

export default LogoutModal;