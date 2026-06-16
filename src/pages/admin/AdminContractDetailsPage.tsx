import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import {
  Building2,
  CalendarClock,
  FileText,
  Home,
  Link as LinkIcon,
  UserRound,
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

function DetailItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <div className="mt-2 break-words text-sm font-bold text-[var(--color-text-main)]">
        {children ?? displayValue(value)}
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {icon}
        </div>

        <div>
          <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

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
    doc?.phone ||
    doc?.phone_number ||
    doc?.phoneNumber ||
    doc?.mobile ||
    doc?.mobile_number ||
    "-"
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
    doc?.phone ||
      doc?.phone_number ||
      doc?.phoneNumber ||
      doc?.mobile ||
      doc?.mobile_number
  );
}

function hasCompletePerson(value: any) {
  return hasPersonName(value) && hasPersonEmail(value) && hasPersonPhone(value);
}

function mergePerson(primary: any, fallback: any) {
  if (!primary && !fallback) return null;

  if (typeof primary === "string") {
    return fallback || primary;
  }

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

  const shouldFetchSellerUser =
    Boolean(sellerUserId) && !hasCompletePerson(sellerRaw);

  const shouldFetchBuyerUser =
    Boolean(buyerUserId) && !hasCompletePerson(buyerRaw);

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
      <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Admin Contract Review
            </p>

            <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)]">
              Contract Details
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Review contract, property, seller, buyer, and signing information
              in one place.
            </p>
          </div>

          <StatusBadge
            label={contract.status || "unknown"}
            variant={getStatusVariant(contract.status)}
          />
        </div>
      </div>

      {/* Contract Info */}
      <SectionBlock
        title="Contract Info"
        description="Basic contract identity, status, and PDF information."
        icon={<FileText className="h-5 w-5" />}
      >
        <DetailItem label="Contract ID" value={contractId} />

        <DetailItem label="Status">
          <StatusBadge
            label={contract.status || "unknown"}
            variant={getStatusVariant(contract.status)}
          />
        </DetailItem>

        <DetailItem label="PDF URL">
          {contract.pdf_url ? (
            <a
              href={contract.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:underline"
            >
              Open Contract PDF
              <LinkIcon className="h-4 w-4" />
            </a>
          ) : (
            "-"
          )}
        </DetailItem>
      </SectionBlock>

      {/* Property Info */}
      <SectionBlock
        title="Property Info"
        description="The listing/property connected with this contract."
        icon={<Home className="h-5 w-5" />}
      >
        <DetailItem label="Property Name" value={propertyName} />

        <DetailItem label="Property Address" value={propertyAddress} />

        <DetailItem label="Property ID" value={getRelationId(property)} />
      </SectionBlock>

      {/* Seller Info */}
      <SectionBlock
        title="Seller Info"
        description="Seller attached to this contract."
        icon={<UserRound className="h-5 w-5" />}
      >
        <DetailItem label="Seller Name" value={getPersonName(seller)} />

        <DetailItem label="Seller ID" value={getRelationId(seller)} />

        <DetailItem label="Seller Email" value={getRelationEmail(seller)} />

        <DetailItem label="Seller Phone" value={getRelationPhone(seller)} />
      </SectionBlock>

      {/* Buyer Info */}
      <SectionBlock
        title="Buyer Info"
        description="Buyer, wholesaler, realtor, or partner attached to this contract."
        icon={<Building2 className="h-5 w-5" />}
      >
        <DetailItem label="Buyer Name" value={getPersonName(buyer)} />

        <DetailItem label="Buyer ID" value={getRelationId(buyer)} />

        <DetailItem label="Buyer Email" value={getRelationEmail(buyer)} />

        <DetailItem label="Buyer Phone" value={getRelationPhone(buyer)} />
      </SectionBlock>

      {/* Signing Timeline */}
      <SectionBlock
        title="Signing Timeline"
        description="Track when each party signed and when the contract was created or updated."
        icon={<CalendarClock className="h-5 w-5" />}
      >
        <DetailItem
          label="Seller Signed At"
          value={formatDate(contract.seller_signed_at)}
        />

        <DetailItem
          label="Buyer Signed At"
          value={formatDate(contract.buyer_signed_at)}
        />

        <DetailItem label="Created At" value={formatDate(contract.createdAt)} />

        <DetailItem label="Updated At" value={formatDate(contract.updatedAt)} />
      </SectionBlock>
    </div>
  );
}

export default AdminContractDetailsPage;