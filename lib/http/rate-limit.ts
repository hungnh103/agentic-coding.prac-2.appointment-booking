type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  rateLimitBuckets?: Map<string, RateLimitBucket>;
};

function getBuckets() {
  globalForRateLimit.rateLimitBuckets ??= new Map<string, RateLimitBucket>();
  return globalForRateLimit.rateLimitBuckets;
}

export function consumeRateLimit(config: RateLimitConfig) {
  const now = Date.now();
  const buckets = getBuckets();
  const current = buckets.get(config.key);

  if (!current || current.resetAt <= now) {
    const nextBucket = {
      count: 1,
      resetAt: now + config.windowMs
    };
    buckets.set(config.key, nextBucket);

    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: nextBucket.resetAt
    };
  }

  if (current.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt
    };
  }

  current.count += 1;
  buckets.set(config.key, current);

  return {
    allowed: true,
    remaining: Math.max(config.limit - current.count, 0),
    resetAt: current.resetAt
  };
}

export function getClientIdentifier(request: Request & { ip?: string | null }) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.ip ??
    "anonymous"
  );
}

export function applySecurityHeaders(headers: Headers) {
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}
