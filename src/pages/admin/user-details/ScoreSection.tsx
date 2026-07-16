import { ShieldAlert, ShieldCheck } from "lucide-react";

import StatusBadge from "../../../components/common/StatusBadge";
import { formatDate, getMongoId } from "../../../utils/adminUtils";
import DetailItem from "./DetailItem";
import SectionBlock from "./SectionBlock";
import {
  formatDelta,
  formatLabel,
  getDoc,
  getEventCreatedAt,
  getLastPenalty,
  getPartnerScoreInfo,
  getRestrictionVariant,
  getScoreHistory,
  getScoreUser,
  getScoreVariant,
} from "./adminUserDetails.helpers";

function ScoreSection({
  user,
  scoreResponse,
  isLoading,
  isError,
}: {
  user: any;
  scoreResponse: any;
  isLoading: boolean;
  isError: boolean;
}) {
  const scoreUser = getScoreUser(scoreResponse);
  const scoreInfo = getPartnerScoreInfo(user, scoreUser);
  const history = getScoreHistory(scoreResponse);
  const lastPenalty = getLastPenalty(scoreResponse);

  const restrictionStatus =
    scoreUser?.restriction_status || user?.restriction_status || "normal";

  const restrictedUntil =
    scoreUser?.restricted_until || user?.restricted_until || null;

  if (isLoading) {
    return (
      <SectionBlock
        title="Score & Restrictions"
        description="Loading score details for this user."
        icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
      >
        <DetailItem label="Score" value="Loading..." featured />
        <DetailItem label="Restriction" value="Loading..." />
      </SectionBlock>
    );
  }

  if (isError) {
    return (
      <SectionBlock
        title="Score & Restrictions"
        description="Score details could not be loaded."
        icon={<ShieldAlert className="h-5 w-5" aria-hidden="true" />}
      >
        <DetailItem label="Score" value="Unable to load score" featured />
        <DetailItem label="Note" value="Please refresh the page." />
      </SectionBlock>
    );
  }

  return (
    <SectionBlock
      title="Score & Restrictions"
      description={scoreInfo.description}
      icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
    >
      <DetailItem label={scoreInfo.label} featured>
        {scoreInfo.applies ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-black">{scoreInfo.value}</span>

            <StatusBadge
              label={`${scoreInfo.value}/100`}
              variant={getScoreVariant(scoreInfo.value)}
            />
          </div>
        ) : (
          <StatusBadge label="N/A" variant="neutral" />
        )}
      </DetailItem>

      <DetailItem label="Restriction Status">
        <StatusBadge
          label={formatLabel(restrictionStatus)}
          variant={getRestrictionVariant(restrictionStatus)}
        />
      </DetailItem>

      <DetailItem
        label="Restricted Until"
        value={restrictedUntil ? formatDate(restrictedUntil) : "-"}
      />

      <DetailItem label="Last Penalty">
        {lastPenalty ? (
          <div className="space-y-1">
            <p className="font-black text-[var(--color-text-main)]">
              {formatLabel(lastPenalty.event_type)}
            </p>

            <p className="text-xs font-semibold text-[var(--color-text-muted)]">
              {formatDelta(lastPenalty.delta)} points
              {lastPenalty.created_at
                ? ` • ${formatDate(lastPenalty.created_at)}`
                : ""}
            </p>

            {lastPenalty.note && (
              <p className="text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                {lastPenalty.note}
              </p>
            )}
          </div>
        ) : (
          "No penalties yet"
        )}
      </DetailItem>

      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3.5 sm:col-span-2 xl:col-span-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Recent Score History
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
              Latest score events.
            </p>
          </div>

          <StatusBadge
            label={`${history.length} event${history.length === 1 ? "" : "s"}`}
            variant="neutral"
          />
        </div>

        {history.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">
            No score events found for this user.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {history.slice(0, 5).map((event: any, index: number) => {
              const doc = getDoc(event);
              const delta = Number(doc?.delta ?? 0);

              return (
                <div
                  key={getMongoId(doc) || `${doc?.event_type}-${index}`}
                  className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[var(--color-text-main)]">
                        {formatLabel(doc?.event_type || "-")}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                        {formatDate(getEventCreatedAt(doc))}
                      </p>

                      {doc?.note && (
                        <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                          {doc.note}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge
                        label={`${formatDelta(delta)} pts`}
                        variant={
                          delta < 0
                            ? "danger"
                            : delta > 0
                              ? "success"
                              : "neutral"
                        }
                      />

                      <StatusBadge
                        label={`${doc?.score_before ?? "-"} → ${
                          doc?.score_after ?? "-"
                        }`}
                        variant="neutral"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionBlock>
  );
}

export default ScoreSection;