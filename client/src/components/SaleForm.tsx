import { useState, type FormEvent } from "react";
import { useCreateSale } from "../hooks/useSaleMutations";
import { toDatetimeLocalValue } from "../utils/datetime";
import { validateSaleFields } from "../utils/validateSaleFields";
import { Button } from "./Button";
import { ErrorText } from "./ErrorText";
import { SaleFields } from "./SaleFields";

type Props = {
  onCreated?: () => void;
};

export function SaleForm({ onCreated }: Props) {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [soldAt, setSoldAt] = useState(() => toDatetimeLocalValue(new Date()));
  const [formError, setFormError] = useState<string | null>(null);
  const createMutation = useCreateSale();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateSaleFields(itemName, amount, soldAt);
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    setFormError(null);
    try {
      await createMutation.mutateAsync(result.value);
      setItemName("");
      setAmount("");
      setSoldAt(toDatetimeLocalValue(new Date()));
      onCreated?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save sale.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">Log a sale</h2>

      <div className="mt-4 flex flex-col gap-4">
        <SaleFields
          idPrefix=""
          itemName={itemName}
          amount={amount}
          soldAt={soldAt}
          itemPlaceholder="e.g. Indomie carton"
          amountPlaceholder="e.g. 12500"
          onItemName={setItemName}
          onAmount={setAmount}
          onSoldAt={setSoldAt}
        />
        <ErrorText message={formError} />
        <div>
          <Button
            type="submit"
            variant="primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving…" : "Save sale"}
          </Button>
        </div>
      </div>
    </form>
  );
}
