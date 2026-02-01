import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) return NextResponse.json([]);

  const alerts = await redis.lrange(`alerts:${clientId}`, 0, 4);
  return NextResponse.json(alerts ?? []);
}
