"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { DateRange } from "@/lib/types";

const storageKey = "hostop-date-range";

type DateRangeControlsProps = {
  range: DateRange;
};

export function DateRangeControls({ range }: DateRangeControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "applying" | "applied">("idle");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const hasRange = searchParams.has("start") && searchParams.has("end");

    if (hasRange) {
      window.localStorage.setItem(storageKey, JSON.stringify(range));
      return;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      window.localStorage.setItem(storageKey, JSON.stringify(range));
      return;
    }

    try {
      const parsed = JSON.parse(stored) as DateRange;

      if (parsed.start && parsed.end) {
        const params = new URLSearchParams(searchParams);
        params.set("start", parsed.start);
        params.set("end", parsed.end);
        router.replace(`${pathname}?${params.toString()}`);
      }
    } catch {
      window.localStorage.setItem(storageKey, JSON.stringify(range));
    }
  }, [pathname, range, router, searchParams]);

  function applyRange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const start = String(formData.get("start") ?? range.start);
    const end = String(formData.get("end") ?? range.end);
    const params = new URLSearchParams(searchParams);
    params.set("start", start);
    params.set("end", end);
    params.delete("page");
    window.localStorage.setItem(storageKey, JSON.stringify({ start, end }));
    setStatus("applying");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    window.setTimeout(() => setStatus("applied"), 300);
    window.setTimeout(() => setStatus("idle"), 1900);
  }

  const isApplying = status === "applying" || isPending;

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      onSubmit={applyRange}
    >
      <label className="text-sm font-medium text-slate-700">
        Start
        <input
          className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-slate-950"
          defaultValue={range.start}
          key={range.start}
          name="start"
          onChange={() => setStatus("idle")}
          type="date"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        End
        <input
          className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-slate-950"
          defaultValue={range.end}
          key={range.end}
          name="end"
          onChange={() => setStatus("idle")}
          type="date"
        />
      </label>
      <button
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isApplying}
      >
        {isApplying
          ? "Applying..."
          : status === "applied"
            ? "Date range applied"
            : "Apply date range"}
      </button>
    </form>
  );
}
