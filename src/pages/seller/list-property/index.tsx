import { useState } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

import {
  useCreateListingMutation,
  useUploadListingDocumentsMutation,
} from "../../../services/listingService";

import { STEPS } from "./constants";
import { buildListingPayload } from "./payload";
import { DEFAULT_FORM, type FormState } from "./types";
import { validateFullForm, validateImages, validateStep } from "./validation";

import PictureUploadStep from "./components/PictureUploadStep";
import Step1PropertyType from "./components/PropertyType";
import Step2HardData from "./components/HardData";
import Step3Condition from "./components/Condition";
import Step4Motivation from "./components/Motivation";
import StepIndicator from "./components/StepIndicator";
import SuccessState from "./components/SubmitListing";

export default function ListPropertyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);

  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [propertyPictures, setPropertyPictures] = useState<File[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const [createListing, { isLoading: isCreatingListing }] =
    useCreateListingMutation();

  const [uploadListingDocuments, { isLoading: isUploadingPictures }] =
    useUploadListingDocumentsMutation();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setApiError(null);
    setForm((previousForm) => ({ ...previousForm, [key]: value }));
  }

  const handleContinue = () => {
    const error = validateStep(step, form);

    if (error) {
      setApiError(error);
      return;
    }

    setApiError(null);
    setStep((currentStep) => Math.min(4, currentStep + 1));
  };

  const handleCreateListing = async () => {
    const validationResult = validateFullForm(form);

    if (validationResult) {
      setStep(validationResult.step);
      setApiError(validationResult.error);
      return;
    }

    try {
      setApiError(null);

      const payload = buildListingPayload(form);
      const response = await createListing(payload).unwrap();

      const listingId = response?.data?._id;

      if (!listingId) {
        setApiError("Listing ID was not returned by backend.");
        return;
      }

      setCreatedListingId(listingId);
    } catch (error: any) {
      setApiError(
        error?.data?.message ?? "Unable to create listing. Please try again."
      );
    }
  };

  const handlePictureSelection = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const error = validateImages(selectedFiles);

    if (error) {
      setApiError(error);
      return;
    }

    setApiError(null);
    setPropertyPictures(selectedFiles);
  };

  const handleUploadPictures = async () => {
    if (!createdListingId) {
      setApiError("Listing ID is missing.");
      return;
    }

    const error = validateImages(propertyPictures);

    if (error) {
      setApiError(error);
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
    } catch (error: any) {
      setApiError(
        error?.data?.message ?? "Unable to upload property pictures."
      );
    }
  };

  if (submitted) {
    return <SuccessState />;
  }

  if (createdListingId) {
    return (
      <PictureUploadStep
        apiError={apiError}
        propertyPictures={propertyPictures}
        isUploadingPictures={isUploadingPictures}
        onBack={() => {
          setApiError(null);
          setCreatedListingId(null);
        }}
        onSelectPictures={handlePictureSelection}
        onUploadPictures={handleUploadPictures}
      />
    );
  }

  return (
    <div className="space-y-8">
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

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      <div className="overflow-x-auto pb-2">
        <StepIndicator current={step} />
      </div>

      <div className="min-h-[400px]">
        {step === 1 && <Step1PropertyType form={form} set={set} />}
        {step === 2 && <Step2HardData form={form} set={set} />}
        {step === 3 && <Step3Condition form={form} set={set} />}
        {step === 4 && <Step4Motivation form={form} set={set} />}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border-light)] pt-6">
        <button
          type="button"
          onClick={() => {
            setApiError(null);
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
              className={`h-1.5 rounded-full transition-all ${
                currentStep.id === step
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