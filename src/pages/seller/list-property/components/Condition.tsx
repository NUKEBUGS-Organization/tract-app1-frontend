import { CONDITIONS } from "../constants";
import type { FormState } from "../types";
import { Chips, Lbl, Tarea, ToggleCard } from "./FormPrimitives";

interface StepProps {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  fieldErrors?: Record<string, string>;
}

export default function Step3Condition({
  form,
  set,
  fieldErrors = {},
}: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
          Condition Report
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Honest details protect you legally and attract serious buyers.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <div>
          <Lbl label="Roof Condition" />

          <Chips
            options={CONDITIONS}
            value={form.roofCondition}
            onChange={(value) => set("roofCondition", value)}
            error={fieldErrors.roofCondition}
          />
        </div>

        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="HVAC Condition" />

          <Chips
            options={CONDITIONS}
            value={form.hvacCondition}
            onChange={(value) => set("hvacCondition", value)}
            error={fieldErrors.hvacCondition}
          />
        </div>

        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="Overall Condition" />

          <Chips
            options={CONDITIONS}
            value={form.overallCondition}
            onChange={(value) => set("overallCondition", value)}
            error={fieldErrors.overallCondition}
          />
        </div>

        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="Condition Notes" />

          <Tarea
            value={form.conditionNotes}
            onChange={(value) => set("conditionNotes", value)}
            placeholder="Roof age, HVAC service date, repairs, known issues, or general notes."
            rows={4}
            error={fieldErrors.conditionNotes}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Environmental & Occupancy
        </h3>

        <ToggleCard
          checked={form.hasWetlands}
          onToggle={() => set("hasWetlands", !form.hasWetlands)}
          label="Wetlands on Property"
          sub="Proximity to protected zones or flood plains"
          error={fieldErrors.hasWetlands}
        />

        <div className="border-t border-[var(--color-border-light)] pt-4">
          <ToggleCard
            checked={form.isVacant}
            onToggle={() => set("isVacant", !form.isVacant)}
            label="Property is Currently Vacant"
            sub="Unoccupied / no tenants or owner"
            error={fieldErrors.isVacant}
          />
        </div>

        <div className="border-t border-[var(--color-border-light)] pt-4">
          <ToggleCard
            checked={form.isOffMarket}
            onToggle={() => set("isOffMarket", !form.isOffMarket)}
            label="Off-Market Property"
            sub="Property is not currently listed publicly"
            error={fieldErrors.isOffMarket}
          />
        </div>
      </div>
    </div>
  );
}