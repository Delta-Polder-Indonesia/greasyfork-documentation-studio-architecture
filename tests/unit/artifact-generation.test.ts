import { describe, expect, it } from "vitest";
import { runReliabilityMatrix } from "@/lib/engines/reliabilityMatrix";

describe("artifact generation", () => {
  it("generates benchmark report with valid structure", () => {
    const result = runReliabilityMatrix(5);

    expect(result.cases.length).toBeGreaterThan(0);
    expect(typeof result.memoryGrowthMb).toBe("number");
    expect(typeof result.rerenderSpikeDetected).toBe("boolean");

    for (const c of result.cases) {
      expect(typeof c.name).toBe("string");
      expect(typeof c.markdownToHtmlMs).toBe("number");
      expect(typeof c.htmlToMarkdownMs).toBe("number");
      expect(typeof c.warningCount).toBe("number");
    }
  });
});
