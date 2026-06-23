import {
  CheckCircle,
  Circle,
  Clock3,
  Route,
  XCircle,
} from "lucide-react";

import type {
  ListingTimelineStep,
  TimelineStepState,
} from "./listingDetailHelpers";

function getStepIcon(state: TimelineStepState) {
  if (state === "complete") {
    return <CheckCircle className="h-4 w-4" aria-hidden="true" />;
  }

  if (state === "danger") {
    return <XCircle className="h-4 w-4" aria-hidden="true" />;
  }

  if (state === "active") {
    return <Clock3 className="h-4 w-4" aria-hidden="true" />;
  }

  return <Circle className="h-4 w-4" aria-hidden="true" />;
}

function getStepVisuals(state: TimelineStepState) {
  if (state === "complete") {
    return {
      dot: "bg-[var(--color-primary)] text-white",
      card: "border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5",
      title: "text-[var(--color-primary)]",
    };
  }

  if (state === "danger") {
    return {
      dot: "bg-[var(--color-danger)] text-white",
      card: "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5",
      title: "text-[var(--color-danger)]",
    };
  }

  if (state === "active") {
    return {
      dot: "bg-[var(--color-secondary)] text-[var(--color-primary)] ring-4 ring-[var(--color-secondary)]/20",
      card: "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10",
      title: "text-[var(--color-primary)]",
    };
  }

  return {
    dot: "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)]",
    card: "border-[var(--color-border-light)] bg-white",
    title: "text-[var(--color-text-muted)]",
  };
}

function getProgressIndex(steps: ListingTimelineStep[]) {
  const activeOrDangerIndex = steps.findIndex(
    (step) => step.state === "active" || step.state === "danger"
  );

  if (activeOrDangerIndex >= 0) return activeOrDangerIndex;

  const completeIndexes = steps
    .map((step, index) => (step.state === "complete" ? index : -1))
    .filter((index) => index >= 0);

  if (completeIndexes.length === 0) return 0;

  return completeIndexes[completeIndexes.length - 1];
}

function ListingTimelineStepper({ steps }: { steps: ListingTimelineStep[] }) {
  const progressIndex = getProgressIndex(steps);

  const progressPercent =
    steps.length > 1 ? (progressIndex / (steps.length - 1)) * 100 : 100;

  const completedCount = steps.filter(
    (step) => step.state === "complete"
  ).length;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              Listing Journey
            </div>

            <h2 className="font-serif text-xl font-black leading-tight text-[var(--color-primary)]">
              Status Timeline
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              Lifecycle progress from creation to current stage.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Progress
            </p>

            <p className="mt-0.5 text-xs font-black text-[var(--color-primary)]">
              {completedCount}/{steps.length} completed
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {steps.map((step, index) => {
              const visuals = getStepVisuals(step.state);

              return (
                <article
                  key={step.key}
                  className={`min-w-0 rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${visuals.card}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${visuals.dot}`}
                    >
                      {getStepIcon(step.state)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                        Step {index + 1}
                      </p>

                      <h3
                        className={`mt-0.5 truncate text-sm font-black ${visuals.title}`}
                      >
                        {step.label}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                    {step.description}
                  </p>

                  <p className="mt-2 text-xs font-black text-[var(--color-text-main)]">
                    {step.date}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ListingTimelineStepper;