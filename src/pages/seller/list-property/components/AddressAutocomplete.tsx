import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

import {
  type AddressSuggestion,
  type PropertyLookupResult,
  useLazySearchPropertyAddressesQuery,
  useLazySelectPropertyAddressQuery,
} from "../../../../services/propertyDataService";

import type { FormState } from "../types";
import {
  ErrorText,
  inputBaseCls,
  inputErrorCls,
  inputNormalCls,
} from "./FormPrimitives";

type Props = {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  error?: string;
};

function createSessionToken() {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isNumericKeyObject(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length > 0 && keys.every((key) => /^\d+$/.test(key));
}

function toAddressSuggestions(value: any): AddressSuggestion[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as AddressSuggestion[];
  }

  if (isNumericKeyObject(value)) {
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key])
      .filter(Boolean) as AddressSuggestion[];
  }

  return [];
}

function formatMoney(value: any) {
  if (value === undefined || value === null || value === "") return "-";

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "-";

  return numericValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatNumber(value: any) {
  if (value === undefined || value === null || value === "") return "-";

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "-";

  return numericValue.toLocaleString();
}

function formatDate(value: any) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getLookupErrorMessage(error: any) {
  const status = error?.status;
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) return message.join(", ");

  if (status === 400) {
    return "Couldn't get details for that address. Please fill in manually.";
  }

  if (status === 404) {
    return "No ATTOM property record was found for this address. You can still fill the form manually.";
  }

  if (status === 502) {
    return "Property search is unavailable right now. Please fill in manually.";
  }

  if (status === 500) {
    return "Property lookup is not configured on the backend.";
  }

  return message || "Couldn't fetch property details. Please fill in manually.";
}

