import {
  useEffect,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import { Link } from "react-router";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  PenLine,
  Phone,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import Loader from "../../../components/common/Loader";
import StatusBadge from "../../../components/common/StatusBadge";
import { displayValue, formatDate } from "../../../utils/adminUtils";
import {
  formatLabel,
  getEmail,
  getPersonName,
  getPhone,
  getRole,
  getSigningProgress,
} from "../../../utils/adminContractDetailsUtils";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function DetailItem({
  label,
  value,
  children,
  icon,
  featured = false,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
  icon?: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`group min-w-0 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-secondary)]/40 hover:shadow-sm ${
        featured
          ? "border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white hover:bg-[var(--color-bg-soft)]/60"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-[var(--color-primary)]/60">{icon}</span>
        )}

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>

      <div
        className={`mt-1.5 break-words text-sm font-bold leading-6 ${
          featured
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-text-main)]"
        }`}
      >
        {children ?? displayValue(value)}
      </div>
    </div>
  );
}

export function SectionBlock({
  title,
  description,
  icon,
  children,
  columns = "default",
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  columns?: "default" | "equal" | "compact";
}) {
  const gridClass =
    columns === "compact"
      ? "grid-cols-1"
      : columns === "equal"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <section className="h-full rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-xl font-black leading-tight text-[var(--color-primary)]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className={`grid ${gridClass} gap-3`}>{children}</div>
    </section>
  );
}

export function RecordLink({
  to,
  label,
  fullWidth = false,
}: {
  to: string;
  label: string;
  fullWidth?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function SigningTimeline({ contract }: { contract: any }) {
  const { steps, completedCount, totalSteps, progress } =
    getSigningProgress(contract);

  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            Signing Journey
          </div>

          <h2 className="font-serif text-2xl font-black leading-tight text-[var(--color-primary)]">
            Signing Timeline
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Contract signing progress from generation to final signature.
          </p>
        </div>

        <div className="w-fit rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Progress
          </p>

          <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {completedCount}/{totalSteps} completed
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4 sm:p-5">
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                step.isComplete
                  ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border-light)] bg-white"
              }`}
            >
              <div className="mb-4 flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 ${
                    step.isComplete
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {step.isComplete ? (
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Step {index + 1}
                  </p>

                  <h3 className="mt-1 text-sm font-black text-[var(--color-primary)]">
                    {step.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                {step.description}
              </p>

              <p className="mt-3 text-sm font-black text-[var(--color-text-main)]">
                {step.helper}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContractImageViewer({
  pdfUrl,
  fallbackImages = [],
}: {
  pdfUrl: string;
  fallbackImages?: string[];
}) {
  const [images, setImages] = useState<string[]>(fallbackImages);
  const [activePage, setActivePage] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const totalPages = images.length;
  const currentImage = images[activePage];

  useEffect(() => {
    let isCancelled = false;

    async function renderPdf() {
      if (fallbackImages.length > 0) {
        setImages(fallbackImages);
        setActivePage(0);
        return;
      }

      if (!pdfUrl) {
        setImages([]);
        setRenderError("");
        return;
      }

      try {
        setIsRendering(true);
        setRenderError("");

        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;

        const renderedImages: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.6 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
  canvas,
  canvasContext: context,
  viewport,
}).promise;

          renderedImages.push(canvas.toDataURL("image/png"));
        }

        if (!isCancelled) {
          setImages(renderedImages);
          setActivePage(0);
        }
      } catch {
        if (!isCancelled) {
          setRenderError(
            "Unable to render PDF pages. You can still open the PDF directly."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    }

    renderPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl, fallbackImages]);

  function goPrevious() {
    setActivePage((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setActivePage((current) => Math.min(totalPages - 1, current + 1));
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) goNext();
      else goPrevious();
    }

    setTouchStartX(null);
  }

  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Contract Preview
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              Swipe or use the controls to review each contract page.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {totalPages > 0 && (
            <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-2 text-xs font-black text-[var(--color-primary)]">
              Page {activePage + 1} of {totalPages}
            </span>
          )}

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
            >
              Open PDF
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {isRendering ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-8">
          <Loader label="Rendering contract pages..." />
        </div>
      ) : renderError ? (
        <div className="rounded-3xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--color-primary)]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>

          <h3 className="mt-4 text-base font-black text-[var(--color-primary)]">
            Preview unavailable
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {renderError}
          </p>
        </div>
      ) : currentImage ? (
        <>
          <div
            className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
            onTouchStart={(event) =>
              setTouchStartX(event.changedTouches[0]?.clientX ?? null)
            }
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm">
              Swipe Preview
            </div>

            <img
              src={currentImage}
              alt={`Contract page ${activePage + 1}`}
              className="mx-auto max-h-[760px] w-full object-contain p-3 sm:p-5"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={goPrevious}
                disabled={activePage === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={activePage >= totalPages - 1}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex justify-center gap-2 sm:justify-end">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to contract page ${index + 1}`}
                  onClick={() => setActivePage(index)}
                  className={`h-2.5 rounded-full transition-all duration-200 ${
                    index === activePage
                      ? "w-8 bg-[var(--color-primary)]"
                      : "w-2.5 bg-[var(--color-border-light)] hover:bg-[var(--color-secondary)]"
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--color-primary)]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>

          <h3 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No contract pages available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            No PDF URL or page images for this
            contract yet.
          </p>
        </div>
      )}
    </section>
  );
}

export function SignerCard({
  title,
  person,
  signedAt,
  isSigned,
  path,
  icon,
}: {
  title: string;
  person: any;
  signedAt: any;
  isSigned: boolean;
  path?: string;
  icon: ReactNode;
}) {
  const name = person ? getPersonName(person) : "-";
  const email = getEmail(person);
  const phone = getPhone(person);
  const role = getRole(person);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {title}
            </p>

            <h3 className="mt-1 break-words text-base font-black text-[var(--color-primary)]">
              {name}
            </h3>

            {role !== "-" && (
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                {formatLabel(role)}
              </p>
            )}
          </div>
        </div>

        <StatusBadge
          label={isSigned ? "Signed" : "Pending"}
          variant={isSigned ? "success" : "warning"}
        />
      </div>

      <div className="mt-4 space-y-2 text-sm font-semibold text-[var(--color-text-muted)]">
        {email !== "-" && (
          <p className="flex min-w-0 items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
            <span className="break-words">{email}</span>
          </p>
        )}

        {phone !== "-" && (
          <p className="flex min-w-0 items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
            <span className="break-words">{phone}</span>
          </p>
        )}

        <p className="flex min-w-0 items-center gap-2">
          <CalendarClock className="h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
          <span>{isSigned ? formatDate(signedAt) : "Signature pending"}</span>
        </p>
      </div>

      {path && (
        <div className="mt-5">
          <RecordLink to={path} label="Open Profile" fullWidth />
        </div>
      )}
    </article>
  );
}