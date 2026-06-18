"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueChartProps = {
  data: Array<{ month: string; revenue: number }>;
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-80 rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Revenue by month
        </h2>
        <p className="text-sm text-slate-500">Last 6 months</p>
      </div>
      <ResponsiveContainer height="82%" width="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-US", {
                notation: "compact",
                style: "currency",
                currency: "USD",
              }).format(Number(value))
            }
            tickLine={false}
          />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(Number(value))
            }
          />
          <Bar dataKey="revenue" fill="#0f172a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
