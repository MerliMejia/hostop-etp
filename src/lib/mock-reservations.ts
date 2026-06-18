import { addDays, formatISO, startOfDay, subDays, subMonths } from "date-fns";
import type { ReservationStatus, Unit } from "./types";

const guests = [
  "Avery Stone",
  "Mia Rivera",
  "Noah Bennett",
  "Sophia Kim",
  "Ethan Brooks",
  "Olivia Carter",
  "Lucas Martin",
  "Amelia Davis",
  "Mateo Flores",
  "Isabella Clark",
];

const channels = ["Airbnb", "Booking.com", "Direct", "VRBO"];
const statuses: ReservationStatus[] = [
  "confirmed",
  "completed",
  "confirmed",
  "completed",
  "cancelled",
];

export function generateMockReservations(orgId: string, units: Unit[]) {
  const baseDate = startOfDay(new Date());

  return Array.from({ length: 50 }, (_, index) => {
    const unit = units[index % units.length];
    const createdAt = subDays(subMonths(baseDate, index % 6), index % 23);
    const checkIn = addDays(createdAt, 7 + (index % 18));
    const nights = 1 + (index % 6);
    const checkOut = addDays(checkIn, nights);
    const status = statuses[index % statuses.length];
    const revenue =
      status === "cancelled"
        ? 0
        : Number((unit.base_nightly_rate * nights * (1 + (index % 4) * 0.08)).toFixed(2));

    return {
      org_id: orgId,
      unit_id: unit.id,
      pms_reservation_id: `mock-pms-${index + 1}`,
      guest_name: guests[index % guests.length],
      check_in: formatISO(checkIn, { representation: "date" }),
      check_out: formatISO(checkOut, { representation: "date" }),
      total_revenue: revenue,
      status,
      channel: channels[index % channels.length],
      created_at: createdAt.toISOString(),
    };
  });
}

export const starterUnits = [
  {
    nickname: "Oceanview Studio",
    city: "Miami",
    bedrooms: 1,
    base_nightly_rate: 155,
  },
  {
    nickname: "Downtown Loft",
    city: "Austin",
    bedrooms: 2,
    base_nightly_rate: 225,
  },
  {
    nickname: "Garden Villa",
    city: "Scottsdale",
    bedrooms: 3,
    base_nightly_rate: 310,
  },
];
