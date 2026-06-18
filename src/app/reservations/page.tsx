import { AppShell } from "@/components/app-shell";
import { DateRangeControls } from "@/components/date-range-controls";
import { PaginationControls } from "@/components/pagination-controls";
import { ReservationFilters } from "@/components/reservation-filters";
import { getUserProfile } from "@/lib/auth";
import { getReservations, getUnits } from "@/lib/data";
import { normalizeDateRange } from "@/lib/date-range";

type ReservationsPageProps = {
  searchParams: Promise<{
    start?: string;
    end?: string;
    unit?: string;
    status?: string;
    page?: string;
  }>;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function pageHref(
  params: Awaited<ReservationsPageProps["searchParams"]>,
  page: number,
) {
  const query = new URLSearchParams();

  for (const key of ["start", "end", "unit", "status"] as const) {
    const value = params[key];

    if (value) {
      query.set(key, value);
    }
  }

  query.set("page", String(page));
  return `/reservations?${query.toString()}`;
}

export default async function ReservationsPage({
  searchParams,
}: ReservationsPageProps) {
  const params = await searchParams;
  const range = normalizeDateRange(params.start, params.end);
  const { supabase, profile } = await getUserProfile();
  const [units, reservationPage] = await Promise.all([
    getUnits(supabase, profile.org_id),
    getReservations(supabase, profile.org_id, range, {
      unitId: params.unit,
      status: params.status,
      page: params.page ? Number(params.page) : 1,
    }),
  ]);

  return (
    <AppShell email={profile.email}>
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Reservations</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Reservation ledger
        </h1>
      </div>

      <div className="mb-4">
        <DateRangeControls range={range} />
      </div>

      <ReservationFilters
        range={range}
        selectedStatus={params.status}
        selectedUnit={params.unit}
        units={units}
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservationPage.reservations.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                    No reservations match these filters.
                  </td>
                </tr>
              ) : (
                reservationPage.reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {reservation.guest_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {reservation.units?.nickname ?? "Unknown unit"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {reservation.check_in} to {reservation.check_out}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {reservation.channel}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-950">
                      {currency.format(Number(reservation.total_revenue))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <p>
            Page {reservationPage.page} of {reservationPage.totalPages} ·{" "}
            {reservationPage.count} total
          </p>
          <PaginationControls
            nextDisabled={reservationPage.page >= reservationPage.totalPages}
            nextHref={pageHref(
              params,
              Math.min(reservationPage.totalPages, reservationPage.page + 1),
            )}
            previousDisabled={reservationPage.page <= 1}
            previousHref={pageHref(
              params,
              Math.max(1, reservationPage.page - 1),
            )}
          />
        </div>
      </div>
    </AppShell>
  );
}
