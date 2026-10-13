import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { EditSaleForm } from "./components/EditSaleForm";
import { PaginationControls } from "./components/PaginationControls";
import { SaleForm } from "./components/SaleForm";
import { SalesTable } from "./components/SalesTable";
import { TotalCard } from "./components/TotalCard";
import { useDeleteSale } from "./hooks/useSaleMutations";
import { PAGE_SIZE, useTodaySales } from "./hooks/useTodaySales";
import type { Sale } from "./lib/api";

export default function App() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Wait until typing pauses before hitting the API.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // New searches and new sales both start on page 1.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const {
    sales,
    total,
    totalCount,
    totalPages,
    loading,
    refreshing,
    error,
    reload,
  } = useTodaySales(page, debouncedQuery);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Sale | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const deleteMutation = useDeleteSale();
  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables ?? null)
    : null;

  // If deletes shrink the list below the current page, step back.
  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      if (editingSale?.id === pendingDelete.id) setEditingSale(null);
      setPendingDelete(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete sale.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <header className="flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Daily Sales Log
            </h1>
            <p className="mt-1 text-sm text-gray-600">Today&apos;s sales.</p>
          </div>
          {refreshing && <p className="text-xs text-gray-500">Updating…</p>}
        </header>

        <main className="mt-6 flex flex-col gap-4">
          <SaleForm onCreated={() => setPage(1)} />

          {editingSale && (
            <EditSaleForm
              sale={editingSale}
              onDone={() => setEditingSale(null)}
              onCancel={() => setEditingSale(null)}
            />
          )}

          <TotalCard total={total} />

          {actionError && (
            <p role="alert" className="text-sm text-red-700">
              {actionError}
            </p>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Search items
            </label>
            <div className="flex gap-2">
              <input
                id="search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Indomie"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
              Loading today&apos;s sales…
            </p>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
              <p role="alert" className="text-red-700">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void reload()}
                className="mt-3 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <SalesTable
                sales={sales}
                deletingId={deletingId}
                search={debouncedQuery}
                onEdit={setEditingSale}
                onDelete={setPendingDelete}
              />
              <PaginationControls
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                onPage={setPage}
              />
            </>
          )}
        </main>
      </div>

      {pendingDelete && (
        <DeleteConfirmDialog
          sale={pendingDelete}
          deleting={deletingId === pendingDelete.id}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (deletingId === null) setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}
