import { NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = typeof body.input === "string" ? body.input : "";
    const hash = createHash("sha256").update(input).digest("hex");

    return NextResponse.json({
      input,
      hash,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to compute hash.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
