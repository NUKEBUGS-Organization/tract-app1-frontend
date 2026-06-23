import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
} from "lucide-react";

import { DetailPageSkeleton } from "../../../components/common/Skeleton";
import { getMongoId } from "../../../utils/adminUtils";
import {
  getDocumentTitle,
  getDocumentUrl,
} from "./listingDetailHelpers";

function PropertyImageGallery({
  images,
  isLoading,
}: {
  images: any[];
  isLoading: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

 if (isLoading) {
  return <DetailPageSkeleton />;
}

  if (images.length === 0) {
    return (
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          <Images className="h-6 w-6" aria-hidden="true" />
        </div>

        <h2 className="mt-4 font-serif text-xl font-black text-[var(--color-primary)]">
          No images uploaded
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
          No property images were attached to this listing.
        </p>
      </section>
    );
  }

  const activeImage = images[activeIndex];
  const activeImageUrl = getDocumentUrl(activeImage);
  const activeImageTitle = getDocumentTitle(activeImage);

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border-light)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Images
              className="h-4 w-4 text-[var(--color-primary)]/70"
              aria-hidden="true"
            />

            <h2 className="text-sm font-black text-[var(--color-primary)]">
              Listing Images
            </h2>

            <span className="rounded-full bg-[var(--color-bg-soft)] px-2.5 py-1 text-[11px] font-black text-[var(--color-primary)]">
              {activeIndex + 1}/{images.length}
            </span>
          </div>

          <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
            Review uploaded property photos before approval.
          </p>
        </div>

        {activeImageUrl && (
          <a
            href={activeImageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)]"
          >
            Full size
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      <div className="relative bg-[var(--color-bg-soft)]">
        <div className="relative h-[300px] w-full overflow-hidden sm:h-[380px] xl:h-[460px]">
          <img
            src={activeImageUrl}
            alt={activeImageTitle}
            className="h-full w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--color-primary)] shadow-md transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={showNext}
                aria-label="Next image"
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--color-primary)] shadow-md transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-2xl bg-[var(--color-primary)]/85 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
            {activeImageTitle}
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className="border-t border-[var(--color-border-light)] p-4">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {images.map((image: any, index: number) => {
              const imageUrl = getDocumentUrl(image);
              const title = getDocumentTitle(image);
              const isActive = index === activeIndex;

              return (
                <button
                  key={getMongoId(image) || `${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${title}`}
                  className={`relative aspect-[4/3] min-w-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 ${
                    isActive
                      ? "border-[var(--color-secondary)] opacity-100 shadow"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />

                  {isActive && (
                    <span className="absolute inset-0 ring-2 ring-inset ring-[var(--color-secondary)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default PropertyImageGallery;