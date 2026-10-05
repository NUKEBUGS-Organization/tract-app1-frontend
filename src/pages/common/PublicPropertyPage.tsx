import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
} from "lucide-react";
import { useGetPublicListingQuery } from "../../services/listingService";
import { useAuthContext } from "../../contexts/AuthContext";
import SharePropertyButton from "../../components/common/SharePropertyButton";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  sfh: "Single Family Home",
  single_family: "Single Family Home",
  multi: "Multi-Family",
  multi_family: "Multi-Family",
  land: "Land",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
};

function formatPropertyType(value?: string) {
  const key = String(value || "").toLowerCase();
  if (PROPERTY_TYPE_LABELS[key]) return PROPERTY_TYPE_LABELS[key];
  return key
    ? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Property";
}

function formatMoney(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-lg font-black text-[var(--color-primary)]">
        {value}
      </p>
    </div>
  );
}

function PublicPropertyPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { accessToken } = useAuthContext();
  const { data, isLoading, isError } = useGetPublicListingQuery(id, {
    skip: !id,
  });
  const [photoIndex, setPhotoIndex] = useState(0);

  const listing = data?.data ?? null;
  const photos: string[] = Array.isArray(listing?.picture_urls)
    ? listing.picture_urls.filter(Boolean)
    : [];
  const typeLabel = formatPropertyType(listing?.property_type);
  const stateCode = listing?.state_code || "";
  const title = [typeLabel, stateCode && `in ${stateCode}`]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/tract-logo.png" alt="TRACT" className="h-9 w-auto" />
          </Link>
          {listing && <SharePropertyButton listingId={id} title={title} />}
        </header>

        {isLoading && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-secondary)]" />
          </div>
        )}

        {!isLoading && (isError || !listing) && (
          <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-lg">
            <h1 className="font-serif text-2xl font-black text-[var(--color-primary)]">
              Property unavailable
            </h1>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              This property is no longer accepting bids or the link is invalid.
            </p>
            <Link
              to="/auth/signin"
              className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white"
            >
              Sign in to TRACT
            </Link>
          </div>
        )}

        {listing && (
          <div className="overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <div className="relative aspect-[16/9] bg-[var(--color-bg-soft)]">
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[photoIndex]}
                    alt={`${title} photo ${photoIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous photo"
                        onClick={() =>
                          setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next photo"
                        onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                        {photoIndex + 1} / {photos.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="p-6 md:p-10">
              <span className="rounded-full bg-[var(--color-secondary)]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                Live — accepting bids
              </span>
              <h1 className="mt-4 font-serif text-3xl font-black text-[var(--color-primary)] md:text-4xl">
                {typeLabel}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin className="h-4 w-4" />
                {stateCode || "Location shared with verified partners"}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Fact icon={Home} label="Asking Price" value={formatMoney(listing.market_price)} />
                <Fact
                  icon={Calendar}
                  label="Year Built"
                  value={listing.year_built ? String(listing.year_built) : "—"}
                />
                <Fact
                  icon={Building2}
                  label="Units"
                  value={listing.unit_count ? String(listing.unit_count) : "—"}
                />
                <Fact icon={Gavel} label="Bids" value={String(listing.bid_count ?? 0)} />
              </div>

              <div className="mt-10 rounded-2xl bg-[var(--color-primary)] p-6 text-white md:flex md:items-center md:justify-between md:gap-6">
                <div>
                  <p className="font-serif text-xl font-black">
                    Interested in this property?
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    The full address, documents and bidding are available to
                    verified TRACT partners.
                  </p>
                </div>
                <div className="mt-4 flex shrink-0 flex-wrap gap-3 md:mt-0">
                  {accessToken ? (
                    <Link
                      to={`/properties/${id}`}
                      className="rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary-dark)]"
                    >
                      View in TRACT
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/auth/signup"
                        className="rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary-dark)]"
                      >
                        Join TRACT
                      </Link>
                      <Link
                        to="/auth/signin"
                        className="rounded-xl border border-white/30 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white"
                      >
                        Sign in
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default PublicPropertyPage;
