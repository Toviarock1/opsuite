import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_AMOUNT, MAX_ITEM_LENGTH, validateSaleInput } from "./saleValidation.js";

describe("validateSaleInput", () => {
  it("accepts valid input and trims the item name", () => {
    const result = validateSaleInput({
      itemName: "  Peak milk tin  ",
      amount: 1200,
      soldAt: "2026-10-13T08:40:00.000Z",
    });
    assert.equal(result.error, undefined);
    assert.equal(result.value?.itemName, "Peak milk tin");
    assert.equal(result.value?.amount, 1200);
    assert.ok(result.value?.soldAt instanceof Date);
  });

  it("rejects a non-object body", () => {
    assert.equal(validateSaleInput(null).error, "Request body must be JSON.");
    assert.equal(validateSaleInput("sale").error, "Request body must be JSON.");
  });

  it("rejects an empty item name", () => {
    assert.equal(
      validateSaleInput({ itemName: "   ", amount: 100, soldAt: "2026-10-13T08:40:00.000Z" }).error,
      "Item name is required.",
    );
  });

  it("rejects an item name over the max length", () => {
    const result = validateSaleInput({
      itemName: "a".repeat(MAX_ITEM_LENGTH + 1),
      amount: 100,
      soldAt: "2026-10-13T08:40:00.000Z",
    });
    assert.match(result.error ?? "", /100 characters or fewer/);
  });

  it("rejects non-integer, zero, and negative amounts", () => {
    for (const amount of [1.5, 0, -500, "1200"]) {
      const result = validateSaleInput({ itemName: "Bread", amount, soldAt: "2026-10-13T08:40:00.000Z" });
      assert.equal(result.error, "Amount must be a positive whole number in naira.");
    }
  });

  it("rejects amounts over the maximum", () => {
    const result = validateSaleInput({
      itemName: "Bread",
      amount: MAX_AMOUNT + 1,
      soldAt: "2026-10-13T08:40:00.000Z",
    });
    assert.match(result.error ?? "", /must not exceed/);
  });

  it("rejects a missing or invalid soldAt", () => {
    assert.equal(
      validateSaleInput({ itemName: "Bread", amount: 100, soldAt: "" }).error,
      "Time of sale is required.",
    );
    assert.equal(
      validateSaleInput({ itemName: "Bread", amount: 100, soldAt: "not-a-date" }).error,
      "Time of sale must be a valid date.",
    );
  });
});