function PropertyLookupSummary({ result }: { result: PropertyLookupResult }) {
  const facts = [
    result.bedrooms !== null ? `${result.bedrooms} bed` : null,
    result.bathrooms !== null ? `${result.bathrooms} bath` : null,
    result.square_footage !== null
      ? `${formatNumber(result.square_footage)} sqft`
      : null,
    result.lot_size_acres !== null ? `${result.lot_size_acres} acres` : null,
  ].filter(Boolean);

  return (
    <div className="mt-4 rounded-xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
          <CheckCircle2 className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[var(--color-primary)]">
            Property data found
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
            ATTOM data was used to prefill available fields. Please review and
            edit anything that looks incorrect.
          </p>

          {facts.length > 0 && (
            <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">
              {facts.join(" · ")}
            </p>
          )}

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div>
              <span className="font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Suggested Price
              </span>

              <p className="mt-1 font-bold text-[var(--color-text-main)]">
                {formatMoney(result.suggested_price)}
              </p>
            </div>

            <div>
              <span className="font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Last Sale
              </span>

              <p className="mt-1 font-bold text-[var(--color-text-main)]">
                {result.last_sale_price
                  ? `${formatMoney(result.last_sale_price)}${
                      result.last_sale_date
                        ? ` on ${formatDate(result.last_sale_date)}`
                        : ""
                    }`
                  : "-"}
              </p>
            </div>

            <div>
              <span className="font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                APN
              </span>

              <p className="mt-1 font-bold text-[var(--color-text-main)]">
                {result.apn || "-"}
              </p>
            </div>

            <div>
              <span className="font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                County FIPS
              </span>

              <p className="mt-1 font-bold text-[var(--color-text-main)]">
                {result.county_fips || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function applyLookupToForm(result: PropertyLookupResult, set: Props["set"]) {
  if (result.address) {
    set("address", result.address);
  }

  if (result.state_code) {
    set("state", result.state_code);
  }

  if (result.zip_code) {
    set("zip", result.zip_code);
  }

  if (result.property_type) {
    set("propertyType", result.property_type);
  }

  if (result.property_type && result.property_type !== "multi_family") {
    set("unitCount", "");
  }

  if (result.unit_count !== null && result.unit_count !== undefined) {
    set("unitCount", String(result.unit_count));
  }

  if (result.year_built !== null && result.year_built !== undefined) {
    set("yearBuilt", String(result.year_built));
  }

  if (result.zoning) {
    set("zoning", result.zoning);
  }

  if (result.suggested_price !== null && result.suggested_price !== undefined) {
    set("marketPrice", String(result.suggested_price));
  }
}

export default function AddressAutocomplete({ form, set, error }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localSuggestions, setLocalSuggestions] = useState<AddressSuggestion[]>(
    []
  );
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyLookupResult | null>(null);
  const [lookupError, setLookupError] = useState("");

  const sessionTokenRef = useRef<string>(createSessionToken());
  const latestQueryRef = useRef("");

  const [searchAddresses, { isFetching: isSearching }] =
    useLazySearchPropertyAddressesQuery();

  const [selectAddress, { isFetching: isSelecting }] =
    useLazySelectPropertyAddressQuery();

  const trimmedAddress = form.address.trim();
  const canSearch = trimmedAddress.length >= 3;

  const visibleSuggestions = useMemo<AddressSuggestion[]>(() => {
    if (!canSearch || !isDropdownOpen) return [];

    return toAddressSuggestions(localSuggestions);
  }, [canSearch, isDropdownOpen, localSuggestions]);

  function resetSessionToken() {
    sessionTokenRef.current = createSessionToken();
  }

  useEffect(() => {
    if (!isFocused || !canSearch) {
      setIsDropdownOpen(false);
      setLocalSuggestions([]);
      return;
    }

    const currentQuery = trimmedAddress;
    latestQueryRef.current = currentQuery;

    const timer = window.setTimeout(async () => {
      try {
        const results = await searchAddresses({
          query: currentQuery,
          session_token: sessionTokenRef.current,
        }).unwrap();

        if (latestQueryRef.current !== currentQuery) return;

        setLocalSuggestions(toAddressSuggestions(results));
        setIsDropdownOpen(true);
      } catch {
        if (latestQueryRef.current !== currentQuery) return;

        setLocalSuggestions([]);
        setIsDropdownOpen(true);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canSearch, isFocused, searchAddresses, trimmedAddress]);

  async function handleSelectSuggestion(suggestion: AddressSuggestion) {
    setLookupError("");
    setIsDropdownOpen(false);
    setLocalSuggestions([]);
    setSelectedProperty(null);

    set("address", suggestion.description);

    try {
      const result = await selectAddress({
        place_id: suggestion.place_id,
        session_token: sessionTokenRef.current,
      }).unwrap();

      applyLookupToForm(result, set);
      setSelectedProperty(result);
      resetSessionToken();
    } catch (error: any) {
      setLookupError(getLookupErrorMessage(error));
      resetSessionToken();
    }
  }

  function handleManualAddressChange(value: string) {
    setLookupError("");
    setSelectedProperty(null);
    set("address", value);

    if (!value.trim()) {
      resetSessionToken();
      setIsDropdownOpen(false);
      setLocalSuggestions([]);
    }
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
          setIsDropdownOpen(false);
        }
      }}
    >
      <div className="relative">
        <input
          type="text"
          value={form.address}
          onFocus={() => {
            setIsFocused(true);

            if (canSearch) {
              setIsDropdownOpen(true);
            }
          }}
          onChange={(event) => handleManualAddressChange(event.target.value)}
          placeholder="Start typing address, e.g. 4529 Winona Ct"
          className={`${inputBaseCls} pr-11 ${
            error ? inputErrorCls : inputNormalCls
          }`}
        />

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          {isSearching || isSelecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
      </div>

      <ErrorText message={error} />

      {lookupError && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-3 text-xs font-semibold leading-5 text-[#7a5d00]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{lookupError}</span>
        </div>
      )}

      {isSelecting && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 p-3 text-xs font-bold text-[var(--color-primary)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fetching property details from ATTOM...
        </div>
      )}

      {isDropdownOpen && canSearch && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-xl">
          {isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching addresses...
            </div>
          )}

          {!isSearching && visibleSuggestions.length === 0 && (
            <div className="px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">
              No address suggestions found.
            </div>
          )}

          {!isSearching &&
            visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="flex w-full items-start gap-3 border-b border-[var(--color-border-light)] px-4 py-3 text-left transition last:border-b-0 hover:bg-[var(--color-primary)]/5"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--color-text-main)]">
                    {suggestion.main_text || suggestion.description}
                  </p>

                  {suggestion.secondary_text && (
                    <p className="mt-0.5 truncate text-xs font-semibold text-[var(--color-text-muted)]">
                      {suggestion.secondary_text}
                    </p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}

      {!selectedProperty && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--color-bg-soft)] p-3 text-xs leading-5 text-[var(--color-text-muted)]">
          <Home className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />

          <p>
            Select a suggested address to auto-fill property type, state, ZIP,
            year built, zoning, and suggested market price. You can still edit
            everything manually.
          </p>
        </div>
      )}

      {selectedProperty && <PropertyLookupSummary result={selectedProperty} />}
    </div>
  );
}