import type { SaleInput } from "../lib/api";

// Client-side checks mirror the server so mistakes show instantly.
// The server still re-validates everything; this is UX, not security.
export function validateSaleFields(
  itemName: string,
  amount: string,
  soldAt: string,
): { error: string } | { value: SaleInput } {
  if (!itemName.trim()) return { error: "Item name is required." };

  const parsedAmount = Number(amount);
  if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
    return { error: "Amount must be a positive whole number." };
  }

  if (!soldAt) return { error: "Time of sale is required." };

  return {
    value: {
      itemName: itemName.trim(),
      amount: parsedAmount,
      soldAt: new Date(soldAt).toISOString(),
    },
  };
}
