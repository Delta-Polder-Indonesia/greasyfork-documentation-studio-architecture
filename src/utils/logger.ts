type LogLevel = "info" | "warn" | "error";

interface LogEvent {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const LOG_BUFFER_LIMIT = 200;
const logBuffer: LogEvent[] = [];

function shouldPrintToConsole(level: LogLevel) {
  if (import.meta.env.MODE === "production") {
    return level === "error";
  }
  return true;
}

export function logEvent(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const event: LogEvent = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
  logBuffer.push(event);
  if (logBuffer.length > LOG_BUFFER_LIMIT) {
    logBuffer.shift();
  }

  if (!shouldPrintToConsole(level)) {
    return;
  }

  if (level === "error") {
    console.error(message, context ?? {});
  } else if (level === "warn") {
    console.warn(message, context ?? {});
  } else {
    console.info(message, context ?? {});
  }
}

export function getRecentLogs() {
  return [...logBuffer];
}
