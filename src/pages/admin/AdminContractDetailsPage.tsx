import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import {
  Building2,
  CalendarClock,
  FileText,
  Home,
  Link as LinkIcon,
  MapPin,
  UserRound,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";

import {
  useGetAdminContractQuery,
  useGetAdminUserQuery,
} from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  displayValue,
  formatDate,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
} from "../../utils/adminUtils";

// ─── Detail Item ─────────────────────────────────────────────────────────────

function DetailItem({
  label,
  value,
  children,
  icon: Icon,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
  icon?: any;
}) {
  return (
    <div className="group flex h-full flex-col gap-1.5 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3.5 transition hover:border-[var(--color-primary)]/20 hover:shadow-sm">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]/50" />}
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>
      <div className="text-sm font-semibold text-[var(--color-text-main)] leading-snug break-words">
        {children ?? displayValue(value)}
      </div>
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({
  title,
  description,
  icon,
  children,
  cols = 3,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const colClass =
    cols === 4
      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      : cols === 2
      ? "grid-cols-2"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 pb-1 border-b border-[var(--color-border-light)]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>
        <div>
          <h2 className="font-serif text-lg font-black text-[var(--color-primary)] leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className={`grid gap-3 auto-rows-fr ${colClass}`}>{children}</div>
    </section>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  icon: any;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 ${
        accent
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          accent
            ? "bg-[var(--color-primary)]/12 text-[var(--color-primary)]"
            : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]/60"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <div
          className={`mt-0.5 truncate text-sm font-bold ${
            accent ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Signing Status Card ──────────────────────────────────────────────────────

function SigningCard({
  role,
  name,
  signedAt,
}: {
  role: string;
  name: string;
  signedAt: string | null | undefined;
}) {
  const signed = Boolean(signedAt);

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-4 ${
        signed
          ? "border-green-200 bg-green-50"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {role}
        </p>
        {signed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Signed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-muted)]">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-main)] leading-snug">
        {name || "-"}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        {signed ? formatDate(signedAt) : "Not yet signed"}
      </p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isObject(value: any) {
  return value && typeof value === "object";
}

function getDoc(value: any) {
  return value?.data?._doc ?? value?._doc ?? value?.data ?? value;
}

function getRelationIdValue(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;
  const doc = getDoc(value);
  return doc?._id || doc?.id || "";
}

function getRelationId(value: any) {
  return getRelationIdValue(value) || "-";
}

function getRelationEmail(value: any) {
  if (!value || typeof value !== "object") return "-";
  const doc = getDoc(value);
  return doc?.email || "-";
}

function getRelationPhone(value: any) {
  if (!value || typeof value !== "object") return "-";
  const doc = getDoc(value);
  return (
    doc?.phone || doc?.phone_number || doc?.phoneNumber || doc?.mobile || doc?.mobile_number || "-"
  );
}

function hasPersonName(value: any) {
  if (!value || typeof value !== "object") return false;
  const doc = getDoc(value);
  return Boolean(doc?.full_name || doc?.fullName || doc?.name);
}

function hasPersonEmail(value: any) {
  if (!value || typeof value !== "object") return false;
  const doc = getDoc(value);
  return Boolean(doc?.email);
}

function hasPersonPhone(value: any) {
  if (!value || typeof value !== "object") return false;
  const doc = getDoc(value);
  return Boolean(
    doc?.phone || doc?.phone_number || doc?.phoneNumber || doc?.mobile || doc?.mobile_number
  );
}

function hasCompletePerson(value: any) {
  return hasPersonName(value) && hasPersonEmail(value) && hasPersonPhone(value);
}

function mergePerson(primary: any, fallback: any) {
  if (!primary && !fallback) return null;
  if (typeof primary === "string") return fallback || primary;
  const primaryDoc = getDoc(primary) || {};
  const fallbackDoc = getDoc(fallback) || {};
  return {
    ...fallbackDoc,
    ...primaryDoc,
    _id: primaryDoc._id || primaryDoc.id || fallbackDoc._id || fallbackDoc.id,
    id: primaryDoc.id || primaryDoc._id || fallbackDoc.id || fallbackDoc._id,
    full_name:
      primaryDoc.full_name ||
      primaryDoc.fullName ||
      primaryDoc.name ||
      fallbackDoc.full_name ||
      fallbackDoc.fullName ||
      fallbackDoc.name,
    email: primaryDoc.email || fallbackDoc.email,
    phone:
      primaryDoc.phone ||
      primaryDoc.phone_number ||
      primaryDoc.phoneNumber ||
      primaryDoc.mobile ||
      primaryDoc.mobile_number ||
      fallbackDoc.phone ||
      fallbackDoc.phone_number ||
      fallbackDoc.phoneNumber ||
      fallbackDoc.mobile ||
      fallbackDoc.mobile_number,
  };
}

function mergeContractData(apiContract: any, stateContract: any) {
  if (!apiContract && !stateContract) return null;
  if (!apiContract) return stateContract;
  if (!stateContract) return apiContract;
  return {
    ...stateContract,
    ...apiContract,
    property_id: isObject(apiContract.property_id)
      ? apiContract.property_id
      : stateContract.property_id ?? apiContract.property_id,
    seller_id: isObject(apiContract.seller_id)
      ? apiContract.seller_id
      : stateContract.seller_id ?? apiContract.seller_id,
    buyer_id: isObject(apiContract.buyer_id)
      ? apiContract.buyer_id
      : stateContract.buyer_id ?? apiContract.buyer_id,
  };
}

function getPropertyAddress(property: any) {
  if (!property || typeof property !== "object") return "-";
  const doc = getDoc(property);
  const address = [
    doc.address || doc.property_address || doc.street_address,
    doc.city,
    doc.state_code,
    doc.zip_code,
  ]
    .filter(Boolean)
    .join(", ");
  return address || getListingTitle(doc);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminContractDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();

  const stateContract = (location.state as any)?.contract ?? null;

  const {
    data: apiContract,
    isLoading,
    isError,
  } = useGetAdminContractQuery(id, {
    skip: !id || Boolean(stateContract),
  });

  const contract = mergeContractData(apiContract, stateContract);

  const sellerRaw = contract?.seller_id ?? null;
  const buyerRaw = contract?.buyer_id ?? null;

  const sellerUserId = getRelationIdValue(sellerRaw);
  const buyerUserId = getRelationIdValue(buyerRaw);

  const shouldFetchSellerUser = Boolean(sellerUserId) && !hasCompletePerson(sellerRaw);
  const shouldFetchBuyerUser = Boolean(buyerUserId) && !hasCompletePerson(buyerRaw);

  const { data: fetchedSellerUser } = useGetAdminUserQuery(sellerUserId, {
    skip: !shouldFetchSellerUser,
  });

  const { data: fetchedBuyerUser } = useGetAdminUserQuery(buyerUserId, {
    skip: !shouldFetchBuyerUser,
  });

  if (isLoading && !contract) {
    return <Loader label="Loading contract details..." />;
  }

  if ((isError && !contract) || !contract) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load contract details.
      </div>
    );
  }

  const property = contract.property_id;
  const seller = mergePerson(sellerRaw, fetchedSellerUser);
  const buyer = mergePerson(buyerRaw, fetchedBuyerUser);

  const contractId = getMongoId(contract);
  const propertyName = getListingTitle(property);
  const propertyAddress = getPropertyAddress(property);

  const bothSigned = Boolean(contract.seller_signed_at && contract.buyer_signed_at);
  const eitherSigned = Boolean(contract.seller_signed_at || contract.buyer_signed_at);

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Admin · Contract Review
            </p>
            <h1 className="mt-1.5 font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
              Contract Details
            </h1>
            {propertyName && propertyName !== "-" && (
              <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-main)]">
                {propertyName}
              </p>
            )}
            {propertyAddress !== "-" && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {propertyAddress}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={contract.status || "unknown"}
                variant={getStatusVariant(contract.status)}
              />
              {bothSigned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Fully Signed
                </span>
              )}
              {!bothSigned && eitherSigned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  Partially Signed
                </span>
              )}
              {!eitherSigned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-muted)]">
                  <Clock className="h-3.5 w-3.5" />
                  Awaiting Signatures
                </span>
              )}
            </div>
          </div>

          {/* PDF quick-action */}
          {contract.pdf_url && (
            <a
              href={contract.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-3 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10"
            >
              <FileText className="h-4 w-4" />
              View Contract PDF
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          )}
        </div>

        {/* Stat row */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-4">
          <StatCard label="Contract ID" value={contractId || "-"} icon={FileText} />
          <StatCard
            label="Status"
            value={
              <StatusBadge
                label={contract.status || "unknown"}
                variant={getStatusVariant(contract.status)}
              />
            }
            icon={CheckCircle2}
            accent
          />
          <StatCard label="Seller" value={getPersonName(seller) || "-"} icon={UserRound} />
          <StatCard label="Buyer" value={getPersonName(buyer) || "-"} icon={Building2} />
        </div>
      </div>

      {/* ── PDF Preview + Signing Status side-by-side ────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">

        {/* Contract PDF Preview — mirrors image gallery style */}
        {contract.pdf_url ? (
          <section className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-light)] px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-primary)]/60" />
                <span className="text-sm font-black text-[var(--color-primary)]">
                  Contract Preview
                </span>
              </div>
              <a
                href={contract.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition"
              >
                Open full PDF
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            {/* iframe — same fixed height as listing gallery */}
            <div className="bg-[var(--color-bg-soft)]">
              <iframe
                src={contract.pdf_url}
                title="Contract PDF Preview"
                className="h-64 w-full sm:h-80"
                style={{ border: "none", display: "block" }}
              />
            </div>
          </section>
        ) : (
          <div className="rounded-xl border border-[var(--color-border-light)] bg-white px-6 py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
              <FileText className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--color-text-main)]">No PDF attached</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              No contract PDF was uploaded for this contract.
            </p>
          </div>
        )}

        {/* Signing Status — sits beside the PDF */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 pb-1 border-b border-[var(--color-border-light)]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black text-[var(--color-primary)] leading-tight">
                Signing Status
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Track which parties have signed this contract.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SigningCard
              role="Seller"
              name={getPersonName(seller)}
              signedAt={contract.seller_signed_at}
            />
            <SigningCard
              role="Buyer"
              name={getPersonName(buyer)}
              signedAt={contract.buyer_signed_at}
            />
          </div>
        </section>

      </div>

   {/* ── Two-column: Seller + Buyer ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Seller */}
        <SectionBlock
          title="Seller"
          description="Seller attached to this contract."
          icon={<UserRound className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Name" value={getPersonName(seller)} />
          <DetailItem label="Seller ID" value={getRelationId(seller)} />
          <DetailItem label="Email" value={getRelationEmail(seller)} />
          <DetailItem label="Phone" value={getRelationPhone(seller)} />
        </SectionBlock>

        {/* Buyer */}
        <SectionBlock
          title="Buyer"
          description="Buyer, wholesaler, or partner attached to this contract."
          icon={<Building2 className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Name" value={getPersonName(buyer)} />
          <DetailItem label="Buyer ID" value={getRelationId(buyer)} />
          <DetailItem label="Email" value={getRelationEmail(buyer)} />
          <DetailItem label="Phone" value={getRelationPhone(buyer)} />
        </SectionBlock>
      </div>

      {/* ── Two-column: Property + Contract Info ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Property Info */}
        <SectionBlock
          title="Property"
          description="The listing connected to this contract."
          icon={<Home className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Property Name" value={propertyName} />
          <DetailItem label="Property ID" value={getRelationId(property)} />
          <DetailItem label="Address" value={propertyAddress} />
        </SectionBlock>

        {/* Contract Info */}
        <SectionBlock
          title="Contract Info"
          description="Identity, status, and document link."
          icon={<FileText className="h-4 w-4" />}
          cols={2}
        >
          <DetailItem label="Contract ID" value={contractId} />
          <DetailItem label="Status">
            <StatusBadge
              label={contract.status || "unknown"}
              variant={getStatusVariant(contract.status)}
            />
          </DetailItem>
          <DetailItem label="PDF Document">
            {contract.pdf_url ? (
              <a
                href={contract.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:underline transition"
              >
                Open Contract PDF
                <LinkIcon className="h-3.5 w-3.5" />
              </a>
            ) : (
              "-"
            )}
          </DetailItem>
        </SectionBlock>
      </div>

   
      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <SectionBlock
        title="Timeline"
        description="Contract creation and update history."
        icon={<CalendarClock className="h-4 w-4" />}
        cols={4}
      >
        <DetailItem label="Created At" value={formatDate(contract.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(contract.updatedAt)} />
        <DetailItem label="Seller Signed At" value={formatDate(contract.seller_signed_at)} />
        <DetailItem label="Buyer Signed At" value={formatDate(contract.buyer_signed_at)} />
      </SectionBlock>

    </div>
  );
}

export default AdminContractDetailsPage;