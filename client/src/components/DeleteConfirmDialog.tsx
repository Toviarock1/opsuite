import { useEffect, useRef } from "react";
import type { Sale } from "../lib/api";
import { formatNaira } from "../utils/formatNaira";
import { Button } from "./Button";

type Props = {
  sale: Sale;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmDialog({
  sale,
  deleting,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog when it opens, close on Escape.
  useEffect(() => {
    cancelRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        className="w-full max-w-sm rounded-lg bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-title" className="text-lg font-semibold text-gray-900">
          Delete sale?
        </h2>
        <p id="delete-desc" className="mt-2 text-sm text-gray-600">
          Delete &quot;{sale.itemName}&quot; ({formatNaira(sale.amount)})? This
          cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
