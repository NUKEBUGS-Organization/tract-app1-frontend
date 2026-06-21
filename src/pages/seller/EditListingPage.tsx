import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

import {
  useGetListingByIdQuery,
  useUpdateListingMutation,
   useSubmitListingMutation,
} from "../../services/listingService";

const PROPERTY_TYPES = ["sfh", "multi_family", "land"];
const CONDITIONS = ["excellent", "good", "fair", "poor"];

const EMPTY_FORM = {
  property_type: "",
  address: "",
  zip_code: "",
  state_code: "",
  year_built: "",
  zoning: "",
  market_price: "",
  hidden_reserve: "",
  has_liens: false,
  lien_disclosure: "",
  is_preforeclosure: false,
  mortgage_amount: "",
  is_vacant: false,
  is_off_market: false,
  condition_report: {
    roof: "",
    hvac: "",
    wetlands: false,
    overall: "",
    notes: "",
  },
  motivation: "",
  sell_timeline: "",
  realtor_commission: "",
  proof_of_funds_required: false,
  unit_count: "",
};

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getListingFromResponse(response: any) {
  const payload = getApiPayload(response);
  return payload?.listing ?? payload;
}


function getListingStatus(listing: any) {
  return String(listing?.status || "").toLowerCase();
}

function isEditableListing(listing: any) {
  const status = getListingStatus(listing);

  return status === "draft" || status === "withdrawn";
}

function isWithdrawnListing(listing: any) {
  return getListingStatus(listing) === "withdrawn";
}

