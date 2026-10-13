import { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { EditSaleForm } from "./components/EditSaleForm";
import { ErrorText } from "./components/ErrorText";
import { PaginationControls } from "./components/PaginationControls";
import { SaleForm } from "./components/SaleForm";
import { SalesTable } from "./components/SalesTable";
import { SearchBar } from "./components/SearchBar";
import { TotalCard } from "./components/TotalCard";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useDeleteSale } from "./hooks/useSaleMutations";
import { PAGE_SIZE, useTodaySales } from "./hooks/useTodaySales";
import type { Sale } from "./lib/api";

export default function App() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

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
          <ErrorText message={actionError} />
          <SearchBar value={query} onChange={setQuery} />

          {loading ? (
            <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
              Loading sales…
            </p>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
              <ErrorText message={error} />
              <Button onClick={() => void reload()} className="mt-3">
                Try again
              </Button>
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
