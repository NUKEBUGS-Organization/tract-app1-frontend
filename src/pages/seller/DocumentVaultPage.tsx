import { useEffect, useMemo, useRef, useState } from "react";
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
  X,
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

type ToastType = "success" | "error" | "info";

interface ToastState {
  type: ToastType;
  title: string;
  message: string;
}

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
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
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
    desc: "Upload clear front, side, interior, and condition photos.",
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

  if (payload && typeof payload === "object") {
    return Object.values(payload);
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

  if (payload && typeof payload === "object") {
    return Object.values(payload);
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

  const oversizedFile = files.find((file) => {
    if (docType === "property_picture") {
      return file.size > MAX_IMAGE_FILE_SIZE;
    }

    return file.size > MAX_FILE_SIZE;
  });

  if (oversizedFile) {
    if (docType === "property_picture") {
      return "Each property image must be 5 MB or smaller.";
    }

    return "Each document must be 5 MB or smaller.";
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

function getListingStatus(listing: any) {
  return String(listing?.status || "").toLowerCase();
}

function isListingAlreadySubmitted(listing: any, submitted: boolean) {
  if (submitted) return true;

  const status = getListingStatus(listing);

  if (!status) return false;

  return status !== "draft";
}

function hasDocumentType(documents: any[], documentType: DocumentCategory) {
  return documents.some(
    (document) =>
      String(document?.document_type || "").toLowerCase() === documentType
  );
}

function getMissingRequiredDocs(documents: any[]) {
  return REQUIRED_DOC_TYPES.filter((docType) => !hasDocumentType(documents, docType));
}

function ToastPopup({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed right-6 top-24 z-[9999] w-[calc(100%-3rem)] max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-2xl">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : isError
                ? "bg-red-50 text-red-600"
                : "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              isSuccess
                ? "text-[var(--color-primary)]"
                : isError
                  ? "text-red-600"
                  : "text-[var(--color-secondary)]"
            }`}
          >
            {isSuccess ? "Success" : isError ? "Action Required" : "Notice"}
          </p>

          <h3 className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {toast.title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
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
      className={`mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 transition-all ${
        drag
          ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10"
          : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] hover:border-[var(--color-secondary)]/70"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      {isUploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      ) : (
        <Upload
          className={`h-6 w-6 ${
            drag
              ? "text-[var(--color-secondary)]"
              : "text-[var(--color-text-muted)]"
          }`}
        />
      )}

      <p className="text-center text-[11px] font-bold text-[var(--color-text-muted)]">
        {isUploading ? "Uploading..." : "Drag & drop your file here"}
      </p>

      <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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

      <p className="text-center text-[10px] text-[var(--color-text-muted)]/70">
        {doc.id === "property_picture"
          ? "JPG, PNG · Max 10 files · 5 MB each"
          : "PDF, DOC, DOCX, JPG, PNG · Max 5 MB"}
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
  const [toast, setToast] = useState<ToastState | null>(null);
  const [uploadingDocType, setUploadingDocType] =
    useState<DocumentCategory | null>(null);

  const toastTimerRef = useRef<number | null>(null);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 4500);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

  const missingRequiredDocs = useMemo(
    () => getMissingRequiredDocs(savedDocuments),
    [savedDocuments]
  );

  const canSubmit = missingRequiredDocs.length === 0;
  const alreadySubmitted = isListingAlreadySubmitted(selectedListing, submitted);

  const handleSelectListing = (selectedId: string) => {
    if (!isMongoObjectId(selectedId)) {
      setApiError("Invalid listing selected.");
      showToast({
        type: "error",
        title: "Invalid listing",
        message: "Please select a valid listing.",
      });
      return;
    }

    setApiError(null);
    setSubmitted(false);
    setToast(null);
    setSearchParams({ listingId: selectedId });
  };

  const handleChangeListing = () => {
    setApiError(null);
    setSubmitted(false);
    setToast(null);
    setSearchParams({});
  };

  const handleUpload = async (
    docType: DocumentCategory,
    selectedFiles: File[]
  ) => {
    if (!listingId) {
      const message = "Please select a listing before uploading documents.";
      setApiError(message);
      showToast({
        type: "error",
        title: "No listing selected",
        message,
      });
      return;
    }

    const validationError = validateFiles(docType, selectedFiles);

    if (validationError) {
      setApiError(validationError);
      showToast({
        type: "error",
        title: "Upload blocked",
        message: validationError,
      });
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

      showToast({
        type: "success",
        title: "Document uploaded",
        message: `${getDocumentLabel(docType)} has been uploaded successfully.`,
      });
    } catch (error: any) {
      const message = getErrorMessage(
        error,
        "Unable to upload document. Please try again."
      );

      setApiError(message);
      showToast({
        type: "error",
        title: "Upload failed",
        message,
      });
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleSubmitListing = async () => {
    if (!listingId) {
      const message = "Please select a listing before submitting.";
      setApiError(message);
      showToast({
        type: "error",
        title: "No listing selected",
        message,
      });
      return;
    }

    if (alreadySubmitted) {
      showToast({
        type: "info",
        title: "Already submitted",
        message: "This listing has already been submitted. You do not need to submit it again.",
      });
      return;
    }

    if (!canSubmit) {
      const missingLabels = missingRequiredDocs
        .map((docType) => getDocumentLabel(docType))
        .join(" and ");

      const message = `Missing required document: ${missingLabels}. Please upload it before submitting.`;

      setApiError(message);
      showToast({
        type: "error",
        title: "Missing required documents",
        message,
      });
      return;
    }

    try {
      setApiError(null);

      await submitListing(listingId).unwrap();

      setSubmitted(true);
      await refetchDashboard();

      showToast({
        type: "success",
        title: "Listing submitted successfully",
        message: "Your listing documents have been submitted for review.",
      });
    } catch (error: any) {
      const message = getErrorMessage(
        error,
        "Failed to submit listing. Please review the required documents."
      );

      setApiError(message);
      showToast({
        type: "error",
        title: "Submit failed",
        message,
      });
    }
  };

  if (!listingId) {
    return (
      <div className="space-y-8">
        {toast && <ToastPopup toast={toast} onClose={() => setToast(null)} />}

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
              Select a property listing to upload survey, tax bill, and images.
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
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                  Select a Listing
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Choose the property you want to complete.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sellerListings.map((listing: any) => {
                const id = String(listing?._id || "");
                const status = getListingStatus(listing);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectListing(id)}
                    className="group overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-[var(--color-secondary)]/60 hover:shadow-xl"
                  >
                    <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="line-clamp-2 text-sm font-black text-[var(--color-primary)]">
                          {getListingLabel(listing)}
                        </h3>

                        <span className="shrink-0 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                          {status || "draft"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 p-5 text-xs text-[var(--color-text-muted)]">
                      <p>
                        <span className="font-black text-[var(--color-primary)]">
                          Type:
                        </span>{" "}
                        {listing?.property_type || "-"}
                      </p>

                      <p>
                        <span className="font-black text-[var(--color-primary)]">
                          Market Price:
                        </span>{" "}
                        {listing?.market_price || "-"}
                      </p>

                      <div className="pt-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                        Open Vault →
                      </div>
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
      {toast && <ToastPopup toast={toast} onClose={() => setToast(null)} />}

      <div className="overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-7 text-white">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
                Seller Document Center
              </p>

              <h1 className="mt-2 flex items-center gap-3 font-serif text-3xl font-black">
                <FolderLock className="h-7 w-7 text-[var(--color-secondary)]" />
                Complete Your Listing
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Upload required documents and property images before submitting
                the listing for review.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                Completion
              </p>

              <p className="mt-1 font-serif text-3xl font-black text-[var(--color-secondary)]">
                {requiredPct}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5">
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
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isFetchingDocuments ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleChangeListing}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white"
              >
                Change Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
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
              className={`overflow-hidden rounded-2xl border bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-xl ${
                done
                  ? "border-[var(--color-primary)]/40"
                  : "border-[var(--color-border-light)]"
              }`}
            >
              <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-3xl">{doc.icon}</span>

                    <h3 className="mt-3 text-sm font-black text-[var(--color-primary)]">
                      {doc.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                      {doc.desc}
                    </p>
                  </div>

                  {done ? (
                    <span className="shrink-0 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                      Uploaded
                    </span>
                  ) : doc.required ? (
                    <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-red-600">
                      Required
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-[var(--color-border-light)]/60 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                      Optional
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                {done && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />

                    <span className="text-[11px] font-bold text-[var(--color-primary)]">
                      This document is uploaded.
                    </span>
                  </div>
                )}

                <DropZone
                  doc={doc}
                  disabled={isLoadingDocuments || alreadySubmitted}
                  isUploading={isUploading}
                  onUpload={handleUpload}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="mb-4 font-serif text-xl font-black text-[var(--color-primary)]">
          Uploaded Documents
        </h2>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
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

      <div className="rounded-2xl border border-[var(--color-secondary)]/30 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 text-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--color-secondary)]" />

              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                Submit Listing
              </span>
            </div>

            <h3 className="mt-2 font-serif text-xl font-black">
              {alreadySubmitted ? "Listing Already Submitted" : "Ready to Submit?"}
            </h3>

            <p className="mt-1 text-sm text-white/60">
              {alreadySubmitted
                ? "This listing has already been submitted. Upload and submit actions are disabled."
                : "Survey and tax bill are required before submission."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleSubmitListing}
              disabled={isSubmitting || alreadySubmitted}
              className="flex items-center gap-2 rounded-full bg-[var(--color-secondary)] px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : alreadySubmitted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              {isSubmitting
                ? "Submitting..."
                : alreadySubmitted
                  ? "Already Submitted"
                  : "Submit Documents"}
            </button>

            {!canSubmit && !alreadySubmitted && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 text-white/40" />

                <span className="text-[10px] text-white/40">
                  Click submit to see missing required documents.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}