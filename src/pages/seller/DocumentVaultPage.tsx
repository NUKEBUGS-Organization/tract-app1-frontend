import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileImage,
  FileText,
  FolderLock,
  Info,
  Loader2,
  RefreshCw,
  Send,
  Upload,
} from "lucide-react";

import {
  useGetListingDocumentsQuery,
  useGetListingsDashboardQuery,
  useSubmitListingMutation,
  useUploadListingDocumentsMutation,
} from "../../services/listingService";

type DocumentCategory =
  | "survey"
  | "tax_bill"
  | "property_picture"
  | "loi"
  | "proof_of_funds"
  | "other";

interface VaultDoc {
  id: DocumentCategory;
  title: string;
  desc: string;
  required: boolean;
  icon: string;
  accept: string;
  allowMultiple?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PROPERTY_PICTURES = 10;

const REQUIRED_DOC_TYPES: DocumentCategory[] = ["survey", "tax_bill"];

const VAULT_DOCS: VaultDoc[] = [
  {
    id: "survey",
    title: "Property Survey",
    desc: "Boundary or property survey document.",
    required: true,
    icon: "📐",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },
  {
    id: "tax_bill",
    title: "Latest Property Tax Bill",
    desc: "Current or most recent property tax bill.",
    required: true,
    icon: "🏛️",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },
  {
    id: "property_picture",
    title: "Property Pictures",
    desc: "Additional property images. You can upload up to 10.",
    required: false,
    icon: "🏡",
    accept: ".jpg,.jpeg,.png",
    allowMultiple: true,
  },
  {
    id: "loi",
    title: "LOI",
    desc: "Letter of intent document, if available.",
    required: false,
    icon: "📄",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },
  {
    id: "proof_of_funds",
    title: "Proof of Funds",
    desc: "Proof of available funds, if required for the deal.",
    required: false,
    icon: "💰",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },
  {
    id: "other",
    title: "Other Document",
    desc: "Any other supported document for this listing.",
    required: false,
    icon: "📎",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },
];

function isMongoObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getDocumentsFromResponse(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload?.documents)) {
    return payload.documents;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

function getListingsFromResponse(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload?.listings)) {
    return payload.listings;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

function formatFileSize(bytes?: number) {
  if (!bytes || Number.isNaN(Number(bytes))) {
    return "-";
  }

  return `${(Number(bytes) / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getAllowedExtensions(docType: DocumentCategory) {
  if (docType === "property_picture") {
    return ["jpg", "jpeg", "png"];
  }

  return ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function validateFiles(docType: DocumentCategory, files: File[]) {
  if (files.length === 0) {
    return "Please select a file.";
  }

  if (docType !== "property_picture" && files.length > 1) {
    return "Please upload one file for this document.";
  }

  if (docType === "property_picture" && files.length > MAX_PROPERTY_PICTURES) {
    return "You can upload a maximum of 10 property pictures.";
  }

  const allowedExtensions = getAllowedExtensions(docType);

  const invalidExtensionFile = files.find(
    (file) => !allowedExtensions.includes(getFileExtension(file.name))
  );

  if (invalidExtensionFile) {
    return `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}.`;
  }

  const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);

  if (oversizedFile) {
    return "Each file must be 20 MB or smaller.";
  }

  return null;
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
}

function getListingLabel(listing: any) {
  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function getDocumentLabel(type?: string) {
  const doc = VAULT_DOCS.find((item) => item.id === type);

  return doc?.title || "Other Document";
}

function hasDocumentType(documents: any[], documentType: DocumentCategory) {
  return documents.some(
    (document) =>
      String(document?.document_type || "").toLowerCase() === documentType
  );
}

function DropZone({
  doc,
  disabled,
  isUploading,
  onUpload,
}: {
  doc: VaultDoc;
  disabled: boolean;
  isUploading: boolean;
  onUpload: (docType: DocumentCategory, files: File[]) => void;
}) {
  const [drag, setDrag] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || disabled || isUploading) return;

    onUpload(doc.id, Array.from(fileList));
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDrag(false);

        if (!disabled) {
          handleFiles(event.dataTransfer.files);
        }
      }}
      className={`mt-4 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed py-7 transition-all ${
        drag
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] hover:border-[var(--color-primary)]/50"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      {isUploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      ) : (
        <Upload
          className={`h-6 w-6 ${
            drag
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-muted)]"
          }`}
        />
      )}

      <p className="text-[11px] font-bold text-[var(--color-text-muted)]">
        {isUploading ? "Uploading..." : "Drag & drop your file"}
      </p>

      <label className="cursor-pointer text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)] underline underline-offset-4">
        Browse Files
        <input
          type="file"
          accept={doc.accept}
          multiple={Boolean(doc.allowMultiple)}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      <p className="text-[10px] text-[var(--color-text-muted)]/60">
        {doc.id === "property_picture"
          ? "JPG, PNG · Max 10 files · 20 MB each"
          : "PDF, DOC, JPG, PNG · Max 20 MB"}
      </p>
    </div>
  );
}

