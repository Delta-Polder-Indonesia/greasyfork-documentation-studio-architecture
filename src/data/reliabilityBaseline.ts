export type ScenarioKey =
  | "typing_stress"
  | "huge_markdown"
  | "rapid_undo_redo"
  | "sanitize_loops"
  | "massive_paste"
  | "preview_rerender_stress"
  | "autosave_recovery";

export type Severity = "critical" | "non_critical";

export interface ScenarioBaseline {
  key: ScenarioKey;
  label: string;
  weight: number;
  severity: Severity;
  baselineMs: number;
  maxThresholdMs: number;
}

export interface ReliabilityThresholds {
  scenarios: Record<ScenarioKey, ScenarioBaseline>;
  maxWarningsPerCase: number;
  maxTypingLatencyP95Ms: number;
  maxPreviewRenderP95Ms: number;
  maxTransactionP95Ms: number;
  maxHistoryMemoryKb: number;
  maxMemoryGrowthMb: number;
  maxRerenderCount: number;
  minConfidenceScore: number;
  minReliabilityScore: number;
  maxNegativeDeltaMs: number;
}

export const reliabilityBaseline: ReliabilityThresholds = {
  scenarios: {
    typing_stress: {
      key: "typing_stress",
      label: "Typing Stress",
      weight: 1.4,
      severity: "critical",
      baselineMs: 42,
      maxThresholdMs: 95,
    },
    huge_markdown: {
      key: "huge_markdown",
      label: "Huge Markdown",
      weight: 1.2,
      severity: "critical",
      baselineMs: 120,
      maxThresholdMs: 240,
    },
    rapid_undo_redo: {
      key: "rapid_undo_redo",
      label: "Rapid Undo Redo",
      weight: 1,
      severity: "critical",
      baselineMs: 20,
      maxThresholdMs: 60,
    },
    sanitize_loops: {
      key: "sanitize_loops",
      label: "Sanitize Loops",
      weight: 1,
      severity: "non_critical",
      baselineMs: 160,
      maxThresholdMs: 260,
    },
    massive_paste: {
      key: "massive_paste",
      label: "Massive Paste",
      weight: 1.1,
      severity: "critical",
      baselineMs: 140,
      maxThresholdMs: 280,
    },
    preview_rerender_stress: {
      key: "preview_rerender_stress",
      label: "Preview Rerender Stress",
      weight: 0.9,
      severity: "non_critical",
      baselineMs: 130,
      maxThresholdMs: 260,
    },
    autosave_recovery: {
      key: "autosave_recovery",
      label: "Autosave Recovery",
      weight: 1.3,
      severity: "critical",
      baselineMs: 35,
      maxThresholdMs: 85,
    },
  },
  maxWarningsPerCase: 40,
  maxTypingLatencyP95Ms: 105,
  maxPreviewRenderP95Ms: 150,
  maxTransactionP95Ms: 140,
  maxHistoryMemoryKb: 8500,
  maxMemoryGrowthMb: 55,
  maxRerenderCount: 2600,
  minConfidenceScore: 72,
  minReliabilityScore: 80,
  maxNegativeDeltaMs: 25,
};
