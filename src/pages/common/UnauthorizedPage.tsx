import { Link } from "react-router";

function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] p-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">
          Unauthorized
        </h1>

        <p className="mt-3 text-gray-600">
          You do not have permission to view this page.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-xl bg-[var(--color-forest)] px-5 py-3 font-semibold text-white"
        >
          Go Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default UnauthorizedPage;