export default function DocumentVaultPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const listingIdFromUrl = searchParams.get("listingId") || "";
  const hasInvalidListingId = Boolean(
    listingIdFromUrl && !isMongoObjectId(listingIdFromUrl)
  );

  const listingId = isMongoObjectId(listingIdFromUrl) ? listingIdFromUrl : "";

  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingDocType, setUploadingDocType] =
    useState<DocumentCategory | null>(null);

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isFetching: isFetchingDashboard,
    refetch: refetchDashboard,
  } = useGetListingsDashboardQuery();

  const sellerListings = getListingsFromResponse(dashboardData);

  const selectedListing =
    sellerListings.find((listing: any) => String(listing?._id) === listingId) ||
    null;

  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    isFetching: isFetchingDocuments,
    refetch: refetchDocuments,
  } = useGetListingDocumentsQuery(listingId, {
    skip: !listingId,
  });

  const savedDocuments = getDocumentsFromResponse(documentsData);

  const [uploadListingDocuments] = useUploadListingDocumentsMutation();

  const [submitListing, { isLoading: isSubmitting }] =
    useSubmitListingMutation();

  const requiredUploadedCount = REQUIRED_DOC_TYPES.filter((docType) =>
    hasDocumentType(savedDocuments, docType)
  ).length;

  const requiredPct = Math.round(
    (requiredUploadedCount / REQUIRED_DOC_TYPES.length) * 100
  );

  const canSubmit = requiredUploadedCount === REQUIRED_DOC_TYPES.length;

  const handleSelectListing = (selectedId: string) => {
    if (!isMongoObjectId(selectedId)) {
      setApiError("Invalid listing selected.");
      return;
    }

    setApiError(null);
    setSubmitted(false);
    setSearchParams({ listingId: selectedId });
  };

  const handleChangeListing = () => {
    setApiError(null);
    setSubmitted(false);
    setSearchParams({});
  };

  const handleUpload = async (
    docType: DocumentCategory,
    selectedFiles: File[]
  ) => {
    if (!listingId) {
      setApiError("Please select a listing before uploading documents.");
      return;
    }

    const validationError = validateFiles(docType, selectedFiles);

    if (validationError) {
      setApiError(validationError);
      return;
    }

    try {
      setApiError(null);
      setUploadingDocType(docType);

      await uploadListingDocuments({
        listingId,
        files: selectedFiles,
        documentTypes: selectedFiles.map(() => docType),
      }).unwrap();

      await refetchDocuments();
    } catch (error: any) {
      setApiError(
        getErrorMessage(error, "Unable to upload document. Please try again.")
      );
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleSubmitListing = async () => {
    if (!listingId) {
      setApiError("Please select a listing before submitting.");
      return;
    }

    if (!canSubmit) {
      setApiError(
        "Please upload the required survey and tax bill before submitting."
      );
      return;
    }

    try {
      setApiError(null);

      await submitListing(listingId).unwrap();

      setSubmitted(true);
      await refetchDashboard();
    } catch (error: any) {
      setApiError(
        getErrorMessage(
          error,
          "Failed to submit listing. Please review the required documents."
        )
      );
    }
  };

  if (!listingId) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Seller Portal
            </p>

            <h1 className="mt-1 flex items-center gap-3 font-serif text-3xl font-black text-[var(--color-primary)]">
              <FolderLock className="h-7 w-7 text-[var(--color-secondary)]" />
              Document Vault
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Select a listing to manage its documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetchDashboard()}
            className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)]"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isFetchingDashboard ? "animate-spin" : ""
              }`}
            />
            Refresh Listings
          </button>
        </div>

        {hasInvalidListingId && (
          <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
            Invalid listing link. Please select a listing from below.
          </div>
        )}

        {apiError && (
          <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
            {apiError}
          </div>
        )}

        {isLoadingDashboard ? (
          <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />

            <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
              Loading your listings...
            </p>
          </div>
        ) : sellerListings.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-white p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4">
              <Info className="mt-1 h-6 w-6 shrink-0 text-[var(--color-secondary)]" />

              <div>
                <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
                  No listings found
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                  Create a property listing first. After the listing is created,
                  you can upload required documents here.
                </p>

                <Link
                  to="/list-property"
                  className="mt-6 inline-flex bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.02]"
                >
                  Create Listing
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-4 font-serif text-xl font-black text-[var(--color-primary)]">
              Select Listing
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sellerListings.map((listing: any) => {
                const id = String(listing?._id || "");

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectListing(id)}
                    className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:shadow-xl"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <h3 className="text-sm font-black text-[var(--color-primary)]">
                        {getListingLabel(listing)}
                      </h3>

                      <span className="shrink-0 bg-[var(--color-primary)]/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                        {listing?.status || "draft"}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                      <p>Property type: {listing?.property_type || "-"}</p>
                      <p>Market price: {listing?.market_price || "-"}</p>
                    </div>

                    <div className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                      Open Vault →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Seller Portal
          </p>

          <h1 className="mt-1 flex items-center gap-3 font-serif text-3xl font-black text-[var(--color-primary)]">
            <FolderLock className="h-7 w-7 text-[var(--color-secondary)]" />
            Document Vault
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Upload and manage documents for this listing. Survey and tax bill
            are required before submission.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-2">
          <Clock className="h-3.5 w-3.5 text-[var(--color-primary)]" />

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Listing Documents
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Active Listing
            </p>

            <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">
              {selectedListing ? getListingLabel(selectedListing) : listingId}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refetchDocuments()}
              className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetchingDocuments ? "animate-spin" : ""
                }`}
              />
              Refresh Documents
            </button>

            <button
              type="button"
              onClick={handleChangeListing}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white"
            >
              Change Listing
            </button>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      {submitted && (
        <div className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />

            <div>
              <p className="text-sm font-black text-[var(--color-primary)]">
                Listing submitted successfully.
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                Your listing has been submitted for review.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Required Documents
            </p>

            <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
              {requiredUploadedCount} of {REQUIRED_DOC_TYPES.length} uploaded
            </p>
          </div>

          <span
            className={`font-serif text-2xl font-black ${
              requiredPct === 100
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {requiredPct}%
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border-light)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
            style={{ width: `${requiredPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {VAULT_DOCS.map((doc) => {
          const done = hasDocumentType(savedDocuments, doc.id);
          const isUploading = uploadingDocType === doc.id;

          return (
            <div
              key={doc.id}
              className={`rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] transition ${
                done
                  ? "border-[var(--color-primary)]/40"
                  : "border-[var(--color-border-light)]"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="text-2xl">{doc.icon}</span>

                  <h3 className="mt-2 text-sm font-black text-[var(--color-primary)]">
                    {doc.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                    {doc.desc}
                  </p>
                </div>

                {doc.required && (
                  <span className="shrink-0 bg-[var(--color-danger)]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--color-danger)]">
                    Required
                  </span>
                )}
              </div>

              {done && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />

                  <span className="text-[11px] font-bold text-[var(--color-primary)]">
                    Uploaded
                  </span>
                </div>
              )}

              <DropZone
                doc={doc}
                disabled={isLoadingDocuments}
                isUploading={isUploading}
                onUpload={handleUpload}
              />
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="mb-4 font-serif text-xl font-black text-[var(--color-primary)]">
          Uploaded Documents
        </h2>

        <div className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          {isLoadingDocuments ? (
            <div className="p-8 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[var(--color-primary)]" />

              <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
                Loading documents...
              </p>
            </div>
          ) : savedDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />

              <p className="mt-3 text-sm font-semibold text-[var(--color-text-main)]">
                No documents uploaded yet.
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Upload survey and tax bill to complete the required documents.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["Document", "Category", "Size", "Uploaded", ""].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {savedDocuments.map((document: any) => {
                    const isImage =
                      String(document?.mime_type || "").startsWith("image/") ||
                      document?.document_type === "property_picture";

                    return (
                      <tr
                        key={document?._id || document?.url}
                        className="border-t border-[var(--color-border-light)] transition hover:bg-[var(--color-bg-soft)]/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                              {isImage ? (
                                <FileImage className="h-4 w-4 text-[var(--color-primary)]" />
                              ) : (
                                <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                              )}
                            </div>

                            <span className="text-sm font-bold text-[var(--color-text-main)]">
                              {document?.file_name || "Uploaded Document"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-xs font-bold text-[var(--color-primary)]">
                          {getDocumentLabel(document?.document_type)}
                        </td>

                        <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
                          {formatFileSize(document?.file_size)}
                        </td>

                        <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
                          {formatDate(document?.uploaded_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {document?.url && (
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
                            >
                              View
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 text-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--color-secondary)]" />

              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                Submit Listing
              </span>
            </div>

            <h3 className="mt-2 font-serif text-xl font-black">
              Ready to Submit?
            </h3>

            <p className="mt-1 text-sm text-white/60">
              Survey and tax bill are required before submission.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleSubmitListing}
              disabled={isSubmitting || !canSubmit}
              className="flex items-center gap-2 bg-[var(--color-secondary)] px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Everything"}
            </button>

            {!canSubmit && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 text-white/40" />

                <span className="text-[10px] text-white/40">
                  Required documents must be uploaded first.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}