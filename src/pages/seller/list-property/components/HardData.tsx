import type { FormState } from "../types";
import { Inp, Lbl, Tarea, ToggleCard } from "./FormPrimitives";

interface StepProps {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  fieldErrors?: Record<string, string>;
}

export default function Step2HardData({
  form,
  set,
  fieldErrors = {},
}: StepProps) {
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
        <div>
          <Lbl label="Zoning" hint="Example: Residential" />

          <Inp
            value={form.zoning}
            onChange={(value) => set("zoning", value)}
            placeholder="Residential"
            error={fieldErrors.zoning}
          />
        </div>

        <div>
          <Lbl label="Year Built" />

          <Inp
            value={form.yearBuilt}
            onChange={(value) => set("yearBuilt", value)}
            placeholder="1995"
            type="number"
            error={fieldErrors.yearBuilt}
          />
        </div>

        <div>
          <Lbl label="Market Price" />

          <Inp
            value={form.marketPrice}
            onChange={(value) => set("marketPrice", value)}
            placeholder="250000"
            type="number"
            error={fieldErrors.marketPrice}
          />
        </div>

        <div>
          <Lbl label="Hidden Reserve" hint="Optional floor price" />

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
          onToggle={() => set("hasLiens", !form.hasLiens)}
          label="Active Liens or Mortgages"
          sub="Any outstanding financial claims against the property"
          error={fieldErrors.hasLiens}
        />

        {form.hasLiens && (
          <div className="border-l-2 border-[var(--color-danger)]/30 pl-4">
            <Tarea
              value={form.lienDetails}
              onChange={(value) => set("lienDetails", value)}
              placeholder="Describe lien amounts, lender names, or mortgage details."
              error={fieldErrors.lienDetails}
            />
          </div>
        )}

        <div className="border-t border-[var(--color-border-light)] pt-4">
          <ToggleCard
            checked={form.isPreforeclosure}
            onToggle={() => set("isPreforeclosure", !form.isPreforeclosure)}
            label="Pre-Foreclosure"
            sub="Property is in pre-foreclosure or foreclosure risk"
            error={fieldErrors.isPreforeclosure}
          />
        </div>

        <div>
          <Lbl label="Mortgage Amount" />

          <Inp
            value={form.mortgageAmount}
            onChange={(value) => set("mortgageAmount", value)}
            placeholder="0"
            type="number"
            error={fieldErrors.mortgageAmount}
          />
        </div>
      </div>
    </div>
  );
}