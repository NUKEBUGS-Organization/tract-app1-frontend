import { LogOut } from "lucide-react";

import ConfirmModal from "./ConfirmModal";

interface LogoutModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function LogoutModal({
  isOpen,
  isLoading = false,
  onCancel,
  onConfirm,
}: LogoutModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      title="Sign out?"
      description="You are about to end your current session. You will need to sign in again to access your dashboard."
      icon={<LogOut className="h-5 w-5" />}
      confirmLabel="Sign Out"
      cancelLabel="Stay Logged In"
      loadingLabel="Signing out..."
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

export default LogoutModal;