import { useEffect, useState } from "react";

import type { FormState } from "../types";
import { Inp, Lbl, Tarea, ToggleCard } from "./FormPrimitives";
import { Eye } from "lucide-react";

interface StepProps {
  form: FormState;
  set: <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => void;
  fieldErrors?: Record<string, string>;
}

const ZONING_GROUPS = [
  {
    label: "Residential",
    options: [
      {
        value: "R1",
        label: "R1 — Single-Family Residential",
      },
      {
        value: "R2",
        label: "R2 — Two-Family / Low-Density Residential",
      },
      {
        value: "R3",
        label: "R3 — Multifamily Residential",
      },
      {
        value: "R4",
        label: "R4 — Medium-Density Multifamily Residential",
      },
      {
        value: "R5",
        label: "R5 — High-Density Residential",
      },
      {
        value: "RS",
        label: "RS — Residential Single-Family",
      },
      {
        value: "RM",
        label: "RM — Residential Multifamily",
      },
      {
        value: "RR",
        label: "RR — Rural Residential",
      },
      {
        value: "MH",
        label: "MH — Manufactured / Mobile Home Residential",
      },
    ],
  },
  {
    label: "Commercial",
    options: [
      {
        value: "C1",
        label: "C1 — Neighborhood Commercial",
      },
      {
        value: "C2",
        label: "C2 — General Commercial",
      },
      {
        value: "C3",
        label: "C3 — Regional / Highway Commercial",
      },
      {
        value: "C4",
        label: "C4 — High-Intensity Commercial",
      },
      {
        value: "C5",
        label: "C5 — Commercial Core",
      },
      {
        value: "CN",
        label: "CN — Neighborhood Commercial",
      },
      {
        value: "CC",
        label: "CC — Community Commercial",
      },
      {
        value: "GC",
        label: "GC — General Commercial",
      },
      {
        value: "CBD",
        label: "CBD — Central Business District",
      },
      {
        value: "CR",
        label: "CR — Commercial Residential",
      },
    ],
  },
  {
    label: "Office",
    options: [
      {
        value: "O",
        label: "O — Office",
      },
      {
        value: "OP",
        label: "OP — Office Professional",
      },
      {
        value: "OR",
        label: "OR — Office Residential",
      },
    ],
  },
  {
    label: "Industrial / Manufacturing",
    options: [
      {
 
        value: "M1",
        label: "M1 — Light Manufacturing",
      },
      {
        value: "M2",
        label: "M2 — General Manufacturing",
      },
      {
        value: "M3",
        label: "M3 — Heavy Manufacturing",
      },
      {
        value: "I1",
        label: "I1 — Light Industrial",
      },
      {
        value: "I2",
        label: "I2 — General Industrial",
      },
      {
        value: "I3",
        label: "I3 — Heavy Industrial",
      },
    ],
  },
  {
    label: "Mixed Use",
    options: [
      {
        value: "MU",
        label: "MU — Mixed Use",
      },
      {
        value: "MX",
        label: "MX — Mixed Residential / Commercial",
      },
      {
        value: "MXD",
        label: "MXD — Mixed-Use Development",
      },
      {
        value: "TOD",
        label: "TOD — Transit-Oriented Development",
      },
    ],
  },
  {
    label: "Agricultural / Rural",
    options: [
      {
        value: "A",
        label: "A — Agricultural",
      },
      {
        value: "AG",
        label: "AG — Agricultural",
      },
      {
        value: "AR",
        label: "AR — Agricultural Residential",
      },
      {
        value: "RA",
        label: "RA — Rural Agricultural",
      },
    ],
  },
  {
    label: "Public / Institutional / Recreation",
    options: [
      {
        value: "P",
        label: "P — Public",
      },
      {
        value: "PF",
        label: "PF — Public Facilities",
      },
      {
        value: "INST",
        label: "INST — Institutional",
      },
      {
        value: "OS",
        label: "OS — Open Space",
      },
      {
        value: "CON",
        label: "CON — Conservation",
      },
      {
        value: "REC",
        label: "REC — Recreation",
      },
    ],
  },
  {
    label: "Special / Planned Development",
    options: [
      {
        value: "PD",
        label: "PD — Planned Development",
      },
      {
        value: "PUD",
        label: "PUD — Planned Unit Development",
      },
      {
        value: "H",
        label: "H — Historic / Historic Overlay",
      },
      {
        value: "HO",
        label: "HO — Historic Overlay",
      },
      {
        value: "AO",
        label: "AO — Airport Overlay",
      },
      {
        value: "FP",
        label: "FP — Floodplain",
      },
    ],
  },
  {
    label: "Unknown / Not Zoned",
    options: [
      {
        value: "UNZONED",
        label: "Unzoned / No Local Zoning",
      },
      {
        value: "UNKNOWN",
        label: "Unknown / Needs Verification",
      },
    ],
  },
] as const;