function numberOrUndefined(value: string) {
  if (value === "") return undefined;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function requiredNumber(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function buildFormFromListing(listing: any) {
  return {
    property_type: listing?.property_type || "",
    address: listing?.address || "",
    zip_code: listing?.zip_code || "",
    state_code: listing?.state_code || "",
    year_built: listing?.year_built ? String(listing.year_built) : "",
    zoning: listing?.zoning || "",
    market_price: listing?.market_price ? String(listing.market_price) : "",
    hidden_reserve: listing?.hidden_reserve ? String(listing.hidden_reserve) : "",
    has_liens: Boolean(listing?.has_liens),
    lien_disclosure: listing?.lien_disclosure || "",
    is_preforeclosure: Boolean(listing?.is_preforeclosure),
    mortgage_amount: listing?.mortgage_amount
      ? String(listing.mortgage_amount)
      : "",
    is_vacant: Boolean(listing?.is_vacant),
    is_off_market: Boolean(listing?.is_off_market),
    condition_report: {
      roof: listing?.condition_report?.roof || "",
      hvac: listing?.condition_report?.hvac || "",
      wetlands: Boolean(listing?.condition_report?.wetlands),
      overall: listing?.condition_report?.overall || "",
      notes: listing?.condition_report?.notes || "",
    },
    motivation: listing?.motivation || "",
    sell_timeline: listing?.sell_timeline || "",
    realtor_commission: listing?.realtor_commission
      ? String(listing.realtor_commission)
      : "",
    proof_of_funds_required: Boolean(listing?.proof_of_funds_required),
    unit_count: listing?.unit_count ? String(listing.unit_count) : "",
  };
}

function validateForm(form: any) {
  if (!form.property_type) return "Please select property type.";
  if (!form.address.trim()) return "Please enter address.";
  if (!form.zip_code.trim()) return "Please enter ZIP code.";
  if (!form.state_code.trim()) return "Please enter state code.";

  if (!form.year_built || !requiredNumber(form.year_built)) {
    return "Please enter valid year built.";
  }

  if (!form.zoning.trim()) return "Please enter zoning.";

  if (!form.market_price || !requiredNumber(form.market_price)) {
    return "Please enter valid market price.";
  }

  return null;
}

function buildPayload(form: any) {
  return {
    property_type: form.property_type,
    address: form.address.trim(),
    zip_code: form.zip_code.trim(),
    state_code: form.state_code.trim().toUpperCase(),
    year_built: requiredNumber(form.year_built),
    zoning: form.zoning.trim(),
    market_price: requiredNumber(form.market_price),
    hidden_reserve: numberOrUndefined(form.hidden_reserve),
    has_liens: form.has_liens,
    lien_disclosure: form.lien_disclosure.trim() || undefined,
    is_preforeclosure: form.is_preforeclosure,
    mortgage_amount: numberOrUndefined(form.mortgage_amount),
    is_vacant: form.is_vacant,
    is_off_market: form.is_off_market,
    condition_report: {
      roof: form.condition_report.roof || undefined,
      hvac: form.condition_report.hvac || undefined,
      wetlands: form.condition_report.wetlands,
      overall: form.condition_report.overall || undefined,
      notes: form.condition_report.notes.trim() || undefined,
    },
    motivation: form.motivation.trim() || undefined,
    sell_timeline: form.sell_timeline.trim() || undefined,
    realtor_commission: numberOrUndefined(form.realtor_commission),
    proof_of_funds_required: form.proof_of_funds_required,
    unit_count: numberOrUndefined(form.unit_count),
  };
}

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [loadedListingId, setLoadedListingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data, isLoading } = useGetListingByIdQuery(id || "", {
    skip: !id,
  });

  const [updateListing, { isLoading: isUpdating }] =
  useUpdateListingMutation();

const [submitListing, { isLoading: isSubmitting }] =
  useSubmitListingMutation();

const isSaving = isUpdating || isSubmitting;

  const listing = getListingFromResponse(data);

  useEffect(() => {
    if (listing?._id && listing._id !== loadedListingId) {
      setForm(buildFormFromListing(listing));
      setLoadedListingId(listing._id);
    }
  }, [listing?._id, loadedListingId, listing]);

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-8 py-6 text-center shadow-[var(--shadow-card)]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
            Loading listing...
          </p>
        </div>
      </div>
    );
  }

  if (!listing?._id) {
    return (
      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="font-serif text-2xl font-black text-[var(--color-primary)]">
          Listing not found
        </h1>

        <Link
          to="/dashboard"
          className="mt-5 inline-flex bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

if (!isEditableListing(listing)) {
    return (
      <div className="rounded-2xl border border-[var(--color-secondary)]/30 bg-white p-8 shadow-[var(--shadow-card)]">
        <Link
          to={`/listings/${id}`}
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Link>

        <h1 className="font-serif text-2xl font-black text-[var(--color-primary)]">
          Editing is restricted
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
         This listing cannot be edited in its current status. Only draft or withdrawn
  listings can be edited.
        </p>
      </div>
    );
  }

  const set = (key: string, value: any) => {
    setApiError(null);
    setForm((previous: any) => ({
      ...previous,
      [key]: value,
    }));
  };

  const setCondition = (key: string, value: any) => {
    setApiError(null);
    setForm((previous: any) => ({
      ...previous,
      condition_report: {
        ...previous.condition_report,
        [key]: value,
      },
    }));
  };

const handleSave = async () => {
  if (!id) return;

  const validationError = validateForm(form);

  if (validationError) {
    setApiError(validationError);
    return;
  }

  try {
    setApiError(null);

    const payload = buildPayload(form);

    await updateListing({
      id,
      body: payload,
    }).unwrap();

    if (isWithdrawnListing(listing)) {
      await submitListing(id).unwrap();
    }

    navigate(`/listings/${id}`, {
      replace: true,
      state: {
        refreshListing: Date.now(),
      },
    });
  } catch (error: any) {
    const message =
      error?.data?.message ||
      error?.data?.error ||
      error?.error ||
      "Unable to update listing.";

    setApiError(Array.isArray(message) ? message.join(", ") : message);
  }
};

  return (
    <div className="space-y-8">
      <div>
        <Link
          to={`/listings/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Link>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
  {isWithdrawnListing(listing) ? "Withdrawn Listing" : "Draft Listing"}
</p>

        <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
          Edit Listing
        </h1>

       <p className="mt-2 text-sm text-[var(--color-text-muted)]">
  {isWithdrawnListing(listing)
    ? "Update this withdrawn listing. After saving, it will be submitted again for admin review."
    : "Update listing information before it is submitted or moved forward."}
</p>
      </div>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
          Property Information
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Property Type">
            <select
              value={form.property_type}
              onChange={(event) => set("property_type", event.target.value)}
              className={inputClass}
            >
              <option value="">Select type</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Address">
            <input
              value={form.address}
              onChange={(event) => set("address", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="State Code">
            <input
              value={form.state_code}
              onChange={(event) => set("state_code", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="ZIP Code">
            <input
              value={form.zip_code}
              onChange={(event) => set("zip_code", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Year Built">
            <input
              type="number"
              value={form.year_built}
              onChange={(event) => set("year_built", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Zoning">
            <input
              value={form.zoning}
              onChange={(event) => set("zoning", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Market Price">
            <input
              type="number"
              value={form.market_price}
              onChange={(event) => set("market_price", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Hidden Reserve">
            <input
              type="number"
              value={form.hidden_reserve}
              onChange={(event) => set("hidden_reserve", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Unit Count">
            <input
              type="number"
              value={form.unit_count}
              onChange={(event) => set("unit_count", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Mortgage Amount">
            <input
              type="number"
              value={form.mortgage_amount}
              onChange={(event) => set("mortgage_amount", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Legal Disclosures
        </h2>

        <div className="mt-5 space-y-5">
          <CardToggle
            label="Active Liens or Mortgages"
            description="Any outstanding financial claims against the property"
            checked={form.has_liens}
            onChange={(value) => set("has_liens", value)}
          />

          {form.has_liens && (
            <Field label="Lien Disclosure">
              <textarea
                value={form.lien_disclosure}
                onChange={(event) => set("lien_disclosure", event.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Describe lien amount, lender name, mortgage details, or other disclosure notes..."
              />
            </Field>
          )}

          <div className="border-t border-[var(--color-border-light)] pt-5">
            <CardToggle
              label="Pre-Foreclosure"
              description="Property is in pre-foreclosure or foreclosure risk"
              checked={form.is_preforeclosure}
              onChange={(value) => set("is_preforeclosure", value)}
            />

            {form.is_preforeclosure && (
              <div className="mt-5">
                <Field label="Mortgage Amount">
                  <input
                    type="number"
                    value={form.mortgage_amount}
                    onChange={(event) =>
                      set("mortgage_amount", event.target.value)
                    }
                    className={inputClass}
                    placeholder="0"
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border-light)] pt-5">
            <CardToggle
              label="Property is Vacant"
              description="Property is currently unoccupied"
              checked={form.is_vacant}
              onChange={(value) => set("is_vacant", value)}
            />
          </div>

          <div className="border-t border-[var(--color-border-light)] pt-5">
            <CardToggle
              label="Off-Market Property"
              description="Property is not currently listed publicly"
              checked={form.is_off_market}
              onChange={(value) => set("is_off_market", value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
          Condition Report
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Roof">
            <ConditionSelect
              value={form.condition_report.roof}
              onChange={(value) => setCondition("roof", value)}
            />
          </Field>

          <Field label="HVAC">
            <ConditionSelect
              value={form.condition_report.hvac}
              onChange={(value) => setCondition("hvac", value)}
            />
          </Field>

          <Field label="Overall">
            <ConditionSelect
              value={form.condition_report.overall}
              onChange={(value) => setCondition("overall", value)}
            />
          </Field>

          <CardToggle
            label="Wetlands"
            description="Property includes wetlands or protected environmental areas"
            checked={form.condition_report.wetlands}
            onChange={(value) => setCondition("wetlands", value)}
          />

          <div className="sm:col-span-2">
            <Field label="Condition Notes">
              <textarea
                value={form.condition_report.notes}
                onChange={(event) => setCondition("notes", event.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
          Motivation
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Motivation">
            <input
              value={form.motivation}
              onChange={(event) => set("motivation", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Sell Timeline">
            <input
              value={form.sell_timeline}
              onChange={(event) => set("sell_timeline", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Realtor Commission">
            <input
              type="number"
              value={form.realtor_commission}
              onChange={(event) =>
                set("realtor_commission", event.target.value)
              }
              className={inputClass}
            />
          </Field>

          <CardToggle
            label="Proof of Funds Required"
            description="Require buyers to provide proof of funds before moving forward"
            checked={form.proof_of_funds_required}
            onChange={(value) => set("proof_of_funds_required", value)}
          />
        </div>
      </section>

      <div className="flex justify-end border-t border-[var(--color-border-light)] pt-6">
       <button
  type="button"
  onClick={handleSave}
  disabled={isSaving}
  className="bg-[var(--color-primary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSaving
    ? "Saving..."
    : isWithdrawnListing(listing)
      ? "Save & Submit for Review"
      : "Save Changes"}
</button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(23,77,52,0.08)]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function CardToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-4 text-left transition ${
        checked
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/40"
      }`}
    >
      <div>
        <p
          className={`text-sm font-black ${
            checked
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-main)]"
          }`}
        >
          {label}
        </p>

        {description && (
          <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`text-[10px] font-black uppercase tracking-[0.22em] ${
            checked
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          {checked ? "Yes" : "No"}
        </span>

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
            checked
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-[var(--color-border-light)] bg-white"
          }`}
        >
          {checked && <Check className="h-4 w-4" />}
        </span>
      </div>
    </button>
  );
}

function ConditionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      <option value="">Select condition</option>
      {CONDITIONS.map((condition) => (
        <option key={condition} value={condition}>
          {condition}
        </option>
      ))}
    </select>
  );
}