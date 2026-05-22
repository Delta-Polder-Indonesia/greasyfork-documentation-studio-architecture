import type { HistorySnapshot } from "@/types/editor";

export function normalizeSnapshot(input: unknown): HistorySnapshot | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Partial<HistorySnapshot>;
  if (typeof candidate.html !== "string" || typeof candidate.markdown !== "string") {
    return null;
  }
  return {
    html: candidate.html,
    markdown: candidate.markdown,
    lastEdited: candidate.lastEdited === "html" || candidate.lastEdited === "visual" || candidate.lastEdited === "markdown" ? candidate.lastEdited : "markdown",
  };
}

export function normalizeHistory(input: unknown): HistorySnapshot[] {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeSnapshot).filter((item): item is HistorySnapshot => item !== null);
}

interface AutosaveRecord {
  data: HistorySnapshot;
  checksum: number;
  savedAt: number;
}

function checksumForSnapshot(snapshot: HistorySnapshot) {
  const payload = `${snapshot.html}|${snapshot.markdown}|${snapshot.lastEdited}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function serializeAutosave(snapshot: HistorySnapshot) {
  const record: AutosaveRecord = {
    data: snapshot,
    checksum: checksumForSnapshot(snapshot),
    savedAt: Date.now(),
  };
  return JSON.stringify(record);
}

export function deserializeAutosave(raw: string): HistorySnapshot | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AutosaveRecord>;
    if (!parsed || typeof parsed !== "object" || !parsed.data) return null;
    const normalized = normalizeSnapshot(parsed.data);
    if (!normalized) return null;
    if (typeof parsed.checksum !== "number") return null;
    if (checksumForSnapshot(normalized) !== parsed.checksum) return null;
    return normalized;
  } catch {
    return null;
  }
}
