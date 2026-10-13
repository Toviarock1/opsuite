import { Button } from "./Button";

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

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-sm text-gray-600">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          Prev
        </Button>
        <p className="text-sm text-gray-600" aria-live="polite">
          Page {page} of {totalPages}
        </p>
        <Button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
