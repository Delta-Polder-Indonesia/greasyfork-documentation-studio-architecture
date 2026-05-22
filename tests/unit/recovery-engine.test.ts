import { describe, expect, it } from "vitest";
import { deserializeAutosave, serializeAutosave } from "@/lib/engines/recoveryEngine";

describe("recovery engine", () => {
  it("serializes and restores autosave snapshots", () => {
    const snapshot = {
      html: "<p>Hello</p>",
      markdown: "Hello",
      lastEdited: "markdown" as const,
    };

    const raw = serializeAutosave(snapshot);
    const restored = deserializeAutosave(raw);
    expect(restored).toEqual(snapshot);
  });

  it("rejects corrupted autosave payload", () => {
    const corrupted = JSON.stringify({ data: { html: "<p>x</p>", markdown: "x", lastEdited: "markdown" }, checksum: 123 });
    expect(deserializeAutosave(corrupted)).toBeNull();
  });
});
