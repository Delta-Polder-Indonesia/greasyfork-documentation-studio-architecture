import { describe, expect, it } from "vitest";
import { runAutomatedReliabilityHarness } from "@/lib/engines/automatedReliabilityHarness";

describe("randomized reliability scenarios", () => {
  it("remains deterministic enough across repeated runs", () => {
    const runs = Array.from({ length: 4 }, (_, idx) => runAutomatedReliabilityHarness(20 + idx));
    const scores = runs.map((item) => item.reliabilityScore);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    expect(max - min).toBeLessThan(55);
    expect(runs.every((item) => item.scenarios.length >= 7)).toBe(true);
  });
});
