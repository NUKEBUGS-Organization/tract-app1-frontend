import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
} from "lucide-react";

import {
  useCreateListingMutation,
  useUploadListingDocumentsMutation,
} from "../../../services/listingService";

import { STEPS } from "./constants";
import { buildListingPayload } from "./payload";
import { DEFAULT_FORM, type FormState } from "./types";
import {
  validateFullFormWithFields,
  validateImages,
  validateStepWithFields,
} from "./validation";

import PictureUploadStep from "./components/PictureUploadStep";
import Step1PropertyType from "./components/PropertyType";
import Step2HardData from "./components/HardData";
import Step3Condition from "./components/Condition";
import Step4Motivation from "./components/Motivation";
import StepIndicator from "./components/StepIndicator";
import SuccessState from "./components/SubmitListing";


type ToastState = {
  type: "error" | "success";
  title: string;
  message: string;
};

type FieldErrors = Record<string, string>;

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
}

function ToastPopup({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  const isSuccess = toast.type === "success";

  return (
    <div className="fixed right-6 top-24 z-[9999] w-[calc(100%-3rem)] max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-2xl">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : "bg-red-50 text-red-600"
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
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSuccess ? "text-[var(--color-primary)]" : "text-red-600"
              }`}
          >
            {isSuccess ? "Success" : "Action Required"}
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

export default function ListPropertyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);

  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [propertyPictures, setPropertyPictures] = useState<File[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimerRef = useRef<number | null>(null);

  const [createListing, { isLoading: isCreatingListing }] =
    useCreateListingMutation();

  const [uploadListingDocuments, { isLoading: isUploadingPictures }] =
    useUploadListingDocumentsMutation();

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

  function clearFieldError(key: string) {
    setFieldErrors((previousErrors) => {
      if (!previousErrors[key]) return previousErrors;

      const updatedErrors = { ...previousErrors };
      delete updatedErrors[key];
      return updatedErrors;
    });
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setApiError(null);
    clearFieldError(String(key));

    setForm((previousForm) => ({
      ...previousForm,
      [key]: value,
    }));
  }

  const handleContinue = () => {
    const validation = validateStepWithFields(step, form);

    if (validation) {
      setApiError(null);
      setFieldErrors(validation.fieldErrors);

      showToast({
        type: "error",
        title: "Please fix highlighted fields",
        message: validation.error,
      });

      return;
    }

    setApiError(null);
    setFieldErrors({});
    setStep((currentStep) => Math.min(4, currentStep + 1));
  };

  const handleCreateListing = async () => {
    const validationResult = validateFullFormWithFields(form);

    if (validationResult) {
      setStep(validationResult.step);
      setApiError(null);
      setFieldErrors(validationResult.fieldErrors);

      showToast({
        type: "error",
        title: "Please fix highlighted fields",
        message: validationResult.error,
      });

      return;
    }

    try {
      setApiError(null);
      setFieldErrors({});

      const payload = buildListingPayload(form);
      const response = await createListing(payload).unwrap();

      const listingId = response?.data?._id;

      if (!listingId) {
        const message = "Listing ID was not returned by backend.";

        setApiError(message);
        showToast({
          type: "error",
          title: "Listing creation failed",
          message,
        });

        return;
      }

      setCreatedListingId(listingId);

      showToast({
        type: "success",
        title: "Draft created",
        message: "Your listing draft has been created successfully.",
      });
    } catch (error: any) {
      const message = getErrorMessage(
        error,
        "Unable to create listing. Please try again."
      );

      setApiError(message);
      showToast({
        type: "error",
        title: "Unable to create listing",
        message,
      });
    }
  };

  const handlePictureSelection = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);

    const mergedFiles = [...propertyPictures, ...selectedFiles];

    const uniqueFiles = Array.from(
      new Map(
        mergedFiles.map((file) => [
          `${file.name}-${file.size}-${file.lastModified}`,
          file,
        ])
      ).values()
    );

    const error = validateImages(uniqueFiles);

    if (error) {
      setApiError(error);

      showToast({
        type: "error",
        title: "Invalid image upload",
        message: error,
      });

      return;
    }

    setApiError(null);
    setPropertyPictures(uniqueFiles);
  };

  const handleRemovePicture = (fileToRemove: File) => {
    setApiError(null);

    setPropertyPictures((currentFiles) =>
      currentFiles.filter(
        (file) =>
          `${file.name}-${file.size}-${file.lastModified}` !==
          `${fileToRemove.name}-${fileToRemove.size}-${fileToRemove.lastModified}`
      )
    );
  };
  const handleUploadPictures = async () => {
    if (!createdListingId) {
      const message = "Listing ID is missing.";

      setApiError(message);
      showToast({
        type: "error",
        title: "Upload blocked",
        message,
      });

      return;
    }

    const error = validateImages(propertyPictures);

    if (error) {
      setApiError(error);

      showToast({
        type: "error",
        title: "Invalid image upload",
        message: error,
      });

      return;
    }

    try {
      setApiError(null);

      await uploadListingDocuments({
        listingId: createdListingId,
        files: propertyPictures,
        documentTypes: propertyPictures.map(() => "property_picture"),
      }).unwrap();

      setSubmitted(true);

      showToast({
        type: "success",
        title: "Pictures uploaded",
        message: "Property pictures have been uploaded successfully.",
      });
    } catch (error: any) {
      const message = getErrorMessage(
        error,
        "Unable to upload property pictures."
      );

      setApiError(message);
      showToast({
        type: "error",
        title: "Upload failed",
        message,
      });
    }
  };

  if (submitted && createdListingId) {
    return <SuccessState listingId={createdListingId} />;
  }

  if (createdListingId) {
    return (
      <>
        {toast && (
          <ToastPopup toast={toast} onClose={() => setToast(null)} />
        )}

        <PictureUploadStep
          apiError={apiError}
          propertyPictures={propertyPictures}
          isUploadingPictures={isUploadingPictures}
          onBack={() => {
            setApiError(null);
            setCreatedListingId(null);
          }}
          onSelectPictures={handlePictureSelection}
          onRemovePicture={handleRemovePicture}
          onUploadPictures={handleUploadPictures}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {toast && <ToastPopup toast={toast} onClose={() => setToast(null)} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Full Disclosure Suite
          </p>

          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            List My Property
          </h1>
        </div>

        <div className="border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Draft Mode
        </div>
      </div>

      {/* {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div> */}
      {/* )} */}

      <div className="overflow-x-auto pb-2">
        <StepIndicator current={step} />
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <Step1PropertyType
            form={form}
            set={set}
            fieldErrors={fieldErrors}
          />
        )}

        {step === 2 && (
          <Step2HardData
            form={form}
            set={set}
            fieldErrors={fieldErrors}
          />
        )}

        {step === 3 && (
          <Step3Condition
            form={form}
            set={set}
            fieldErrors={fieldErrors}
          />
        )}

        {step === 4 && (
          <Step4Motivation
            form={form}
            set={set}
            fieldErrors={fieldErrors}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border-light)] pt-6">
        <button
          type="button"
          onClick={() => {
            setApiError(null);
            setFieldErrors({});
            setStep((currentStep) => Math.max(1, currentStep - 1));
          }}
          disabled={step === 1}
          className="flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex gap-1">
          {STEPS.map((currentStep) => (
            <div
              key={currentStep.id}
              className={`h-1.5 rounded-full transition-all ${currentStep.id === step
                  ? "w-8 bg-[var(--color-primary)]"
                  : currentStep.id < step
                    ? "w-4 bg-[var(--color-primary)]/40"
                    : "w-4 bg-[var(--color-border-light)]"
                }`}
            />
          ))}
        </div>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-2 bg-[var(--color-primary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-card)] transition hover:scale-[1.02]"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreateListing}
            disabled={isCreatingListing}
            className="flex items-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isCreatingListing ? "Creating Draft..." : "Create Draft"}
          </button>
        )}
      </div>
    </div>
  );
}