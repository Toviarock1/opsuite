import { useState, type FormEvent } from "react";
import { useUpdateSale } from "../hooks/useSaleMutations";
import type { Sale, SaleInput } from "../lib/api";
import { toDatetimeLocalValue } from "../utils/datetime";

type Props = {
  sale: Sale;
  onDone: () => void;
  onCancel: () => void;
};

export function EditSaleForm({ sale, onDone, onCancel }: Props) {
  const [itemName, setItemName] = useState(sale.itemName);
  const [amount, setAmount] = useState(String(sale.amount));
  const [soldAt, setSoldAt] = useState(() =>
    toDatetimeLocalValue(new Date(sale.soldAt)),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const updateMutation = useUpdateSale();
  const submitting = updateMutation.isPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsedAmount = Number(amount);
    if (!itemName.trim()) {
      setFormError("Item name is required.");
      return;
    }
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setFormError("Amount must be a positive whole number.");
      return;
    }
    if (!soldAt) {
      setFormError("Time of sale is required.");
      return;
    }

    const input: SaleInput = {
      itemName: itemName.trim(),
      amount: parsedAmount,
      soldAt: new Date(soldAt).toISOString(),
    };

    try {
      await updateMutation.mutateAsync({ id: sale.id, input });
      onDone();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not update sale.",
      );
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-blue-300 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">Edit sale</h2>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label
            htmlFor="edit-itemName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Item name
          </label>
          <input
            id="edit-itemName"
            type="text"
            maxLength={100}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label
              htmlFor="edit-amount"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Amount (₦, whole naira)
            </label>
            <input
              id="edit-amount"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="edit-soldAt"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Time of sale
            </label>
            <input
              id="edit-soldAt"
              type="datetime-local"
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
