type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  return {
    value: String(error)
  };
}

function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context
  };

  const message = JSON.stringify(payload);

  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.log(message);
}

export function logInfo(event: string, context?: LogContext) {
  writeLog("info", event, context);
}

export function logWarn(event: string, context?: LogContext) {
  writeLog("warn", event, context);
}

export function logError(event: string, error: unknown, context?: LogContext) {
  writeLog("error", event, {
    ...context,
    error: serializeError(error)
  });
}
