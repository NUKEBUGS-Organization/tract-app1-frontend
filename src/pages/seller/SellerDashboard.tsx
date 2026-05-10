// src/pages/seller/SellerDashboard.tsx

import Button from "../../components/common/Button";
import { useGetMeQuery } from "../../services/userService";

export default function SellerDashboard() {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetMeQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">
          Seller Dashboard
        </h1>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Testing protected user API.
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-main)]">
              Current User API Test
            </h2>

            <p className="text-sm text-[var(--color-text-muted)]">
              GET /api/v1/users/me
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => refetch()}
            isLoading={isFetching}
            loadingText="Refreshing..."
          >
            Test API
          </Button>
        </div>

        {isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Loading user data...
          </p>
        )}

        {error && (
          <div className="rounded-[var(--radius-input)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
            API failed. Check Network tab for status and response.
          </div>
        )}

        {data && (
          <pre className="mt-4 max-h-[420px] overflow-auto rounded-[var(--radius-input)] bg-[var(--color-bg-soft)] p-4 text-xs text-[var(--color-text-main)]">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}