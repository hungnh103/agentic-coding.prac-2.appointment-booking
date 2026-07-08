import { NextResponse } from "next/server";

import { ApiError } from "@/lib/http/api-error";

type RouteHandlerOptions = {
  routeName?: string;
  timeoutMs?: number;
};

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    };
  }

  return {
    message: String(error)
  };
}

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
      console.warn(`[route:${routeName}] handled api error`, {
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

    console.error(`[route:${routeName}] unhandled error`, {
      durationMs,
      ...getErrorDetails(error)
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
