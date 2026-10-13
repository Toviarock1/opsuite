import { useState, type FormEvent } from "react";
import { useUpdateSale } from "../hooks/useSaleMutations";
import type { Sale } from "../lib/api";
import { toDatetimeLocalValue } from "../utils/datetime";
import { validateSaleFields } from "../utils/validateSaleFields";
import { Button } from "./Button";
import { ErrorText } from "./ErrorText";
import { SaleFields } from "./SaleFields";

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateSaleFields(itemName, amount, soldAt);
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: sale.id, input: result.value });
      onDone();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not update sale.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-blue-300 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">Edit sale</h2>

      <div className="mt-4 flex flex-col gap-4">
        <SaleFields
          idPrefix="edit-"
          itemName={itemName}
          amount={amount}
          soldAt={soldAt}
          onItemName={setItemName}
          onAmount={setAmount}
          onSoldAt={setSoldAt}
        />
        <ErrorText message={formError} />

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}
