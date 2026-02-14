import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

/**
 * TEMP CLIENT KEYS
 * (Later move this to DB)
 */
const CLIENT_KEYS: Record<string, string> = {
  client_abc: "abc123",
};

const INTENT_THRESHOLD = 25;
const SESSION_TTL = 60 * 30; // 30 minutes

type IntentSession = {
  pageViews: number;
  duration: number;
  ctaClicks: number;
  returned: boolean;
  alerted: boolean;
};

/**
 * Calculate intent score
 * (No URLs, no PII, behavior only)
 */
function calculateScore(s: IntentSession): number {
  let score = 0;
  if (s.pageViews >= 3) score += 10;
  if (s.duration >= 60) score += 5;
  if (s.ctaClicks > 0) score += 10;
  if (s.returned) score += 10;
  return score;
}

export async function POST(req: Request) {
  try {
    // ✅ DEPLOY-SAFE way (NO nextUrl)
    const apiKey =
      req.headers.get("x-api-key") ||
      new URL(req.url).searchParams.get("apiKey");

    const body = await req.json();

    const {
      clientId,
      sessionId,
      event,
      value = 0,
    }: {
      clientId: string;
      sessionId: string;
      event: "pageview" | "duration" | "cta" | "return";
      value?: number;
    } = body;

    // ---- AUTH CHECK ----
    if (!clientId || CLIENT_KEYS[clientId] !== apiKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessionKey = `intent:${clientId}:${sessionId}`;
    const alertKey = `alerts:${clientId}`;

    // ---- LOAD SESSION FROM REDIS ----
    const session: IntentSession =
      (await redis.get<IntentSession>(sessionKey)) ?? {
        pageViews: 0,
        duration: 0,
        ctaClicks: 0,
        returned: false,
        alerted: false,
      };

    // ---- UPDATE BEHAVIOR ----
    if (event === "pageview") session.pageViews++;
    if (event === "duration") session.duration += value;
    if (event === "cta") session.ctaClicks++;
    if (event === "return") session.returned = true;

    const score = calculateScore(session);

    // ---- SAVE SESSION WITH TTL ----
    await redis.set(
      sessionKey,
      { ...session, score },
      { ex: SESSION_TTL }
    );

    // ---- CREATE ALERT (ONCE) ----
    if (score >= INTENT_THRESHOLD && !session.alerted) {
      session.alerted = true;

      await redis.lpush(alertKey, {
        sessionId: sessionId.slice(0, 6),
        score,
        timestamp: new Date().toISOString(),
      });

      await redis.ltrim(alertKey, 0, 9);

      await redis.set(
        sessionKey,
        { ...session, score },
        { ex: SESSION_TTL }
      );
    }

    return NextResponse.json({ ok: true, score });
  } catch (err) {
    console.error("Intent track error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
