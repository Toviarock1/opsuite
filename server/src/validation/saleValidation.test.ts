import { MAX_AMOUNT, MAX_ITEM_LENGTH, validateSaleInput } from "./saleValidation.js";

describe("validateSaleInput", () => {
  it("accepts valid input and trims the item name", () => {
    const result = validateSaleInput({
      itemName: "  Peak milk tin  ",
      amount: 1200,
      soldAt: "2026-10-13T08:40:00.000Z",
    });
    expect(result.error).toBeUndefined();
    expect(result.value?.itemName).toBe("Peak milk tin");
    expect(result.value?.amount).toBe(1200);
    expect(result.value?.soldAt).toBeInstanceOf(Date);
  });

  it("rejects a non-object body", () => {
    expect(validateSaleInput(null).error).toBe("Request body must be JSON.");
    expect(validateSaleInput("sale").error).toBe("Request body must be JSON.");
  });

  it("rejects an empty item name", () => {
    expect(
      validateSaleInput({ itemName: "   ", amount: 100, soldAt: "2026-10-13T08:40:00.000Z" }).error,
    ).toBe("Item name is required.");
  });

  it("rejects an item name over the max length", () => {
    const result = validateSaleInput({
      itemName: "a".repeat(MAX_ITEM_LENGTH + 1),
      amount: 100,
      soldAt: "2026-10-13T08:40:00.000Z",
    });
    expect(result.error).toMatch(/100 characters or fewer/);
  });

  it("rejects non-integer, zero, and negative amounts", () => {
    for (const amount of [1.5, 0, -500, "1200"]) {
      const result = validateSaleInput({
        itemName: "Bread",
        amount,
        soldAt: "2026-10-13T08:40:00.000Z",
      });
      expect(result.error).toBe("Amount must be a positive whole number in naira.");
    }
  });

  it("rejects amounts over the maximum", () => {
    const result = validateSaleInput({
      itemName: "Bread",
      amount: MAX_AMOUNT + 1,
      soldAt: "2026-10-13T08:40:00.000Z",
    });
    expect(result.error).toMatch(/must not exceed/);
  });

  it("rejects a missing or invalid soldAt", () => {
    expect(
      validateSaleInput({ itemName: "Bread", amount: 100, soldAt: "" }).error,
    ).toBe("Time of sale is required.");
    expect(
      validateSaleInput({ itemName: "Bread", amount: 100, soldAt: "not-a-date" }).error,
    ).toBe("Time of sale must be a valid date.");
  });
});
