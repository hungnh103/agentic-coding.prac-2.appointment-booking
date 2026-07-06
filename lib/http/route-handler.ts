import { NextResponse } from "next/server";

import { ApiError } from "@/lib/http/api-error";

export async function withRouteHandler<T>(handler: () => Promise<T>) {
  try {
    const data = await handler();

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
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

