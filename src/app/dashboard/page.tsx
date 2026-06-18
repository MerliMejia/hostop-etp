import { AppShell } from "@/components/app-shell";
import { DateRangeControls } from "@/components/date-range-controls";
import { RevenueChart } from "@/components/revenue-chart";
import { SummaryButton } from "@/components/summary-button";
import { SyncButton } from "@/components/sync-button";
import { getUserProfile } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/data";
import { normalizeDateRange } from "@/lib/date-range";

type DashboardPageProps = {
  searchParams: Promise<{
    start?: string;
    end?: string;
  }>;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const range = normalizeDateRange(params.start, params.end);
  const { supabase, profile } = await getUserProfile();
  const metrics = await getDashboardMetrics(supabase, profile.org_id, range);
  const rangeDetail = range.start && range.end ? "Selected date range" : "All reservations";

  const kpis = [
    {
      label: "Revenue",
      value: currency.format(metrics.revenue),
      detail: rangeDetail,
    },
    {
      label: "Reservations",
      value: metrics.reservations.toLocaleString("en-US"),
      detail: rangeDetail,
    },
    {
      label: "Occupancy",
      value: percent.format(metrics.occupancyRate),
      detail: `${metrics.roomsSold} sold / ${metrics.roomsAvailable} available`,
    },
    {
      label: "ADR",
      value: currency.format(metrics.adr),
      detail: "Revenue / rooms sold",
    },
  ];

  return (
    <AppShell email={profile.email}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Revenue analytics
          </h1>
        </div>
        <SyncButton />
      </div>

      <div className="mb-6">
        <DateRangeControls range={range} />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-5"
            key={kpi.label}
          >
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {kpi.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{kpi.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <RevenueChart data={metrics.revenueByMonth} subtitle={rangeDetail} />
        <SummaryButton range={range} />
      </section>
    </AppShell>
  );
}