const COMMON_ZONING_VALUES = new Set<string>(
  ZONING_GROUPS.flatMap((group) =>
    group.options.map((option) => String(option.value))
  )
);
function HiddenReserveInfo() {
  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        aria-label="What is a hidden reserve?"
        className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] focus:bg-[var(--color-primary)]/10 focus:text-[var(--color-primary)] focus:outline-none"
      >
        <Eye className="h-4 w-4" />
      </button>

      <div className="pointer-events-none absolute right-0 top-9 z-50 hidden w-[290px] rounded-xl border border-[var(--color-border-light)] bg-white p-4 text-left shadow-xl group-hover:block group-focus-within:block sm:w-[340px]">
        <p className="text-sm font-black text-[var(--color-primary)]">
          What is the Hidden Reserve?
        </p>

        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
          This is the seller&apos;s private minimum acceptable price. It is not
          displayed to buyers or acquisition partners.
        </p>

        <div className="mt-3 rounded-lg bg-[var(--color-bg-soft)] p-3">
          <p className="text-xs font-bold leading-5 text-[var(--color-text-main)]">
            Bids below this amount are automatically blocked or rejected,
            helping prevent lowball offers.
          </p>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">
          The Market Price remains public, while the Hidden Reserve stays
          private.
        </p>

        <span className="absolute -top-1.5 right-2 h-3 w-3 rotate-45 border-l border-t border-[var(--color-border-light)] bg-white" />
      </div>
    </div>
  );
}

export default function Step2HardData({
  form,
  set,
  fieldErrors = {},
}: StepProps) {
  const [useCustomZoning, setUseCustomZoning] = useState(() => {
    return Boolean(
      form.zoning &&
      !COMMON_ZONING_VALUES.has(
        form.zoning.toUpperCase()
      )
    );
  });

  useEffect(() => {
    if (!form.zoning) return;

    const normalizedZoning = form.zoning
      .trim()
      .toUpperCase();

    setUseCustomZoning(
      !COMMON_ZONING_VALUES.has(normalizedZoning)
    );
  }, [form.zoning]);

  function handleZoningChange(value: string) {
    if (value === "__other__") {
      setUseCustomZoning(true);
      set("zoning", "");
      return;
    }

    setUseCustomZoning(false);
    set("zoning", value);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
          Hard Data & Financials
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Accurate data builds trust and speeds up verification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Zoning dropdown */}
        <div>
          <Lbl
            label="Zoning"
            hint="Select the closest local zoning code"
          />

          <select
            value={
              useCustomZoning
                ? "__other__"
                : form.zoning || ""
            }
            onChange={(event) =>
              handleZoningChange(event.target.value)
            }
            className={`w-full rounded-none border bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:ring-1 ${fieldErrors.zoning
              ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
              : "border-[var(--color-border-light)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)]"
              }`}
          >
            <option value="" disabled>
              Select zoning category
            </option>

            {ZONING_GROUPS.map((group) => (
              <optgroup
                key={group.label}
                label={group.label}
              >
                {group.options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}

            <option value="__other__">
              Other / Local Zoning Code
            </option>
          </select>

          {fieldErrors.zoning && (
            <p className="mt-2 text-xs font-semibold text-[var(--color-danger)]">
              {fieldErrors.zoning}
            </p>
          )}

          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            Zoning codes vary by city and county. Select
            “Other” when the property uses a more specific
            local code, such as R1-5, RS-7.5, or C2-1.
          </p>

          {useCustomZoning && (
            <div className="mt-4">
              <Lbl
                label="Local Zoning Code"
                hint="Enter the exact code from county or city records"
              />

              <Inp
                value={form.zoning}
                onChange={(value) =>
                  set(
                    "zoning",
                    value.toUpperCase()
                  )
                }
                placeholder="Example: R1-5, RS-7.5, C2-1"
                error={fieldErrors.zoning}
              />
            </div>
          )}
        </div>

        <div>
          <Lbl label="Year Built" />

          <Inp
            value={form.yearBuilt}
            onChange={(value) =>
              set("yearBuilt", value)
            }
            placeholder="1995"
            type="number"
            error={fieldErrors.yearBuilt}
          />
        </div>

        <div>
          <div className="mb-2 flex min-h-7 items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Market Price
            </p>
          </div>

          <Inp
            value={form.marketPrice}
            onChange={(value) => set("marketPrice", value)}
            placeholder="250000"
            type="number"
            error={fieldErrors.marketPrice}
          />
        </div>

        <div>
          <div className="mb-2 flex min-h-7 items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Hidden Reserve
            </p>

            <HiddenReserveInfo />
          </div>

          <Inp
            value={form.hiddenReserve}
            onChange={(value) => set("hiddenReserve", value)}
            placeholder="200000"
            type="number"
            error={fieldErrors.hiddenReserve}
          />
        </div>
      </div>

      <div className="space-y-5 rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Legal Disclosures
        </h3>

        <ToggleCard
          checked={form.hasLiens}
          onToggle={() =>
            set("hasLiens", !form.hasLiens)
          }
          label="Active Liens or Mortgages"
          sub="Any outstanding financial claims against the property"
          error={fieldErrors.hasLiens}
        />

        {form.hasLiens && (
          <div className="border-l-2 border-[var(--color-danger)]/30 pl-4">
            <Tarea
              value={form.lienDetails}
              onChange={(value) =>
                set("lienDetails", value)
              }
              placeholder="Describe lien amounts, lender names, or mortgage details."
              error={fieldErrors.lienDetails}
            />
          </div>
        )}

        <div className="border-t border-[var(--color-border-light)] pt-4">
          <ToggleCard
            checked={form.isPreforeclosure}
            onToggle={() =>
              set(
                "isPreforeclosure",
                !form.isPreforeclosure
              )
            }
            label="Pre-Foreclosure"
            sub="Property is in pre-foreclosure or foreclosure risk"
            error={fieldErrors.isPreforeclosure}
          />
        </div>

        <div>
          <Lbl label="Mortgage Amount" />

          <Inp
            value={form.mortgageAmount}
            onChange={(value) =>
              set("mortgageAmount", value)
            }
            placeholder="0"
            type="number"
            error={fieldErrors.mortgageAmount}
          />
        </div>
      </div>
    </div>
  );
}