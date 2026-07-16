import { RotateCcw, ShieldAlert } from "lucide-react";

import Button from "../../../components/common/Button";
import SectionBlock from "./SectionBlock";
import {
  formatLabel,
  getRawRole,
  getScoreEventOptions,
} from "./adminUserDetails.helpers";
import { normalizeValue } from "../../../utils/adminUtils";

function AdminScoreActions({
  user,
  eventType,
  dealId,
  note,
  delta,
  resetNote,
  error,
  success,
  isApplyingPenalty,
  isResettingScore,
  onEventTypeChange,
  onDealIdChange,
  onNoteChange,
  onDeltaChange,
  onResetNoteChange,
  onApplyPenalty,
  onResetScore,
}: {
  user: any;
  eventType: string;
  dealId: string;
  note: string;
  delta: string;
  resetNote: string;
  error: string;
  success: string;
  isApplyingPenalty: boolean;
  isResettingScore: boolean;
  onEventTypeChange: (value: string) => void;
  onDealIdChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onDeltaChange: (value: string) => void;
  onResetNoteChange: (value: string) => void;
  onApplyPenalty: () => void;
  onResetScore: () => void;
}) {
  const options = getScoreEventOptions(user);
  const role = normalizeValue(getRawRole(user));
  const canScore = options.length > 0;
  const isManualAdjustment = eventType === "manual_adjustment";
  const selectedOption = options.find((option) => option.value === eventType);

  return (
    <SectionBlock
      title="Admin Score Actions"
      description={
        canScore
          ? "Manually apply a score penalty or reset this partner's score."
          : "Score penalties currently apply only to wholesalers and realtors."
      }
      icon={<ShieldAlert className="h-5 w-5" aria-hidden="true" />}
    >
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3.5 sm:col-span-2 xl:col-span-3">
        {!canScore ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-4">
            <p className="text-sm font-bold text-[var(--color-text-main)]">
              No score action available for {formatLabel(role)}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 px-4 py-3 text-sm font-semibold text-[var(--color-danger)]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
                {success}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Penalty Reason
              </label>

              <select
                value={eventType}
                onChange={(event) => onEventTypeChange(event.target.value)}
                className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-bold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
              >
                <option value="">Select score event...</option>

                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {selectedOption && (
                <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                  {selectedOption.description}
                </p>
              )}
            </div>

            {isManualAdjustment && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  Manual Delta
                </label>

                <input
                  type="number"
                  value={delta}
                  onChange={(event) => onDeltaChange(event.target.value)}
                  placeholder="-5"
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-bold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
                />

                <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                  Use a negative value for penalty, for example -5 or -10.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Related Deal ID Optional
              </label>

              <input
                type="text"
                value={dealId}
                onChange={(event) => onDealIdChange(event.target.value)}
                placeholder="Paste deal id if this penalty is deal-related"
                className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-bold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Admin Note Optional
              </label>

              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                rows={3}
                placeholder="Example: Missed required milestone after seller reminders."
                className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-bold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
              />
            </div>

            <Button
              type="button"
              variant="danger"
              isLoading={isApplyingPenalty}
              onClick={onApplyPenalty}
              className="w-full justify-center py-2.5 text-xs"
            >
              <ShieldAlert className="h-4 w-4" />
              Apply Penalty
            </Button>

            <div className="border-t border-[var(--color-border-light)] pt-4">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Reset Score Note Optional
              </label>

              <textarea
                value={resetNote}
                onChange={(event) => onResetNoteChange(event.target.value)}
                rows={2}
                placeholder="Example: Score reset after admin review."
                className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-bold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
              />

              <Button
                type="button"
                variant="outline"
                isLoading={isResettingScore}
                onClick={onResetScore}
                className="mt-3 w-full justify-center py-2.5 text-xs"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Score to 100
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionBlock>
  );
}

export default AdminScoreActions;