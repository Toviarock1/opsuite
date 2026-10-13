import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLagosDayRange } from "./lagosDay.js";

describe("getLagosDayRange", () => {
  it("returns a 24-hour range starting at Lagos midnight", () => {
    // Noon UTC = 1pm in Lagos (UTC+1), so the day is Oct 13 in Lagos.
    const { start, end } = getLagosDayRange(new Date("2026-10-13T12:00:00.000Z"));
    assert.equal(start.toISOString(), "2026-10-12T23:00:00.000Z");
    assert.equal(end.toISOString(), "2026-10-13T23:00:00.000Z");
  });

  it("treats 23:30 Lagos as the same day and 00:30 Lagos as the next", () => {
    const evening = getLagosDayRange(new Date("2026-10-13T22:30:00.000Z"));
    assert.equal(evening.start.toISOString(), "2026-10-12T23:00:00.000Z");

    const nextMorning = getLagosDayRange(new Date("2026-10-13T23:30:00.000Z"));
    assert.equal(nextMorning.start.toISOString(), "2026-10-13T23:00:00.000Z");
  });
});
