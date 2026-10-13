export const MAX_ITEM_LENGTH = 100;
export const MAX_AMOUNT = 10_000_000;

export type ValidSaleInput = {
  itemName: string;
  amount: number;
  soldAt: Date;
};

// Returns an error message string, or the cleaned values when valid.
export function validateSaleInput(body: unknown): {
  error?: string;
  value?: ValidSaleInput;
} {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be JSON." };
  }

  const { itemName, amount, soldAt } = body as Record<string, unknown>;

  if (typeof itemName !== "string" || itemName.trim().length === 0) {
    return { error: "Item name is required." };
  }
  const trimmed = itemName.trim();
  if (trimmed.length > MAX_ITEM_LENGTH) {
    return {
      error: `Item name must be ${MAX_ITEM_LENGTH} characters or fewer.`,
    };
  }

  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    return { error: "Amount must be a positive whole number in naira." };
  }
  if (amount > MAX_AMOUNT) {
    return {
      error: `Amount must not exceed ${MAX_AMOUNT.toLocaleString("en-NG")}.`,
    };
  }

  if (typeof soldAt !== "string" || soldAt.length === 0) {
    return { error: "Time of sale is required." };
  }
  const parsed = new Date(soldAt);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "Time of sale must be a valid date." };
  }

  return { value: { itemName: trimmed, amount, soldAt: parsed } };
}
