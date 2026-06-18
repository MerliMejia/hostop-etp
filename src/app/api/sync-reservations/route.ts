import { NextResponse } from "next/server";
import { getOptionalUserProfile } from "@/lib/auth";
import { generateMockReservations, starterUnits } from "@/lib/mock-reservations";
import { getUnits } from "@/lib/data";
import type { Unit } from "@/lib/types";

const batchSize = 10;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST() {
  try {
    const { supabase, profile } = await getOptionalUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let units = await getUnits(supabase, profile.org_id);

    if (units.length === 0) {
      const { error } = await supabase.from("units").insert(
        starterUnits.map((unit) => ({
          ...unit,
          org_id: profile.org_id,
        })),
      );

      if (error) {
        throw new Error(error.message);
      }

      units = await getUnits(supabase, profile.org_id);
    }

    const reservations = generateMockReservations(profile.org_id, units as Unit[]);
    let syncedCount = 0;

    for (let index = 0; index < reservations.length; index += batchSize) {
      const batch = reservations.slice(index, index + batchSize);
      const { error } = await supabase.from("reservations").upsert(batch, {
        onConflict: "org_id,pms_reservation_id",
      });

      if (error) {
        throw new Error(error.message);
      }

      syncedCount += batch.length;

      if (index + batchSize < reservations.length) {
        await delay(100);
      }
    }

    return NextResponse.json({ syncedCount });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to sync reservations.",
      },
      { status: 500 },
    );
  }
}
