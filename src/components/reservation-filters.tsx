"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { DateRange, Unit } from "@/lib/types";

const storageKey = "hostop-date-range";

type ReservationFiltersProps = {
  range: DateRange;
  selectedStatus?: string;
  selectedUnit?: string;
  units: Unit[];
};

export function ReservationFilters({
  range,
  selectedStatus,
  selectedUnit,
  units,
}: ReservationFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingAction, setPendingAction] = useState<{
    type: "apply" | "clear";
    href: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const query = searchParams.toString();
  const currentHref = query ? `${pathname}?${query}` : pathname;
  const activePendingAction =
    pendingAction && currentHref !== pendingAction.href
      ? pendingAction.type
      : null;
  const isNavigating = isPending || activePendingAction !== null;

  function pushHref(href: string, type: "apply" | "clear") {
    setPendingAction({ type, href });
    startTransition(() => {
      router.push(href);
    });
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const unit = String(formData.get("unit") ?? "");
    const status = String(formData.get("status") ?? "");
    const params = new URLSearchParams();

    if (range.start && range.end) {
      params.set("start", range.start);
      params.set("end", range.end);
    }

    if (unit) {
      params.set("unit", unit);
    }

    if (status) {
      params.set("status", status);
    }

    const nextQuery = params.toString();
    pushHref(nextQuery ? `/reservations?${nextQuery}` : "/reservations", "apply");
  }

  function clearFilters() {
    window.localStorage.removeItem(storageKey);
    pushHref("/reservations", "clear");
  }

  return (
    <form
      className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      onSubmit={applyFilters}
    >
      <label className="text-sm font-medium text-slate-700">
        Unit
        <select
          className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100"
          defaultValue={selectedUnit ?? ""}
          disabled={isNavigating}
          name="unit"
        >
          <option value="">All units</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.nickname}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">
        Status
        <select
          className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100"
          defaultValue={selectedStatus ?? ""}
          disabled={isNavigating}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <button
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isNavigating}
      >
        {activePendingAction === "apply" ? "Applying..." : "Apply filters"}
      </button>
      <button
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isNavigating}
        onClick={clearFilters}
        type="button"
      >
        {activePendingAction === "clear" ? "Clearing..." : "Clear filters"}
      </button>
    </form>
  );
}
