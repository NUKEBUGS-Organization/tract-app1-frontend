import type { ReactNode } from "react";

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--color-border-light)]/70 ${className}`}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-10 w-72" />
        <SkeletonBlock className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-8 w-8 rounded-full" />
            </div>

            <SkeletonBlock className="h-8 w-24" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <SkeletonBlock className="mb-5 h-7 w-48" />

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 border-t border-[var(--color-border-light)] py-5 lg:grid-cols-[1.5fr_160px_140px_120px]"
            >
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-64" />
                <SkeletonBlock className="h-3 w-32" />
              </div>

              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-9 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-border-light)] px-6 py-5">
        <SkeletonBlock className="h-7 w-44" />
        <SkeletonBlock className="mt-2 h-4 w-72" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[var(--color-bg-soft)]">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-4">
                  <SkeletonBlock className="h-3 w-24" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-[var(--color-border-light)]"
              >
                {Array.from({ length: columns }).map((_, columnIndex) => (
                  <td key={columnIndex} className="px-6 py-5">
                    <SkeletonBlock
                      className={
                        columnIndex === 0
                          ? "h-5 w-48"
                          : columnIndex === columns - 1
                            ? "h-9 w-24"
                            : "h-5 w-28"
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  cards = 8,
}: {
  cards?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]"
        >
          <SkeletonBlock className="mb-4 h-9 w-9 rounded-full" />
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-36" />
          <SkeletonBlock className="h-10 w-96 max-w-full" />
          <SkeletonBlock className="h-6 w-28 rounded-full" />
        </div>

        <div className="flex gap-3">
          <SkeletonBlock className="h-11 w-28" />
          <SkeletonBlock className="h-11 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]"
          >
            <SkeletonBlock className="mb-4 h-3 w-28" />
            <SkeletonBlock className="h-8 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <SkeletonBlock className="h-[360px] w-full" />
          </div>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <SkeletonBlock className="mb-6 h-7 w-52" />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index}>
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="mt-2 h-5 w-36" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="animate-pulse">{children}</div>;
}