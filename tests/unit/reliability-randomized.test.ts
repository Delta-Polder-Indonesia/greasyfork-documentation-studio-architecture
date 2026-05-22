import { describe, expect, it } from "vitest";
import { runReliabilityMatrix } from "@/lib/engines/reliabilityMatrix";

describe("reliability matrix determinism", () => {
  it("produces consistent case count across runs", () => {
    const r1 = runReliabilityMatrix(5);
    const r2 = runReliabilityMatrix(8);

    expect(r1.cases.length).toBe(r2.cases.length);
    expect(r1.cases.map((c) => c.name)).toEqual(r2.cases.map((c) => c.name));
  });
});
