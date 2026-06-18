import {
  eachMonthOfInterval,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { daysInInclusiveRange, halfOpenCreatedAtRange } from "./date-range";
import type {
  DashboardMetrics,
  DateRange,
  Reservation,
  ReservationStatus,
  Unit,
} from "./types";

type SupabaseClientLike = {
  from: (table: string) => any;
};

type ReservationFilters = {
  unitId?: string;
  status?: string;
  page?: number;
};

export async function getUnits(
  supabase: SupabaseClientLike,
  orgId: string,
): Promise<Unit[]> {
  const { data, error } = await supabase
    .from("units")
    .select("id, org_id, nickname, city, bedrooms, base_nightly_rate")
    .eq("org_id", orgId)
    .order("nickname");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getDashboardMetrics(
  supabase: SupabaseClientLike,
  orgId: string,
  range: DateRange,
): Promise<DashboardMetrics> {
  const createdAt = halfOpenCreatedAtRange(range);
  const [unitsResult, reservationsResult, chartResult] = await Promise.all([
    supabase
      .from("units")
      .select("id")
      .eq("org_id", orgId),
    supabase
      .from("reservations")
      .select("id, total_revenue, status, check_in, check_out, created_at")
      .eq("org_id", orgId)
      .gte("created_at", createdAt.gte)
      .lt("created_at", createdAt.lt),
    supabase
      .from("reservations")
      .select("total_revenue, created_at, status")
      .eq("org_id", orgId)
      .gte("created_at", startOfMonth(subMonths(new Date(), 5)).toISOString())
      .lt("created_at", new Date().toISOString()),
  ]);

  if (unitsResult.error) {
    throw new Error(unitsResult.error.message);
  }

  if (reservationsResult.error) {
    throw new Error(reservationsResult.error.message);
  }

  if (chartResult.error) {
    throw new Error(chartResult.error.message);
  }

  const reservations = reservationsResult.data ?? [];
  const activeReservations = reservations.filter(
    (reservation: Reservation) => reservation.status !== "cancelled",
  );
  const revenue = activeReservations.reduce(
    (sum: number, reservation: Reservation) =>
      sum + Number(reservation.total_revenue),
    0,
  );
  const roomsSold = activeReservations.length;
  const unitsCount = unitsResult.data?.length ?? 0;
  const roomsAvailable = unitsCount * daysInInclusiveRange(range);
  const occupancyRate = roomsAvailable > 0 ? roomsSold / roomsAvailable : 0;
  const adr = roomsSold > 0 ? revenue / roomsSold : 0;
  const months = eachMonthOfInterval({
    start: startOfMonth(subMonths(new Date(), 5)),
    end: startOfMonth(new Date()),
  });
  const revenueByMonth = months.map((month) => {
    const key = format(month, "yyyy-MM");
    const monthRevenue = (chartResult.data ?? [])
      .filter((reservation: Reservation) => {
        return (
          reservation.status !== "cancelled" &&
          format(parseISO(reservation.created_at), "yyyy-MM") === key
        );
      })
      .reduce(
        (sum: number, reservation: Reservation) =>
          sum + Number(reservation.total_revenue),
        0,
      );

    return {
      month: format(month, "MMM"),
      revenue: monthRevenue,
    };
  });

  return {
    revenue,
    reservations: reservations.length,
    roomsSold,
    roomsAvailable,
    occupancyRate,
    adr,
    revenueByMonth,
  };
}

export async function getReservations(
  supabase: SupabaseClientLike,
  orgId: string,
  range: DateRange,
  filters: ReservationFilters,
) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = 20;
  const createdAt = halfOpenCreatedAtRange(range);
  let query = supabase
    .from("reservations")
    .select(
      "id, org_id, unit_id, pms_reservation_id, guest_name, check_in, check_out, total_revenue, status, channel, created_at, units(nickname, city)",
      { count: "exact" },
    )
    .eq("org_id", orgId)
    .gte("created_at", createdAt.gte)
    .lt("created_at", createdAt.lt);

  if (filters.unitId) {
    query = query.eq("unit_id", filters.unitId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status as ReservationStatus);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    reservations: (data ?? []) as Reservation[],
    count: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}
