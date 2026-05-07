import { useNavigate } from "react-router";

function EntryPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#f7f2e8] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-[#1f2a24]">
          TRACT Acquisition Engine
        </h1>

        <p className="mt-2 text-gray-600">
          Select your role to continue.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <button
            onClick={() => navigate("/seller/dashboard")}
            className="rounded-xl bg-[#1f5135] px-5 py-4 text-white font-semibold hover:opacity-90"
          >
            Seller
          </button>

          <button
            onClick={() => navigate("/partner/dashboard")}
            className="rounded-xl bg-red-600 px-5 py-4 text-white font-semibold hover:opacity-90"
          >
            Wholesaler
          </button>

          <button
            onClick={() => navigate("/realtor/dashboard")}
            className="rounded-xl bg-yellow-600 px-5 py-4 text-white font-semibold hover:opacity-90"
          >
            Realtor
          </button>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-xl bg-gray-900 px-5 py-4 text-white font-semibold hover:opacity-90"
          >
            Admin
          </button>
        </div>
      </div>
    </main>
  );
}

export default EntryPage;