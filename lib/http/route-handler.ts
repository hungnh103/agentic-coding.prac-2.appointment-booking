import { NextResponse } from "next/server";

import { ApiError } from "@/lib/http/api-error";
import { logError, logWarn } from "@/lib/observability/logger";

type RouteHandlerOptions = {
  routeName?: string;
  timeoutMs?: number;
};

export async function withRouteHandler<T>(handler: () => Promise<T>, options: RouteHandlerOptions = {}) {
  const routeName = options.routeName ?? "unknown-route";
  const timeoutMs = options.timeoutMs ?? 8_000;
  const startedAt = Date.now();

  try {
    const data = await Promise.race([
      handler(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Route handler timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);

    return NextResponse.json(data);
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    if (error instanceof ApiError) {
      logWarn("route.api_error", {
        routeName,
        status: error.status,
        code: error.code,
        durationMs
      });

      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message
          }
        },
        { status: error.status }
      );
    }

    logError("route.unhandled_error", error, {
      routeName,
      durationMs,
    });

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong."
        }
      },
      { status: 500 }
    );
  }
}
