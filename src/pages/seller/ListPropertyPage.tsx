import { useState } from "react";
import {
  AlertTriangle, Building2, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, FileText, Home, Info, Layers, MapPin, Send, Trees, Warehouse,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */
interface FormState {
  propertyType: string; unitCount: string; commercialSubtype: string;
  address: string; city: string; state: string; zip: string;
  zoning: string; yearBuilt: string; purchasePrice: string; purchaseYear: string;
  hasLiens: boolean; lienDetails: string; hasViolations: boolean; violationDetails: string;
  roofCondition: string; roofNotes: string; hvacCondition: string; hvacNotes: string;
  hasWetlands: boolean; isVacant: boolean; vacancyNotes: string;
  timeline: string; reason: string; askingPrice: string; additionalNotes: string;
}

const DEFAULT: FormState = {
  propertyType: "", unitCount: "", commercialSubtype: "",
  address: "", city: "", state: "", zip: "",
  zoning: "", yearBuilt: "", purchasePrice: "", purchaseYear: "",
  hasLiens: false, lienDetails: "", hasViolations: false, violationDetails: "",
  roofCondition: "", roofNotes: "", hvacCondition: "", hvacNotes: "",
  hasWetlands: false, isVacant: false, vacancyNotes: "",
  timeline: "", reason: "", askingPrice: "", additionalNotes: "",
};

/* ── Constants ──────────────────────────────────────────── */
const PROPERTY_TYPES = [
  { id: "sfh",       label: "Single Family Home", icon: Home,      desc: "Standalone residential" },
  { id: "multi",     label: "Multi-Family",        icon: Layers,    desc: "Duplex, triplex, apartment" },
  { id: "land",      label: "Land",                icon: Trees,     desc: "Vacant or raw land" },
  { id: "commercial",label: "Commercial",          icon: Warehouse, desc: "Warehouse, retail, offices" },
  { id: "mixeduse",  label: "Mixed Use",           icon: Building2, desc: "Residential + commercial" },
];
const COMMERCIAL_SUBS = ["Warehouse", "Office Building", "Retail Space", "Commercial Land", "Industrial"];
const ROOF_CONDS    = ["Excellent", "Good", "Fair", "Poor"];
const HVAC_CONDS    = ["New (<3yrs)", "Good", "Aging", "Needs Replacement"];
const TIMELINES     = ["ASAP (30 days)", "1–3 Months", "3–6 Months", "Flexible / No Rush"];
const SELL_REASONS  = ["Relocating", "Financial hardship", "Estate / Inheritance", "Upgrading", "Investment exit", "Divorce", "Other"];
const STEPS         = [
  { id: 1, label: "Property Type", icon: Home },
  { id: 2, label: "Hard Data",     icon: FileText },
  { id: 3, label: "Condition",     icon: AlertTriangle },
  { id: 4, label: "Motivation",    icon: Send },
];

/* ── Shared primitives ───────────────────────────────────── */
const inputCls = "w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(23,77,52,0.08)]";

function Lbl({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">{label}</label>
      {hint && <span title={hint}><Info className="h-3.5 w-3.5 cursor-help text-[var(--color-text-muted)]/50" /></span>}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />;
}

function Tarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${inputCls} resize-none`} />;
}

function Toggle({ checked, onToggle, label, sub }: { checked: boolean; onToggle: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-[var(--color-text-main)]">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{sub}</p>}
      </div>
      <button type="button" onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-light)]"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${value === opt ? "bg-[var(--color-primary)] text-white" : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ── Step indicator ──────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${done ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : active ? "border-[var(--color-secondary)] bg-white shadow-[0_0_0_4px_rgba(212,175,55,0.15)]" : "border-[var(--color-border-light)] bg-white"}`}>
                {done ? <CheckCircle2 className="h-5 w-5 text-white" /> : <Icon className={`h-4 w-4 ${active ? "text-[var(--color-secondary)]" : "text-[var(--color-text-muted)]"}`} />}
              </div>
              <span className={`hidden text-[10px] font-black uppercase tracking-[0.15em] sm:block ${active ? "text-[var(--color-primary)]" : done ? "text-[var(--color-primary)]/50" : "text-[var(--color-text-muted)]"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 w-10 sm:w-20 ${done ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-light)]"}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Property Type ───────────────────────────────── */
function Step1({ f, set }: { f: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">Property Type</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Select the category that best describes your property.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PROPERTY_TYPES.map(({ id, label, icon: Icon, desc }) => (
          <button key={id} type="button" onClick={() => set("propertyType", id)}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${f.propertyType === id ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/40"}`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${f.propertyType === id ? "bg-[var(--color-primary)] text-[var(--color-secondary)]" : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]"}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-sm font-black ${f.propertyType === id ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"}`}>{label}</p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {f.propertyType === "multi" && (
        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
          <Lbl label="Number of Units" />
          <Inp value={f.unitCount} onChange={v => set("unitCount", v)} placeholder="e.g. 4" type="number" />
        </div>
      )}
      {f.propertyType === "commercial" && (
        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
          <Lbl label="Commercial Subtype" />
          <div className="mt-2"><Chips options={COMMERCIAL_SUBS} value={f.commercialSubtype} onChange={v => set("commercialSubtype", v)} /></div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">
          <MapPin className="h-4 w-4 text-[var(--color-secondary)]" /> Property Location
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Lbl label="Street Address" /><Inp value={f.address} onChange={v => set("address", v)} placeholder="123 Main Street" /></div>
          <div><Lbl label="City" /><Inp value={f.city} onChange={v => set("city", v)} placeholder="Austin" /></div>
          <div><Lbl label="State" /><Inp value={f.state} onChange={v => set("state", v)} placeholder="TX" /></div>
          <div><Lbl label="ZIP Code" /><Inp value={f.zip} onChange={v => set("zip", v)} placeholder="78701" /></div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Hard Data ───────────────────────────────────── */
function Step2({ f, set }: { f: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">Hard Data & Financials</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Accurate data builds trust and speeds up verification.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div><Lbl label="Zoning" hint="e.g. R-1, M-1, C-2" /><Inp value={f.zoning} onChange={v => set("zoning", v)} placeholder="e.g. R-1 (Residential)" /></div>
        <div><Lbl label="Year Built" /><Inp value={f.yearBuilt} onChange={v => set("yearBuilt", v)} placeholder="e.g. 1998" type="number" /></div>
        <div><Lbl label="Original Purchase Price" /><Inp value={f.purchasePrice} onChange={v => set("purchasePrice", v)} placeholder="$280,000" /></div>
        <div><Lbl label="Year Purchased" /><Inp value={f.purchaseYear} onChange={v => set("purchaseYear", v)} placeholder="e.g. 2015" type="number" /></div>
      </div>
      <div className="space-y-5 rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">Legal Disclosures</h3>
        <Toggle checked={f.hasLiens} onToggle={() => set("hasLiens", !f.hasLiens)} label="Active Liens or Mortgages" sub="Any outstanding financial claims against the property" />
        {f.hasLiens && (
          <div className="border-l-2 border-[var(--color-danger)]/30 pl-4">
            <Tarea value={f.lienDetails} onChange={v => set("lienDetails", v)} placeholder="Describe lien amounts, lender names, or mortgage details…" />
          </div>
        )}
        <div className="border-t border-[var(--color-border-light)] pt-4 space-y-4">
          <Toggle checked={f.hasViolations} onToggle={() => set("hasViolations", !f.hasViolations)} label="Code Violations or Notices" sub="Any municipal or city code enforcement issues" />
          {f.hasViolations && (
            <div className="border-l-2 border-[var(--color-warning)]/40 pl-4">
              <Tarea value={f.violationDetails} onChange={v => set("violationDetails", v)} placeholder="Describe violations, notice dates, or case numbers…" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Condition ───────────────────────────────────── */
function Step3({ f, set }: { f: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">Condition Report</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Honest details protect you legally and attract serious buyers.</p>
      </div>
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm space-y-6">
        <div>
          <Lbl label="Roof Condition" />
          <Chips options={ROOF_CONDS} value={f.roofCondition} onChange={v => set("roofCondition", v)} />
          <div className="mt-3"><Tarea value={f.roofNotes} onChange={v => set("roofNotes", v)} placeholder="Roof age, material, or known issues…" rows={2} /></div>
        </div>
        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="HVAC Condition" />
          <Chips options={HVAC_CONDS} value={f.hvacCondition} onChange={v => set("hvacCondition", v)} />
          <div className="mt-3"><Tarea value={f.hvacNotes} onChange={v => set("hvacNotes", v)} placeholder="Last service date, system age or type…" rows={2} /></div>
        </div>
      </div>
      <div className="space-y-4 rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">Environmental & Occupancy</h3>
        <Toggle checked={f.hasWetlands} onToggle={() => set("hasWetlands", !f.hasWetlands)} label="Wetlands on Property" sub="Proximity to protected zones or flood plains" />
        <div className="border-t border-[var(--color-border-light)] pt-4 space-y-3">
          <Toggle checked={f.isVacant} onToggle={() => set("isVacant", !f.isVacant)} label="Property is Currently Vacant" sub="Unoccupied / no tenants or owner" />
          {f.isVacant && <Tarea value={f.vacancyNotes} onChange={v => set("vacancyNotes", v)} placeholder="How long vacant? Any security or maintenance notes?" rows={2} />}
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: Motivation ──────────────────────────────────── */
function Step4({ f, set }: { f: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">Motivation & Asking Price</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Help buyers understand your situation to receive better, faster offers.</p>
      </div>
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm space-y-6">
        <div>
          <Lbl label="Desired Timeline" hint="How soon do you need to close?" />
          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TIMELINES.map(t => (
              <button key={t} type="button" onClick={() => set("timeline", t)}
                className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${f.timeline === t ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/50"}`}>
                <Clock className={`h-5 w-5 ${f.timeline === t ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
                <span className={`text-sm font-bold ${f.timeline === t ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"}`}>{t}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="Primary Reason for Selling" />
          <div className="mt-1 flex flex-wrap gap-2">
            {SELL_REASONS.map(r => (
              <button key={r} type="button" onClick={() => set("reason", r)}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${f.reason === r ? "bg-[var(--color-secondary)] text-[var(--color-primary-dark)]" : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-secondary)]"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="Asking Price" hint="Buyers may offer above or below." />
          <Inp value={f.askingPrice} onChange={v => set("askingPrice", v)} placeholder="$350,000" />
        </div>
        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="Additional Notes" />
          <Tarea value={f.additionalNotes} onChange={v => set("additionalNotes", v)} placeholder="Anything else buyers should know…" rows={4} />
        </div>
      </div>
      <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-secondary)]" />
          <div>
            <p className="text-sm font-black text-[var(--color-primary)]">1-Hour Auto-Live Guarantee</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">Once submitted, your listing moves from "Draft" to "Live in Network" within 1 hour after automated compliance check.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function ListPropertyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]">
          <CheckCircle2 className="h-10 w-10 text-[var(--color-secondary)]" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">Listing Submitted!</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Your property will go <strong>Live in the Network within 1 hour</strong>.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-6 py-3">
          <Clock className="h-4 w-4 text-[var(--color-secondary)]" />
          <span className="text-sm font-bold text-[var(--color-primary)]">Auto-Live Check: In Progress</span>
        </div>
        <a href="/document-vault" className="bg-[var(--color-primary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.02]">
          Upload Documents →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Full Disclosure Suite</p>
          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">List My Property</h1>
        </div>
        <div className="rounded-none border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Draft Auto-Saved
        </div>
      </div>

      {/* Step Indicator */}
      <div className="overflow-x-auto pb-2">
        <StepIndicator current={step} />
      </div>

      {/* Step Panel */}
      <div className="min-h-[400px]">
        {step === 1 && <Step1 f={form} set={set} />}
        {step === 2 && <Step2 f={form} set={set} />}
        {step === 3 && <Step3 f={form} set={set} />}
        {step === 4 && <Step4 f={form} set={set} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-light)] pt-6">
        <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
          className="flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex gap-1">
          {STEPS.map(s => (
            <div key={s.id} className={`h-1.5 rounded-full transition-all ${s.id === step ? "w-8 bg-[var(--color-primary)]" : s.id < step ? "w-4 bg-[var(--color-primary)]/40" : "w-4 bg-[var(--color-border-light)]"}`} />
          ))}
        </div>

        {step < 4 ? (
          <button type="button" onClick={() => setStep(s => Math.min(4, s + 1))}
            className="flex items-center gap-2 bg-[var(--color-primary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-card)] transition hover:scale-[1.02]">
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={() => setSubmitted(true)}
            className="flex items-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]">
            <Send className="h-4 w-4" /> Submit Listing
          </button>
        )}
      </div>
    </div>
  );
}
