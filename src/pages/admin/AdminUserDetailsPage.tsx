import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import {
  useApplyAdminScorePenaltyMutation,
  useBanAdminUserMutation,
  useGetAdminUserQuery,
  useGetAdminUserScoreQuery,
  useResetAdminUserScoreMutation,
  useUnbanAdminUserMutation,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import { DetailPageSkeleton } from "../../components/common/Skeleton";
import StatusBadge from "../../components/common/StatusBadge";
import {
  formatDate,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

import AdminControlPanel from "./user-details/AdminControlPanel";
import AdminScoreActions from "./user-details/AdminScoreActions";
import AdminUserHero from "./user-details/AdminUserHero";
import DetailItem from "./user-details/DetailItem";
import ScoreSection from "./user-details/ScoreSection";
import SectionBlock from "./user-details/SectionBlock";
import {
  formatLabel,
  getBanReason,
  getCity,
  getCountry,
  getCreatedAt,
  getDoc,
  getEmail,
  getFullAddress,
  getKycStatus,
  getPhone,
  getRawRole,
  getScoreEventOptions,
  getState,
  getStreetAddress,
  getUpdatedAt,
  getZipCode,
} from "./user-details/adminUserDetails.helpers";

function AdminUserDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [banReason, setBanReason] = useState("");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  const [scoreEventType, setScoreEventType] = useState("");
  const [scoreDealId, setScoreDealId] = useState("");
  const [scoreNote, setScoreNote] = useState("");
  const [scoreDelta, setScoreDelta] = useState("-5");
  const [scoreActionError, setScoreActionError] = useState("");
  const [scoreActionSuccess, setScoreActionSuccess] = useState("");
  const [resetScoreNote, setResetScoreNote] = useState("");

  const {
    data: userResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAdminUserQuery(id, { skip: !id });

  const {
    data: scoreResponse,
    isLoading: isScoreLoading,
    isError: isScoreError,
    refetch: refetchScore,
  } = useGetAdminUserScoreQuery(id, { skip: !id });

  const [banUser, { isLoading: isBanning }] = useBanAdminUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanAdminUserMutation();

  const [applyScorePenalty, { isLoading: isApplyingPenalty }] =
    useApplyAdminScorePenaltyMutation();

  const [resetUserScore, { isLoading: isResettingScore }] =
    useResetAdminUserScoreMutation();

  const user = getDoc(userResponse);

  async function handleBan() {
    if (!user || banReason.trim().length < 3) return;

    await banUser({
      id: getMongoId(user),
      reason: banReason.trim(),
    }).unwrap();

    setIsBanModalOpen(false);
    setBanReason("");
    refetch();
    refetchScore();
  }

  async function handleUnban() {
    if (!user) return;

    await unbanUser(getMongoId(user)).unwrap();

    refetch();
    refetchScore();
  }

  async function handleApplyScorePenalty() {
    if (!user) return;

    setScoreActionError("");
    setScoreActionSuccess("");

    const options = getScoreEventOptions(user);

    if (options.length === 0) {
      setScoreActionError(
        "Score penalties only apply to wholesalers and realtors."
      );
      return;
    }

    if (!scoreEventType) {
      setScoreActionError("Please select a penalty reason.");
      return;
    }

    const isManualAdjustment = scoreEventType === "manual_adjustment";
    const parsedDelta = Number(scoreDelta);

    if (isManualAdjustment && Number.isNaN(parsedDelta)) {
      setScoreActionError("Please enter a valid delta for manual adjustment.");
      return;
    }

    if (isManualAdjustment && parsedDelta === 0) {
      setScoreActionError("Manual adjustment delta cannot be 0.");
      return;
    }

    if (scoreNote.trim() && scoreNote.trim().length < 3) {
      setScoreActionError("Note must be at least 3 characters.");
      return;
    }

    try {
      await applyScorePenalty({
        user_id: getMongoId(user),
        event_type: scoreEventType,
        ...(scoreDealId.trim() ? { deal_id: scoreDealId.trim() } : {}),
        ...(scoreNote.trim() ? { note: scoreNote.trim() } : {}),
        ...(isManualAdjustment ? { delta: parsedDelta } : {}),
      }).unwrap();

      setScoreActionSuccess("Score penalty applied successfully.");
      setScoreEventType("");
      setScoreDealId("");
      setScoreNote("");
      setScoreDelta("-5");

      refetch();
      refetchScore();
    } catch (error: any) {
      setScoreActionError(
        error?.data?.message ||
          error?.message ||
          "Failed to apply score penalty."
      );
    }
  }

  async function handleResetScore() {
    if (!user) return;

    setScoreActionError("");
    setScoreActionSuccess("");

    if (resetScoreNote.trim() && resetScoreNote.trim().length < 3) {
      setScoreActionError("Reset note must be at least 3 characters.");
      return;
    }

    try {
      await resetUserScore({
        userId: getMongoId(user),
        ...(resetScoreNote.trim() ? { note: resetScoreNote.trim() } : {}),
      }).unwrap();

      setScoreActionSuccess("Score reset to 100 successfully.");
      setResetScoreNote("");

      refetch();
      refetchScore();
    } catch (error: any) {
      setScoreActionError(
        error?.data?.message || error?.message || "Failed to reset score."
      );
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-base font-black text-[var(--color-danger)]">
          Failed to load user details
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          The user could not be loaded. Please go back and try again.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/users")}
          className="mt-4 justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  const fullName = getPersonName(user);
  const email = getEmail(user);
  const phone = getPhone(user);
  const fullAddress = getFullAddress(user);
  const role = normalizeValue(getRawRole(user));
  const kycStatus = normalizeValue(getKycStatus(user));
  const isBanned = user?.is_banned === true;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Users
      </button>

      <AdminUserHero user={user} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <main className="min-w-0 space-y-6">
          <SectionBlock
            title="Contact"
            description="Primary contact details for this user."
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          >
            <DetailItem label="Full Name" value={fullName} featured />

            <DetailItem
              label="Email"
              value={email}
              icon={<Mail className="h-3.5 w-3.5" aria-hidden="true" />}
            />

            <DetailItem
              label="Phone"
              value={phone}
              icon={<Phone className="h-3.5 w-3.5" aria-hidden="true" />}
            />

            <DetailItem label="Role" value={formatLabel(role)} />
          </SectionBlock>

          <ScoreSection
            user={user}
            scoreResponse={scoreResponse}
            isLoading={isScoreLoading}
            isError={isScoreError}
          />

          <AdminScoreActions
            user={user}
            eventType={scoreEventType}
            dealId={scoreDealId}
            note={scoreNote}
            delta={scoreDelta}
            resetNote={resetScoreNote}
            error={scoreActionError}
            success={scoreActionSuccess}
            isApplyingPenalty={isApplyingPenalty}
            isResettingScore={isResettingScore}
            onEventTypeChange={setScoreEventType}
            onDealIdChange={setScoreDealId}
            onNoteChange={setScoreNote}
            onDeltaChange={setScoreDelta}
            onResetNoteChange={setResetScoreNote}
            onApplyPenalty={handleApplyScorePenalty}
            onResetScore={handleResetScore}
          />

          <SectionBlock
            title="Address"
            description={
              fullAddress === "-"
                ? "No registered address is available for this user."
                : "Registered address from the user profile."
            }
            icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
          >
            <DetailItem label="Street Address" value={getStreetAddress(user)} />

            <DetailItem label="City" value={getCity(user)} />

            <DetailItem label="State" value={getState(user)} />

            <DetailItem label="Zip Code" value={getZipCode(user)} />

            <DetailItem label="Country" value={getCountry(user)} />

            <DetailItem label="Full Address" value={fullAddress} featured />
          </SectionBlock>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionBlock
              title="Account Status"
              description="Role, KYC, and access information."
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              columns="compact"
            >
              <DetailItem label="Role" value={formatLabel(role)} />

              <DetailItem label="KYC Status">
                <StatusBadge
                  label={formatLabel(kycStatus)}
                  variant={getStatusVariant(kycStatus)}
                />
              </DetailItem>

              <DetailItem label="Account Access">
                <StatusBadge
                  label={isBanned ? "Banned" : "Active"}
                  variant={isBanned ? "danger" : "success"}
                />
              </DetailItem>

              {isBanned && getBanReason(user) !== "-" && (
                <DetailItem label="Ban Reason" value={getBanReason(user)} />
              )}
            </SectionBlock>

            <SectionBlock
              title="Timeline"
              description="Account creation and latest profile update."
              icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
              columns="compact"
            >
              <DetailItem
                label="Created"
                value={formatDate(getCreatedAt(user))}
                icon={
                  <CalendarClock
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                }
              />

              <DetailItem
                label="Last Updated"
                value={formatDate(getUpdatedAt(user))}
                icon={<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}
              />
            </SectionBlock>
          </div>
        </main>

        <AdminControlPanel
          user={user}
          isUnbanning={isUnbanning}
          onBanClick={() => setIsBanModalOpen(true)}
          onUnban={handleUnban}
        />
      </div>

      <ConfirmModal
        isOpen={isBanModalOpen}
        variant="danger"
        title="Ban user?"
        description={`This will block ${fullName} from platform access until an admin removes the ban.`}
        icon={<Ban className="h-5 w-5" />}
        confirmLabel="Ban User"
        loadingLabel="Banning..."
        isLoading={isBanning}
        onCancel={() => {
          setIsBanModalOpen(false);
          setBanReason("");
        }}
        onConfirm={handleBan}
      >
        <div>
          <label
            htmlFor="user-ban-reason"
            className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
          >
            Ban reason
          </label>

          <textarea
            id="user-ban-reason"
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
            rows={4}
            placeholder="Enter ban reason..."
            className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />

          <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">
            Minimum 3 characters are required before this action can be
            submitted.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default AdminUserDetailsPage;