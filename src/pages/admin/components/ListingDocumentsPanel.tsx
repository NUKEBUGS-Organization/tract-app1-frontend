import { ExternalLink, FileText } from "lucide-react";

import { DetailPageSkeleton } from "../../../components/common/Skeleton";
import {
  formatLabel,
  getDocumentMimeType,
  getDocumentTitle,
  getDocumentUrl,
} from "./listingDetailHelpers";

function ListingDocumentsPanel({
  documents,
  isLoading,
}: {
  documents: any[];
  isLoading: boolean;
}) {
if (isLoading) {
  return <DetailPageSkeleton />;
}

  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
            Documents
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
            Supporting files attached to this listing.
          </p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5 text-center">
          <p className="text-sm font-black text-[var(--color-primary)]">
            No supporting documents
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
            Only image files are currently attached or no files were uploaded.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((document: any, index: number) => {
            const title = getDocumentTitle(document);
            const url = getDocumentUrl(document);
            const mimeType = getDocumentMimeType(document);

            return (
              <a
                key={`${title}-${index}`}
                href={url || undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!url}
                className={`flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-3 transition ${
                  url
                    ? "hover:border-[var(--color-secondary)] hover:bg-white"
                    : "pointer-events-none opacity-60"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-primary)]">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-[var(--color-primary)]">
                      {title}
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
                      {mimeType ? formatLabel(mimeType) : "File"}
                    </p>
                  </div>
                </div>

                {url && (
                  <ExternalLink
                    className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ListingDocumentsPanel;