import { UserRound } from "lucide-react";
import { getInitials } from "./adminUserDetails.helpers";

function UserAvatar({ name, isBanned }: { name: string; isBanned: boolean }) {
  const initials = getInitials(name);

  return (
    <div
      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-xl font-black text-white shadow-lg sm:h-20 sm:w-20 ${
        isBanned ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/10" />

      {initials || <UserRound className="h-8 w-8" aria-hidden="true" />}

      <span
        className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white ${
          isBanned ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]"
        }`}
      />
    </div>
  );
}

export default UserAvatar;