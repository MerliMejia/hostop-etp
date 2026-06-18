"use client";

import { useState } from "react";
import type { DateRange } from "@/lib/types";

type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: string }
  | { status: "error"; message: string };

export function SummaryButton({ range }: { range: DateRange }) {
  const [state, setState] = useState<SummaryState>({ status: "idle" });

  async function summarize() {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/summarize-month", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(range),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Summary failed.");
      }

      setState({ status: "success", summary: body.summary });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Summary failed.",
      });
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            AI performance summary
          </h2>
          <p className="text-sm text-slate-500">
            Uses aggregate metrics only for the selected date range.
          </p>
        </div>
        <button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={state.status === "loading"}
          onClick={summarize}
          type="button"
        >
          {state.status === "loading" ? "Summarizing..." : "Summarize this month"}
        </button>
      </div>
      {state.status === "success" ? (
        <p className="mt-4 text-sm leading-6 text-slate-700">{state.summary}</p>
      ) : null}
      {state.status === "error" ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
