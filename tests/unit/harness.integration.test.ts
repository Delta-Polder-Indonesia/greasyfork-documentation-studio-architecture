import { describe, expect, it } from "vitest";
import { runReliabilityMatrix } from "@/lib/engines/reliabilityMatrix";

describe("reliability matrix", () => {
  it("returns benchmark cases and metrics", () => {
    const result = runReliabilityMatrix(10);

    expect(result.cases.length).toBeGreaterThanOrEqual(6);
    expect(typeof result.undoRedoSimulationMs).toBe("number");
    expect(typeof result.historyStackSize).toBe("number");
    expect(result.historyStackSize).toBe(10);
  });
});
