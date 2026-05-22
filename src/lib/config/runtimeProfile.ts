export type RuntimeEnvironment = "local" | "dev" | "ci" | "production";

export interface EnvironmentProfile {
  environment: RuntimeEnvironment;
  strictCriticalFailures: boolean;
  allowSoftWarnings: boolean;
  instrumentationEnabled: boolean;
  flakyVarianceTolerance: number;
  sampleRuns: number;
}

const profileMap: Record<RuntimeEnvironment, EnvironmentProfile> = {
  local: {
    environment: "local",
    strictCriticalFailures: false,
    allowSoftWarnings: true,
    instrumentationEnabled: true,
    flakyVarianceTolerance: 0.5,
    sampleRuns: 3,
  },
  dev: {
    environment: "dev",
    strictCriticalFailures: false,
    allowSoftWarnings: true,
    instrumentationEnabled: true,
    flakyVarianceTolerance: 0.4,
    sampleRuns: 4,
  },
  ci: {
    environment: "ci",
    strictCriticalFailures: true,
    allowSoftWarnings: false,
    instrumentationEnabled: true,
    flakyVarianceTolerance: 0.25,
    sampleRuns: 5,
  },
  production: {
    environment: "production",
    strictCriticalFailures: true,
    allowSoftWarnings: false,
    instrumentationEnabled: false,
    flakyVarianceTolerance: 0.2,
    sampleRuns: 3,
  },
};

function readEnvKey(): RuntimeEnvironment {
  const mode = (import.meta.env.MODE ?? "").toLowerCase();
  const explicit = (import.meta.env.VITE_RUNTIME_ENV ?? "").toLowerCase();
  const isCi = import.meta.env.CI === "true" || explicit === "ci";

  if (explicit === "production" || mode === "production") return "production";
  if (isCi) return "ci";
  if (explicit === "dev" || mode === "development") return "dev";
  return "local";
}

export function getEnvironmentProfile(): EnvironmentProfile {
  return profileMap[readEnvKey()];
}

export function createCommitStyleId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${randomPart}`;
}
