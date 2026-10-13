type Props = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPage: (page: number) => void;
};

export function PaginationControls({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPage,
}: Props) {
  if (totalCount === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const buttonClass =
    "rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-sm text-gray-600">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
          className={buttonClass}
        >
          Prev
        </button>
        <p className="text-sm text-gray-600" aria-live="polite">
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
          className={buttonClass}
        >
          Next
        </button>
      </div>
    </div>
  );
}
