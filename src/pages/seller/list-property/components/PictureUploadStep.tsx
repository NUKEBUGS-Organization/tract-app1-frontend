import { FileImage, UploadCloud } from "lucide-react";
import { MAX_IMAGES } from "../constants";

interface PictureUploadStepProps {
  apiError: string | null;
  propertyPictures: File[];
  isUploadingPictures: boolean;
  onBack: () => void;
  onSelectPictures: (files: FileList | null) => void;
  onUploadPictures: () => void;
}

export default function PictureUploadStep({
  apiError,
  propertyPictures,
  isUploadingPictures,
  onBack,
  onSelectPictures,
  onUploadPictures,
}: PictureUploadStepProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Draft Created
          </p>

          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            Upload Property Pictures
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Add property pictures for this listing. You must upload at least 1
            image and can upload a maximum of 10 images. Each image must be 5 MB
            or smaller.
          </p>
        </div>

        {apiError && (
          <div className="mb-5 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
            {apiError}
          </div>
        )}

        <div className="rounded-xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-8 text-center">
          <UploadCloud className="mx-auto mb-4 h-10 w-10 text-[var(--color-secondary)]" />

          <label className="mx-auto inline-flex cursor-pointer items-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.02]">
            <FileImage className="h-4 w-4" />
            Select Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => onSelectPictures(event.target.files)}
              className="hidden"
            />
          </label>

          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Selected pictures: {propertyPictures.length} / {MAX_IMAGES}
          </p>
        </div>

        {propertyPictures.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {propertyPictures.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="rounded-xl border border-[var(--color-border-light)] bg-white p-3 text-xs font-semibold text-[var(--color-text-muted)]"
              >
                <p className="truncate">{file.name}</p>

                <p className="mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onUploadPictures}
            disabled={isUploadingPictures}
            className="bg-[var(--color-primary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-card)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploadingPictures ? "Uploading..." : "Upload Pictures"}
          </button>
        </div>
      </div>
    </div>
  );
}