import type { TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileText } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import Loader from "../../../components/common/Loader";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface ContractPdfCarouselProps {
  pdfUrl: string;
}

export default function ContractPdfCarousel({ pdfUrl }: ContractPdfCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setNumPages(0);
    setCurrentPage(1);
    setLoadError("");
  }, [pdfUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateWidth() {
      const c = containerRef.current;
      if (!c) return;
      setContainerWidth(Math.floor(c.getBoundingClientRect().width));
    }

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const pageHeight =
    containerWidth < 420 ? 560 : containerWidth < 640 ? 680 : 780;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < numPages;

  function previousPage() {
    setCurrentPage((c) => Math.max(1, c - 1));
  }
  function nextPage() {
    setCurrentPage((c) => Math.min(numPages, c + 1));
  }
  function openPage(pageNumber: number) {
    setCurrentPage(Math.min(Math.max(pageNumber, 1), numPages));
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const x = event.changedTouches[0]?.clientX ?? null;
    touchStartX.current = x;
    touchCurrentX.current = x;
  }
  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    touchCurrentX.current = event.changedTouches[0]?.clientX ?? null;
  }
  function handleTouchEnd() {
    if (touchStartX.current === null || touchCurrentX.current === null) return;
    const swipe = touchStartX.current - touchCurrentX.current;
    if (swipe > 50 && canGoNext) nextPage();
    if (swipe < -50 && canGoPrevious) previousPage();
    touchStartX.current = null;
    touchCurrentX.current = null;
  }

  return (
    // ── max-w removed so the carousel fills its parent column fully ──
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") previousPage();
        if (e.key === "ArrowRight") nextPage();
      }}
      className="w-full outline-none"
    >
      <Document
        key={pdfUrl}
        file={pdfUrl}
        onLoadSuccess={({ numPages: loaded }) => {
          setNumPages(loaded);
          setCurrentPage(1);
          setLoadError("");
        }}
        onLoadError={(error) => {
          console.error("Failed to load contract PDF:", error);
          setLoadError("Unable to display the contract.");
        }}
        loading={
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white p-6">
            <Loader label="Loading contract..." />
          </div>
        }
        error={
          <div className="rounded-xl border border-[var(--color-danger)]/30 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-[var(--color-danger)]">
              {loadError || "Unable to display the contract."}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              The PDF storage server may not allow browser preview access.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-light)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]"
            >
              Open PDF
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        }
      >
        {numPages > 0 && (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-sm">
            {/* Page header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-primary)]/60" />
                <p className="text-xs font-black text-[var(--color-primary)]">
                  Contract Page {currentPage}
                </p>
              </div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                {currentPage} of {numPages}
              </p>
            </div>

            {/* Page render — full width, no inner centering constraint */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative flex touch-pan-y select-none items-center justify-center overflow-hidden bg-[var(--color-bg-soft)] px-3 py-4"
            >
              <Page
                key={`${pdfUrl}-${currentPage}`}
                pageNumber={currentPage}
                height={pageHeight}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex min-h-64 items-center justify-center">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                      Loading page {currentPage}...
                    </p>
                  </div>
                }
                className="overflow-hidden rounded-md bg-white shadow-md"
              />

              {canGoPrevious && (
                <button
                  type="button"
                  onClick={previousPage}
                  aria-label="Previous contract page"
                  className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border-light)] bg-white/95 text-[var(--color-primary)] shadow-md transition hover:bg-white sm:flex"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {canGoNext && (
                <button
                  type="button"
                  onClick={nextPage}
                  aria-label="Next contract page"
                  className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border-light)] bg-white/95 text-[var(--color-primary)] shadow-md transition hover:bg-white sm:flex"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Footer controls */}
            <div className="flex flex-col gap-3 border-t border-[var(--color-border-light)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-[11px] font-semibold text-[var(--color-text-muted)] sm:text-left">
                {numPages > 1 ? "Swipe left or right on mobile." : "This contract contains one page."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!canGoPrevious}
                  onClick={previousPage}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border-light)] px-4 py-2 text-xs font-black text-[var(--color-primary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={nextPage}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-black text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Dot pagination */}
            {numPages > 1 && numPages <= 10 && (
              <div className="flex flex-wrap justify-center gap-2 border-t border-[var(--color-border-light)] bg-white px-4 py-3">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => openPage(n)}
                    aria-label={`Open contract page ${n}`}
                    className={`h-2.5 rounded-full transition-all ${
                      n === currentPage
                        ? "w-7 bg-[var(--color-primary)]"
                        : "w-2.5 bg-[var(--color-border-light)] hover:bg-[var(--color-text-muted)]"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Document>
    </div>
  );
}