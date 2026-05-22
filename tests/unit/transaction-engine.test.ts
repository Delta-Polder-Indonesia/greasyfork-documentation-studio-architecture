import { describe, expect, it } from "vitest";
import { createTransactionEngine } from "@/lib/engines/transactionEngine";
import { createManualScheduler, deterministicIdFactory } from "../helpers/deterministic";

describe("transaction engine deterministic behavior", () => {
  it("commits queued values with deterministic ids", () => {
    const committed: Array<{ value: string; transactionId: string }> = [];
    const { scheduler, flushAll } = createManualScheduler();

    const engine = createTransactionEngine<string>({
      debounceMs: 20,
      scheduler,
      idFactory: deterministicIdFactory(99),
      onCommit: (payload) => committed.push(payload),
    });

    engine.queue("a");
    engine.queue("b");
    flushAll();

    expect(committed).toHaveLength(1);
    expect(committed[0]?.value).toBe("b");
    expect(committed[0]?.transactionId.startsWith("tx_det_1_")).toBe(true);
  });
});
