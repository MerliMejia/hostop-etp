import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardMetrics } from "@/lib/data";
import { normalizeDateRange } from "@/lib/date-range";
import { requireEnv } from "@/lib/env";
import { getOptionalUserProfile } from "@/lib/auth";

const requestSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid date range." },
        { status: 400 },
      );
    }

    const { supabase, profile } = await getOptionalUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const range = normalizeDateRange(parsed.data.start, parsed.data.end);
    const metrics = await getDashboardMetrics(supabase, profile.org_id, range);
    const period =
      range.start && range.end
        ? `date range ${range.start} to ${range.end}`
        : "all reservations";
    const anthropic = new Anthropic({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
    });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 180,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: `Write a 2-3 sentence plain-English performance summary for a short-term rental portfolio. Use only these aggregate metrics: ${period}, revenue $${metrics.revenue.toFixed(2)}, reservations ${metrics.reservations}, rooms sold ${metrics.roomsSold}, rooms available ${metrics.roomsAvailable}, occupancy ${(metrics.occupancyRate * 100).toFixed(1)}%, ADR $${metrics.adr.toFixed(2)}.`,
        },
      ],
    });
    const summary = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to summarize performance.",
      },
      { status: 500 },
    );
  }
}
