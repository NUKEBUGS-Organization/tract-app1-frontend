import { MapPin } from "lucide-react";
import { PROPERTY_TYPES, STATES } from "../constants";
import type { FormState } from "../types";
import { Inp, Lbl, inputCls } from "./FormPrimitives";

interface StepProps {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export default function Step1PropertyType({ form, set }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
          Property Type
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Select the category that best describes your property.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PROPERTY_TYPES.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => set("propertyType", id)}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              form.propertyType === id
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/40"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                form.propertyType === id
                  ? "bg-[var(--color-primary)] text-[var(--color-secondary)]"
                  : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div>
              <p
                className={`text-sm font-black ${
                  form.propertyType === id
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-main)]"
                }`}
              >
                {label}
              </p>

              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {form.propertyType === "multi_family" && (
        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
          <Lbl label="Number of Units" />

          <Inp
            value={form.unitCount}
            onChange={(value) => set("unitCount", value)}
            placeholder="e.g. 4"
            type="number"
          />
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">
          <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
          Property Location
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Lbl label="Street Address" hint="Example: 123 Main St, Newark" />

            <Inp
              value={form.address}
              onChange={(value) => set("address", value)}
              placeholder="123 Main St, Newark"
            />
          </div>

          <div>
            <Lbl label="State" />

            <select
              value={form.state}
              onChange={(event) => set("state", event.target.value)}
              className={inputCls}
            >
              <option value="">Select state</option>
              {STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Lbl label="ZIP Code" />

            <Inp
              value={form.zip}
              onChange={(value) => set("zip", value)}
              placeholder="07101"
            />
          </div>
        </div>
      </div>
    </div>
  );
}